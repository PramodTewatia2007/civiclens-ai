import math
import re
import json
import logging
from typing import List, Dict, Tuple, Optional
from .config import settings

logger = logging.getLogger("civiclens.ai")

CATEGORY_CONFIG = {
    "potholes": {
        "name": "Potholes & Road Hazard",
        "keywords": [
            "pothole", "potholes", "crater", "asphalt", "road", "street", "pavement",
            "tarmac", "hole", "cracked road", "tire damage", "bike lane", "manhole",
            "bump", "uneven road", "cavity", "rut"
        ],
        "department": "Department of Public Works & Roads",
        "default_sla": "24 to 48 Hours"
    },
    "waste": {
        "name": "Illegal Dumping & Waste",
        "keywords": [
            "trash", "garbage", "waste", "dumping", "litter", "rubbish", "debris",
            "bin", "dumpster", "overflowing", "mattress", "junk", "recycling",
            "plastic", "smell", "odor", "discarded", "tires", "fly-tipping"
        ],
        "department": "Sanitation & Waste Management Bureau",
        "default_sla": "24 to 72 Hours"
    },
    "broken_streetlights": {
        "name": "Broken Streetlights & Electrical",
        "keywords": [
            "streetlight", "street light", "lamp", "pole", "light", "dark",
            "darkness", "flickering", "bulb", "blackout", "fixture", "wires",
            "electrical", "illumination", "crosswalk light", "pedestrian light"
        ],
        "department": "Municipal Electrical & Lighting Dept",
        "default_sla": "12 to 36 Hours"
    },
    "water_leaks": {
        "name": "Water Leaks & Pipe Bursts",
        "keywords": [
            "water", "leak", "pipe", "burst", "flooding", "hydrant", "sprinkler",
            "drain", "sewer", "sewage", "main break", "gushing", "puddle",
            "overflow", "bubbling", "pressure", "water supply", "aqueduct"
        ],
        "department": "City Water & Sewage Utility",
        "default_sla": "6 to 24 Hours"
    }
}

HAZARD_KEYWORDS_CRITICAL = [
    "burst pipe", "flooding", "blackout", "deep crater", "hazardous", "sparking",
    "electrocution", "severe crash", "high pressure gush", "main break", "sinkhole",
    "blocking highway", "emergency", "immediate danger"
]

HAZARD_KEYWORDS_HIGH = [
    "deep", "traffic blocked", "dark intersection", "foul smell", "contaminating",
    "school zone", "crosswalk", "pedestrian hazard", "major road", "arterial", "large"
]

HAZARD_KEYWORDS_MEDIUM = [
    "overflowing", "cracked", "slow leak", "blinking", "sidewalk", "alley",
    "moderate", "residential street", "litter", "trip hazard"
]


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in meters."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def text_token_similarity(text1: str, text2: str) -> float:
    """Computes token Jaccard + character overlap between two texts."""
    def tokenize(s: str) -> set:
        tokens = re.findall(r'\b\w{3,}\b', s.lower())
        return set(tokens)

    set1 = tokenize(text1)
    set2 = tokenize(text2)
    if not set1 or not set2:
        return 0.0

    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    jaccard = intersection / union if union > 0 else 0.0

    # Also check substring match
    clean1 = "".join(text1.lower().split())
    clean2 = "".join(text2.lower().split())
    substr_bonus = 0.2 if (clean1 in clean2 or clean2 in clean1) and len(clean1) > 10 else 0.0

    return min(1.0, jaccard + substr_bonus)


class AIService:
    def __init__(self):
        self.gemini_client = None
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info("Initialized Gemini Client successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}. Using intelligent fallback.")

    def classify_issue(self, title: str, description: str, image_name: Optional[str] = None) -> Dict:
        """
        Classifies an issue report into one of 4 categories and suggests a severity level.
        Uses Gemini if configured, otherwise uses intelligent local civic heuristics.
        """
        combined_text = f"{title or ''} {description or ''} {image_name or ''}".lower()

        # Check Gemini API if available and key configured
        if self.gemini_client and not settings.DEMO_MODE:
            try:
                prompt = (
                    f"You are CivicLens AI, an automated civic complaint categorization engine.\n"
                    f"Evaluate this civic report:\n"
                    f"Title: {title}\n"
                    f"Description: {description}\n\n"
                    f"Rules:\n"
                    f"1. Choose EXACTLY ONE category from: ['potholes', 'waste', 'broken_streetlights', 'water_leaks']\n"
                    f"2. Suggest severity from: ['low', 'medium', 'high', 'critical']\n"
                    f"3. Return strict JSON with keys: category, confidence, severity, severity_reasoning, key_indicators (array), recommended_department, estimated_sla"
                )
                response = self.gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text = response.text
                clean_json = re.search(r'\{.*\}', text, re.DOTALL)
                if clean_json:
                    data = json.loads(clean_json.group(0))
                    cat = data.get("category", "potholes").lower()
                    if cat not in CATEGORY_CONFIG:
                        cat = "potholes"
                    return {
                        "category": cat,
                        "category_name": CATEGORY_CONFIG[cat]["name"],
                        "category_confidence": round(float(data.get("confidence", 0.92)), 2),
                        "severity": data.get("severity", "medium").lower(),
                        "severity_reasoning": data.get("severity_reasoning", "Assessed by Gemini Multimodal Vision API"),
                        "key_indicators": data.get("key_indicators", ["Visual damage match"]),
                        "recommended_department": data.get("recommended_department", CATEGORY_CONFIG[cat]["department"]),
                        "estimated_sla": data.get("estimated_sla", CATEGORY_CONFIG[cat]["default_sla"]),
                        "is_demo_mode": False
                    }
            except Exception as e:
                logger.warning(f"Gemini API request failed: {e}. Falling back to internal engine.")

        # Built-in Intelligent Classifier (Deterministic, instant, and reliable)
        scores = {}
        matched_words = {}
        for cat_key, cfg in CATEGORY_CONFIG.items():
            matches = [kw for kw in cfg["keywords"] if kw in combined_text]
            matched_words[cat_key] = matches
            scores[cat_key] = len(matches)

        # Image name heuristics (e.g., "pothole_4th_ave.jpg", "water_leak.png")
        if image_name:
            img_lower = image_name.lower()
            if "pothole" in img_lower or "road" in img_lower:
                scores["potholes"] = scores.get("potholes", 0) + 3
            elif "waste" in img_lower or "trash" in img_lower or "garbage" in img_lower or "dump" in img_lower:
                scores["waste"] = scores.get("waste", 0) + 3
            elif "light" in img_lower or "lamp" in img_lower or "dark" in img_lower:
                scores["broken_streetlights"] = scores.get("broken_streetlights", 0) + 3
            elif "water" in img_lower or "leak" in img_lower or "pipe" in img_lower or "flood" in img_lower:
                scores["water_leaks"] = scores.get("water_leaks", 0) + 3

        # Default to highest scoring category
        best_cat = max(scores, key=scores.get)
        if scores[best_cat] == 0:
            best_cat = "potholes"
            confidence = 0.72
            indicators = ["Contextual road infrastructure keywords"]
        else:
            base_score = min(0.98, 0.78 + (scores[best_cat] * 0.05))
            confidence = round(base_score, 2)
            indicators = matched_words.get(best_cat, [])[:4]
            if not indicators:
                indicators = ["Keywords matching " + CATEGORY_CONFIG[best_cat]["name"]]

        # Determine severity
        severity = "medium"
        reasoning = "Standard civic disruption requiring regular maintenance queue."
        sla = CATEGORY_CONFIG[best_cat]["default_sla"]

        if any(w in combined_text for w in HAZARD_KEYWORDS_CRITICAL):
            severity = "critical"
            reasoning = "High risk of immediate property damage, accident, or electrical/flooding hazard."
            sla = "Immediate: 4 to 12 Hours"
        elif any(w in combined_text for w in HAZARD_KEYWORDS_HIGH):
            severity = "high"
            reasoning = "Elevated safety risk or severe traffic obstruction on high-traffic public thoroughfare."
            sla = "Urgent: 12 to 24 Hours"
        elif any(w in combined_text for w in HAZARD_KEYWORDS_MEDIUM):
            severity = "medium"
            reasoning = "Noticeable civic impediment impacting community convenience and quality of life."
            sla = "Standard: 24 to 48 Hours"
        else:
            severity = "low"
            reasoning = "Localized minor defect with minimal immediate safety risk."
            sla = "Routine: 3 to 5 Days"

        return {
            "category": best_cat,
            "category_name": CATEGORY_CONFIG[best_cat]["name"],
            "category_confidence": confidence,
            "severity": severity,
            "severity_reasoning": reasoning,
            "key_indicators": indicators,
            "recommended_department": CATEGORY_CONFIG[best_cat]["department"],
            "estimated_sla": sla,
            "is_demo_mode": self.gemini_client is None or settings.DEMO_MODE
        }

    def detect_duplicates(
        self,
        new_lat: float,
        new_lon: float,
        new_category: str,
        new_title: str,
        new_description: str,
        existing_issues: List[Dict],
        radius_meters: float = 600.0,
        similarity_threshold: float = 0.60
    ) -> Dict:
        """
        Calculates duplicate risk across nearby active reports.
        Never auto-deletes; returns candidates flagged with similarity metrics.
        """
        candidates = []

        for issue in existing_issues:
            # Skip resolved issues or different categories if desired, or include them with penalty
            if issue.get("status") == "resolved":
                continue

            dist = haversine_distance_meters(new_lat, new_lon, issue["latitude"], issue["longitude"])
            if dist > radius_meters:
                continue

            # Category match component
            is_same_cat = (issue.get("category") == new_category)
            cat_score = 1.0 if is_same_cat else 0.2

            # Proximity score (1.0 at 0m, decaying to 0.0 at radius_meters)
            geo_score = max(0.0, 1.0 - (dist / radius_meters))

            # Text similarity on title & description
            txt_score = text_token_similarity(
                f"{new_title} {new_description}",
                f"{issue.get('title', '')} {issue.get('description', '')}"
            )

            # Composite similarity score (0.0 to 1.0)
            composite_score = (geo_score * 0.45) + (cat_score * 0.30) + (txt_score * 0.25)
            # Boost if within 100 meters and same category
            if dist <= 120 and is_same_cat:
                composite_score = min(0.99, composite_score + 0.25)

            if composite_score >= similarity_threshold:
                candidates.append({
                    "issue_id": issue["id"],
                    "title": issue["title"],
                    "category": issue["category"],
                    "status": issue["status"],
                    "distance_meters": round(dist, 1),
                    "similarity_score": round(composite_score * 100, 1),
                    "image_url": issue.get("image_url", ""),
                    "address": issue.get("address", ""),
                    "created_at": issue.get("created_at")
                })

        # Sort highest similarity first
        candidates.sort(key=lambda x: x["similarity_score"], reverse=True)

        has_dupes = len(candidates) > 0
        top_match = candidates[0] if has_dupes else None
        warning = None
        if top_match:
            warning = (
                f"Notice: A very similar issue (#{top_match['issue_id']}: '{top_match['title']}') "
                f"was reported {int(top_match['distance_meters'])}m away ({top_match['similarity_score']}% match). "
                f"You may still submit this report as supporting evidence."
            )

        return {
            "has_duplicates": has_dupes,
            "potential_matches": candidates,
            "top_match_id": top_match["issue_id"] if top_match else None,
            "warning_message": warning
        }


ai_service = AIService()
