from __future__ import annotations

import ast
import io
import logging
import os
import re
import uuid
from contextlib import redirect_stdout
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from content_lessons import LANGUAGE_META, all_lessons, language_lessons
from content_quiz import CHALLENGES, QUIZ_BANK
from content_syntax import SYNTAX_LIBRARY, all_syntax
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "syntaxai-development-secret-key-32chars-min")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="SyntaxAI SMA API", version="1.1.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)
logger = logging.getLogger("syntaxai")

LEVEL_NAMES = [
    "Coding Newbie", "Code Explorer", "Junior Coder", "Coding Apprentice",
    "Code Builder", "AI Explorer", "AI Builder", "Code Master",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def level_for_xp(xp: int) -> tuple[int, str]:
    level = min(len(LEVEL_NAMES), max(1, xp // 100 + 1))
    return level, LEVEL_NAMES[level - 1]


class RegisterInput(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    experience: str = "Belum pernah coding"


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileInput(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    experience: str | None = None


class ProgressInput(BaseModel):
    item_id: str
    item_type: Literal["lesson", "syntax", "challenge", "project"]
    percentage: int = Field(default=100, ge=0, le=100)
    xp: int = Field(default=0, ge=0, le=200)


class QuizInput(BaseModel):
    quiz_id: str
    score: int = Field(ge=0, le=100)
    correct_answers: int = Field(ge=0)
    wrong_answers: int = Field(ge=0)


class BookmarkInput(BaseModel):
    content_type: str
    content_id: str
    title: str


class NoteInput(BaseModel):
    content_type: str
    content_id: str
    note: str = Field(min_length=1, max_length=2000)


class HistoryInput(BaseModel):
    content_type: str
    content_id: str
    title: str


class RunCodeInput(BaseModel):
    language: Literal["python", "javascript", "cpp", "java"]
    code: str = Field(max_length=5000)


class ChallengeSubmitInput(BaseModel):
    challenge_id: str
    code: str = Field(max_length=5000)


def user_public(user: dict[str, Any]) -> dict[str, Any]:
    xp = user.get("xp", 0)
    level, level_name = level_for_xp(xp)
    return {"id": user["id"], "name": user["name"], "email": user["email"], "avatar": user.get("avatar", ""), "level": level, "level_name": level_name, "xp": xp, "streak": user.get("streak", 0), "experience": user.get("experience", "Belum pernah coding"), "created_at": user.get("created_at", now_iso())}


def token_for(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=30)}, JWT_SECRET, algorithm="HS256")


async def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesi login diperlukan")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Sesi login tidak valid") from exc
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
    return user


# -----------------------------------------------------------------------------
# Streak logic
# -----------------------------------------------------------------------------

async def update_streak(user: dict[str, Any]) -> int:
    today = datetime.now(timezone.utc).date().isoformat()
    last = user.get("last_active")
    streak = user.get("streak", 0)
    if last == today:
        return streak
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    streak = streak + 1 if last == yesterday else 1
    await db.users.update_one({"id": user["id"]}, {"$set": {"streak": streak, "last_active": today}})
    return streak


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------

@api_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "SyntaxAI SMA API siap digunakan"}


@api_router.post("/auth/register")
async def register(data: RegisterInput) -> dict[str, Any]:
    email = data.email.lower()
    if await db.users.find_one({"email": email}, {"_id": 0, "id": 1}):
        raise HTTPException(status_code=409, detail="Email sudah terdaftar")
    user_id = str(uuid.uuid4())
    created_at = now_iso()
    await db.users.insert_one({"id": user_id, "name": data.name.strip(), "email": email, "password_hash": bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode(), "avatar": "", "level": 1, "level_name": LEVEL_NAMES[0], "xp": 0, "streak": 1, "last_active": datetime.now(timezone.utc).date().isoformat(), "experience": data.experience, "created_at": created_at, "updated_at": created_at})
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return {"token": token_for(user_id), "user": user_public(user)}


@api_router.post("/auth/login")
async def login(data: LoginInput) -> dict[str, Any]:
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if not user or not bcrypt.checkpw(data.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Email atau password belum sesuai")
    await update_streak(user)
    user = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"token": token_for(user["id"]), "user": user_public(user)}


@api_router.get("/auth/me")
async def me(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return user_public(user)


@api_router.patch("/profile")
async def update_profile(data: ProfileInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    update: dict[str, Any] = {"updated_at": now_iso()}
    if data.name is not None:
        update["name"] = data.name.strip()
    if data.experience is not None:
        update["experience"] = data.experience
    await db.users.update_one({"id": user["id"]}, {"$set": update})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return user_public(updated)


@api_router.delete("/account")
async def delete_account(user: dict[str, Any] = Depends(current_user)) -> dict[str, str]:
    user_id = user["id"]
    for collection in ("users", "user_progress", "quiz_results", "bookmarks", "notes", "history", "submissions"):
        await db[collection].delete_many({"user_id": user_id} if collection != "users" else {"id": user_id})
    return {"message": "Akun dan data pembelajaran berhasil dihapus"}


@api_router.get("/catalog")
async def catalog(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    progress = await db.user_progress.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    done = {item["item_id"]: item["percentage"] for item in progress}
    languages = []
    for language in LANGUAGE_META:
        lessons = language_lessons(language["id"])
        total = max(1, len(lessons))
        percentage = round(sum(done.get(lesson["id"], 0) for lesson in lessons) / total)
        languages.append({**language, "progress": percentage, "lessons_count": len(lessons), "syntax_count": len(SYNTAX_LIBRARY.get(language["id"], []))})
    return {"languages": languages, "lessons": all_lessons(), "syntax": all_syntax()}


@api_router.get("/dashboard")
async def dashboard(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    await update_streak(user)
    user = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    user_progress = await db.user_progress.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    bookmarks = await db.bookmarks.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    notes = await db.notes.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(20)
    history = await db.history.find({"user_id": user["id"]}, {"_id": 0}).sort("visited_at", -1).to_list(20)
    lessons_list = all_lessons()
    lessons_by_id = {item["id"]: item for item in lessons_list}
    completed = [item for item in user_progress if item.get("item_type") == "lesson" and item.get("percentage", 0) >= 100]
    active = next((item for item in sorted(user_progress, key=lambda x: x.get("updated_at", ""), reverse=True) if item.get("item_type") == "lesson" and item.get("percentage", 0) < 100), None)
    active_lesson = lessons_by_id.get(active["item_id"]) if active else lessons_by_id["python-lesson-1"]
    language_progress: dict[str, int] = {}
    for language in LANGUAGE_META:
        language_total = max(1, len(language_lessons(language["id"])))
        language_progress[language["id"]] = round(sum(item.get("percentage", 0) for item in user_progress if item.get("item_type") == "lesson" and item.get("item_id", "").startswith(language["id"] + "-lesson-")) / language_total)
    daily_syntax = SYNTAX_LIBRARY["python"][datetime.now(timezone.utc).day % len(SYNTAX_LIBRARY["python"])]
    daily_syntax = {**daily_syntax, "language_id": "python"}
    daily_challenge = CHALLENGES[datetime.now(timezone.utc).day % len(CHALLENGES)]
    xp = user.get("xp", 0)
    level, level_name = level_for_xp(xp)
    badges = [
        {"id": "first-code", "title": "First Code", "description": "Menjalankan kode pertama", "unlocked": any(item.get("item_type") == "challenge" for item in user_progress)},
        {"id": "syntax-explorer", "title": "Syntax Explorer", "description": "Mempelajari syntax baru", "unlocked": any(item.get("item_type") == "syntax" for item in user_progress)},
        {"id": "quiz-master", "title": "Quiz Master", "description": "Mendapatkan nilai kuis 90 atau lebih", "unlocked": await db.quiz_results.find_one({"user_id": user["id"], "score": {"$gte": 90}}, {"_id": 0}) is not None},
        {"id": "challenge-solver", "title": "Challenge Solver", "description": "Menyelesaikan coding challenge", "unlocked": len([item for item in user_progress if item.get("item_type") == "challenge" and item.get("percentage", 0) >= 100]) >= 3},
        {"id": "python-starter", "title": "Python Starter", "description": "Selesaikan Python dasar", "unlocked": language_progress.get("python", 0) >= 20},
        {"id": "web-apprentice", "title": "Web Apprentice", "description": "Pelajari HTML dan CSS", "unlocked": language_progress.get("html", 0) > 0 and language_progress.get("css", 0) > 0},
        {"id": "ai-explorer", "title": "AI Explorer", "description": "Mulai modul AI", "unlocked": language_progress.get("ai", 0) > 0},
        {"id": "ai-ethics", "title": "AI Ethics Learner", "description": "Selesaikan materi etika AI", "unlocked": any(item.get("item_id") == "ai-lesson-14" and item.get("percentage", 0) >= 100 for item in user_progress)},
    ]
    if active:
        active_lesson = {**active_lesson, "progress": active.get("percentage", 0)}
    else:
        active_lesson = {**active_lesson, "progress": 0}
    recommendation = _recommend(user, user_progress, language_progress, active_lesson)
    return {"user": {**user_public(user), "level": level, "level_name": level_name}, "active_lesson": active_lesson, "language_progress": language_progress, "completed_lessons": len(completed), "syntax_learned": len([item for item in user_progress if item.get("item_type") == "syntax"]), "quiz_completed": await db.quiz_results.count_documents({"user_id": user["id"]}), "challenge_completed": len([item for item in user_progress if item.get("item_type") == "challenge" and item.get("percentage", 0) >= 100]), "badges": badges, "bookmarks": bookmarks, "notes": notes, "history": history, "recommendation": recommendation, "daily_syntax": daily_syntax, "daily_challenge": daily_challenge}


def _recommend(user: dict[str, Any], progress: list[dict[str, Any]], language_progress: dict[str, int], active: dict[str, Any]) -> str:
    done_ids = {item.get("item_id") for item in progress if item.get("percentage", 0) >= 100}
    if not progress:
        return "Mulai dari Python Pengenalan untuk membangun fondasi coding kamu."
    low_quiz = [item for item in progress if item.get("item_type") == "quiz" and item.get("percentage", 0) < 70]
    if low_quiz:
        return "Nilai kuismu masih bisa ditingkatkan. Ulangi materi terkait sebelum lanjut."
    if active and active.get("id") not in done_ids:
        return f"Lanjutkan {active.get('title')} untuk mengunci progress hari ini."
    if language_progress.get("ai", 0) == 0:
        return "Setelah coding dasar, cobalah modul AI untuk melihat penerapan nyata."
    return "Coba coding challenge untuk menguji pemahaman dan dapatkan XP tambahan."


@api_router.get("/lessons/{lesson_id}")
async def lesson_detail(lesson_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    lesson = next((item for item in all_lessons() if item["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Materi belum ditemukan")
    syntax = [dict(item, language_id=lesson["language_id"]) for item in SYNTAX_LIBRARY.get(lesson["language_id"], [])[:5]]
    progress = await db.user_progress.find_one({"user_id": user["id"], "item_id": lesson_id}, {"_id": 0})
    language_challenges = [item for item in CHALLENGES if item["language_id"] == lesson["language_id"]]
    challenge = language_challenges[(lesson["order"] - 1) % max(1, len(language_challenges))] if language_challenges else None
    return {"lesson": lesson, "progress": progress.get("percentage", 0) if progress else 0, "sections": lesson.get("sections", []), "syntax": syntax, "quiz_id": f"quiz-{lesson_id}", "challenge": challenge}


@api_router.get("/syntax")
async def syntax_search(q: str = "", language: str = "", user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    query = q.strip().lower()
    items = all_syntax()
    if language:
        items = [item for item in items if item["language_id"] == language]
    if query:
        items = [item for item in items if query in (item["name"] + item["category"] + item["description"] + item["language_id"]).lower()]
    return {"items": items[:60], "count": len(items)}


@api_router.get("/syntax/{syntax_id}")
async def syntax_detail(syntax_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    item = next((entry for entry in all_syntax() if entry["id"] == syntax_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Syntax belum ditemukan")
    return item


@api_router.get("/quizzes/{quiz_id}")
async def quiz(quiz_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    lesson_id = quiz_id.removeprefix("quiz-") if quiz_id.startswith("quiz-") else quiz_id
    lesson = next((item for item in all_lessons() if item["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Kuis belum ditemukan")
    bank = QUIZ_BANK.get(lesson_id)
    if bank:
        questions = bank
    else:
        language_items = SYNTAX_LIBRARY[lesson["language_id"]][:4] or SYNTAX_LIBRARY["python"][:4]
        questions = [
            {"id": f"{quiz_id}-1", "question": f"Apa fokus utama materi {lesson['title']}?", "options": [lesson["summary"], "Mengganti perangkat", "Membuat akun sekolah", "Menghapus semua kode"], "answer": 0, "explanation": "Materi ini membangun pemahaman bertahap melalui praktik."},
            {"id": f"{quiz_id}-2", "question": f"Syntax mana yang relevan untuk mulai berlatih {lesson['title']}?", "options": [item["name"] for item in language_items[:4]], "answer": 0, "explanation": "Pilih syntax dasar, lalu uji dengan contoh kecil."},
            {"id": f"{quiz_id}-3", "question": f"Setelah selesai {lesson['title']}, apa langkah terbaik?", "options": ["Coba contoh di simulator", "Hapus semua catatan", "Berhenti belajar", "Minta jawaban langsung ke AI"], "answer": 0, "explanation": "Praktik langsung membantu mengkonsolidasi pemahaman."},
        ]
    return {"id": quiz_id, "title": f"Kuis {lesson['title']}", "lesson": lesson, "questions": questions}


@api_router.get("/challenges")
async def challenges(language: str = "", user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    items = [item for item in CHALLENGES if not language or item["language_id"] == language]
    return {"items": items}


@api_router.get("/challenges/{challenge_id}")
async def challenge_detail(challenge_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    item = next((entry for entry in CHALLENGES if entry["id"] == challenge_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Challenge tidak ditemukan")
    return item


@api_router.post("/progress")
async def save_progress(data: ProgressInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    await db.user_progress.update_one({"user_id": user["id"], "item_id": data.item_id}, {"$set": {"user_id": user["id"], "item_id": data.item_id, "item_type": data.item_type, "percentage": data.percentage, "updated_at": now_iso()}, "$setOnInsert": {"created_at": now_iso()}}, upsert=True)
    if data.xp:
        new_xp = user.get("xp", 0) + data.xp
        level, level_name = level_for_xp(new_xp)
        await db.users.update_one({"id": user["id"]}, {"$set": {"xp": new_xp, "level": level, "level_name": level_name, "updated_at": now_iso()}})
    return {"message": "Progress tersimpan", "xp_earned": data.xp}


@api_router.post("/quiz-results")
async def save_quiz(data: QuizInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    await db.quiz_results.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], **data.model_dump(), "completed_at": now_iso()})
    earned = 25 if data.score >= 90 else 20 if data.score >= 70 else 10
    new_xp = user.get("xp", 0) + earned
    level, level_name = level_for_xp(new_xp)
    await db.users.update_one({"id": user["id"]}, {"$set": {"xp": new_xp, "level": level, "level_name": level_name, "updated_at": now_iso()}})
    return {"message": "Hasil kuis tersimpan", "xp_earned": earned, "score": data.score}


@api_router.get("/bookmarks")
async def get_bookmarks(user: dict[str, Any] = Depends(current_user)) -> list[dict[str, Any]]:
    return await db.bookmarks.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).sort("created_at", -1).to_list(100)


@api_router.post("/bookmarks")
async def toggle_bookmark(data: BookmarkInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    existing = await db.bookmarks.find_one({"user_id": user["id"], "content_id": data.content_id}, {"_id": 0})
    if existing:
        await db.bookmarks.delete_one({"user_id": user["id"], "content_id": data.content_id})
        return {"saved": False}
    await db.bookmarks.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], **data.model_dump(), "created_at": now_iso()})
    return {"saved": True}


@api_router.get("/notes")
async def get_notes(user: dict[str, Any] = Depends(current_user)) -> list[dict[str, Any]]:
    return await db.notes.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).sort("updated_at", -1).to_list(100)


@api_router.post("/notes")
async def save_note(data: NoteInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    note_id = str(uuid.uuid4())
    now = now_iso()
    await db.notes.insert_one({"id": note_id, "user_id": user["id"], **data.model_dump(), "created_at": now, "updated_at": now})
    return {"id": note_id, "content_type": data.content_type, "content_id": data.content_id, "note": data.note, "created_at": now, "updated_at": now}


@api_router.post("/history")
async def save_history(data: HistoryInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, str]:
    await db.history.update_one({"user_id": user["id"], "content_id": data.content_id}, {"$set": {"user_id": user["id"], **data.model_dump(), "visited_at": now_iso()}}, upsert=True)
    return {"message": "Riwayat tersimpan"}


# -----------------------------------------------------------------------------
# Code simulator (sandbox terbatas untuk Python, static pattern matching lain)
# -----------------------------------------------------------------------------

def safe_python(code: str) -> tuple[str, str | None]:
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return "", f"SyntaxError: {exc.msg} di baris {exc.lineno}"
    allowed = (
        ast.Module, ast.Expr, ast.Assign, ast.AugAssign, ast.Name, ast.Load, ast.Store, ast.Constant,
        ast.Call, ast.BinOp, ast.UnaryOp, ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow,
        ast.USub, ast.UAdd, ast.Compare, ast.Gt, ast.GtE, ast.Lt, ast.LtE, ast.Eq, ast.NotEq, ast.BoolOp,
        ast.And, ast.Or, ast.Not, ast.List, ast.Tuple, ast.Dict, ast.Set, ast.JoinedStr, ast.FormattedValue,
        ast.If, ast.For, ast.While, ast.Break, ast.Continue, ast.Pass, ast.Subscript, ast.Index, ast.Slice,
        ast.FunctionDef, ast.Return, ast.arguments, ast.arg, ast.keyword, ast.Attribute, ast.In, ast.NotIn,
        ast.IfExp, ast.ListComp, ast.comprehension, ast.GeneratorExp, ast.SetComp, ast.DictComp,
    )
    if any(not isinstance(node, allowed) for node in ast.walk(tree)):
        return "", "Simulator pembelajaran membatasi fitur Python. Pakai variable, operasi sederhana, if/for/while, dan print()."
    for node in ast.walk(tree):
        if isinstance(node, ast.Attribute):
            attr = node.attr
            if attr.startswith("_"):
                return "", "Akses atribut dunder dibatasi untuk alasan keamanan."
    output = io.StringIO()
    safe_builtins = {
        "print": print, "len": len, "range": range, "str": str, "int": int, "float": float, "bool": bool,
        "list": list, "tuple": tuple, "set": set, "dict": dict, "sum": sum, "min": min, "max": max,
        "abs": abs, "round": round, "sorted": sorted, "reversed": reversed, "enumerate": enumerate,
        "zip": zip, "map": map, "filter": filter, "True": True, "False": False, "None": None,
    }
    try:
        with redirect_stdout(output):
            exec(compile(tree, "<student-code>", "exec"), {"__builtins__": safe_builtins}, {})
        return output.getvalue().rstrip(), None
    except Exception as exc:
        return "", f"{type(exc).__name__}: {exc}"


def simple_output(code: str, language: str) -> tuple[str, str | None]:
    if len(code) > 5000:
        return "", "Kode terlalu panjang untuk simulator belajar."
    if re.search(r"(import\s+os|subprocess|require\s*\(|fetch\s*\(|System\.exit|Runtime|system\s*\(|eval\s*\()", code, re.I):
        return "", "Akses file, jaringan, dan system dibatasi demi keamanan belajar."
    patterns = {
        "javascript": r"console\.log\((.*?)\)",
        "cpp": r"cout\s*<<\s*(.*?)(?:;|<<\s*endl|$)",
        "java": r"System\.out\.print(?:ln|f)?\((.*?)\)",
    }
    values = re.findall(patterns[language], code, re.M)
    if not values:
        return "Program berhasil diperiksa. Tambahkan perintah output untuk melihat hasilnya.", None
    rendered: list[str] = []
    for value in values:
        value = value.strip()
        # Resolve concatenations with + for strings, or simple expressions.
        parts = re.split(r"\s*<<\s*|\s*,\s*|\s*\+\s*", value)
        pieces = []
        for part in parts:
            part = part.strip()
            if not part:
                continue
            if part in ("endl", "\\n"):
                pieces.append("\n")
                continue
            if (part.startswith('"') and part.endswith('"')) or (part.startswith("'") and part.endswith("'")):
                pieces.append(part[1:-1])
                continue
            # Try evaluate simple arithmetic
            try:
                if re.match(r"^[\d\.\+\-\*\/\(\)\s]+$", part):
                    pieces.append(str(eval(part, {"__builtins__": {}}, {})))
                    continue
            except Exception:
                pass
            pieces.append(part)
        rendered.append("".join(pieces))
    return "\n".join(rendered), None


@api_router.post("/run-code")
async def run_code(data: RunCodeInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if data.language == "python":
        output, error = safe_python(data.code)
    else:
        output, error = simple_output(data.code, data.language)
    return {"output": output, "error": error, "hint": "Periksa tanda kurung, indentasi, dan nama variable." if error else "Mantap! Coba ubah satu bagian kode dan amati perbedaannya."}


@api_router.post("/challenges/submit")
async def submit_challenge(data: ChallengeSubmitInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    challenge = next((entry for entry in CHALLENGES if entry["id"] == data.challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge tidak ditemukan")
    language = challenge["language_id"]
    expected = challenge["expected"].strip()
    if language in ("html", "css"):
        # Checklist pattern: expected harus muncul di kode
        passed = expected.lower() in data.code.lower()
        output = data.code[:200]
    elif language == "ai":
        passed = expected.lower() in data.code.lower()
        output = "Prompt dirancang"
    elif language == "python":
        output, error = safe_python(data.code)
        passed = (error is None) and (output.strip() == expected)
    else:
        output, error = simple_output(data.code, language if language in ("javascript", "cpp", "java") else "python")
        passed = (error is None) and (output.strip() == expected)
    if passed:
        xp = challenge["xp"]
        await db.user_progress.update_one({"user_id": user["id"], "item_id": challenge["id"]}, {"$set": {"user_id": user["id"], "item_id": challenge["id"], "item_type": "challenge", "percentage": 100, "updated_at": now_iso()}, "$setOnInsert": {"created_at": now_iso()}}, upsert=True)
        new_xp = user.get("xp", 0) + xp
        level, level_name = level_for_xp(new_xp)
        await db.users.update_one({"id": user["id"]}, {"$set": {"xp": new_xp, "level": level, "level_name": level_name, "updated_at": now_iso()}})
        feedback = f"Keren! Output sesuai target. +{xp} XP."
    else:
        xp = 0
        feedback = "Belum sesuai. Bandingkan output kamu dengan output yang diharapkan."
    await db.submissions.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], "challenge_id": data.challenge_id, "code": data.code[:1000], "passed": passed, "output": output[:500] if isinstance(output, str) else "", "created_at": now_iso()})
    return {"passed": passed, "output": output or "", "expected": expected, "xp_earned": xp, "feedback": feedback}


# -----------------------------------------------------------------------------
# AI Tutor (Claude Sonnet 5-5 via Emergent LLM Key)
# -----------------------------------------------------------------------------

TUTOR_SYSTEM_PROMPT = """Kamu adalah \"SyntaxAI Tutor\", tutor coding dan Artificial Intelligence untuk siswa SMA/SMK di Indonesia. Jawab SELALU dalam Bahasa Indonesia yang ramah, sederhana, dan membangun rasa percaya diri siswa.

PRINSIP UTAMA:
1. Dorong siswa berpikir, jangan beri jawaban utuh langsung.
2. Untuk pertanyaan konsep (apa itu loop, apa itu variable, dll): jelaskan singkat dengan analogi sehari-hari, lalu beri 1 contoh sangat ringkas (2-5 baris), dan diakhiri pertanyaan reflektif.
3. Untuk error / debugging: tanyakan dulu baris mana yang error, minta siswa menebak penyebabnya, lalu beri 1-2 petunjuk konkret. Jangan tempelkan solusi lengkap.
4. Untuk coding challenge: TOLAK memberi solusi lengkap. Beri strategi langkah demi langkah (pseudocode naratif), biarkan siswa menulis kode sendiri.
5. Jika siswa memaksa minta jawaban utuh untuk challenge, jelaskan dengan sopan kenapa kamu tidak boleh dan tawarkan hint lebih spesifik.
6. Hormati privasi: jangan minta data pribadi (NIK, nomor HP, alamat).
7. Gunakan istilah teknis bahasa Inggris jika standar (loop, function, variable), tetapi langsung terjemahkan di dalam kurung.
8. Panjang balasan ideal: 60-180 kata. Pakai paragraf pendek atau 2-3 bullet. Hindari daftar yang terlalu panjang.
9. Jika siswa mengirim potongan kode, tunjukkan 1 baris spesifik yang perlu diperhatikan dan berikan 1 pertanyaan untuk membuatnya menebak perbaikan.
10. Tutup setiap jawaban dengan dorongan singkat ("Coba dulu ya, nanti kabari hasilnya!") agar belajar terasa menyenangkan.

JANGAN:
- Menuliskan kode lengkap untuk soal challenge (lebih dari 6 baris berurutan).
- Memberi jawaban langsung "ya/tidak" tanpa alasan edukatif.
- Membahas topik di luar coding/AI/belajar pemrograman (politik, konten dewasa, kekerasan). Jika ditanya, arahkan balik ke topik belajar."""


class TutorMessageInput(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: str | None = None


@api_router.post("/tutor/message")
async def tutor_message(data: TutorMessageInput, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI Tutor belum siap. Hubungi admin aplikasi.")
    conv_id = data.conversation_id or str(uuid.uuid4())
    conversation = await db.tutor_conversations.find_one({"id": conv_id, "user_id": user["id"]}, {"_id": 0})
    if not conversation:
        conversation = {"id": conv_id, "user_id": user["id"], "title": data.message[:48], "messages": [], "created_at": now_iso(), "updated_at": now_iso()}
        await db.tutor_conversations.insert_one({**conversation})
    # Rangkum riwayat singkat agar Claude paham konteks percakapan terakhir
    history = conversation.get("messages", [])
    context_lines = []
    for item in history[-8:]:
        prefix = "Siswa" if item["role"] == "user" else "Tutor"
        context_lines.append(f"{prefix}: {item['content']}")
    enriched = data.message
    if context_lines:
        enriched = "Riwayat singkat percakapan:\n" + "\n".join(context_lines) + f"\n\nSiswa: {data.message}"
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"tutor-{conv_id}-{uuid.uuid4()}", system_message=TUTOR_SYSTEM_PROMPT).with_model("anthropic", "claude-sonnet-5-5")
    try:
        reply = await chat.send_message(UserMessage(text=enriched))
    except Exception as exc:
        logger.exception("Tutor LLM error")
        raise HTTPException(status_code=502, detail="AI Tutor sedang tidak bisa dihubungi. Coba lagi sebentar.") from exc
    reply_text = reply if isinstance(reply, str) else str(reply)
    now = now_iso()
    new_messages = history + [
        {"role": "user", "content": data.message, "at": now},
        {"role": "assistant", "content": reply_text, "at": now},
    ]
    await db.tutor_conversations.update_one(
        {"id": conv_id, "user_id": user["id"]},
        {"$set": {"messages": new_messages, "updated_at": now, "title": conversation.get("title") or data.message[:48]}},
    )
    return {"conversation_id": conv_id, "reply": reply_text, "updated_at": now}


@api_router.get("/tutor/conversations")
async def tutor_conversations(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    items = await db.tutor_conversations.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0, "messages": 0}).sort("updated_at", -1).to_list(50)
    return {"items": items}


@api_router.get("/tutor/conversations/{conversation_id}")
async def tutor_conversation(conversation_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    conv = await db.tutor_conversations.find_one({"id": conversation_id, "user_id": user["id"]}, {"_id": 0, "user_id": 0})
    if not conv:
        raise HTTPException(status_code=404, detail="Percakapan tidak ditemukan")
    return conv


@api_router.delete("/tutor/conversations/{conversation_id}")
async def delete_tutor_conversation(conversation_id: str, user: dict[str, Any] = Depends(current_user)) -> dict[str, str]:
    await db.tutor_conversations.delete_one({"id": conversation_id, "user_id": user["id"]})
    return {"message": "Percakapan dihapus"}


# -----------------------------------------------------------------------------
# Leaderboard
# -----------------------------------------------------------------------------

def _mask_name(name: str) -> str:
    parts = [p for p in name.strip().split() if p]
    if not parts:
        return "Siswa"
    first = parts[0]
    if len(parts) == 1:
        return first
    return f"{first} {parts[-1][0].upper()}."


@api_router.get("/leaderboard")
async def leaderboard(scope: Literal["all", "week"] = "all", user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if scope == "all":
        top_cursor = db.users.find({"xp": {"$gt": 0}}, {"_id": 0, "id": 1, "name": 1, "xp": 1, "level": 1, "level_name": 1, "streak": 1}).sort("xp", -1).limit(25)
        rows = await top_cursor.to_list(25)
        entries = [
            {"rank": idx + 1, "user_id": row["id"], "name": _mask_name(row.get("name", "Siswa")), "xp": row.get("xp", 0), "level": row.get("level", 1), "level_name": row.get("level_name", LEVEL_NAMES[0]), "streak": row.get("streak", 0), "is_me": row["id"] == user["id"]}
            for idx, row in enumerate(rows)
        ]
        all_users = await db.users.find({}, {"_id": 0, "id": 1, "xp": 1}).sort("xp", -1).to_list(2000)
        my_rank = next((idx + 1 for idx, row in enumerate(all_users) if row["id"] == user["id"]), None)
        return {"scope": "all", "entries": entries, "my_rank": my_rank, "total": len(all_users)}
    # Weekly: hitung XP yang didapat 7 hari terakhir dari user_progress + quiz_results
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    xp_map: dict[str, int] = {}
    async for row in db.user_progress.find({"updated_at": {"$gte": week_ago}, "percentage": {"$gte": 100}}, {"_id": 0, "user_id": 1, "item_type": 1}):
        xp = 100 if row.get("item_type") == "project" else 30 if row.get("item_type") == "challenge" else 10
        xp_map[row["user_id"]] = xp_map.get(row["user_id"], 0) + xp
    async for row in db.quiz_results.find({"completed_at": {"$gte": week_ago}}, {"_id": 0, "user_id": 1, "score": 1}):
        earned = 25 if row.get("score", 0) >= 90 else 20 if row.get("score", 0) >= 70 else 10
        xp_map[row["user_id"]] = xp_map.get(row["user_id"], 0) + earned
    user_ids = list(xp_map.keys())
    users = await db.users.find({"id": {"$in": user_ids}} if user_ids else {"id": "_none_"}, {"_id": 0, "id": 1, "name": 1, "level": 1, "level_name": 1, "streak": 1}).to_list(500)
    users_by_id = {u["id"]: u for u in users}
    sorted_ids = sorted(xp_map.keys(), key=lambda uid: xp_map[uid], reverse=True)[:25]
    entries = []
    for idx, uid in enumerate(sorted_ids):
        info = users_by_id.get(uid, {"name": "Siswa", "level": 1, "level_name": LEVEL_NAMES[0], "streak": 0})
        entries.append({"rank": idx + 1, "user_id": uid, "name": _mask_name(info.get("name", "Siswa")), "xp": xp_map[uid], "level": info.get("level", 1), "level_name": info.get("level_name", LEVEL_NAMES[0]), "streak": info.get("streak", 0), "is_me": uid == user["id"]})
    ranked = sorted(xp_map.items(), key=lambda kv: kv[1], reverse=True)
    my_rank = next((idx + 1 for idx, (uid, _) in enumerate(ranked) if uid == user["id"]), None)
    return {"scope": "week", "entries": entries, "my_rank": my_rank, "total": len(ranked)}


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
