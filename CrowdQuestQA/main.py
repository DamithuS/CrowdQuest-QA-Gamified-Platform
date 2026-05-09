from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, BackgroundTasks
import asyncio
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
from groq import AsyncGroq
import os

from database import get_db, AsyncSessionLocal
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

groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SEVERITY_PROMPT_TEMPLATE = """You are an expert software QA engineer specializing in bug severity classification.

Given a bug report (title, description, and reproduction steps), classify the severity as exactly one of:
- low: Minor cosmetic issues, typos, trivial UI glitches with no functional impact
- medium: Functional issues with a workaround available, affects non-critical features
- high: Significant functional impact, no workaround, affects core features or many users
- critical: System crashes, data loss, security vulnerabilities, complete feature failure

Respond with ONLY a valid JSON object — no markdown, no explanation outside the JSON:
{{"severity": "<low|medium|high|critical>", "reasoning": "<1-2 sentence explanation>", "confidence": "<low|medium|high>"}}

Title: {title}
Description: {description}
Steps to reproduce: {steps}"""

QUALITY_PROMPT_TEMPLATE = """You are a senior QA engineer reviewing a bug report submission.

Score this report from 0.0 to 10.0 and assign a status:
- accepted (score >= 7.0): Clear title, detailed description, complete reproducible steps
- under_review (score 4.0–6.9): Decent report but missing some detail
- rejected (score < 4.0): Too vague, missing steps, or not a real bug

Respond with ONLY valid JSON — no markdown, no explanation outside the JSON:
{{"quality_score": <0.0-10.0>, "status": "<accepted|under_review|rejected>", "feedback": "<one sentence>"}}

Title: {title}
Description: {description}
Steps to reproduce: {steps}
Severity: {severity}"""

async def auto_review_report(report_id: int):
    await asyncio.sleep(30)
    async with AsyncSessionLocal() as db:
        report = await db.get(BugReport, report_id)
        if not report or report.status != StatusEnum.pending:
            return
        try:
            prompt = QUALITY_PROMPT_TEMPLATE.format(
                title=report.title,
                description=report.description,
                steps=report.steps_to_reproduce,
                severity=report.severity.value,
            )
            response = await groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=128,
            )
            text = response.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            result = json.loads(text.strip())
            score = float(result.get("quality_score", 5.0))
            new_status = result.get("status", "under_review")
            if new_status not in ("accepted", "under_review", "rejected"):
                new_status = "under_review"
            new_status_enum = StatusEnum(new_status)
            pts = POINTS_MAP.get(new_status_enum, 0)
            await db.execute(
                sql_update(BugReport).where(BugReport.id == report_id).values(
                    status=new_status_enum,
                    quality_score=round(score, 1),
                    points_awarded=pts if pts else None,
                )
            )
            if pts:
                await db.execute(
                    sql_update(User).where(User.id == report.submitted_by_id).values(
                        points=User.points + pts,
                        xp=User.xp + pts,
                    )
                )
                user = await db.get(User, report.submitted_by_id)
                if user:
                    new_level = calculate_level(user.xp + pts)
                    await db.execute(
                        sql_update(User).where(User.id == report.submitted_by_id).values(level=new_level)
                    )
            notif_msg = f'Your report "{report.title[:50]}" was {new_status.replace("_", " ")}!'
            if pts:
                notif_msg += f' +{pts} points'
            db.add(Notification(
                user_id=report.submitted_by_id,
                message=notif_msg,
                type="success" if new_status == "accepted" else "info",
            ))
            await db.commit()
        except Exception:
            pass


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
    exists = await db.scalar(select(User).where(User.id == user_id))
    if not exists:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.username:
        taken = await db.scalar(
            select(User).where(User.username == payload.username, User.id != user_id)
        )
        if taken:
            raise HTTPException(status_code=400, detail="Username already taken")
    data = {f: getattr(payload, f) for f in payload.model_fields_set if f != "remove_avatar"}
    if payload.remove_avatar:
        data["avatar_url"] = None
    if data:
        await db.execute(sql_update(User).where(User.id == user_id).values(**data))
        await db.commit()
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one()


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
async def submit_report(payload: BugReportCreate, user_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    report = BugReport(**payload.model_dump(), submitted_by_id=user_id)
    db.add(report)
    await db.commit()
    await db.refresh(report)
    await db.refresh(report, ["submitter"])

    background_tasks.add_task(auto_review_report, report.id)
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
        prompt = SEVERITY_PROMPT_TEMPLATE.format(
            title=payload.title,
            description=payload.description,
            steps=payload.steps_to_reproduce,
        )
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=256,
        )
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text.strip())
        if result.get("severity") not in ("low", "medium", "high", "critical"):
            raise ValueError("Invalid severity value")
        return result
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=500, detail="AI returned an unexpected response format")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
