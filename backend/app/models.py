from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(20), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # Category info (with AI suggestion + human override capability)
    category = Column(String(50), nullable=False, index=True)  # potholes, waste, broken_streetlights, water_leaks
    ai_category = Column(String(50), nullable=False)
    ai_category_confidence = Column(Float, default=0.85)
    category_overridden = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)

    # Severity info (Low, Medium, High, Critical)
    severity = Column(String(20), default="medium", index=True)
    ai_severity = Column(String(20), default="medium")
    ai_severity_reasoning = Column(Text, nullable=True)
    severity_overridden = Column(Boolean, default=False)

    # Evidence status progression: submitted -> under_review -> assigned -> in_progress -> resolved
    status = Column(String(30), default="submitted", index=True)

    # Geospatial location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    landmark = Column(String(255), nullable=True)

    # Media & evidence
    image_url = Column(String(500), nullable=False)
    resolution_image_url = Column(String(500), nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Assignment
    assigned_department = Column(String(100), nullable=True)
    assigned_person = Column(String(100), nullable=True)

    # Duplicate detection & flagging (never auto-deleting)
    potential_duplicate_of = Column(String(20), nullable=True, index=True)
    duplicate_confidence = Column(Float, nullable=True)
    duplicate_status = Column(String(30), default="none")  # none, flagged, dismissed, confirmed

    # Community verification
    reporter_name = Column(String(100), default="Community Resident")
    reporter_contact = Column(String(100), nullable=True)
    upvotes = Column(Integer, default=1)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Audit Trail
    timeline_events = relationship("StatusHistory", back_populates="issue", cascade="all, delete-orphan", order_by="StatusHistory.created_at.asc()")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(String(20), ForeignKey("issues.id"), nullable=False, index=True)
    from_status = Column(String(30), nullable=True)
    to_status = Column(String(30), nullable=False)
    changed_by = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    issue = relationship("Issue", back_populates="timeline_events")
