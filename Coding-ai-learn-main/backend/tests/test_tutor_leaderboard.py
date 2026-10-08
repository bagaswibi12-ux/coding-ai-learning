"""Backend tests for new iteration 3 endpoints: AI Tutor + Leaderboard."""
from __future__ import annotations

import os
import pytest
import requests

BASE_URL = (os.environ.get("EXPO_BACKEND_URL") or "https://code-master-app-6.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
QA_EMAIL = "qa.syntaxai@gmail.com"
QA_PASSWORD = "Belajar123!"


@pytest.fixture(scope="module")
def session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return s


# ---- AI Tutor ----
class TestTutor:
    conv_id: str | None = None

    def test_tutor_first_message(self, session):
        r = session.post(f"{API}/tutor/message", json={"message": "Apa itu variable?"}, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["conversation_id"]
        assert isinstance(body["reply"], str) and len(body["reply"]) > 20
        TestTutor.conv_id = body["conversation_id"]

    def test_tutor_followup_context(self, session):
        assert TestTutor.conv_id, "need first message"
        r = session.post(f"{API}/tutor/message", json={"message": "Beri contoh lagi.", "conversation_id": TestTutor.conv_id}, timeout=60)
        assert r.status_code == 200
        assert r.json()["conversation_id"] == TestTutor.conv_id

    def test_tutor_conversations_list(self, session):
        r = session.get(f"{API}/tutor/conversations", timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert any(it["id"] == TestTutor.conv_id for it in items)

    def test_tutor_conversation_detail(self, session):
        r = session.get(f"{API}/tutor/conversations/{TestTutor.conv_id}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data["messages"]) >= 4  # 2 user + 2 assistant
        roles = [m["role"] for m in data["messages"]]
        assert "user" in roles and "assistant" in roles

    def test_tutor_delete(self, session):
        r = session.delete(f"{API}/tutor/conversations/{TestTutor.conv_id}", timeout=15)
        assert r.status_code == 200
        r2 = session.get(f"{API}/tutor/conversations/{TestTutor.conv_id}", timeout=15)
        assert r2.status_code == 404


# ---- Leaderboard ----
class TestLeaderboard:
    def test_leaderboard_all(self, session):
        r = session.get(f"{API}/leaderboard", params={"scope": "all"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["scope"] == "all"
        entries = data["entries"]
        assert len(entries) >= 1
        # sorted by XP desc
        xps = [e["xp"] for e in entries]
        assert xps == sorted(xps, reverse=True)
        # name mask: either single word or "First L." pattern (ends with '.')
        for e in entries:
            parts = e["name"].split()
            assert len(parts) <= 2
            if len(parts) == 2:
                assert parts[1].endswith(".") and len(parts[1]) == 2
        # my_rank integer, is_me present
        assert isinstance(data["my_rank"], int)
        assert any(e["is_me"] for e in entries)

    def test_leaderboard_week(self, session):
        r = session.get(f"{API}/leaderboard", params={"scope": "week"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["scope"] == "week"
        assert isinstance(data["entries"], list)
