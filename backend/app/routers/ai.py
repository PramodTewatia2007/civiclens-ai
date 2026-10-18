from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Issue
from ..schemas import (
    AIAnalysisRequest, AIAnalysisResponse,
    DuplicateCheckRequest, DuplicateCheckResponse
)
from ..ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])


@router.post("/classify", response_model=AIAnalysisResponse)
def classify_issue_content(request: AIAnalysisRequest):
    """
    Simulates or executes AI vision & text model to suggest category,
    severity, key indicators, and municipal department.
    """
    result = ai_service.classify_issue(
        title=request.title or "",
        description=request.description or "",
        image_name=request.image_name
    )
    return result


@router.post("/check-duplicates", response_model=DuplicateCheckResponse)
def check_duplicates_endpoint(request: DuplicateCheckRequest, db: Session = Depends(get_db)):
    """
    Evaluates new report coordinates, category, and text against existing
    unresolved reports within proximity radius.
    """
    existing_query = db.query(Issue).filter(Issue.status != "resolved")
    if request.exclude_id:
        existing_query = existing_query.filter(Issue.id != request.exclude_id)

    existing_issues = existing_query.all()
    existing_dicts = [
        {
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "category": i.category,
            "status": i.status,
            "latitude": i.latitude,
            "longitude": i.longitude,
            "image_url": i.image_url,
            "address": i.address,
            "created_at": i.created_at
        }
        for i in existing_issues
    ]

    result = ai_service.detect_duplicates(
        new_lat=request.latitude,
        new_lon=request.longitude,
        new_category=request.category,
        new_title=request.title,
        new_description=request.description,
        existing_issues=existing_dicts
    )
    return result
