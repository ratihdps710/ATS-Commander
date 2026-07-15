import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Access the API key.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini client if the key is available.
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

app.use(express.json({ limit: '10mb' }));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: !!GEMINI_API_KEY
  });
});

// Resume Optimizer API Route
app.post("/api/optimize-resume", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Sistem AI belum terkonfigurasi. Pastikan GEMINI_API_KEY terpasang di panel Secrets."
      });
    }

    const { baseResume, jobDescription, roleName, language } = req.body;

    if (!baseResume || !jobDescription) {
      return res.status(400).json({
        error: "Mohon isi resume dasar (base resume) dan deskripsi pekerjaan terlebih dahulu."
      });
    }

    const isEnglish = language === "en";

    const systemPrompt = `Anda adalah seorang ahli rekrutmen profesional, spesialis optimasi sistem ATS (Applicant Tracking System), dan penasihat karir yang hebat di Indonesia.
Tugas Anda adalah menganalisis resume dasar (base resume) pengguna dan mencocokkannya dengan target pekerjaan (job description) yang diberikan.
Lalu, buatlah resume baru yang dioptimalkan agar lolos seleksi mesin screening ATS dengan skor kecocokan di atas 70%.

PANDUAN OPTIMASI RESUME:
1. **Pindahkan Kualifikasi & Pengalaman secara Jujur**: Pindahkan latar belakang pendidikan, kualifikasi, skill, sertifikasi, dan riwayat pekerjaan dari base resume ke resume baru, namun susun ulang kalimatnya menggunakan kata kerja aktif, metrik pencapaian (jika ada), serta kata kunci (keywords) yang relevan dari deskripsi pekerjaan target. Jangan mengarang riwayat kerja atau pendidikan fiktif yang tidak ada di base resume!
2. **Optimasi Kata Kunci (Keywords)**: Temukan kata kunci teknis (hard skills) dan non-teknis (soft skills) penting di deskripsi pekerjaan, lalu integrasikan ke dalam resume baru secara organik dan profesional.
3. **Berikan Penilaian Jujur**: Nilai kecocokan latar belakang pengguna dengan pekerjaan target secara objektif pada skala 1-10.
4. **Berikan Saran Perbaikan**: Berikan penjelasan jujur tentang kesenjangan (gap) antara resume dasar dengan kebutuhan lowongan. Beri tahu pengguna jika ada kualifikasi atau sertifikasi yang mungkin mereka miliki di luar resume dasar yang harus dicantumkan agar memperbesar peluang lolos. Jelaskan juga keputusan optimasi yang Anda buat.

PANDUAN BAHASA:
- Pengguna memilih bahasa target resume: ${isEnglish ? "Bahasa Inggris (English)" : "Bahasa Indonesia"}.
- Oleh karena itu, resume yang dioptimasi (nilai properti "optimizedResume") HARUS ditulis dan diterjemahkan/diformat sepenuhnya dalam ${isEnglish ? "Bahasa Inggris (English) yang profesional, formal, dan berstandar global" : "Bahasa Indonesia yang profesional, formal, dan sesuai EYD"}.
- Untuk analisis kesenjangan ("gapAnalysis"), detail penjelasan ("optimizationDetails"), dan penjelasan kecocokan ("suitabilityExplanation"), tetap tuliskan dalam Bahasa Indonesia agar mudah dipahami.

PANDUAN STRUKTUR & MARKDOWN "optimizedResume":
Resume hasil optimasi harus ditulis menggunakan Markdown dengan struktur yang sangat spesifik berikut untuk menghasilkan tata letak lembar A4 yang elegan, seimbang, dan mudah dibaca:

1. Baris pertama HARUS berupa Nama Lengkap menggunakan header tingkat 1 (#):
# [NAMA LENGKAP]

2. Baris berikutnya (tanpa tanda header # atau ##) adalah Judul Jabatan/Role Target yang disesuaikan dengan target pekerjaan (dipisahkan oleh pipa "|" jika ada beberapa):
[Target Job Title / Professional Role]

3. Baris berikutnya berisi detail info kontak, dipisahkan dengan tanda pipa "|":
[Nomor Telepon] | [Email] | [Lokasi, misal: Jakarta, Indonesia]

4. Baris berikutnya jika ada tambahan portofolio, links, atau ketersediaan kerja, dipisahkan dengan tanda pipa "|":
[Keterangan Remote / Time Zones / Link Portofolio]

5. Setiap bagian utama (Section) HARUS menggunakan header tingkat 2 (##) dengan huruf kapital semua (UPPERCASE) tanpa nomor urut:
## PROFESSIONAL SUMMARY
## KEY ACHIEVEMENTS
## CORE COMPETENCIES
## PROFESSIONAL EXPERIENCE
## EDUCATION
## CERTIFICATIONS

6. Untuk sub-bagian Pengalaman Kerja (PROFESSIONAL EXPERIENCE), gunakan format header tingkat 3 (###) yang menggabungkan Posisi Jabatan dan Rentang Tanggal dipisahkan dengan tanda pipa "|":
### [Nama Jabatan / Posisi] | [Rentang Tanggal, misal: January 2025 – Present]
Baris langsung di bawahnya berisi nama Perusahaan dan Keterangan/Lokasi dipisahkan oleh pipa "|":
[Nama Perusahaan] | [Keterangan Lokasi / Remote]
Diikuti dengan poin-poin penjelasan deskripsi tanggung jawab menggunakan tanda strip (-) dan menebalkan (bold) pencapaian penting.

7. Untuk sub-bagian Pendidikan (EDUCATION), gunakan format:
## EDUCATION
### [Nama Universitas / Institusi] | [Tahun Lulus, misal: 2019]
[Nama Gelar / Jurusan / IPK jika ada]

8. Untuk sub-bagian Sertifikasi (CERTIFICATIONS) jika ada, gunakan format:
## CERTIFICATIONS
[Nama Sertifikasi] | [Nama Lembaga Penerbit / Tahun]

Pastikan struktur di atas diikuti secara tepat sehingga sistem front-end dapat menguraikannya dan merender tampilan A4 dengan sempurna seperti format CV profesional yang bersih, seimbang, memiliki garis pembatas horizontal antar bagian utama, dan penataan teks berkeadilan.`;

    const userPrompt = `Target Role: ${roleName || 'Tidak ditentukan'}

--- RESUME DASAR (BASE RESUME) ---
${baseResume}

--- DESKRIPSI PEKERJAAN TARGET ---
${jobDescription}

Tolong optimasi resume dasar di atas agar lolos screening ATS untuk pekerjaan target tersebut, dan berikan evaluasi kecocokan yang lengkap sesuai schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for factual structuring
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: {
              type: Type.INTEGER,
              description: "Skor kecocokan ATS antara 0 hingga 100 persen berdasarkan optimasi resume."
            },
            suitabilityScale: {
              type: Type.INTEGER,
              description: "Skala kelayakan/kecocokan pengguna terhadap lowongan ini (skala 1-10)."
            },
            suitabilityExplanation: {
              type: Type.STRING,
              description: "Penjelasan jujur dan mendalam tentang kecocokan pengguna dengan pekerjaan ini berdasarkan resume dasarnya. Sebutkan jika ada kualifikasi lain yang tidak tertulis yang harus mereka pertimbangkan."
            },
            optimizedResume: {
              type: Type.STRING,
              description: "Teks resume lengkap yang sudah dioptimalkan dan disesuaikan dengan kata kunci ATS. Tuliskan dengan struktur resume formal: Info Kontak, Ringkasan Profesional, Pengalaman Kerja, Pendidikan, dan Skill."
            },
            gapAnalysis: {
              type: Type.STRING,
              description: "Analisis kesenjangan (gap) antara resume pengguna dan syarat di deskripsi pekerjaan."
            },
            optimizationDetails: {
              type: Type.STRING,
              description: "Penjelasan kenapa bagian tertentu di resume diubah, apa saja kata kunci yang dimasukkan, dan saran taktis lainnya untuk pendaftaran."
            },
            suggestedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar kata kunci krusial dari lowongan pekerjaan yang berhasil diintegrasikan ke dalam resume."
            }
          },
          required: [
            "atsScore",
            "suitabilityScale",
            "suitabilityExplanation",
            "optimizedResume",
            "gapAnalysis",
            "optimizationDetails",
            "suggestedKeywords"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI tidak menghasilkan respons yang valid.");
    }

    const data = JSON.parse(text);
    return res.json(data);

  } catch (error: any) {
    console.error("Error optimizing resume:", error);
    return res.status(500).json({
      error: error.message || "Gagal mengoptimasi resume menggunakan AI."
    });
  }
});

// Configure Vite integration for SPA development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
