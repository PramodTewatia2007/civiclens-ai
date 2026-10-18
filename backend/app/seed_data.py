from datetime import datetime, timedelta
from .models import Issue, StatusHistory
from .schemas import DEPARTMENT_MAPPINGS

# Realistic civic placeholder images using clean Unsplash civic & urban infrastructure imagery
CIVIC_IMAGES = {
    "pothole_crater": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80",
    "pothole_crosswalk": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80",
    "pothole_asphalt": "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=900&q=80",
    "waste_dumping": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    "waste_overflow": "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=900&q=80",
    "waste_alley": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=900&q=80",
    "broken_light_dark": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
    "broken_light_pole": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=900&q=80",
    "broken_light_flicker": "https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&w=900&q=80",
    "water_leak_main": "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=900&q=80",
    "water_leak_hydrant": "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=900&q=80",
    "water_leak_street": "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=900&q=80",
    "resolved_repaved": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=900&q=80",
    "resolved_cleaned": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
}

SEED_ISSUES = [
    {
        "id": "CV-101",
        "title": "Deep Pothole on Oak Street causing tire punctures",
        "description": "Large asphalt crater right outside the Community Library entrance on Oak St. At least 8 inches deep with exposed gravel. Two cyclists nearly crashed this morning and multiple cars swerving into oncoming lane.",
        "category": "potholes",
        "ai_category": "potholes",
        "ai_category_confidence": 0.96,
        "category_overridden": False,
        "severity": "high",
        "ai_severity": "high",
        "ai_severity_reasoning": "High-impact road hazard directly adjacent to high pedestrian library crosswalk and bicycle lane.",
        "severity_overridden": False,
        "status": "assigned",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "452 Oak Street, Civic Center",
        "landmark": "Opposite Civic Center Library East Wing",
        "image_url": CIVIC_IMAGES["pothole_crater"],
        "assigned_department": DEPARTMENT_MAPPINGS["potholes"],
        "assigned_person": "Dave Martinez (Road Crew Lead)",
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Maya Lin (Resident)",
        "upvotes": 14,
        "days_ago": 2,
        "timeline": [
            ("submitted", None, "submitted", "Maya Lin (Resident)", "Report submitted with photo evidence and GPS tag."),
            ("under_review", "submitted", "under_review", "Elena Vance (Triage Coordinator)", "AI classification verified. High safety hazard confirmed near school/library."),
            ("assigned", "under_review", "assigned", "Marcus Reed (Superintendent)", "Dispatched to Road Maintenance Crew #3. Asphalt hot-patch scheduled.")
        ]
    },
    {
        "id": "CV-102",
        "title": "Severe crater in road near 450 Oak St (Potential Duplicate)",
        "description": "Hazardous road hole near 450 Oak St. Hit it with my sedan and felt severe suspension thump. Dangerous for two wheelers.",
        "category": "potholes",
        "ai_category": "potholes",
        "ai_category_confidence": 0.94,
        "category_overridden": False,
        "severity": "high",
        "ai_severity": "high",
        "ai_severity_reasoning": "Road crater with tire hazard reported in active traffic lane.",
        "severity_overridden": False,
        "status": "under_review",
        "latitude": 37.7751,
        "longitude": -122.4192,
        "address": "450 Oak Street, Civic Center",
        "landmark": "Near Oak St Bike Rack",
        "image_url": CIVIC_IMAGES["pothole_asphalt"],
        "assigned_department": DEPARTMENT_MAPPINGS["potholes"],
        "assigned_person": None,
        "potential_duplicate_of": "CV-101",
        "duplicate_confidence": 0.88,
        "duplicate_status": "flagged",
        "reporter_name": "Carlos Gomez",
        "upvotes": 6,
        "days_ago": 1,
        "timeline": [
            ("submitted", None, "submitted", "Carlos Gomez", "Submitted report from mobile device."),
            ("under_review", "submitted", "under_review", "System (CivicLens AI)", "Duplicate detection flagged 88% spatial & visual correlation with #CV-101 (28 meters away). Linked for staff verification.")
        ]
    },
    {
        "id": "CV-103",
        "title": "High-Pressure Water Main Leak Flooding Pedestrian Sidewalk",
        "description": "Underground pipe rupture bubbling rapidly through sidewalk pavers on Elm & 6th Ave. Clean drinking water pooling into storm drain at ~15 gallons/min. Sidewalk beginning to sag.",
        "category": "water_leaks",
        "ai_category": "water_leaks",
        "ai_category_confidence": 0.98,
        "category_overridden": False,
        "severity": "critical",
        "ai_severity": "critical",
        "ai_severity_reasoning": "Active pressurized main line break threatening structural foundation and wasting potable municipal water.",
        "severity_overridden": False,
        "status": "in_progress",
        "latitude": 37.7782,
        "longitude": -122.4215,
        "address": "810 Elm Street & 6th Ave",
        "landmark": "Near Westgate Metro Plaza",
        "image_url": CIVIC_IMAGES["water_leak_main"],
        "assigned_department": DEPARTMENT_MAPPINGS["water_leaks"],
        "assigned_person": "Sarah Jenkins (Emergency Water Dispatch)",
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Kavita Patel (Student)",
        "upvotes": 28,
        "days_ago": 1,
        "timeline": [
            ("submitted", None, "submitted", "Kavita Patel", "Reported immediate geyser-like leak."),
            ("under_review", "submitted", "under_review", "Auto-Triage", "Critical severity threshold triggered automated high-priority alert."),
            ("assigned", "under_review", "assigned", "Dispatch Center", "Assigned emergency crew with subterranean acoustic sensor equipment."),
            ("in_progress", "assigned", "in_progress", "Sarah Jenkins", "Crew arrived on scene. Valve isolated, excavation in progress.")
        ]
    },
    {
        "id": "CV-104",
        "title": "Commercial Furniture and Construction Debris Illegally Dumped in Alley",
        "description": "Massive pile of discarded drywall, broken mattresses, wood pallets, and paint buckets blocking the shared alleyway behind Market Street shops. Attracting rodents and obstructing delivery trucks.",
        "category": "waste",
        "ai_category": "waste",
        "ai_category_confidence": 0.97,
        "category_overridden": False,
        "severity": "medium",
        "ai_severity": "medium",
        "ai_severity_reasoning": "Non-toxic bulk waste blocking public right-of-way, sanitation code violation.",
        "severity_overridden": False,
        "status": "assigned",
        "latitude": 37.7712,
        "longitude": -122.4140,
        "address": "1120 Market Street Alleyway",
        "landmark": "Behind artisan bakery & hardware store",
        "image_url": CIVIC_IMAGES["waste_dumping"],
        "assigned_department": DEPARTMENT_MAPPINGS["waste"],
        "assigned_person": "Heavy Haul Unit B",
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "David Wong (Store Manager)",
        "upvotes": 9,
        "days_ago": 3,
        "timeline": [
            ("submitted", None, "submitted", "David Wong", "Uploaded 2 photos of commercial dumping."),
            ("under_review", "submitted", "under_review", "Elena Vance (Triage Coordinator)", "Classified under Municipal Waste Code Sec 14-B."),
            ("assigned", "under_review", "assigned", "Sanitation Supervisor", "Assigned 16-yard hydraulic flatbed for Monday morning pickup.")
        ]
    },
    {
        "id": "CV-105",
        "title": "Three Consecutive Streetlights Dark along University Campus Walkway",
        "description": "Lamp posts #L-420, L-421, and L-422 are completely unlit creating a 200-meter pitch black zone along the North Campus pedestrian corridor. High safety concern for night class students walking to transit.",
        "category": "broken_streetlights",
        "ai_category": "broken_streetlights",
        "ai_category_confidence": 0.95,
        "category_overridden": False,
        "severity": "high",
        "ai_severity": "high",
        "ai_severity_reasoning": "Total darkness on active student transit route poses imminent pedestrian security and fall risks.",
        "severity_overridden": False,
        "status": "in_progress",
        "latitude": 37.7815,
        "longitude": -122.4168,
        "address": "North Campus Perimeter Walkway, University Ave",
        "landmark": "Between Science Hall and Dormitory Quad",
        "image_url": CIVIC_IMAGES["broken_light_dark"],
        "assigned_department": DEPARTMENT_MAPPINGS["broken_streetlights"],
        "assigned_person": "Campus Electrical Services - Unit 4",
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Student Safety Committee",
        "upvotes": 42,
        "days_ago": 2,
        "timeline": [
            ("submitted", None, "submitted", "Student Safety Committee", "Submitted with student petition signature references."),
            ("under_review", "submitted", "under_review", "Campus Operations", "Verified power outage on circuit #8."),
            ("assigned", "under_review", "assigned", "City Electrical Bureau", "Technician Roger Sterling assigned."),
            ("in_progress", "assigned", "in_progress", "Roger Sterling", "Found damaged photocell sensor and blown 40A breaker. Sourcing replacement ballast.")
        ]
    },
    {
        "id": "CV-106",
        "title": "Overflowing Public Park Trash Cans with Scattered Plastic Litter",
        "description": "Weekend festival trash has overwhelmed all 4 solar compactors at Central Green. Wind is scattering plastic bottles, food wrappers, and aluminum cans across children playground area.",
        "category": "waste",
        "ai_category": "waste",
        "ai_category_confidence": 0.91,
        "category_overridden": False,
        "severity": "medium",
        "ai_severity": "medium",
        "ai_severity_reasoning": "Litter spillover in recreational green space; moderate environmental impact.",
        "severity_overridden": False,
        "status": "resolved",
        "latitude": 37.7698,
        "longitude": -122.4260,
        "address": "Central Green Park, Pine St Entrance",
        "landmark": "Near Children's Adventure Playground",
        "image_url": CIVIC_IMAGES["waste_overflow"],
        "resolution_image_url": CIVIC_IMAGES["resolved_cleaned"],
        "resolution_notes": "Park Maintenance Crew #2 emptied all 4 compactors, performed magnetic sweep of turf, and power-washed surrounding concrete pads. Extra bins stationed for the weekend.",
        "assigned_department": DEPARTMENT_MAPPINGS["waste"],
        "assigned_person": "Park Sanitation Lead",
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Rachel Adams",
        "upvotes": 11,
        "days_ago": 4,
        "resolved_days_ago": 1,
        "timeline": [
            ("submitted", None, "submitted", "Rachel Adams", "Reported park bins spilling onto lawn."),
            ("under_review", "submitted", "under_review", "Elena Vance", "Dispatched to Parks & Recreation team."),
            ("assigned", "under_review", "assigned", "Sanitation Team", "Scheduled priority cleanup for morning shift."),
            ("in_progress", "assigned", "in_progress", "Park Sanitation Lead", "On-site cleanup underway."),
            ("resolved", "in_progress", "resolved", "Park Sanitation Lead", "Cleanup complete. Bins emptied and sanitized. Area reopened.")
        ]
    },
    {
        "id": "CV-107",
        "title": "Persistent Fire Hydrant Base Seepage Flooding Bike Lane",
        "description": "Continuous trickle of clean water from the flange base of red fire hydrant #H-89. Water has eroded the asphalt seam in the protected bike lane over the past 48 hours.",
        "category": "water_leaks",
        "ai_category": "water_leaks",
        "ai_category_confidence": 0.93,
        "category_overridden": False,
        "severity": "low",
        "ai_severity": "low",
        "ai_severity_reasoning": "Low pressure gasket seepage; no current structure compromise, scheduled for gasket replacement.",
        "severity_overridden": False,
        "status": "submitted",
        "latitude": 37.7798,
        "longitude": -122.4085,
        "address": "290 Folsom Street",
        "landmark": "Corner of Folsom & 3rd St",
        "image_url": CIVIC_IMAGES["water_leak_hydrant"],
        "assigned_department": DEPARTMENT_MAPPINGS["water_leaks"],
        "assigned_person": None,
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Tariq Mansoor (Cyclist)",
        "upvotes": 5,
        "days_ago": 1,
        "timeline": [
            ("submitted", None, "submitted", "Tariq Mansoor", "Reported via mobile app while commuting.")
        ]
    },
    {
        "id": "CV-108",
        "title": "Severe Road Subsidence and Asphalt Deterioration on 10th Ave",
        "description": "Road surface is sinking forming multiple longitudinal potholes. Heavy transit buses are bottoming out when crossing this intersection. Ground vibration felt in adjacent storefronts.",
        "category": "potholes",
        "ai_category": "potholes",
        "ai_category_confidence": 0.94,
        "category_overridden": False,
        "severity": "critical",
        "ai_severity": "critical",
        "ai_severity_reasoning": "Subsurface structural subsidence on primary municipal bus route. Immediate asphalt failure risk.",
        "severity_overridden": False,
        "status": "resolved",
        "latitude": 37.7725,
        "longitude": -122.4175,
        "address": "620 10th Avenue & Mission St",
        "landmark": "Outside Mission Community Pharmacy",
        "image_url": CIVIC_IMAGES["pothole_crosswalk"],
        "resolution_image_url": CIVIC_IMAGES["resolved_repaved"],
        "resolution_notes": "Emergency cold-mill and 3-inch hot mix asphalt overlay completed over 40-foot section. Sub-base reinforced with crushed limestone aggregate. Road fully reopened to transit traffic.",
        "assigned_department": DEPARTMENT_MAPPINGS["potholes"],
        "assigned_person": "Dave Martinez (Road Crew Lead)",
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Anita Roy (Bus Driver)",
        "upvotes": 35,
        "days_ago": 6,
        "resolved_days_ago": 2,
        "timeline": [
            ("submitted", None, "submitted", "Anita Roy", "Reported urgent road sag on transit line."),
            ("under_review", "submitted", "under_review", "Elena Vance", "AI critical flag validated. Structural inspector dispatched."),
            ("assigned", "under_review", "assigned", "Dave Martinez", "Milling and paving equipment mobilized."),
            ("in_progress", "assigned", "in_progress", "Dave Martinez", "Traffic detour established. Excavation and resurfacing ongoing."),
            ("resolved", "in_progress", "resolved", "Dave Martinez", "Resurfacing finished, compaction verified at 98%, lanes restriped.")
        ]
    },
    {
        "id": "CV-109",
        "title": "Exposed Wiring at Base of Decorative Streetlight Pole",
        "description": "Metal inspection cover plate has been knocked off the base of streetlight pole #DP-14. High voltage colored wires are hanging out within reach of pedestrians and pets.",
        "category": "broken_streetlights",
        "ai_category": "broken_streetlights",
        "ai_category_confidence": 0.97,
        "category_overridden": False,
        "severity": "critical",
        "ai_severity": "critical",
        "ai_severity_reasoning": "Direct electrical shock hazard in high foot-traffic zone with accessible live conductors.",
        "severity_overridden": False,
        "status": "under_review",
        "latitude": 37.7765,
        "longitude": -122.4230,
        "address": "320 Grove Street, Civic Center",
        "landmark": "Near Symphony Plaza Fountain",
        "image_url": CIVIC_IMAGES["broken_light_pole"],
        "assigned_department": DEPARTMENT_MAPPINGS["broken_streetlights"],
        "assigned_person": None,
        "potential_duplicate_of": None,
        "duplicate_confidence": None,
        "duplicate_status": "none",
        "reporter_name": "Jonathan Vance",
        "upvotes": 19,
        "days_ago": 1,
        "timeline": [
            ("submitted", None, "submitted", "Jonathan Vance", "Reported exposed live electrical wiring near dog park."),
            ("under_review", "submitted", "under_review", "Safety Dispatch", "Urgent dispatch notice relayed to electric standby unit.")
        ]
    }
]


def seed_database(db):
    """Populates the database with realistic civic data if empty."""
    existing_count = db.query(Issue).count()
    if existing_count > 0:
        return

    now = datetime.utcnow()

    for item in SEED_ISSUES:
        created_time = now - timedelta(days=item.get("days_ago", 1), hours=3)
        resolved_time = None
        if item.get("status") == "resolved" and "resolved_days_ago" in item:
            resolved_time = now - timedelta(days=item["resolved_days_ago"], hours=1)

        issue = Issue(
            id=item["id"],
            title=item["title"],
            description=item["description"],
            category=item["category"],
            ai_category=item["ai_category"],
            ai_category_confidence=item["ai_category_confidence"],
            category_overridden=item["category_overridden"],
            override_reason=item.get("override_reason"),
            severity=item["severity"],
            ai_severity=item["ai_severity"],
            ai_severity_reasoning=item["ai_severity_reasoning"],
            severity_overridden=item["severity_overridden"],
            status=item["status"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            address=item["address"],
            landmark=item.get("landmark"),
            image_url=item["image_url"],
            resolution_image_url=item.get("resolution_image_url"),
            resolution_notes=item.get("resolution_notes"),
            assigned_department=item.get("assigned_department"),
            assigned_person=item.get("assigned_person"),
            potential_duplicate_of=item.get("potential_duplicate_of"),
            duplicate_confidence=item.get("duplicate_confidence"),
            duplicate_status=item.get("duplicate_status", "none"),
            reporter_name=item.get("reporter_name", "Community Resident"),
            upvotes=item.get("upvotes", 1),
            created_at=created_time,
            updated_at=created_time + timedelta(hours=2),
            resolved_at=resolved_time
        )
        db.add(issue)
        db.flush()

        # Add timeline events
        timeline_data = item.get("timeline", [])
        event_time = created_time
        for (to_s, from_s, _, by_who, notes) in timeline_data:
            event = StatusHistory(
                issue_id=issue.id,
                from_status=from_s,
                to_status=to_s,
                changed_by=by_who,
                notes=notes,
                created_at=event_time
            )
            db.add(event)
            event_time = event_time + timedelta(hours=4)

    db.commit()
