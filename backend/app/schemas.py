from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# Category mappings
CATEGORY_NAMES = {
    "potholes": "Potholes & Road Hazard",
    "waste": "Illegal Dumping & Waste",
    "broken_streetlights": "Broken Streetlights & Electrical",
    "water_leaks": "Water Leaks & Pipe Bursts"
}

DEPARTMENT_MAPPINGS = {
    "potholes": "Department of Public Works & Roads",
    "waste": "Sanitation & Waste Management Bureau",
    "broken_streetlights": "Municipal Electrical & Lighting Dept",
    "water_leaks": "City Water & Sewage Utility"
}

class StatusHistoryResponse(BaseModel):
    id: int
    issue_id: str
    from_status: Optional[str] = None
    to_status: str
    changed_by: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class IssueBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    latitude: float
    longitude: float
    address: str
    landmark: Optional[str] = None
    image_url: str
    reporter_name: Optional[str] = "Community Resident"
    reporter_contact: Optional[str] = None


class IssueCreate(IssueBase):
    category: Optional[str] = None
    severity: Optional[str] = None
    ai_category: Optional[str] = None
    ai_category_confidence: Optional[float] = 0.85
    ai_severity: Optional[str] = None
    ai_severity_reasoning: Optional[str] = None
    potential_duplicate_of: Optional[str] = None
    duplicate_confidence: Optional[float] = None
    duplicate_status: Optional[str] = "none"


class IssueUpdateStatus(BaseModel):
    status: str
    changed_by: str
    notes: Optional[str] = None
    assigned_department: Optional[str] = None
    assigned_person: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolution_image_url: Optional[str] = None


class IssueUpdateClassification(BaseModel):
    category: str
    override_reason: str
    severity: Optional[str] = None
    changed_by: str


class DuplicateFlagUpdate(BaseModel):
    duplicate_status: str  # dismissed or confirmed
    notes: Optional[str] = None
    changed_by: str


class IssueResponse(IssueBase):
    id: str
    category: str
    ai_category: str
    ai_category_confidence: float
    category_overridden: bool
    override_reason: Optional[str] = None
    severity: str
    ai_severity: str
    ai_severity_reasoning: Optional[str] = None
    severity_overridden: bool
    status: str
    resolution_image_url: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_department: Optional[str] = None
    assigned_person: Optional[str] = None
    potential_duplicate_of: Optional[str] = None
    duplicate_confidence: Optional[float] = None
    duplicate_status: str
    upvotes: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    timeline_events: List[StatusHistoryResponse] = []

    class Config:
        from_attributes = True


class AIAnalysisRequest(BaseModel):
    title: Optional[str] = ""
    description: str
    image_name: Optional[str] = None
    image_base64: Optional[str] = None


class AIAnalysisResponse(BaseModel):
    category: str
    category_name: str
    category_confidence: float
    severity: str
    severity_reasoning: str
    key_indicators: List[str]
    recommended_department: str
    estimated_sla: str
    is_demo_mode: bool


class DuplicateCheckRequest(BaseModel):
    latitude: float
    longitude: float
    category: str
    title: str
    description: str
    exclude_id: Optional[str] = None


class DuplicateCandidate(BaseModel):
    issue_id: str
    title: str
    category: str
    status: str
    distance_meters: float
    similarity_score: float
    image_url: str
    address: str
    created_at: datetime


class DuplicateCheckResponse(BaseModel):
    has_duplicates: bool
    potential_matches: List[DuplicateCandidate]
    top_match_id: Optional[str] = None
    warning_message: Optional[str] = None


class AnalyticsSummary(BaseModel):
    total_reports: int
    unresolved_reports: int
    in_progress_reports: int
    resolved_reports: int
    resolution_rate: float
    avg_resolution_hours: float
    category_breakdown: Dict[str, int]
    severity_breakdown: Dict[str, int]
    status_breakdown: Dict[str, int]
    flagged_duplicates_count: int
