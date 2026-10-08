"""Backend regression tests for SyntaxAI SMA API.

Covers: health, auth, dashboard, catalog, lessons, syntax, quiz, challenges,
code simulator, bookmarks, notes, history, profile.
"""
from __future__ import annotations

import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("EXPO_BACKEND_URL") or "https://code-master-app-6.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

QA_EMAIL = "qa.syntaxai@gmail.com"
QA_PASSWORD = "Belajar123!"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth(session: requests.Session) -> dict:
    r = session.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    session.headers.update({"Authorization": f"Bearer {data['token']}"})
    return data


# ---------------------------------------------------------------------------
# Health / Auth
# ---------------------------------------------------------------------------

class TestHealthAuth:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "SyntaxAI" in r.json().get("message", "")

    def test_login_qa(self, session):
        r = session.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["user"]["email"] == QA_EMAIL
        assert body["user"]["level_name"]

    def test_login_bad_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": "wrong-pass!"}, timeout=15)
        assert r.status_code == 401
        assert "sesuai" in r.json().get("detail", "").lower()

    def test_me_requires_auth(self, session):
        plain = requests.Session()
        plain.headers.update({"Content-Type": "application/json"})
        r = plain.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me(self, session, auth):
        r = session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == QA_EMAIL


# ---------------------------------------------------------------------------
# Catalog & Dashboard
# ---------------------------------------------------------------------------

class TestCatalogDashboard:
    def test_catalog_languages(self, session, auth):
        r = session.get(f"{API}/catalog", timeout=15)
        assert r.status_code == 200
        data = r.json()
        ids = {language["id"] for language in data["languages"]}
        assert {"python", "javascript", "html", "css", "cpp", "java", "ai"}.issubset(ids)
        # Lessons expectation: 7 languages * 15 = 105
        assert len(data["lessons"]) >= 50
        assert len(data["syntax"]) >= 100

    def test_dashboard_shape(self, session, auth):
        r = session.get(f"{API}/dashboard", timeout=15)
        assert r.status_code == 200
        data = r.json()
        for key in ("user", "active_lesson", "language_progress", "badges", "daily_syntax", "daily_challenge", "recommendation"):
            assert key in data
        assert data["user"]["email"] == QA_EMAIL
        assert data["daily_syntax"] and data["daily_challenge"]


# ---------------------------------------------------------------------------
# Lessons / Syntax / Quiz / Challenges
# ---------------------------------------------------------------------------

class TestContent:
    def test_lesson_detail(self, session, auth):
        r = session.get(f"{API}/lessons/python-lesson-1", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["lesson"]["id"] == "python-lesson-1"
        assert isinstance(data["sections"], list) and len(data["sections"]) >= 1
        assert data["quiz_id"].startswith("quiz-")

    def test_lesson_404(self, session, auth):
        r = session.get(f"{API}/lessons/does-not-exist", timeout=15)
        assert r.status_code == 404

    def test_syntax_search(self, session, auth):
        r = session.get(f"{API}/syntax", params={"language": "python"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["count"] > 0
        assert all(item["language_id"] == "python" for item in data["items"])

    def test_quiz_detail(self, session, auth):
        r = session.get(f"{API}/quizzes/quiz-python-lesson-1", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["questions"] and all("options" in q and "answer" in q for q in data["questions"])

    def test_challenges_list(self, session, auth):
        r = session.get(f"{API}/challenges", timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) >= 5


# ---------------------------------------------------------------------------
# Simulator & Challenge submit
# ---------------------------------------------------------------------------

class TestSimulator:
    def test_run_python(self, session, auth):
        r = session.post(f"{API}/run-code", json={"language": "python", "code": "print('Halo, SyntaxAI!')"}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["error"] is None
        assert body["output"] == "Halo, SyntaxAI!"

    def test_run_python_blocks_dangerous(self, session, auth):
        r = session.post(f"{API}/run-code", json={"language": "python", "code": "import os\nos.system('ls')"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["error"]

    def test_run_javascript(self, session, auth):
        r = session.post(f"{API}/run-code", json={"language": "javascript", "code": "console.log('Hi')"}, timeout=15)
        assert r.status_code == 200
        assert "Hi" in r.json()["output"]

    def test_run_cpp(self, session, auth):
        r = session.post(f"{API}/run-code", json={"language": "cpp", "code": 'cout << "ok" << endl;'}, timeout=15)
        assert r.status_code == 200
        assert "ok" in r.json()["output"]

    def test_submit_challenge_python_pass(self, session, auth):
        # ch-py-sayhello challenge
        challenge_id = "ch-py-sayhello"
        r = session.get(f"{API}/challenges/{challenge_id}", timeout=15)
        if r.status_code != 200:
            pytest.skip(f"challenge {challenge_id} not available")
        challenge = r.json()
        expected = challenge["expected"].strip()
        code = f'print("{expected}")'
        r2 = session.post(f"{API}/challenges/submit", json={"challenge_id": challenge_id, "code": code}, timeout=15)
        assert r2.status_code == 200
        body = r2.json()
        assert body["passed"] is True, body
        assert body["xp_earned"] > 0


# ---------------------------------------------------------------------------
# Bookmark / Note / History / Progress
# ---------------------------------------------------------------------------

class TestPersistence:
    def test_bookmark_toggle_and_persist(self, session, auth):
        content_id = f"TEST_bm_{uuid.uuid4().hex[:6]}"
        r = session.post(f"{API}/bookmarks", json={"content_type": "lesson", "content_id": content_id, "title": "TEST"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["saved"] is True
        # GET verifies persistence
        r2 = session.get(f"{API}/bookmarks", timeout=15)
        assert any(b["content_id"] == content_id for b in r2.json())
        # Toggle off (cleanup)
        r3 = session.post(f"{API}/bookmarks", json={"content_type": "lesson", "content_id": content_id, "title": "TEST"}, timeout=15)
        assert r3.json()["saved"] is False

    def test_notes_create(self, session, auth):
        content_id = f"TEST_note_{uuid.uuid4().hex[:6]}"
        r = session.post(f"{API}/notes", json={"content_type": "syntax", "content_id": content_id, "note": "TEST note"}, timeout=15)
        assert r.status_code == 200
        note_id = r.json()["id"]
        r2 = session.get(f"{API}/notes", timeout=15)
        assert any(n["id"] == note_id for n in r2.json())

    def test_profile_update_and_verify(self, session, auth):
        new_name = f"QA SyntaxAI {uuid.uuid4().hex[:4]}"
        r = session.patch(f"{API}/profile", json={"name": new_name}, timeout=15)
        assert r.status_code == 200
        assert r.json()["name"] == new_name
        # GET to verify persisted
        r2 = session.get(f"{API}/auth/me", timeout=15)
        assert r2.json()["name"] == new_name
        # Reset to canonical name
        session.patch(f"{API}/profile", json={"name": "QA SyntaxAI"}, timeout=15)

    def test_quiz_result_persisted(self, session, auth):
        r = session.post(f"{API}/quiz-results", json={"quiz_id": "quiz-python-lesson-1", "score": 90, "correct_answers": 3, "wrong_answers": 0}, timeout=15)
        assert r.status_code == 200
        assert r.json()["xp_earned"] >= 20
