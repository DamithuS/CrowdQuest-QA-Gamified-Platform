from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from models import SeverityEnum, StatusEnum


# ── User ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_color: Optional[str] = None
    avatar_url: Optional[str] = None
    remove_avatar: Optional[bool] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    bio: Optional[str]
    location: Optional[str]
    avatar_color: str
    avatar_url: Optional[str] = None
    points: int
    level: int
    xp: int
    created_at: datetime

    model_config = {"from_attributes": True}

class UserPublic(BaseModel):
    id: int
    username: str
    avatar_color: str
    avatar_url: Optional[str] = None
    points: int
    level: int

    model_config = {"from_attributes": True}


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Bug Report ────────────────────────────────────────────────────────────────
class BugReportCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    steps_to_reproduce: str = Field(..., min_length=10)
    severity: SeverityEnum = SeverityEnum.medium
    website_name: Optional[str] = None
    environment: Optional[str] = None
    device_browser: Optional[str] = None
    version: Optional[str] = None
    screenshot_url: Optional[str] = None

class BugReportOut(BaseModel):
    id: int
    title: str
    description: str
    steps_to_reproduce: str
    severity: SeverityEnum
    website_name: Optional[str]
    environment: Optional[str]
    device_browser: Optional[str]
    version: Optional[str]
    screenshot_url: Optional[str]
    status: StatusEnum
    quality_score: Optional[float]
    points_awarded: Optional[int]
    submitted_by_id: int
    submitter: UserPublic
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}

class BugReportStatusUpdate(BaseModel):
    status: StatusEnum
    points_awarded: Optional[int] = None
    quality_score: Optional[float] = None


# ── Badge ─────────────────────────────────────────────────────────────────────
class BadgeOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    earned_at: datetime

    model_config = {"from_attributes": True}


# ── Leaderboard ───────────────────────────────────────────────────────────────
class LeaderboardEntry(BaseModel):
    rank: int
    user: UserPublic
    bugs_accepted: int
    bugs_submitted: int

    model_config = {"from_attributes": True}


# ── AI Severity Detection ─────────────────────────────────────────────────────
class SeverityDetectRequest(BaseModel):
    title: str
    description: str
    steps_to_reproduce: str


# ── Notification ──────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
