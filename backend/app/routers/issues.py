import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from ..database import get_db
from ..models import Issue, StatusHistory
from ..schemas import (
    IssueCreate, IssueResponse, IssueUpdateStatus,
    IssueUpdateClassification, DuplicateFlagUpdate,
    DEPARTMENT_MAPPINGS, CATEGORY_NAMES
)
from ..ai_service import ai_service
from ..config import settings

router = APIRouter(prefix="/api/issues", tags=["Issues"])


def generate_issue_id(db: Session) -> str:
    count = db.query(Issue).count() + 101
    candidate = f"CV-{count}"
    while db.query(Issue).filter(Issue.id == candidate).first():
        count += 1
        candidate = f"CV-{count}"
    return candidate


@router.get("", response_model=List[IssueResponse])
def get_issues(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    search: Optional[str] = Query(None, description="Text search title, description, address"),
    duplicates_only: Optional[bool] = Query(False, description="Filter flagged duplicates only"),
    db: Session = Depends(get_db)
):
    query = db.query(Issue)

    if category and category.lower() != "all":
        query = query.filter(Issue.category == category.lower())

    if status and status.lower() != "all":
        query = query.filter(Issue.status == status.lower())

    if severity and severity.lower() != "all":
        query = query.filter(Issue.severity == severity.lower())

    if duplicates_only:
        query = query.filter(Issue.duplicate_status == "flagged")

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Issue.id.ilike(s),
                Issue.title.ilike(s),
                Issue.description.ilike(s),
                Issue.address.ilike(s),
                Issue.assigned_department.ilike(s)
            )
        )

    # Order by newest first
    issues = query.order_by(desc(Issue.created_at)).all()
    return issues


@router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.post("", response_model=IssueResponse, status_code=201)
def create_issue(issue_in: IssueCreate, db: Session = Depends(get_db)):
    # 1. Run AI classification if not explicitly provided
    if not issue_in.category or not issue_in.severity:
        ai_res = ai_service.classify_issue(
            title=issue_in.title,
            description=issue_in.description,
            image_name=issue_in.image_url
        )
        final_category = issue_in.category or ai_res["category"]
        final_severity = issue_in.severity or ai_res["severity"]
        ai_cat = ai_res["category"]
        ai_cat_conf = ai_res["category_confidence"]
        ai_sev = ai_res["severity"]
        ai_sev_reason = ai_res["severity_reasoning"]
    else:
        final_category = issue_in.category
        final_severity = issue_in.severity
        ai_cat = issue_in.ai_category or issue_in.category
        ai_cat_conf = issue_in.ai_category_confidence or 0.88
        ai_sev = issue_in.ai_severity or issue_in.severity
        ai_sev_reason = issue_in.ai_severity_reasoning or "User designated classification"

    # 2. Check for potential duplicate reports in existing database
    existing_all = db.query(Issue).filter(Issue.status != "resolved").all()
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
        for i in existing_all
    ]

    dupe_res = ai_service.detect_duplicates(
        new_lat=issue_in.latitude,
        new_lon=issue_in.longitude,
        new_category=final_category,
        new_title=issue_in.title,
        new_description=issue_in.description,
        existing_issues=existing_dicts
    )

    potential_duplicate_of = issue_in.potential_duplicate_of
    duplicate_confidence = issue_in.duplicate_confidence
    duplicate_status = issue_in.duplicate_status or "none"

    if dupe_res["has_duplicates"] and not potential_duplicate_of:
        top_match = dupe_res["potential_matches"][0]
        potential_duplicate_of = top_match["issue_id"]
        duplicate_confidence = top_match["similarity_score"] / 100.0
        duplicate_status = "flagged"

    new_id = generate_issue_id(db)
    now = datetime.utcnow()

    # Recommended department
    dept = DEPARTMENT_MAPPINGS.get(final_category, "Department of Public Works")

    new_issue = Issue(
        id=new_id,
        title=issue_in.title,
        description=issue_in.description,
        category=final_category,
        ai_category=ai_cat,
        ai_category_confidence=ai_cat_conf,
        category_overridden=False,
        severity=final_severity,
        ai_severity=ai_sev,
        ai_severity_reasoning=ai_sev_reason,
        severity_overridden=False,
        status="submitted",
        latitude=issue_in.latitude,
        longitude=issue_in.longitude,
        address=issue_in.address,
        landmark=issue_in.landmark,
        image_url=issue_in.image_url,
        assigned_department=dept,
        potential_duplicate_of=potential_duplicate_of,
        duplicate_confidence=duplicate_confidence,
        duplicate_status=duplicate_status,
        reporter_name=issue_in.reporter_name or "Community Resident",
        reporter_contact=issue_in.reporter_contact,
        upvotes=1,
        created_at=now,
        updated_at=now
    )
    db.add(new_issue)
    db.flush()

    # Initial timeline entry
    notes = "Report submitted by community member with photographic evidence and geolocation."
    if duplicate_status == "flagged" and potential_duplicate_of:
        notes += f" Automated proximity engine flagged {int(duplicate_confidence * 100)}% similarity to #{potential_duplicate_of}."

    init_event = StatusHistory(
        issue_id=new_id,
        from_status=None,
        to_status="submitted",
        changed_by=issue_in.reporter_name or "Community Resident",
        notes=notes,
        created_at=now
    )
    db.add(init_event)
    db.commit()
    db.refresh(new_issue)

    return new_issue


@router.patch("/{issue_id}/status", response_model=IssueResponse)
def update_issue_status(issue_id: str, payload: IssueUpdateStatus, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    valid_statuses = ["submitted", "under_review", "assigned", "in_progress", "resolved"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    old_status = issue.status
    now = datetime.utcnow()
    issue.status = payload.status
    issue.updated_at = now

    if payload.assigned_department:
        issue.assigned_department = payload.assigned_department
    if payload.assigned_person:
        issue.assigned_person = payload.assigned_person
    if payload.resolution_notes:
        issue.resolution_notes = payload.resolution_notes
    if payload.resolution_image_url:
        issue.resolution_image_url = payload.resolution_image_url

    if payload.status == "resolved" and not issue.resolved_at:
        issue.resolved_at = now

    event = StatusHistory(
        issue_id=issue.id,
        from_status=old_status,
        to_status=payload.status,
        changed_by=payload.changed_by,
        notes=payload.notes or f"Status transitioned from {old_status.replace('_', ' ')} to {payload.status.replace('_', ' ')}.",
        created_at=now
    )
    db.add(event)
    db.commit()
    db.refresh(issue)

    return issue


@router.patch("/{issue_id}/classification", response_model=IssueResponse)
def override_classification(issue_id: str, payload: IssueUpdateClassification, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    old_cat = issue.category
    now = datetime.utcnow()

    issue.category = payload.category
    issue.category_overridden = True
    issue.override_reason = payload.override_reason
    issue.assigned_department = DEPARTMENT_MAPPINGS.get(payload.category, issue.assigned_department)
    issue.updated_at = now

    if payload.severity:
        issue.severity = payload.severity
        issue.severity_overridden = True

    event = StatusHistory(
        issue_id=issue.id,
        from_status=issue.status,
        to_status=issue.status,
        changed_by=payload.changed_by,
        notes=f"Staff reclassification: Category changed from {CATEGORY_NAMES.get(old_cat, old_cat)} to {CATEGORY_NAMES.get(payload.category, payload.category)}. Reason: {payload.override_reason}",
        created_at=now
    )
    db.add(event)
    db.commit()
    db.refresh(issue)

    return issue


@router.patch("/{issue_id}/duplicate", response_model=IssueResponse)
def update_duplicate_flag(issue_id: str, payload: DuplicateFlagUpdate, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    now = datetime.utcnow()
    issue.duplicate_status = payload.duplicate_status
    issue.updated_at = now

    notes = payload.notes or f"Duplicate flag updated to '{payload.duplicate_status}'."
    event = StatusHistory(
        issue_id=issue.id,
        from_status=issue.status,
        to_status=issue.status,
        changed_by=payload.changed_by,
        notes=notes,
        created_at=now
    )
    db.add(event)
    db.commit()
    db.refresh(issue)

    return issue


@router.post("/{issue_id}/upvote", response_model=IssueResponse)
def upvote_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.upvotes += 1
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Receives and stores uploaded photo evidence."""
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    safe_name = f"evidence_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = settings.UPLOAD_DIR / safe_name

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": safe_name,
        "url": f"/uploads/{safe_name}",
        "original_name": file.filename
    }
