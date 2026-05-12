from sqlalchemy import (
    Column, Integer, String, Text, Float,
    DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class StatusEnum(str, enum.Enum):
    pending = "pending"
    under_review = "under_review"
    accepted = "accepted"
    rejected = "rejected"


# ── Users ─────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    username     = Column(String(50), unique=True, nullable=False, index=True)
    email        = Column(String(255), unique=True, nullable=False, index=True)
    password_hash= Column(String(255), nullable=False)
    bio          = Column(Text, nullable=True)
    location     = Column(String(100), nullable=True)
    avatar_color = Column(String(7), default="#6366F1")   # hex colour for letter avatar
    avatar_url   = Column(String(500), nullable=True)      # uploaded profile picture path

    points       = Column(Integer, default=0, nullable=False)
    level        = Column(Integer, default=1, nullable=False)
    xp           = Column(Integer, default=0, nullable=False)

    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    reports      = relationship("BugReport", back_populates="submitter", cascade="all, delete-orphan")


# ── Bug Reports ───────────────────────────────────────────────────────────────
class BugReport(Base):
    __tablename__ = "bug_reports"

    id                  = Column(Integer, primary_key=True, index=True)
    title               = Column(String(200), nullable=False)
    description         = Column(Text, nullable=False)
    steps_to_reproduce  = Column(Text, nullable=False)
    severity            = Column(Enum(SeverityEnum), default=SeverityEnum.medium, nullable=False)
    environment         = Column(String(100), nullable=True)   # Windows / macOS / Linux / etc.
    device_browser      = Column(String(150), nullable=True)   # e.g. "Chrome 120, iPhone 14"
    version             = Column(String(50), nullable=True)    # app version
    screenshot_url      = Column(String(500), nullable=True)   # S3 or local path

    website_name        = Column(String(200), nullable=True)            # website/app where the bug was found

    status              = Column(Enum(StatusEnum), default=StatusEnum.pending, nullable=False)
    quality_score       = Column(Float, nullable=True)         # filled by AI module
    points_awarded      = Column(Integer, nullable=True)

    submitted_by_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    submitter           = relationship("User", back_populates="reports")

    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

