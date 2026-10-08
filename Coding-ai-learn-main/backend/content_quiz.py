"""Bank kuis dan coding challenge SyntaxAI SMA.

Setiap lesson punya 3-5 pertanyaan. Challenge punya test case sederhana.
"""
from __future__ import annotations

from typing import Any


def _q(id: str, question: str, options: list[str], answer: int, explanation: str) -> dict[str, Any]:
    return {"id": id, "question": question, "options": options, "answer": answer, "explanation": explanation}


# Kumpulan kuis spesifik per lesson (fallback akan dibuat otomatis di server).
# Key: lesson_id, Value: list of questions.
QUIZ_BANK: dict[str, list[dict[str, Any]]] = {
    "python-lesson-1": [
        _q("py-q1-1", "Apa fungsi print() di Python?", ["Membuat variable", "Menampilkan nilai ke layar", "Menerima input", "Menghapus data"], 1, "print() mencetak nilai yang diberikan ke layar."),
        _q("py-q1-2", "Siapa pencipta Python?", ["Guido van Rossum", "Brendan Eich", "James Gosling", "Dennis Ritchie"], 0, "Python diciptakan Guido van Rossum pada 1991."),
        _q("py-q1-3", "Python umumnya dipakai untuk apa?", ["Hanya game", "AI, web, data science", "Hanya database", "Hanya mobile"], 1, "Python luas digunakan di AI, web backend, data science, dan otomatisasi."),
        _q("py-q1-4", "Komentar satu baris di Python ditandai dengan?", ["//", "#", "<!-- -->", ";"], 1, "Komentar satu baris memakai tanda #."),
    ],
    "python-lesson-2": [
        _q("py-q2-1", "Variable `umur = 15` bertipe apa?", ["str", "int", "float", "bool"], 1, "Angka tanpa titik desimal bertipe int."),
        _q("py-q2-2", "Mana nama variable yang VALID?", ["1nama", "nama_siswa", "nama-siswa", "nama siswa"], 1, "Underscore boleh, tidak boleh diawali angka atau mengandung spasi/strip."),
        _q("py-q2-3", "Berapa nilai `type(3.14)` kembalikan?", ["int", "float", "str", "bool"], 1, "Angka dengan titik desimal bertipe float."),
        _q("py-q2-4", "Apa output dari: `x = True; print(not x)`?", ["True", "False", "None", "Error"], 1, "not True = False."),
    ],
    "python-lesson-5": [
        _q("py-q5-1", "Operator mana yang BENAR untuk membandingkan?", ["=", "==", ":=", "<=>"], 1, "`==` membandingkan nilai; `=` adalah assignment."),
        _q("py-q5-2", "Apa output: `nilai=80\\nif nilai>=75: print('L')\\nelse: print('T')`?", ["L", "T", "Error", "80"], 0, "80 >= 75 benar → cetak L."),
        _q("py-q5-3", "Kata kunci untuk kondisi tambahan setelah if?", ["elseif", "elif", "else if", "elsif"], 1, "Python memakai `elif`."),
        _q("py-q5-4", "Mana yang BUKAN error umum pada if Python?", ["Lupa titik dua", "Indentasi inkonsisten", "Pakai == untuk bandingkan", "Pakai = untuk bandingkan"], 2, "Pakai == justru benar, pakai = adalah error."),
    ],
    "python-lesson-6": [
        _q("py-q6-1", "`for i in range(3)` menghasilkan i berapa saja?", ["1,2,3", "0,1,2,3", "0,1,2", "0,1"], 2, "range(3) menghasilkan 0,1,2 (eksklusif di 3)."),
        _q("py-q6-2", "`break` dipakai untuk?", ["Lompat iterasi", "Keluar loop", "Masuk loop", "Pause loop"], 1, "`break` menghentikan loop sepenuhnya."),
        _q("py-q6-3", "Apa risiko loop while?", ["Tidak jalan", "Infinite loop", "Lebih cepat", "Pakai lebih banyak RAM"], 1, "Jika kondisi tidak pernah False, loop tidak berhenti."),
    ],
    "javascript-lesson-1": [
        _q("js-q1-1", "Mana perintah output JavaScript?", ["print()", "console.log()", "echo", "System.out"], 1, "Di browser, console.log() mencetak ke console."),
        _q("js-q1-2", "File JavaScript biasanya diekstensi?", [".py", ".java", ".js", ".ts"], 2, ".js adalah ekstensi JavaScript."),
        _q("js-q1-3", "JavaScript berjalan di mana?", ["Hanya server", "Hanya browser", "Browser dan server (Node.js)", "Hanya mobile"], 2, "JavaScript bisa jalan di browser dan server lewat Node.js."),
    ],
    "javascript-lesson-2": [
        _q("js-q2-1", "Mana cara deklarasi variable yang BARU disarankan?", ["var", "let", "declare", "variable"], 1, "`let` dan `const` disarankan sejak ES6."),
        _q("js-q2-2", "`const` berarti?", ["Variabel bisa diubah", "Variabel tidak akan ditugaskan ulang", "Variabel public", "Variabel global"], 1, "const tidak boleh ditugaskan ulang (meskipun isi objek bisa dimutasi)."),
        _q("js-q2-3", "Apa output: `let x=5; x+=3; console.log(x)`?", ["3", "5", "8", "undefined"], 2, "x menjadi 5+3 = 8."),
    ],
    "html-lesson-1": [
        _q("html-q1-1", "Apa kepanjangan HTML?", ["Hyper Table Markup Language", "HyperText Markup Language", "Home Tool Multi Language", "High Tech Multi Lang"], 1, "HTML = HyperText Markup Language."),
        _q("html-q1-2", "Elemen pembuka dokumen HTML5?", ["<html>", "<!DOCTYPE html>", "<head>", "<body>"], 1, "DOCTYPE deklarasi tipe dokumen di baris pertama."),
        _q("html-q1-3", "Mana BUKAN bagian dari struktur dasar?", ["<head>", "<body>", "<main>", "<python>"], 3, "<python> bukan tag HTML."),
    ],
    "css-lesson-1": [
        _q("css-q1-1", "Simbol untuk selector class?", ["#", ".", "*", "/"], 1, "Titik . digunakan untuk class."),
        _q("css-q1-2", "Simbol untuk selector id?", ["#", ".", "*", "/"], 0, "Pagar # untuk id."),
        _q("css-q1-3", "Cara memasukkan CSS eksternal?", ["<style>", "<link rel='stylesheet'>", "<css>", "<script>"], 1, "Pakai <link rel='stylesheet' href='style.css'>."),
    ],
    "cpp-lesson-1": [
        _q("cpp-q1-1", "Fungsi utama C++?", ["main()", "start()", "run()", "init()"], 0, "int main() adalah entry point program."),
        _q("cpp-q1-2", "Perintah output dasar?", ["print", "echo", "cout", "write"], 2, "cout dari <iostream> digunakan untuk output."),
        _q("cpp-q1-3", "Direktif untuk sertakan library?", ["#use", "#include", "import", "using"], 1, "#include <lib> untuk menyertakan header."),
    ],
    "java-lesson-1": [
        _q("java-q1-1", "Signature main() Java yang benar?", ["main()", "void main()", "public static void main(String[] args)", "static main()"], 2, "Signature wajib: public static void main(String[] args)."),
        _q("java-q1-2", "Perintah output dengan newline?", ["print()", "println()", "write()", "echo()"], 1, "System.out.println() mencetak dengan newline."),
        _q("java-q1-3", "File Java diekstensi?", [".jv", ".jva", ".java", ".class"], 2, "File source Java berekstensi .java."),
    ],
    "ai-lesson-1": [
        _q("ai-q1-1", "AI adalah singkatan dari?", ["Automated Internet", "Artificial Intelligence", "Advanced Information", "Autonomous Inference"], 1, "AI = Artificial Intelligence."),
        _q("ai-q1-2", "Mana contoh AI dalam kehidupan sehari-hari?", ["Rekomendasi lagu", "Mesin cuci biasa", "Lampu LED", "Kalkulator sederhana"], 0, "Rekomendasi musik memakai machine learning."),
        _q("ai-q1-3", "Faktor utama kualitas model AI?", ["Warna layar", "Kualitas data latih", "Kecepatan internet", "Jenis OS"], 1, "Garbage in, garbage out — data menentukan model."),
    ],
    "ai-lesson-13": [
        _q("ai-q13-1", "Apa yang dimaksud 'AI hallucination'?", ["Model tidur", "Model menghasilkan jawaban yang salah tapi meyakinkan", "Model tidak merespons", "Model lambat"], 1, "Hallucination = jawaban terdengar benar tapi faktanya salah."),
        _q("ai-q13-2", "Cara terbaik menyikapi jawaban AI?", ["Percaya semua", "Verifikasi dari sumber terpercaya", "Buang semua", "Ikut saja"], 1, "Selalu verifikasi, terutama untuk angka, kutipan, atau fakta."),
        _q("ai-q13-3", "Apakah AI boleh dipakai untuk tugas sekolah?", ["Tidak sama sekali", "Boleh sebagai alat bantu belajar", "Hanya untuk salin-tempel", "Hanya guru"], 1, "AI alat bantu memahami, bukan pengganti pemikiran sendiri."),
    ],
}


# Coding Challenge per bahasa.
CHALLENGES: list[dict[str, Any]] = [
    # Python
    {"id": "ch-py-sayhello", "language_id": "python", "title": "Sapa Pengguna", "description": "Buat program yang mencetak 'Halo, SyntaxAI!' persis.", "starter": '# Tulis kode di sini\n', "expected": "Halo, SyntaxAI!", "xp": 20, "difficulty": "Beginner"},
    {"id": "ch-py-sum", "language_id": "python", "title": "Jumlah Dua Angka", "description": "Cetak hasil 15 + 27.", "starter": 'a = 15\nb = 27\n# cetak a + b\n', "expected": "42", "xp": 25, "difficulty": "Beginner"},
    {"id": "ch-py-area", "language_id": "python", "title": "Luas Persegi", "description": "Hitung dan cetak luas persegi dengan sisi 10.", "starter": 'sisi = 10\n# cetak luas\n', "expected": "100", "xp": 25, "difficulty": "Beginner"},
    {"id": "ch-py-grade", "language_id": "python", "title": "Status Kelulusan", "description": "Cetak 'Lulus' jika nilai 80 >= 75, selain itu 'Belum Lulus'.", "starter": 'nilai = 80\n# tulis kondisi\n', "expected": "Lulus", "xp": 30, "difficulty": "Basic"},
    {"id": "ch-py-sum-loop", "language_id": "python", "title": "Jumlah 1 sampai 5", "description": "Pakai loop untuk mencetak total 1+2+3+4+5.", "starter": 'total = 0\n# gunakan for\n', "expected": "15", "xp": 35, "difficulty": "Basic"},
    # JavaScript
    {"id": "ch-js-hello", "language_id": "javascript", "title": "Halo JS", "description": "Cetak 'Halo JavaScript!' menggunakan console.log.", "starter": '// tulis di sini\n', "expected": "Halo JavaScript!", "xp": 20, "difficulty": "Beginner"},
    {"id": "ch-js-sum", "language_id": "javascript", "title": "Jumlah Dua Variable", "description": "Jumlahkan a=15 dan b=27 lalu log hasilnya.", "starter": 'const a = 15\nconst b = 27\n// console.log hasilnya\n', "expected": "42", "xp": 25, "difficulty": "Beginner"},
    {"id": "ch-js-area", "language_id": "javascript", "title": "Keliling Persegi Panjang", "description": "Cetak 2 * (10 + 5).", "starter": 'const p = 10\nconst l = 5\n// console.log(...)\n', "expected": "30", "xp": 25, "difficulty": "Basic"},
    # C++
    {"id": "ch-cpp-hello", "language_id": "cpp", "title": "Halo C++", "description": "Cetak 'Halo C++!' menggunakan cout.", "starter": '#include <iostream>\nusing namespace std;\nint main() {\n  // kode\n  return 0;\n}\n', "expected": "Halo C++!", "xp": 25, "difficulty": "Beginner"},
    {"id": "ch-cpp-sum", "language_id": "cpp", "title": "Jumlah Konstanta", "description": "Cetak hasil 15 + 27 dengan cout.", "starter": '#include <iostream>\nusing namespace std;\nint main() {\n  // tulis di sini\n  return 0;\n}\n', "expected": "42", "xp": 25, "difficulty": "Beginner"},
    # Java
    {"id": "ch-java-hello", "language_id": "java", "title": "Halo Java", "description": "Cetak 'Halo Java!' dengan System.out.println.", "starter": 'public class Main {\n  public static void main(String[] args) {\n    // tulis di sini\n  }\n}\n', "expected": "Halo Java!", "xp": 25, "difficulty": "Beginner"},
    {"id": "ch-java-sum", "language_id": "java", "title": "Hitung Rata-rata", "description": "Cetak rata-rata dari 80 dan 90 (hasil 85).", "starter": 'public class Main {\n  public static void main(String[] args) {\n    int a = 80, b = 90;\n    // cetak rata-rata\n  }\n}\n', "expected": "85", "xp": 30, "difficulty": "Basic"},
    # HTML & CSS - tidak ada test output, tetapi ada checklist
    {"id": "ch-html-landing", "language_id": "html", "title": "Landing Page Mini", "description": "Buat halaman HTML dengan judul 'SyntaxAI' dan paragraf perkenalan.", "starter": '<!DOCTYPE html>\n<html>\n<head><title></title></head>\n<body>\n  <!-- h1 dan p -->\n</body>\n</html>\n', "expected": "SyntaxAI", "xp": 25, "difficulty": "Beginner"},
    {"id": "ch-css-button", "language_id": "css", "title": "Tombol Brand", "description": "Buat selector .btn dengan background biru dan sudut membulat.", "starter": '.btn {\n  /* background-color dan border-radius */\n}\n', "expected": "border-radius", "xp": 25, "difficulty": "Beginner"},
    # AI
    {"id": "ch-ai-prompt", "language_id": "ai", "title": "Prompt untuk Chatbot Belajar", "description": "Tulis prompt (sebagai komentar Python) yang jelas untuk minta AI menjelaskan loop Python. Gunakan rumus Tujuan+Konteks+Format.", "starter": '# prompt = """\n# ... tulis di sini ...\n# """\nprint("Prompt dirancang")', "expected": "Prompt dirancang", "xp": 20, "difficulty": "Beginner"},
]
