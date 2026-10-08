# SyntaxAI SMA — Product Requirements Document

## Visi
Aplikasi mobile pembelajaran coding & Artificial Intelligence untuk siswa SMA/SMK.  
Konsep: "Duolingo untuk coding dan AI tingkat SMA" — gamified, mobile-first, Bahasa Indonesia.

## Target Pengguna
- Siswa SMA/SMK sederajat
- Pelajar pemula tanpa pengalaman coding
- Rentang: Beginner → Basic → Intermediate

## Platform
- Expo React Native (iOS/Android), prioritas Android untuk Google Play Store
- Backend: FastAPI + MongoDB
- Autentikasi: Email/Password dengan JWT (bcrypt hash)

## Scope Fase 1 (SELESAI)
Fondasi:
- ✅ Splash → Onboarding (3 slide + pilih level pengalaman) → Register/Login → Home
- ✅ 5 tab native: Home, Belajar, Praktik, Progress, Profil
- ✅ Material You theme (light + dark) via `src/theme.ts`
- ✅ Streak harian otomatis, XP + 8 level ladder, 8 badge

## Scope Fase 2 (SELESAI)
Konten pembelajaran:
- ✅ 7 bahasa: Python, JavaScript, HTML, CSS, C++, Java, AI
- ✅ 15 lesson per bahasa (105 lesson total) dengan 3 section nyata per lesson
- ✅ Syntax dictionary 150+ entri (37 Python, 32 JS, 39 HTML, 40 CSS, 33 C++, 35 Java, 20 AI)
- ✅ Quiz bank per lesson (14 lesson punya kuis khusus, sisanya fallback)
- ✅ 15 coding challenge dengan auto-grading (expected output match)
- ✅ Code simulator Python (AST sandbox) + static output JS/C++/Java
- ✅ HTML/CSS playground + preview (WebView di native, iframe di web)
- ✅ Syntax comparison 5 konsep lintas bahasa

Fitur siswa:
- ✅ Bookmark syntax/lesson/challenge
- ✅ Catatan pribadi per syntax
- ✅ Riwayat belajar (history)
- ✅ Rekomendasi berbasis progress

Profil & keamanan:
- ✅ Edit nama
- ✅ Dark/Light mode (persisted)
- ✅ Account deletion dengan konfirmasi inline (no Alert)
- ✅ Password bcrypt, JWT 30 hari

## Scope Belum Implementasi (potensi fase berikut)
- Project builder bertingkat lengkap (hanya ada sebagai mini project di akhir setiap bahasa)
- Google Sign-In (opsional)
- Notifikasi harian (hanya di real device setelah build)
- Offline cache materi penuh

## Scope Fase 3 (SELESAI)
- ✅ AI Tutor Chat berbasis Claude Sonnet 5-5 via Emergent LLM Key
  - System prompt menolak kasih kode utuh untuk coding challenge (gaya Socratic/mixed)
  - Riwayat percakapan per user tersimpan di MongoDB (`tutor_conversations`)
  - Multi-turn context (ambil 8 pesan terakhir sebagai context)
  - Screen: `/tutor` (chat), `/tutor/history` (daftar + delete)
- ✅ Papan peringkat (Leaderboard)
  - Scope all-time (sort by total XP) + weekly (XP terhitung dari user_progress & quiz_results 7 hari terakhir)
  - Masking nama untuk privasi: "Firstname L." (nama depan + inisial belakang)
  - Highlight baris user sendiri + `my_rank` dari total pengguna
  - Screen: `/leaderboard`
- ✅ Shortcut akses dari Home (dua tombol: AI Tutor & Leaderboard) dan dari Profile menu

## Arsitektur
### Backend (`/app/backend`)
- `server.py` — FastAPI app dengan 20+ endpoint
- `content_lessons.py` — 105 lesson dengan body real
- `content_syntax.py` — 236 syntax entry
- `content_quiz.py` — Quiz bank + 15 coding challenge

### Frontend (`/app/frontend`)
- `app/` — expo-router file-based routes
- `src/api.ts` — centralized fetch dengan 15s timeout
- `src/session.tsx` — SessionProvider dengan AsyncStorage token
- `src/theme.ts` — colors light+dark
- `src/components/primitives.tsx` — Screen, TopBar, Pill, ProgressBar, SectionTitle

### API Endpoints Utama
- `POST /api/auth/register`, `/api/auth/login`, `GET /api/auth/me`
- `GET /api/catalog`, `/api/dashboard`
- `GET /api/lessons/{id}`, `/api/syntax`, `/api/syntax/{id}`
- `GET /api/quizzes/{id}`, `POST /api/quiz-results`
- `GET /api/challenges`, `/api/challenges/{id}`, `POST /api/challenges/submit`
- `POST /api/run-code`, `/api/progress`, `/api/bookmarks`, `/api/notes`, `/api/history`
- `PATCH /api/profile`, `DELETE /api/account`

## Database Collections
- `users` — id, name, email, password_hash, xp, streak, last_active, experience
- `user_progress` — user_id, item_id, item_type, percentage, updated_at
- `quiz_results` — user_id, quiz_id, score, correct/wrong_answers
- `bookmarks`, `notes`, `history`, `submissions`

## Playstore-Ready Notes
- App icon + splash via `app.json`
- Permission minimal (tidak minta kamera/lokasi/mic)
- Account deletion flow tersedia (compliance)
- Privacy via tidak kumpulkan data berlebih
