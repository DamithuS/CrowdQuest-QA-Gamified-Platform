from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update as sql_update
from typing import Optional
import hashlib
import shutil
import uuid
import json
from pathlib import Path
import anthropic

from database import get_db
from models import User, BugReport, Badge, UserBadge, Notification, StatusEnum

UPLOAD_DIR = Path(__file__).parent / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
from schemas import (
    UserCreate, UserUpdate, UserOut, UserPublic,
    LoginRequest, BugReportCreate, BugReportOut, BugReportStatusUpdate,
    NotificationOut, LeaderboardEntry, SeverityDetectRequest,
)

app = FastAPI(
    title="CrowdQuestQA API_v3",
    description="Crowdsourced QA Gamification Platform",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5179"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=Path(__file__).parent / "uploads"), name="uploads")

# ── AI Client ─────────────────────────────────────────────────────────────────

ai_client = anthropic.AsyncAnthropic()

SEVERITY_SYSTEM_PROMPT = """You are an expert software QA engineer specializing in bug severity classification.

Given a bug report (title, description, and reproduction steps), classify the severity as exactly one of:
- low: Minor cosmetic issues, typos, trivial UI glitches with no functional impact
- medium: Functional issues with a workaround available, affects non-critical features
- high: Significant functional impact, no workaround, affects core features or many users
- critical: System crashes, data loss, security vulnerabilities, complete feature failure

Respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON:
{"severity": "<low|medium|high|critical>", "reasoning": "<1-2 sentence explanation>", "confidence": "<low|medium|high>"}"""

# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

POINTS_MAP = {
    StatusEnum.accepted: 50,
    StatusEnum.under_review: 20,
}

XP_PER_LEVEL = 1000

def calculate_level(xp: int) -> int:
    return max(1, xp // XP_PER_LEVEL + 1)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    user_count = await db.scalar(select(func.count(User.id)))
    report_count = await db.scalar(select(func.count(BugReport.id)))
    return {"status": "ok", "total_users": user_count, "total_reports": report_count}


# ── Users ─────────────────────────────────────────────────────────────────────

@app.post("/users/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing = await db.scalar(select(User).where(User.username == payload.username))
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@app.post("/users/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or user.password_hash != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "user": UserOut.model_validate(user)}


@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.patch("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    data = {f: getattr(payload, f) for f in payload.model_fields_set}
    if data:
        await db.execute(sql_update(User).where(User.id == user_id).values(**data))
        await db.commit()
    await db.refresh(user)
    return user


@app.delete("/users/{user_id}/avatar", response_model=UserOut)
async def delete_avatar(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.execute(sql_update(User).where(User.id == user_id).values(avatar_url=None))
    await db.commit()
    await db.refresh(user)
    return user


@app.post("/users/{user_id}/avatar", response_model=UserOut)
async def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if file.content_type not in ("image/jpeg", "image/png", "image/gif", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, and WebP images are allowed")

    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename

    with dest.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)

    user.avatar_url = f"/uploads/avatars/{filename}"
    await db.commit()
    await db.refresh(user)
    return user


# ── Bug Reports ───────────────────────────────────────────────────────────────

@app.post("/reports", response_model=BugReportOut, status_code=status.HTTP_201_CREATED)
async def submit_report(payload: BugReportCreate, user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    report = BugReport(**payload.model_dump(), submitted_by_id=user_id)
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Eager-load submitter for response
    await db.refresh(report, ["submitter"])
    return report


@app.get("/reports", response_model=list[BugReportOut])
async def get_reports(
    filter_status: Optional[StatusEnum] = None,
    filter_severity: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(BugReport)
    if filter_status:
        q = q.where(BugReport.status == filter_status)
    if filter_severity:
        q = q.where(BugReport.severity == filter_severity)
    q = q.order_by(BugReport.created_at.desc())
    result = await db.execute(q)
    reports = result.scalars().all()
    for r in reports:
        await db.refresh(r, ["submitter"])
    return reports


@app.get("/reports/{report_id}", response_model=BugReportOut)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await db.get(BugReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    await db.refresh(report, ["submitter"])
    return report


@app.patch("/reports/{report_id}/status", response_model=BugReportOut)
async def update_report_status(
    report_id: int,
    payload: BugReportStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    report = await db.get(BugReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    old_status = report.status
    report.status = payload.status

    if payload.quality_score is not None:
        report.quality_score = payload.quality_score

    # Award points when status changes to accepted or under_review
    if old_status != payload.status and payload.status in POINTS_MAP:
        pts = payload.points_awarded or POINTS_MAP[payload.status]
        report.points_awarded = pts

        user = await db.get(User, report.submitted_by_id)
        if user:
            user.points += pts
            user.xp += pts
            user.level = calculate_level(user.xp)

            notif = Notification(
                user_id=user.id,
                message=f'Your report "{report.title}" was {payload.status.value}! +{pts} points',
                type="success" if payload.status == StatusEnum.accepted else "info",
            )
            db.add(notif)

    await db.commit()
    await db.refresh(report, ["submitter"])
    return report


@app.get("/users/{user_id}/reports", response_model=list[BugReportOut])
async def get_user_reports(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BugReport)
        .where(BugReport.submitted_by_id == user_id)
        .order_by(BugReport.created_at.desc())
    )
    reports = result.scalars().all()
    for r in reports:
        await db.refresh(r, ["submitter"])
    return reports


# ── Leaderboard ───────────────────────────────────────────────────────────────

@app.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).order_by(User.points.desc()).limit(20)
    )
    users = result.scalars().all()

    leaderboard = []
    for rank, user in enumerate(users, start=1):
        submitted = await db.scalar(
            select(func.count(BugReport.id)).where(BugReport.submitted_by_id == user.id)
        )
        accepted = await db.scalar(
            select(func.count(BugReport.id)).where(
                BugReport.submitted_by_id == user.id,
                BugReport.status == StatusEnum.accepted,
            )
        )
        leaderboard.append({
            "rank": rank,
            "user": UserPublic.model_validate(user),
            "bugs_submitted": submitted,
            "bugs_accepted": accepted,
        })
    return leaderboard


# ── Notifications ─────────────────────────────────────────────────────────────

@app.get("/users/{user_id}/notifications", response_model=list[NotificationOut])
async def get_notifications(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()


@app.patch("/users/{user_id}/notifications/read")
async def mark_all_read(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    )
    for n in result.scalars().all():
        n.is_read = True
    await db.commit()
    return {"message": "All notifications marked as read"}


# ── AI ────────────────────────────────────────────────────────────────────────

@app.post("/ai/detect-severity")
async def detect_severity(payload: SeverityDetectRequest):
    try:
        response = await ai_client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=256,
            system=[{
                "type": "text",
                "text": SEVERITY_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            messages=[{
                "role": "user",
                "content": (
                    f"Title: {payload.title}\n"
                    f"Description: {payload.description}\n"
                    f"Steps to reproduce: {payload.steps_to_reproduce}"
                ),
            }],
        )
        result = json.loads(response.content[0].text)
        if result.get("severity") not in ("low", "medium", "high", "critical"):
            raise ValueError("Invalid severity value")
        return result
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=500, detail="AI returned an unexpected response format")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e.message}")
