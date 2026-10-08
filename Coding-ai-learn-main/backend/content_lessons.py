"""Konten pembelajaran statis untuk SyntaxAI SMA.

Semua bahasa pemrograman, syntax, quiz, dan coding challenge ada di sini.
Dipisahkan dari server.py agar logic utama tetap bersih dan konten mudah
diperbarui tanpa menyentuh endpoint.
"""
from __future__ import annotations

from typing import Any

LANGUAGE_META: list[dict[str, Any]] = [
    {"id": "python", "name": "Python", "icon": "language-python", "color": "blue", "level": "Pemula", "description": "Bahasa yang ramah untuk mulai coding dan banyak dipakai di AI."},
    {"id": "javascript", "name": "JavaScript", "icon": "language-javascript", "color": "yellow", "level": "Pemula", "description": "Bangun interaksi web dan aplikasi yang terasa hidup."},
    {"id": "html", "name": "HTML", "icon": "language-html5", "color": "red", "level": "Pemula", "description": "Susun struktur halaman web dengan tag yang jelas."},
    {"id": "css", "name": "CSS", "icon": "language-css3", "color": "cyan", "level": "Pemula", "description": "Buat tampilan web yang rapi, responsif, dan menarik."},
    {"id": "cpp", "name": "C++", "icon": "language-cpp", "color": "purple", "level": "Dasar", "description": "Kenali logika program dan cara kerja komputer lebih dekat."},
    {"id": "java", "name": "Java", "icon": "language-java", "color": "orange", "level": "Dasar", "description": "Pelajari fondasi aplikasi dan pemrograman berorientasi objek."},
    {"id": "ai", "name": "Artificial Intelligence", "icon": "brain", "color": "green", "level": "Pemula", "description": "Pahami AI, Machine Learning, Generative AI, dan etika penggunaannya."},
]

# -----------------------------------------------------------------------------
# Lessons: per bahasa 15 materi. Setiap materi punya body section nyata.
# -----------------------------------------------------------------------------

def _section(title: str, body: str) -> dict[str, str]:
    return {"title": title, "body": body}

LESSON_LIBRARY: dict[str, list[dict[str, Any]]] = {
    "python": [
        {"title": "Pengenalan Python", "summary": "Kenali Python, cara kerjanya, dan kenapa cocok untuk pemula sampai AI.", "duration": "8 menit", "sections": [
            _section("Apa itu Python?", "Python adalah bahasa pemrograman yang dibaca mesin dari atas ke bawah. Sintaksnya ringkas sehingga baris kodenya mendekati bahasa Inggris sehari-hari. Python banyak dipakai untuk web, otomatisasi, data science, hingga Artificial Intelligence."),
            _section("Kenapa belajar Python?", "Python sangat ramah bagi pemula karena tidak banyak tanda baca rumit. Komunitasnya besar, library-nya banyak, dan belajarnya cepat terasa hasilnya."),
            _section("Yang akan kamu pelajari", "Pada jalur ini kamu akan belajar menulis kode pertama, menyimpan data di variable, membuat keputusan dengan percabangan, mengulang aksi, dan membangun program utuh.")]},
        {"title": "Variable & Data Type", "summary": "Simpan nilai ke variable dan pahami tipe data dasar Python.", "duration": "10 menit", "sections": [
            _section("Konsep variable", "Variable adalah wadah bernama untuk menyimpan nilai. Tulis `nama = nilai`. Nama variable boleh huruf, angka, dan underscore, tetapi tidak boleh diawali angka."),
            _section("Tipe data dasar", "`int` menyimpan bilangan bulat (10), `float` menyimpan desimal (3.14), `str` menyimpan teks (\"Halo\"), `bool` menyimpan True/False."),
            _section("Coba sendiri", "Buka simulator, ketik `nama = \"SMA\"` lalu `print(nama)`. Amati hasilnya. Ubah isi nama dan lihat perubahannya.")]},
        {"title": "Operator", "summary": "Lakukan hitungan, perbandingan, dan logika dengan operator.", "duration": "9 menit", "sections": [
            _section("Operator aritmetika", "`+ - * / // % **` dipakai untuk hitungan. `//` menghasilkan hasil bagi tanpa koma, `%` menghasilkan sisa bagi, `**` adalah pangkat."),
            _section("Operator perbandingan", "`== != > < >= <=` menghasilkan True atau False. Dipakai di percabangan untuk mengambil keputusan."),
            _section("Operator logika", "`and or not` menggabungkan kondisi. Contoh: `if nilai >= 75 and hadir == True:`.")]},
        {"title": "Input & Output", "summary": "Terima masukan dari pengguna dan tampilkan hasilnya.", "duration": "8 menit", "sections": [
            _section("Menampilkan dengan print()", "`print()` menerima satu atau beberapa nilai. Pisahkan dengan koma supaya ada spasi otomatis: `print(\"Nilai:\", 90)`."),
            _section("Menerima input()", "`input(prompt)` menunggu pengguna mengetik lalu menekan Enter. Hasilnya selalu bertipe string, konversi ke int bila perlu: `int(input(\"Umur: \"))`."),
            _section("Tips", "Gunakan f-string agar kalimat rapi: `print(f\"Halo, {nama}\")`. Ini jauh lebih mudah dibaca daripada menyambung dengan `+`.")]},
        {"title": "Conditional (if / elif / else)", "summary": "Buat keputusan berbasis kondisi.", "duration": "11 menit", "sections": [
            _section("Struktur dasar", "`if kondisi:` diikuti blok indentasi 4 spasi. Tambahkan `elif` untuk kondisi lain, `else` untuk fallback."),
            _section("Contoh nilai siswa", "nilai = 80\nif nilai >= 85: print(\"Sangat baik\")\nelif nilai >= 75: print(\"Lulus\")\nelse: print(\"Belum lulus\")"),
            _section("Kesalahan umum", "Lupa titik dua di akhir kondisi, atau indentasi yang tidak konsisten (campur tab dan spasi).")]},
        {"title": "Looping (for & while)", "summary": "Jalankan blok berulang kali tanpa duplikasi kode.", "duration": "10 menit", "sections": [
            _section("for ... in", "`for i in range(5):` mengulang 5 kali dengan nilai i 0 sampai 4. Bisa juga iterasi list: `for buah in [\"apel\", \"mangga\"]:`."),
            _section("while kondisi", "`while` berjalan selama kondisi True. Hati-hati, jika kondisi tidak pernah False program akan macet (infinite loop)."),
            _section("break & continue", "`break` berhenti dari loop, `continue` lompat ke iterasi berikutnya. Pakailah seperlunya agar kode tetap mudah dibaca.")]},
        {"title": "Function (def & return)", "summary": "Kelompokkan kode agar dapat dipakai ulang.", "duration": "11 menit", "sections": [
            _section("Membuat fungsi", "`def sapa(nama):` mendefinisikan fungsi. Blok di dalamnya menerima input (parameter) lalu menghasilkan output dengan `return`."),
            _section("Contoh", "def tambah(a, b):\n    return a + b\nprint(tambah(3, 4))  # 7"),
            _section("Kenapa butuh fungsi?", "Agar logika tidak diulang-ulang. Jika rumus berubah cukup ubah satu tempat. Fungsi juga membuat kode mudah dites.")]},
        {"title": "String", "summary": "Olah teks dengan method bawaan yang sering dipakai.", "duration": "9 menit", "sections": [
            _section("Dasar string", "String ditulis dalam tanda kutip. Panjangnya dicek dengan `len()`. Potong dengan slicing `teks[0:5]`."),
            _section("Method penting", "`upper()`, `lower()`, `strip()`, `split(\",\")`, `replace(\"a\", \"b\")` adalah teman sehari-hari untuk membersihkan dan mengolah data teks."),
            _section("Format rapi", "Gunakan f-string: `f\"Nilai: {nilai:.2f}\"` membatasi 2 angka di belakang koma.")]},
        {"title": "Collection (list, tuple, set, dict)", "summary": "Simpan banyak data dalam satu variable.", "duration": "12 menit", "sections": [
            _section("List", "List ditulis `[1, 2, 3]`, bisa diubah. Tambah dengan `.append()`, ambil dengan index `data[0]`."),
            _section("Tuple & set", "Tuple `(1, 2)` tidak bisa diubah. Set `{1, 2}` tidak boleh duplikat."),
            _section("Dictionary", "Dict `{\"nama\": \"Rina\", \"nilai\": 90}` menyimpan pasangan key-value. Ambil dengan `data[\"nama\"]` atau `data.get(\"nama\")`.")]},
        {"title": "Error Handling", "summary": "Tangani error dengan rapi tanpa program berhenti mendadak.", "duration": "9 menit", "sections": [
            _section("try / except", "Letakkan kode yang mungkin error di `try:`, lalu tangkap di `except NamaError:`. Jangan tangkap semua error tanpa alasan agar bug tetap kelihatan."),
            _section("finally", "Blok `finally` selalu dijalankan, misal untuk menutup file."),
            _section("Pesan error", "Error adalah guru. Baca jenis dan baris error-nya sebelum menebak.")]},
        {"title": "File Handling", "summary": "Baca dan tulis data ke file dengan aman.", "duration": "9 menit", "sections": [
            _section("Membuka file", "`with open(\"data.txt\", \"r\") as f:` membaca file dengan aman. Mode `w` menulis ulang, `a` menambah di akhir."),
            _section("Membaca", "`f.read()` ambil semua isi, `for line in f:` baca per baris. Hemat memori untuk file besar."),
            _section("Catatan", "Simulator belajar membatasi akses file untuk alasan keamanan. Materi ini untuk dikuasai di komputer pribadi.")]},
        {"title": "Module", "summary": "Pakai kekuatan library bawaan dan buat module sendiri.", "duration": "7 menit", "sections": [
            _section("import", "`import math` lalu `math.sqrt(16)`. Atau impor spesifik: `from math import sqrt`."),
            _section("Module sendiri", "Setiap file .py bisa dipakai sebagai module. Simpan fungsi di `utils.py`, lalu `from utils import tambah`."),
            _section("Rekomendasi", "Mulai mengenal `math`, `random`, `datetime`, dan `json` yang sering muncul di proyek nyata.")]},
        {"title": "OOP Dasar", "summary": "Buat class dan object sebagai cetak biru data.", "duration": "12 menit", "sections": [
            _section("Class & object", "`class Siswa:` adalah cetak biru. Buat object: `rina = Siswa(\"Rina\", 90)`."),
            _section("__init__ dan self", "`__init__` adalah fungsi yang jalan saat object dibuat. `self` adalah referensi ke object itu sendiri."),
            _section("Method", "Method adalah fungsi dalam class. Memakai `self` untuk akses data object.")]},
        {"title": "Etika Digital & AI Awareness", "summary": "Belajar menggunakan AI dengan bijak sejak dini.", "duration": "7 menit", "sections": [
            _section("AI bukan pengganti berpikir", "Gunakan AI sebagai alat bantu, bukan pengganti pemahamanmu. Verifikasi jawaban sebelum dipakai."),
            _section("Privasi data", "Jangan masukkan data pribadi (NIK, alamat, kata sandi) ke chatbot publik."),
            _section("Plagiarisme", "Mengambil karya tanpa mengubah dan tanpa menyebut sumber adalah plagiat. AI tidak membuat ide milikmu secara otomatis.")]},
        {"title": "Mini Project: Kalkulator", "summary": "Satukan semua konsep menjadi program nyata.", "duration": "15 menit", "sections": [
            _section("Tujuan", "Buat kalkulator yang menerima dua angka dan operasi (+, -, *, /) lalu mencetak hasil."),
            _section("Langkah", "1) Minta input dua angka. 2) Minta operator. 3) Lakukan percabangan sesuai operator. 4) Tampilkan hasil. 5) Tangani pembagian dengan 0."),
            _section("Pengembangan", "Tambah validasi angka, menu ulang, atau menyimpan riwayat hitungan ke list.")]},
    ],
    "javascript": [
        {"title": "Pengenalan JavaScript", "summary": "Kenali bahasa web yang membuat halaman jadi interaktif.", "duration": "8 menit", "sections": [
            _section("Apa itu JavaScript?", "JavaScript berjalan di browser (dan juga di server lewat Node.js). Setiap tombol, animasi, dan validasi di halaman web modern biasanya dibuat dengannya."),
            _section("console.log()", "Perintah utama untuk mencetak nilai saat belajar. Lihat hasilnya di console browser (F12)."),
            _section("Tips", "Mulailah dari file HTML dengan `<script>` sederhana sambil belajar sintaksnya.")]},
        {"title": "Variable: var, let, const", "summary": "Pahami perbedaan tiga cara membuat variable.", "duration": "9 menit", "sections": [
            _section("let & const", "`let` membuat variable yang bisa diubah. `const` membuat variable yang tidak akan diubah ulang."),
            _section("var sudah ketinggalan", "`var` masih valid tapi hindari untuk kode baru karena punya scope yang membingungkan."),
            _section("Konvensi", "Pakai `const` secara default. Ganti ke `let` jika nilai memang perlu berubah.")]},
        {"title": "Tipe data & Operator", "summary": "Angka, teks, boolean, dan operasi dasar.", "duration": "9 menit", "sections": [
            _section("Tipe utama", "`number`, `string`, `boolean`, `null`, `undefined`, `object`, `array`."),
            _section("Operator", "+ - * / % ** untuk hitung. === untuk perbandingan ketat (lebih aman daripada ==)."),
            _section("Template literal", "`${}` di dalam backtick: `` `Halo ${nama}` `` membuat string gabungan jauh lebih mudah.")]},
        {"title": "Conditional", "summary": "if, else if, else, dan switch.", "duration": "9 menit", "sections": [
            _section("if biasa", "if (kondisi) { aksi } else if (kondisi2) { aksi2 } else { fallback }."),
            _section("Ternary", "Bentuk singkat `kondisi ? jalan1 : jalan2`. Pakai untuk kondisi sederhana saja."),
            _section("switch", "switch (nilai) { case \"a\": ...; break; default: ... }.")]},
        {"title": "Loop", "summary": "for, while, dan iterasi array modern.", "duration": "10 menit", "sections": [
            _section("for klasik", "for (let i = 0; i < 5; i++) { console.log(i) }."),
            _section("for...of & for...in", "`for...of` iterasi nilai, `for...in` iterasi key object."),
            _section("Array modern", "`.forEach()`, `.map()`, `.filter()`, `.reduce()` lebih deklaratif dan sering dipakai di kode produksi.")]},
        {"title": "Function", "summary": "Function statement dan arrow function.", "duration": "9 menit", "sections": [
            _section("Function statement", "function tambah(a, b) { return a + b }."),
            _section("Arrow function", "const tambah = (a, b) => a + b. Lebih ringkas; cocok untuk callback."),
            _section("Parameter default & rest", "function sapa(nama = \"Teman\") {}. Rest parameter: function sum(...nilai) {}.")]},
        {"title": "Array & Method", "summary": "Olah data berurutan dengan method praktis.", "duration": "10 menit", "sections": [
            _section("Dasar array", "const nilai = [80, 90, 75]. Ambil dengan index: nilai[0]."),
            _section("Method penting", "push, pop, shift, unshift mengubah array. map, filter, reduce menghasilkan array baru tanpa mengubah aslinya."),
            _section("Destructuring", "const [a, b] = [1, 2]. Memudahkan ambil beberapa nilai sekaligus.")]},
        {"title": "Object", "summary": "Simpan data berpasangan key-value.", "duration": "9 menit", "sections": [
            _section("Object literal", "const siswa = { nama: \"Rina\", nilai: 90 }."),
            _section("Akses", "siswa.nama atau siswa[\"nama\"]. Shorthand `{nama}` jika nama variable sama dengan key."),
            _section("Method dalam object", "const siswa = { nama: \"Rina\", sapa() { return `Halo ${this.nama}` } }.")]},
        {"title": "DOM Dasar", "summary": "Mengubah halaman HTML dari JavaScript.", "duration": "11 menit", "sections": [
            _section("Memilih elemen", "document.querySelector(\"#judul\") untuk pilih berdasarkan id."),
            _section("Mengubah isi", ".textContent mengubah teks, .innerHTML mengubah HTML, .classList.add() menambah class."),
            _section("Event", "elemen.addEventListener(\"click\", () => { ... }) menjalankan fungsi saat tombol diklik.")]},
        {"title": "Event & Form", "summary": "Dengarkan interaksi pengguna.", "duration": "9 menit", "sections": [
            _section("Click, submit, input", "Jenis event sering: click, submit (form), input (textbox)."),
            _section("preventDefault", "event.preventDefault() mencegah form berpindah halaman saat submit."),
            _section("Validasi sederhana", "Cek field tidak kosong sebelum mengirim data.")]},
        {"title": "Async: Promise & await", "summary": "Tangani operasi yang butuh waktu.", "duration": "10 menit", "sections": [
            _section("Kenapa async?", "Operasi seperti fetch data perlu waktu. JavaScript tidak boleh menunggu di jalur utama."),
            _section("async/await", "async function ambilData() { const res = await fetch(url); const data = await res.json(); return data }."),
            _section("Error handling", "Bungkus di try/catch agar error jaringan tidak membuat halaman diam.")]},
        {"title": "Fetch & JSON", "summary": "Ambil data dari server.", "duration": "9 menit", "sections": [
            _section("fetch dasar", "const res = await fetch(\"https://api.contoh.com/data\"). Hasilnya response, perlu .json() untuk mengurai."),
            _section("JSON.stringify & parse", "Kirim data: JSON.stringify(obj). Terima: JSON.parse(str)."),
            _section("Keamanan", "Jangan simpan API key sensitif di front-end publik.")]},
        {"title": "Module (import/export)", "summary": "Pecah kode menjadi file terorganisir.", "duration": "7 menit", "sections": [
            _section("export", "export function tambah(a, b) { return a + b }."),
            _section("import", "import { tambah } from \"./utils.js\"."),
            _section("Default export", "export default class Siswa {}. Import tanpa kurung kurawal.")]},
        {"title": "Error Handling", "summary": "Jaga kode tetap jalan saat gagal.", "duration": "7 menit", "sections": [
            _section("try/catch", "try { ... } catch (err) { console.error(err) }."),
            _section("Throw error", "throw new Error(\"Nilai tidak valid\"). Pakai jika logika aplikasi dilanggar."),
            _section("Finally", "Blok finally selalu dijalankan, misal untuk membersihkan state loading.")]},
        {"title": "Mini Project: To-do List", "summary": "Satukan DOM, event, dan array.", "duration": "15 menit", "sections": [
            _section("Rencana", "Input teks + tombol tambah. Daftar tugas muncul di bawahnya. Setiap tugas bisa dihapus."),
            _section("Langkah utama", "1) Simpan tugas di array. 2) Render ulang daftar setiap perubahan. 3) Tambah event listener untuk tombol."),
            _section("Pengembangan", "Simpan di localStorage agar tidak hilang saat refresh.")]},
    ],
    "html": [
        {"title": "Pengenalan HTML", "summary": "HTML adalah kerangka halaman web.", "duration": "7 menit", "sections": [
            _section("Apa itu HTML?", "HTML (HyperText Markup Language) menandai bagian-bagian halaman: judul, paragraf, gambar, tautan."),
            _section("Struktur dasar", "<!DOCTYPE html>\\n<html>\\n<head><title>Judul</title></head>\\n<body>Konten</body>\\n</html>"),
            _section("Catatan", "Setiap tag biasanya dibuka dan ditutup. Beberapa tag mandiri seperti <img> dan <br>.")]},
        {"title": "Tag Teks", "summary": "Heading, paragraf, dan penekanan.", "duration": "8 menit", "sections": [
            _section("Heading h1-h6", "Gunakan satu <h1> per halaman untuk judul utama. <h2> dan seterusnya untuk sub judul."),
            _section("Paragraf", "<p>...</p> membungkus satu paragraf. Jangan pakai beberapa <br> berturut-turut untuk pisahkan paragraf."),
            _section("Penekanan", "<strong> untuk penting, <em> untuk penekanan ringan. <mark> menandai teks seperti highlighter.")]},
        {"title": "Link & Gambar", "summary": "Hubungkan halaman dan tampilkan media.", "duration": "7 menit", "sections": [
            _section("Tautan", "<a href=\"https://example.com\">Buka</a>. Tambahkan target=\"_blank\" untuk membuka tab baru."),
            _section("Gambar", "<img src=\"foto.jpg\" alt=\"deskripsi\">. Selalu tulis alt agar aksesibel dan SEO lebih baik."),
            _section("Media lain", "<video> dan <audio> dengan atribut controls menampilkan pemutar standar.")]},
        {"title": "List & Tabel", "summary": "Tampilkan data terurut dan tabular.", "duration": "8 menit", "sections": [
            _section("List", "<ul> untuk urutan bebas, <ol> untuk bernomor. Isi dengan <li>."),
            _section("Tabel", "<table>, <thead>, <tbody>, <tr>, <th>, <td>. Pakai tabel untuk data, bukan tata letak."),
            _section("Aksesibilitas", "Tambah scope=\"col\" pada <th> agar pembaca layar paham struktur.")]},
        {"title": "Form Dasar", "summary": "Kumpulkan input pengguna.", "duration": "9 menit", "sections": [
            _section("Elemen form", "<form> membungkus input. Setiap input ber-<label>, action menentukan tujuan submit."),
            _section("Jenis input", "text, email, password, number, date, checkbox, radio, file."),
            _section("Tombol", "<button type=\"submit\">Kirim</button>. Gunakan type=button untuk tombol aksi lain.")]},
        {"title": "Semantic HTML", "summary": "Beri makna pada struktur halaman.", "duration": "8 menit", "sections": [
            _section("Kenapa semantic?", "Pencari dan pembaca layar lebih paham struktur jika memakai tag yang tepat."),
            _section("Tag penting", "<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>."),
            _section("div vs semantic", "<div> tetap valid untuk pembungkus generik, tapi gunakan semantic jika makna tersedia.")]},
        {"title": "Atribut Umum", "summary": "id, class, data-, dan lainnya.", "duration": "6 menit", "sections": [
            _section("id vs class", "id unik satu per halaman, class bisa dipakai di banyak elemen."),
            _section("data-*", "Simpan info pada elemen: data-id=\"42\". Diakses JavaScript dengan dataset.id."),
            _section("Aksesibilitas", "aria-label menjelaskan tombol tanpa teks, title memberi tooltip.")]},
        {"title": "Head & Meta", "summary": "Metadata membantu SEO dan tampilan.", "duration": "6 menit", "sections": [
            _section("Isi head", "<title>, <meta charset=\"UTF-8\">, <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">."),
            _section("Favicon", "<link rel=\"icon\" href=\"favicon.ico\">."),
            _section("Open Graph", "Tag og:title, og:image membuat tampilan link di media sosial lebih menarik.")]},
        {"title": "Multimedia", "summary": "Video, audio, iframe.", "duration": "6 menit", "sections": [
            _section("Video", "<video src=\"...\" controls poster=\"thumb.jpg\"></video>."),
            _section("Audio", "<audio src=\"lagu.mp3\" controls></audio>."),
            _section("Iframe", "Tanamkan konten eksternal (map, video YouTube). Perhatikan izin dan privasi.")]},
        {"title": "Form Lanjutan", "summary": "Validasi dan field khusus.", "duration": "8 menit", "sections": [
            _section("Required & pattern", "Atribut required mewajibkan isi, pattern memvalidasi regex sederhana."),
            _section("Select & textarea", "<select><option>...</option></select>. <textarea> untuk teks panjang."),
            _section("Autocomplete", "Atribut autocomplete=\"email\" membantu browser mengisi otomatis.")]},
        {"title": "HTML Entity & Karakter", "summary": "Tulis karakter khusus dengan benar.", "duration": "5 menit", "sections": [
            _section("Entity dasar", "&lt; &gt; &amp; untuk <, >, &."),
            _section("Simbol", "&copy; (©), &reg; (®), &euro; (€)."),
            _section("Spasi", "&nbsp; menambah spasi yang tidak dipotong.")]},
        {"title": "SEO Dasar", "summary": "Pengenalan optimasi mesin pencari.", "duration": "6 menit", "sections": [
            _section("Judul & deskripsi", "<title> dan meta description muncul di hasil pencarian."),
            _section("Heading hierarkis", "Gunakan h1 → h2 → h3 secara berurutan, jangan loncat."),
            _section("Teks alt gambar", "Deskripsi gambar membantu mesin pencari memahami isi halaman.")]},
        {"title": "Aksesibilitas", "summary": "Buat halaman ramah untuk semua.", "duration": "7 menit", "sections": [
            _section("Kontras warna", "Pastikan teks mudah dibaca di atas latar belakangnya."),
            _section("Keyboard", "Semua interaksi harus bisa dilakukan dengan Tab + Enter, bukan hanya klik mouse."),
            _section("Screen reader", "Gunakan label dan aria- yang jelas untuk membantu pengguna pembaca layar.")]},
        {"title": "Struktur Halaman Lengkap", "summary": "Rangkai header, hero, content, footer.", "duration": "9 menit", "sections": [
            _section("Pola umum", "header dengan nav → hero (judul besar) → section konten → footer dengan kontak."),
            _section("Komponen umum", "Card dengan judul, deskripsi, dan tombol. Ulangi dalam section."),
            _section("Checklist", "Judul jelas, gambar ber-alt, link bermakna, form validasi, footer lengkap.")]},
        {"title": "Mini Project: Landing Page", "summary": "Rangkai HTML menjadi halaman nyata.", "duration": "15 menit", "sections": [
            _section("Rencana", "Halaman promosi sekolah: header nama sekolah, hero visi, section kegiatan, footer kontak."),
            _section("Langkah", "1) Struktur semantic. 2) Isi konten. 3) Tambah gambar dengan alt. 4) Hubungkan tombol ke section."),
            _section("Pengembangan", "Hubungkan ke CSS pada jalur berikutnya untuk mempercantik tampilan.")]},
    ],
    "css": [
        {"title": "Pengenalan CSS", "summary": "CSS mempercantik HTML tanpa mengubah strukturnya.", "duration": "7 menit", "sections": [
            _section("Cara pakai", "Inline (style=\"...\"), internal (<style>), atau external (<link rel=\"stylesheet\">). External paling disarankan."),
            _section("Selector dasar", "Pilih berdasarkan tag (p), class (.card), id (#judul)."),
            _section("Deklarasi", "selector { property: value; } — jangan lupa titik koma di akhir setiap deklarasi.")]},
        {"title": "Warna & Teks", "summary": "Atur warna, font, dan ukuran teks.", "duration": "8 menit", "sections": [
            _section("Warna", "color: #0284C7; atau rgba(2,132,199,.8). Gunakan hex untuk kode konsisten."),
            _section("Font", "font-family: 'Inter', sans-serif;. Pakai fallback agar tetap rapi."),
            _section("Ukuran", "font-size: 16px. line-height: 1.5 membuat teks lega untuk dibaca.")]},
        {"title": "Box Model", "summary": "Pahami bagaimana spasi diatur CSS.", "duration": "10 menit", "sections": [
            _section("Komponen box", "Setiap elemen punya content → padding → border → margin."),
            _section("box-sizing", "Set `*, *::before, *::after { box-sizing: border-box; }` agar width termasuk padding."),
            _section("Spasi", "Pakai margin untuk jarak antar elemen, padding untuk jarak dari isi.")]},
        {"title": "Flexbox", "summary": "Susun elemen fleksibel dalam baris atau kolom.", "duration": "10 menit", "sections": [
            _section("display: flex", "Elemen anak otomatis sejajar. flex-direction menentukan arah."),
            _section("justify-content & align-items", "Mengatur distribusi di sumbu utama dan tegak lurus."),
            _section("Gap", "gap: 12px memberi jarak antar anak tanpa margin tambahan.")]},
        {"title": "Grid", "summary": "Buat tata letak dua dimensi.", "duration": "10 menit", "sections": [
            _section("display: grid", "grid-template-columns: repeat(3, 1fr) membuat 3 kolom sama lebar."),
            _section("Area", "Nama area membuat tata letak responsive mudah dibaca."),
            _section("Gap", "gap: 16px bekerja seperti di flex, memberi jarak antar sel.")]},
        {"title": "Position", "summary": "Static, relative, absolute, fixed, sticky.", "duration": "9 menit", "sections": [
            _section("Static & relative", "Static adalah default. Relative sedikit menggeser dari posisi asal."),
            _section("Absolute", "Keluar dari aliran, mengambil posisi relatif ke parent dengan position: relative."),
            _section("Fixed & sticky", "Fixed tetap di layar. Sticky menempel saat scroll melewati batas.")]},
        {"title": "Pseudo-class", "summary": ":hover, :focus, :nth-child, dan lainnya.", "duration": "7 menit", "sections": [
            _section("Interaksi", ":hover, :focus, :active mengubah tampilan saat berinteraksi."),
            _section("Struktural", ":first-child, :last-child, :nth-child(odd) menargetkan posisi."),
            _section("Form", ":disabled, :invalid, :valid memberi feedback status form.")]},
        {"title": "Transform & Transition", "summary": "Animasi ringan untuk interaksi.", "duration": "8 menit", "sections": [
            _section("Transform", "transform: translateY(-2px) scale(1.02) mengubah posisi dan ukuran."),
            _section("Transition", "transition: all .2s ease membuat perubahan properti terasa halus."),
            _section("Tips", "Gunakan transition pada transform dan opacity untuk performa terbaik.")]},
        {"title": "Animation & Keyframes", "summary": "Buat animasi sendiri.", "duration": "8 menit", "sections": [
            _section("@keyframes", "@keyframes muncul { from { opacity: 0 } to { opacity: 1 } }."),
            _section("Jalankan", "animation: muncul .4s ease-out forwards."),
            _section("Ethical motion", "Hormati prefers-reduced-motion untuk pengguna yang sensitif gerakan.")]},
        {"title": "Responsive Design", "summary": "Tampilan menyesuaikan ukuran layar.", "duration": "9 menit", "sections": [
            _section("Mobile first", "Mulai dari ukuran kecil, lalu tambah styling untuk layar besar."),
            _section("@media", "@media (min-width: 768px) { ... } menerapkan aturan di tablet ke atas."),
            _section("Unit", "rem lebih fleksibel daripada px untuk ukuran teks. % untuk lebar yang fluid.")]},
        {"title": "Variable CSS", "summary": "Konsisten dengan custom property.", "duration": "6 menit", "sections": [
            _section("Deklarasi", ":root { --brand: #0284C7; }."),
            _section("Pakai", "color: var(--brand);. Lebih mudah untuk theming."),
            _section("Dark mode", "Ganti variable di prefers-color-scheme untuk mendukung mode gelap.")]},
        {"title": "Typography", "summary": "Rapikan teks agar nyaman dibaca.", "duration": "6 menit", "sections": [
            _section("Hierarki", "Beda ukuran dan ketebalan antara heading dan isi."),
            _section("Panjang baris", "Idealnya 50-75 karakter per baris agar mata tidak lelah."),
            _section("Spacing", "letter-spacing kecil untuk heading besar; biarkan default untuk isi.")]},
        {"title": "Komponen Umum", "summary": "Card, button, badge.", "duration": "7 menit", "sections": [
            _section("Button", "Gabungan padding, border-radius, dan transition. Hover memberi feedback."),
            _section("Card", "Container dengan background, padding, shadow ringan, dan radius."),
            _section("Badge", "Ukuran kecil untuk label status: default, success, warning, error.")]},
        {"title": "Debugging CSS", "summary": "Pakai DevTools dengan efektif.", "duration": "5 menit", "sections": [
            _section("Inspect element", "Klik kanan → inspect untuk melihat aturan aktif."),
            _section("Specificity", "ID > class > tag. Kalau style tidak muncul, mungkin kalah spesifik."),
            _section("Tips", "Pakai outline sementara: * { outline: 1px solid red } untuk melihat struktur layout.")]},
        {"title": "Mini Project: Styling Landing Page", "summary": "Rapikan landing page HTML dengan CSS.", "duration": "15 menit", "sections": [
            _section("Rencana", "Tambahkan grid untuk kegiatan, flex untuk nav, variable warna brand, dan transition pada tombol."),
            _section("Langkah", "1) Warna + font brand. 2) Flex untuk header. 3) Grid untuk kartu kegiatan. 4) Media query untuk mobile."),
            _section("Checklist", "Kontras cukup, responsive, animasi halus, konsisten warna.")]},
    ],
    "cpp": [
        {"title": "Pengenalan C++", "summary": "Bahasa performa tinggi, fondasi banyak sistem.", "duration": "7 menit", "sections": [
            _section("Apa itu C++?", "Bahasa statis dan di-compile menjadi program native. Dipakai di game, OS, dan sistem embedded."),
            _section("Hello World", "#include <iostream>\\nusing namespace std;\\nint main() { cout << \"Halo\"; return 0; }"),
            _section("Compile", "Di komputer pribadi gunakan g++ nama.cpp -o nama lalu ./nama untuk menjalankan.")]},
        {"title": "Variable & Tipe", "summary": "int, double, char, bool, string.", "duration": "8 menit", "sections": [
            _section("Deklarasi", "int umur = 15; double tinggi = 1.65;"),
            _section("Konstanta", "const double PI = 3.14; nilai tidak dapat diubah."),
            _section("string", "#include <string>; string nama = \"Rina\";")]},
        {"title": "Operator & Ekspresi", "summary": "Hitung, bandingkan, logika.", "duration": "7 menit", "sections": [
            _section("Aritmetika", "+ - * / %. Pembagian int dengan int menghasilkan int."),
            _section("Perbandingan & logika", "== != > < >= <=; && || ! untuk logika."),
            _section("Increment", "i++ sama dengan i = i + 1.")]},
        {"title": "Conditional", "summary": "if, else if, else, switch.", "duration": "8 menit", "sections": [
            _section("if", "if (nilai >= 75) { cout << \"Lulus\"; }."),
            _section("switch", "switch (hari) { case 1: ...; break; default: ... }."),
            _section("Ternary", "nilai >= 75 ? \"Lulus\" : \"Tidak lulus\".")]},
        {"title": "Loop", "summary": "for, while, do-while.", "duration": "8 menit", "sections": [
            _section("for", "for (int i = 0; i < 5; i++) { cout << i; }."),
            _section("while", "while (sisa > 0) { ... }."),
            _section("Range-based for", "for (int n : {1,2,3}) { cout << n; } (C++11+).")]},
        {"title": "Function", "summary": "Membuat kode modular.", "duration": "9 menit", "sections": [
            _section("Deklarasi", "int tambah(int a, int b) { return a + b; }."),
            _section("Pass by value vs reference", "Reference `int &x` membuat perubahan di fungsi berpengaruh ke variabel asal."),
            _section("Default parameter", "void sapa(string nama = \"Teman\") {}.")]},
        {"title": "Array & String", "summary": "Struktur data dasar.", "duration": "9 menit", "sections": [
            _section("Array", "int nilai[3] = {80, 90, 75}. Ingat batas index."),
            _section("Vector (lebih modern)", "#include <vector>; vector<int> nilai = {80, 90}; nilai.push_back(100);"),
            _section("String", "Menggunakan std::string. Gabung dengan +, panjang dengan .size().")]},
        {"title": "Pointer", "summary": "Konsep khas C++.", "duration": "10 menit", "sections": [
            _section("Alamat memory", "int umur = 10; int *p = &umur. p menyimpan alamat."),
            _section("Dereferensi", "*p untuk mengambil nilai yang ditunjuk."),
            _section("Hati-hati", "Pointer dangling atau nullptr dapat menyebabkan crash. Gunakan smart pointer di C++ modern.")]},
        {"title": "Struct", "summary": "Kelompokkan data terkait.", "duration": "7 menit", "sections": [
            _section("Definisi", "struct Siswa { string nama; int nilai; };"),
            _section("Pemakaian", "Siswa a = {\"Rina\", 90}; cout << a.nama;"),
            _section("Perbedaan dengan class", "Struct secara default public, class private. Fitur lainnya mirip.")]},
        {"title": "Class & OOP", "summary": "Enkapsulasi data dan method.", "duration": "11 menit", "sections": [
            _section("Konstruktor", "class Siswa { public: Siswa(string n) { nama = n; } string nama; };"),
            _section("Akses", "public, private, protected menentukan siapa yang boleh akses."),
            _section("Member function", "Deklarasi di dalam class, bisa dipisah definisinya di luar.")]},
        {"title": "Inheritance", "summary": "Warisi sifat dari class lain.", "duration": "9 menit", "sections": [
            _section("Dasar", "class Pelajar : public Orang {};. Pelajar mewarisi Orang."),
            _section("Override", "Method virtual boleh ditimpa oleh class turunan."),
            _section("Polymorphism", "Satu interface, banyak implementasi. Dasar untuk design pattern lanjutan.")]},
        {"title": "File I/O", "summary": "Baca tulis file.", "duration": "7 menit", "sections": [
            _section("Baca", "#include <fstream>; ifstream file(\"data.txt\"); string line; while (getline(file, line)) {}."),
            _section("Tulis", "ofstream out(\"keluar.txt\"); out << \"Halo\";."),
            _section("Error", "Selalu cek file.is_open() sebelum operasi.")]},
        {"title": "Standard Library", "summary": "Fitur siap pakai.", "duration": "8 menit", "sections": [
            _section("algorithm", "sort(v.begin(), v.end()); untuk mengurutkan vector."),
            _section("map", "map<string, int> nilai; nilai[\"Rina\"] = 90;."),
            _section("iostream", "cin >> umur; cout << umur; untuk input/output interaktif.")]},
        {"title": "Debugging & Praktik", "summary": "Jaga kualitas kode.", "duration": "6 menit", "sections": [
            _section("Compiler warning", "Nyalakan -Wall; peringatan sering jadi tanda bug awal."),
            _section("Komentar", "// komentar satu baris. /* ... */ untuk banyak baris. Jelaskan intensi, bukan apa."),
            _section("Modular", "Pecah program ke file header (.h) dan sumber (.cpp) untuk program besar.")]},
        {"title": "Mini Project: Nilai Siswa", "summary": "Program kelas sederhana.", "duration": "15 menit", "sections": [
            _section("Rencana", "Terima jumlah siswa, nama, dan tiga nilai. Hitung rata-rata, tentukan lulus."),
            _section("Langkah", "1) struct Siswa. 2) vector siswa. 3) Loop input. 4) Hitung dan tampilkan."),
            _section("Pengembangan", "Simpan ke file, cari siswa dengan nilai tertinggi, atau urutkan dengan sort.")]},
    ],
    "java": [
        {"title": "Pengenalan Java", "summary": "Bahasa populer untuk aplikasi dan Android.", "duration": "7 menit", "sections": [
            _section("Apa itu Java?", "Bahasa berorientasi objek yang berjalan di JVM. Terkenal karena 'write once, run anywhere'."),
            _section("Hello World", "public class Main { public static void main(String[] args) { System.out.println(\"Halo\"); } }"),
            _section("Jalankan", "javac Main.java menghasilkan Main.class. Jalankan dengan java Main.")]},
        {"title": "Variable & Tipe", "summary": "int, double, char, boolean, String.", "duration": "8 menit", "sections": [
            _section("Primitif vs objek", "int adalah primitif, String adalah objek."),
            _section("Final", "final double PI = 3.14; nilai tetap."),
            _section("Konvensi", "camelCase untuk variable: namaSiswa, nilaiAkhir.")]},
        {"title": "Operator", "summary": "Aritmetika dan logika.", "duration": "7 menit", "sections": [
            _section("Aritmetika", "+ - * / %. Pembagian integer menghilangkan desimal."),
            _section("String concat", "+ bisa menggabung String. Gunakan StringBuilder untuk banyak gabungan."),
            _section("Logika", "&& || ! sama seperti bahasa lain.")]},
        {"title": "Conditional", "summary": "if, else, switch.", "duration": "8 menit", "sections": [
            _section("if", "if (nilai >= 75) { System.out.println(\"Lulus\"); }."),
            _section("switch", "switch (nilai) { case 90: ...; break; default: ... }."),
            _section("switch expression (Java 14+)", "String hasil = switch (nilai) { case 90 -> \"A\"; default -> \"B\"; };.")]},
        {"title": "Loop", "summary": "for, while, do-while.", "duration": "8 menit", "sections": [
            _section("for", "for (int i = 0; i < 5; i++) {}."),
            _section("Enhanced for", "for (int n : nilai) {} untuk iterasi array/collection."),
            _section("break & continue", "break keluar, continue lompat ke iterasi berikutnya.")]},
        {"title": "Method", "summary": "Modularisasi logika.", "duration": "9 menit", "sections": [
            _section("Deklarasi", "public static int tambah(int a, int b) { return a + b; }."),
            _section("Overloading", "Dua method dengan nama sama, parameter berbeda."),
            _section("Return", "Harus sesuai tipe deklarasi; void tidak mengembalikan apa pun.")]},
        {"title": "Array", "summary": "Struktur data tetap.", "duration": "7 menit", "sections": [
            _section("Deklarasi", "int[] nilai = {80, 90, 75};"),
            _section("Panjang", "nilai.length. Index mulai dari 0."),
            _section("Multidimensi", "int[][] matrix = new int[3][3]; untuk tabel.")]},
        {"title": "String", "summary": "Olah teks.", "duration": "7 menit", "sections": [
            _section("Method utama", "length(), toUpperCase(), substring(0,3), replace(\"a\",\"b\"), split(\",\")."),
            _section("Immutable", "String tidak bisa diubah; setiap operasi menghasilkan string baru."),
            _section("StringBuilder", "Lebih efisien untuk banyak modifikasi berurutan.")]},
        {"title": "Class & Object", "summary": "Dasar OOP di Java.", "duration": "11 menit", "sections": [
            _section("Class", "class Siswa { String nama; int nilai; }."),
            _section("Konstruktor", "public Siswa(String n, int v) { this.nama = n; this.nilai = v; }."),
            _section("Object", "Siswa rina = new Siswa(\"Rina\", 90); rina.nama;.")]},
        {"title": "Encapsulation", "summary": "Lindungi data dengan modifier.", "duration": "8 menit", "sections": [
            _section("private vs public", "private menyembunyikan dari luar class. Pakai getter/setter untuk akses terkontrol."),
            _section("this", "this merujuk ke instance saat ini."),
            _section("Package", "Kelompokkan class dalam package untuk organisasi.")]},
        {"title": "Inheritance", "summary": "class turunan.", "duration": "9 menit", "sections": [
            _section("extends", "class Pelajar extends Orang {}."),
            _section("super", "super() memanggil konstruktor parent."),
            _section("Override", "@Override memberitahu compiler kita menimpa method parent.")]},
        {"title": "Interface", "summary": "Kontrak behavior.", "duration": "8 menit", "sections": [
            _section("Deklarasi", "interface Hitung { int tambah(int a, int b); }."),
            _section("Implements", "class Kalkulator implements Hitung { ... }."),
            _section("Default method", "Interface boleh punya default method sejak Java 8.")]},
        {"title": "Collection", "summary": "ArrayList, HashMap, HashSet.", "duration": "9 menit", "sections": [
            _section("ArrayList", "List<Integer> nilai = new ArrayList<>(); nilai.add(90);."),
            _section("HashMap", "Map<String, Integer> siswa = new HashMap<>(); siswa.put(\"Rina\", 90);."),
            _section("HashSet", "Set<String> unik = new HashSet<>(); hanya menyimpan nilai unik.")]},
        {"title": "Exception", "summary": "Tangani kesalahan runtime.", "duration": "8 menit", "sections": [
            _section("try-catch", "try { ... } catch (ArithmeticException e) { ... }."),
            _section("finally", "Selalu dijalankan untuk membersihkan resource."),
            _section("throws", "Deklarasikan di method jika memanggil kode yang berpotensi error.")]},
        {"title": "Mini Project: Bank Sederhana", "summary": "Latih OOP.", "duration": "15 menit", "sections": [
            _section("Rencana", "Class Nasabah dengan saldo. Method setor, tarik, lihatSaldo."),
            _section("Langkah", "1) Buat class. 2) Validasi tarik tidak melebihi saldo. 3) Simpan beberapa nasabah di ArrayList."),
            _section("Pengembangan", "Tambah riwayat transaksi, hitung bunga, atau simpan ke file.")]},
    ],
    "ai": [
        {"title": "Apa itu Artificial Intelligence?", "summary": "Konsep dasar AI dalam bahasa sederhana.", "duration": "7 menit", "sections": [
            _section("AI = kemampuan belajar", "AI membuat komputer meniru kemampuan manusia belajar dari data: mengenali, memprediksi, mengambil keputusan."),
            _section("Bukan sihir", "AI bukan ajaib; dia belajar dari banyak contoh (data). Kualitas data menentukan kualitas AI."),
            _section("Di sekitarmu", "Rekomendasi musik, filter kamera, autocomplete chat, dan asisten suara adalah contoh AI yang kamu pakai setiap hari.")]},
        {"title": "Sejarah Singkat AI", "summary": "Dari ide 1950-an hingga Generative AI 2020-an.", "duration": "6 menit", "sections": [
            _section("Era awal", "1950: Alan Turing bertanya 'Dapatkah mesin berpikir?'. 1956: istilah AI resmi lahir."),
            _section("Masa dingin", "AI sempat pelan 1970-80 karena harapan terlalu besar vs komputer belum kuat."),
            _section("Era modern", "Dari 2012 Deep Learning meroket. 2022-2024 Generative AI (seperti ChatGPT) jadi arus utama.")]},
        {"title": "Machine Learning", "summary": "Cara AI belajar dari data.", "duration": "9 menit", "sections": [
            _section("Tiga keluarga", "Supervised (pakai label), Unsupervised (cari pola), Reinforcement (belajar dari reward)."),
            _section("Workflow", "Kumpulkan data → bersihkan → latih model → evaluasi → gunakan untuk prediksi."),
            _section("Overfitting", "Model yang terlalu hafal data latih bisa gagal di data baru. Perlu validasi.")]},
        {"title": "Deep Learning & Neural Network", "summary": "Jaringan saraf sederhana sampai lapisan dalam.", "duration": "9 menit", "sections": [
            _section("Neuron", "Meniru sel saraf: menerima input, mengalikan dengan bobot, lalu meneruskan hasil."),
            _section("Layer", "Banyak neuron disusun jadi layer. Beberapa layer bertumpuk = Deep Learning."),
            _section("Training", "Backpropagation menyesuaikan bobot agar prediksi makin tepat.")]},
        {"title": "Computer Vision", "summary": "Mengenali gambar dan video.", "duration": "8 menit", "sections": [
            _section("Image classification", "Model menebak kategori gambar: kucing, anjing, mobil."),
            _section("Object detection", "Menandai lokasi objek dengan kotak di gambar."),
            _section("Penerapan", "Face unlock, filter kamera, mobil otonom, deteksi penyakit dari citra medis.")]},
        {"title": "Natural Language Processing", "summary": "Memahami bahasa manusia.", "duration": "8 menit", "sections": [
            _section("Tugas umum", "Sentiment analysis, terjemahan, summarization, question answering."),
            _section("Tokenization", "Teks dipecah jadi token (potongan kata). Model memproses token."),
            _section("Context", "Model modern memahami konteks dengan Transformer yang jadi dasar LLM.")]},
        {"title": "Generative AI", "summary": "AI yang menghasilkan konten baru.", "duration": "8 menit", "sections": [
            _section("Jenis", "Teks (ChatGPT), gambar (Nano Banana), suara (TTS), video, kode."),
            _section("Bagaimana?", "Model dilatih dari sangat banyak contoh. Diminta prompt, model menyusun output baru."),
            _section("Batasan", "Hasil tidak selalu benar; bisa 'halusinasi'. Verifikasi sebelum dipakai.")]},
        {"title": "Large Language Model (LLM)", "summary": "Mesin di balik chatbot modern.", "duration": "8 menit", "sections": [
            _section("Skala besar", "Miliaran parameter yang dilatih dari triliunan token teks."),
            _section("Prompt", "Instruksi yang kamu tulis; model memprediksi lanjutan paling mungkin."),
            _section("Chain of thought", "Minta model menjelaskan langkah membantu akurasi untuk soal yang kompleks.")]},
        {"title": "Chatbot & Recommendation", "summary": "Dua aplikasi AI yang paling kamu rasakan.", "duration": "7 menit", "sections": [
            _section("Chatbot", "Kombinasi NLP, LLM, dan knowledge base. Dari rule-based ke generative."),
            _section("Recommendation", "Collaborative filtering (pelajari pola user) atau content-based (mirip item)."),
            _section("Hati-hati", "Rekomendasi bisa membentuk gelembung informasi; kritisi apa yang kamu konsumsi.")]},
        {"title": "AI dalam Pendidikan", "summary": "Dari asisten belajar sampai personalisasi.", "duration": "7 menit", "sections": [
            _section("Positif", "Latihan adaptif, umpan balik instan, teman belajar 24/7."),
            _section("Negatif", "Bergantung pada AI, kurang berlatih berpikir mandiri, dan risiko plagiarisme."),
            _section("Pemakaian sehat", "Gunakan AI untuk memahami, bukan menyalin. Tulis ulang dengan kata sendiri.")]},
        {"title": "AI dalam Kehidupan Sehari-hari", "summary": "Peluang karier di masa depan.", "duration": "6 menit", "sections": [
            _section("Industri", "Kesehatan, keuangan, logistik, agrikultur, hiburan — semua pakai AI."),
            _section("Peran", "Data scientist, ML engineer, prompt engineer, AI product manager, AI ethics specialist."),
            _section("Mulai dari mana?", "Kuasai Python, statistika dasar, dan logika pemrograman — fondasi untuk semua jalur AI.")]},
        {"title": "Prompt Engineering", "summary": "Beri instruksi yang tepat pada AI.", "duration": "7 menit", "sections": [
            _section("Rumus TKF", "Tujuan + Konteks + Format: 'Jelaskan loop Python untuk kelas 10, kurang dari 100 kata, pakai contoh gaya kalkulator.'"),
            _section("Peran", "'Kamu adalah tutor pemrograman...' membantu model menyesuaikan nada."),
            _section("Iterasi", "Jarang sekali prompt pertama sempurna. Perbaiki berdasarkan hasil.")]},
        {"title": "AI Hallucination", "summary": "Kenapa AI bisa salah dengan percaya diri.", "duration": "7 menit", "sections": [
            _section("Apa itu?", "Model menghasilkan jawaban yang terdengar meyakinkan tapi salah fakta."),
            _section("Penyebab", "Model menebak lanjutan paling mungkin — bukan paling benar."),
            _section("Cara menanggapi", "Selalu cek sumber, tanyakan sumber ke AI, dan verifikasi angka/fakta penting.")]},
        {"title": "Etika & Bias AI", "summary": "AI mewarisi data yang dipelajarinya.", "duration": "8 menit", "sections": [
            _section("Bias data", "Jika data latih tidak seimbang, keputusan AI juga tidak adil."),
            _section("Privasi", "Jangan masukkan NIK, data medis, atau password ke AI publik."),
            _section("Hak cipta", "Pakai konten generatif dengan menyebutkan bantuan AI; hormati karya orang lain.")]},
        {"title": "Mini Project AI: Chatbot Sederhana", "summary": "Rancang alur chatbot untuk tanya jawab coding.", "duration": "15 menit", "sections": [
            _section("Rencana", "User mengirim pertanyaan tentang Python → chatbot menjawab penjelasan. Alur: input → prompt → model → output."),
            _section("Langkah", "1) Siapkan prompt dasar 'kamu tutor coding'. 2) Rancang topik yang bisa dibantu. 3) Buat guardrail jangan beri jawaban langsung untuk coding challenge."),
            _section("Refleksi", "Catat kapan AI membantu belajar dan kapan justru mengurangi usaha berpikir mandiri.")]},
    ],
}


def language_lessons(language_id: str) -> list[dict[str, Any]]:
    data = LESSON_LIBRARY.get(language_id, [])
    return [
        {
            "id": f"{language_id}-lesson-{i + 1}",
            "language_id": language_id,
            "order": i + 1,
            "title": item["title"],
            "summary": item["summary"],
            "duration": item["duration"],
            "xp": 10 + i,
            "sections": item["sections"],
        }
        for i, item in enumerate(data)
    ]


def all_lessons() -> list[dict[str, Any]]:
    return [lesson for lang in LANGUAGE_META for lesson in language_lessons(lang["id"])]
