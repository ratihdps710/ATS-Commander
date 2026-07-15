import { Project, JobApplication } from "../types";

// Helper to calculate automated status based on application date and current status
export function getAutomatedStatus(dateAppliedStr: string, status: string): { text: string; color: string } {
  if (status === 'not_applied' || !dateAppliedStr || dateAppliedStr === '-' || dateAppliedStr === '') {
    return { text: '📝 Belum Melamar (Draft)', color: 'text-stone-600 bg-stone-100/80 border-stone-200' };
  }

  if (status === 'rejected' || status === 'job canceled') {
    return { text: 'Arsip / Selesai', color: 'text-gray-400 bg-gray-100' };
  }

  const applyDate = new Date(dateAppliedStr);
  const today = new Date();
  
  // Calculate difference in days
  const diffTime = Math.abs(today.getTime() - applyDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 30) {
    return { text: '⚠️ >30 Hari Tanpa Kabar', color: 'text-rose-700 bg-rose-50 font-medium' };
  } else if (diffDays >= 14) {
    return { text: '⏳ >14 Hari Tanpa Kabar', color: 'text-amber-700 bg-amber-50 font-medium' };
  } else {
    return { text: '🟢 Aktif / Baru', color: 'text-emerald-700 bg-emerald-50' };
  }
}

// Generate default projects and job tracking applications for high-fidelity initial experience
export const defaultProjects: Project[] = [
  {
    id: 'proj-b2b-sales',
    name: 'B2B Sales Specialist',
    baseResume: `RATIH DWI PUTRI
ratihdps710@gmail.com | +62 812-3456-7890 | Jakarta, Indonesia

RINGKASAN PROFESIONAL
B2B Sales Specialist berpengalaman selama 3 tahun dalam mengelola siklus penjualan penuh dari prospeksi hingga negosiasi kontrak. Terbukti mampu melampaui target penjualan tahunan sebesar 15-20% melalui taktik penjualan berbasis konsultasi dan hubungan klien jangka panjang di sektor teknologi SaaS dan logistik.

PENGALAMAN KERJA
B2B Sales Executive | PT Solusi Digital Utama, Jakarta
Januari 2024 - Sekarang
* Mengelola portofolio berisi 40+ klien korporat berskala besar.
* Berhasil meningkatkan pertumbuhan pendapatan akun baru (new business revenue) sebesar 25% YoY.
* Melakukan presentasi produk, negosiasi harga, dan penutupan kontrak senilai ratusan juta rupiah per transaksi.
* Berkolaborasi dengan tim produk untuk menyesuaikan penawaran SaaS berdasarkan kebutuhan klien.

Account Representative | PT Logistik Cepat Indonesia, Jakarta
Juli 2022 - Desember 2023
* Memperoleh 15 klien bisnis baru di sektor manufaktur dalam waktu kurang dari 6 bulan.
* Berhasil mencapai rata-rata 110% dari kuota penjualan bulanan yang ditentukan.
* Menyusun proposal penawaran harga yang kompetitif dan mengoordinasikan transisi onboarding klien baru.

KEAHLIAN (SKILLS)
* Hard Skills: B2B Sales, CRM (Salesforce, HubSpot), Consultative Selling, Negosiasi Kontrak, Prospeksi Bisnis, Lead Generation.
* Soft Skills: Komunikasi Persuasif, Manajemen Hubungan Klien (CRM), Problem Solving, Kolaborasi Tim.

PENDIDIKAN
Sarjana Manajemen Bisnis | Universitas Indonesia, Depok
Kelulusan: 2022`,
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'proj-operational',
    name: 'Operational Manager',
    baseResume: `RATIH DWI PUTRI
ratihdps710@gmail.com | +62 812-3456-7890 | Jakarta, Indonesia

RINGKASAN PROFESIONAL
Profesional operasional dengan keahlian kepemimpinan dalam mengoptimalkan proses bisnis, rantai pasok (supply chain), dan manajemen tim. Terampil mengurangi biaya operasional hingga 12% tanpa mengorbankan kualitas layanan serta berpengalaman memimpin tim lintas divisi berisi 15+ staf.

PENGALAMAN KERJA
Operations & Logistics Lead | PT Global Express Cargo, Tangerang
Maret 2024 - Sekarang
* Memimpin pengawasan operasional pergudangan harian dan armada pengiriman barang regional Jabodetabek.
* Merancang ulang rute distribusi yang berhasil memotong biaya bahan bakar armada sebesar 15% bulanan.
* Mengelola tim operasional gudang sebanyak 18 orang termasuk penjadwalan shift dan evaluasi KPI.
* Menurunkan tingkat kesalahan pengiriman dari 2.1% menjadi di bawah 0.5% melalui implementasi SOP baru.

Operational Supervisor | PT Retail Raksasa Indonesia, Tangerang
September 2022 - Februari 2024
* Mengawasi operasional logistik masuk (inbound) dan keluar (outbound) untuk 5 gerai ritel besar.
* Memastikan kepatuhan ketat terhadap standar keselamatan kerja (K3) di lingkungan gudang.
* Berkoordinasi dengan supplier luar negeri untuk ketersediaan stok barang dan pemrosesan bea cukai harian.

KEAHLIAN (SKILLS)
* Hard Skills: Supply Chain Management, Operational SOPs, Inventory Control, Budgeting, Logistics Analytics.
* Soft Skills: Leadership, Project Management, Conflict Resolution, Adaptabilitas Tinggi.

PENDIDIKAN
Sarjana Teknik Industri | Institut Teknologi Bandung, Bandung
Kelulusan: 2022`,
    createdAt: '2026-06-01T10:05:00Z'
  },
  {
    id: 'proj-socmed',
    name: 'Social Media & Brand Specialist',
    baseResume: `RATIH DWI PUTRI
ratihdps710@gmail.com | +62 812-3456-7890 | Jakarta, Indonesia

RINGKASAN PROFESIONAL
Creative Social Media Specialist dengan spesialisasi pengembangan brand digital dan pembuatan konten orisinal yang memicu interaksi komunitas. Ahli dalam merancang strategi Instagram, TikTok, dan LinkedIn yang mampu melipatgandakan metrik jangkauan organik (organic reach) brand retail & tech startup.

PENGALAMAN KERJA
Social Media Specialist | PT Kosmetik Cantik Digital, Jakarta
November 2023 - Sekarang
* Menyusun strategi editorial content calendar bulanan untuk Instagram dan TikTok dengan 200k+ total pengikut.
* Berhasil menaikkan engagement rate organik sebesar 45% dan jangkauan konten (reach) sebesar 120% melalui tren video reels kreatif.
* Berkolaborasi dengan influencer kecantikan dalam promosi berbayar (KOL Management).
* Menggunakan analitik (Meta Suite, TikTok Analytics) untuk merumuskan ulang strategi konten berbasis data bulanan.

Social Media Associate | PT Kreatif Studio Muda, Bandung
Juni 2022 - Oktober 2023
* Memproduksi 15+ konten video pendek mingguan (shooting, editing, scripting) untuk 3 klien agensi.
* Mengelola moderasi komunitas dan melayani pertanyaan pelanggan melalui direct messages secara ramah dan tanggap.

KEAHLIAN (SKILLS)
* Hard Skills: Copywriting, Content Creation, Video Editing (CapCut, Premiere), KOL Management, Social Media Analytics, SEO Dasar.
* Soft Skills: Pemikiran Kreatif, Storytelling, Manajemen Waktu, Kerjasama Tim.

PENDIDIKAN
Sarjana Ilmu Komunikasi | Universitas Padjadjaran, Jatinangor
Kelulusan: 2022`,
    createdAt: '2026-06-01T10:10:00Z'
  }
];

// Seed some initial tracked job applications around the current month (July 2026)
export const defaultApplications: JobApplication[] = [
  {
    id: 'app-1',
    projectId: 'proj-b2b-sales',
    company: 'GoTo Group',
    title: 'Senior Enterprise Sales Executive',
    jobCategory: 'Sales / Business Development',
    locationType: 'hybrid',
    workType: 'full-time',
    country: 'Indonesia',
    timezone: 'GMT+7',
    status: 'interview',
    dateCreated: '2026-07-01',
    dateApplied: '2026-07-02',
    interviewDates: ['2026-07-10', '2026-07-15'],
    atsScore: 84,
    suitabilityScale: 8,
    suitabilityExplanation: 'Latar belakang pelamar di PT Solusi Digital Utama sangat relevan dengan kebutuhan GoTo. Pengalaman mengelola 40+ klien korporat SaaS cocok untuk segmen Enterprise. Disarankan untuk menyoroti pencapaian persentase peningkatan YoY yang terukur saat wawancara.',
    optimizedResume: `RATIH DWI PUTRI\nratihdps710@gmail.com | +62 812-3456-7890 | Jakarta, Indonesia\n\nRINGKASAN PROFESIONAL\nEnterprise Sales Specialist dengan rekam jejak sukses melampaui kuota B2B dan mengelola kemitraan berharga tinggi di sektor SaaS. Memiliki keahlian kuat dalam Consultative Selling, manajemen siklus penjualan lengkap, dan hubungan level eksekutif.\n\nPENGALAMAN KERJA\nPT Solusi Digital Utama - B2B Sales Executive\nJanuari 2024 - Sekarang\n* Memimpin siklus penjualan penuh untuk 40+ klien korporat berskala besar.\n* Berhasil mencetak pertumbuhan pendapatan akun baru sebesar 25% YoY.\n* Menutup transaksi bernilai ratusan juta rupiah per kontrak.\n\nPT Logistik Cepat Indonesia - Account Representative\nJuli 2022 - Desember 2023\n* Memperoleh 15 akun bisnis manufaktur baru dalam 6 bulan.\n* Konsisten melampaui target kuota dengan rata-rata pencapaian 110%.`,
    gapAnalysis: 'Sedikit gap pada bagian sertifikasi penjualan formal, namun tertutupi oleh pengalaman praktis menangani kontrak korporat bernilai tinggi.',
    optimizationDetails: 'Injeksi kata kunci "Enterprise Sales", "B2B SaaS", dan "Siklus Penjualan Lengkap" untuk mencocokkan kualifikasi GoTo.',
    notes: 'Sudah melalui Interview HR tanggal 10 Juli. Wawancara User (Tech Test/Case) dijadwalkan tanggal 15 Juli 2026 pukul 14:00 WIB.',
    jobDescription: 'GoTo is looking for an experienced Senior Enterprise Sales Executive to scale our corporate technology packages and SaaS models. Must have a history of driving B2B account growth.'
  },
  {
    id: 'app-2',
    projectId: 'proj-b2b-sales',
    company: 'HubSpot Singapore',
    title: 'B2B Business Development Representative',
    jobCategory: 'Sales / Business Development',
    locationType: 'remote',
    workType: 'full-time',
    country: 'Singapore',
    timezone: 'GMT+8',
    status: 'applied',
    dateCreated: '2026-07-08',
    dateApplied: '2026-07-09',
    interviewDates: [],
    atsScore: 78,
    suitabilityScale: 7,
    suitabilityExplanation: 'Kecocokan yang baik karena kandidat sudah memiliki pengalaman nyata menggunakan HubSpot CRM dan melakukan cold outbound prospecting. Gap utamanya adalah kebutuhan bahasa Inggris tingkat profesional penuh karena menangani klien regional Asia Tenggara.',
    optimizedResume: `RATIH DWI PUTRI\nratihdps710@gmail.com | +62 812-3456-7890\n\nPROFESSIONAL SUMMARY\nConsultative B2B Sales Executive with 3 years experience driving SaaS account acquisition and client retention. Proficient in HubSpot CRM, outbound lead generation, and contract negotiation.\n\nEXPERIENCE\nPT Solusi Digital Utama - B2B Sales Executive\nJan 2024 - Present\n* Managed high-value tech portfolios with 25% revenue growth.\n* Utilized consultative tactics to close major software contracts.`,
    gapAnalysis: 'Memerlukan kefasihan bahasa Inggris bisnis dalam komunikasi tertulis dan lisan secara intensif.',
    optimizationDetails: 'Bahasa resume diganti ke bahasa Inggris profesional untuk mencocokkan target pasar Singapura.',
    notes: 'Kirim lamaran lewat LinkedIn Jobs. Menunggu respon.',
    jobDescription: 'HubSpot Singapore is seeking a B2B Business Development Representative to manage sales leads, qualify outbound contacts, and work actively within HubSpot CRM systems.'
  },
  {
    id: 'app-3',
    projectId: 'proj-operational',
    company: 'Shopee Express',
    title: 'Hub Logistics Operations Supervisor',
    jobCategory: 'Operations / Logistics',
    locationType: 'on site',
    workType: 'full-time',
    country: 'Indonesia',
    timezone: 'GMT+7',
    status: 'interview',
    dateCreated: '2026-07-03',
    dateApplied: '2026-07-04',
    interviewDates: ['2026-07-09'],
    atsScore: 91,
    suitabilityScale: 9,
    suitabilityExplanation: 'Sangat cocok! Kandidat saat ini memimpin operasional logistik logistik di Tangerang. Pengalaman memangkas biaya bahan bakar sebesar 15% dan memimpin 18 staf sangat dicari oleh Shopee Express untuk Hub Supervisor.',
    optimizedResume: `RATIH DWI PUTRI\n\nPROFESSIONAL EXPERTISE\nOperations Lead specializing in hub operations, distribution efficiency, and fleet cost control.\n\nWORK HISTORY\nOperations & Logistics Lead - PT Global Express Cargo\n* Lead operations of warehouse and freight distribution.\n* Reduced fuel expenses by 15% via dynamic rerouting.\n* Supervised 18 logistics staff members.`,
    gapAnalysis: 'Sistem Shopee Express berskala sangat besar, kandidat perlu beradaptasi dengan sistem otomatisasi berskala masif.',
    optimizationDetails: 'Fokus pada "Hub Operations", "Fleet Rerouting", dan "Staff Scheduling" pada resume yang dioptimasi.',
    notes: 'Wawancara pertama tanggal 9 Juli berjalan lancar. Menunggu kabar kelanjutan untuk panel interview berikutnya.',
    jobDescription: 'Shopee Express is looking for a Hub Logistics Operations Supervisor to oversee daily shift distribution, routing, and logistics personnel within the Tangerang regional hub.'
  },
  {
    id: 'app-4',
    projectId: 'proj-operational',
    company: 'Lalamove Indonesia',
    title: 'Fleet Operations Executive',
    jobCategory: 'Operations / Logistics',
    locationType: 'hybrid',
    workType: 'full-time',
    country: 'Indonesia',
    timezone: 'GMT+7',
    status: 'applied',
    dateCreated: '2026-06-10',
    dateApplied: '2026-06-11',
    interviewDates: [],
    atsScore: 75,
    suitabilityScale: 8,
    suitabilityExplanation: 'Pengalaman kandidat dalam merancang rute pengiriman regional dan mengelola armada kurir di PT Global Express Cargo adalah modal emas untuk melamar di Lalamove.',
    optimizedResume: 'Lalamove Fleet Resume Optimized...',
    gapAnalysis: 'Tidak ada celah krusial.',
    optimizationDetails: 'Kata kunci "Fleet Management" dan "SOP Logistik Kurir" ditambahkan.',
    notes: 'Sudah >30 hari tanpa kabar sejak dikirim. Status otomatis akan menunjukkan peringatan.',
    jobDescription: 'Lalamove is seeking a Fleet Operations Executive to coordinate driver registration, route schedules, and logistic standards to improve customer deliveries.'
  },
  {
    id: 'app-5',
    projectId: 'proj-socmed',
    company: 'Sociolla (PT Social Bella)',
    title: 'Brand Social Media Specialist',
    jobCategory: 'Marketing / Creative',
    locationType: 'hybrid',
    workType: 'full-time',
    country: 'Indonesia',
    timezone: 'GMT+7',
    status: 'applied',
    dateCreated: '2026-07-11',
    dateApplied: '2026-07-12',
    interviewDates: [],
    atsScore: 88,
    suitabilityScale: 9,
    suitabilityExplanation: 'Sangat relevan karena kandidat saat ini memegang peran Social Media Specialist di perusahaan kosmetik (PT Kosmetik Cantik Digital). Portofolio kecantikan dan jaringan KOL yang dimiliki kandidat akan langsung terpakai di Sociolla.',
    optimizedResume: 'Sociolla Brand Specialist Resume...',
    gapAnalysis: 'Minim gap, kecocokan industri kosmetik sangat tinggi.',
    optimizationDetails: 'Injeksi nama tren-tren kecantikan, taktik interaksi TikTok, dan data peningkatan engagement rate kosmetik.',
    notes: 'Baru mendaftar kemarin menggunakan resume hasil optimasi.',
    jobDescription: 'Sociolla is looking for a Brand Social Media Specialist to handle daily Instagram and TikTok storytelling, editorial calendars, and brand promotion for cosmetic lines.'
  },
  {
    id: 'app-6',
    projectId: 'proj-socmed',
    company: 'Tokopedia',
    title: 'Campaign & Social Media Coordinator',
    jobCategory: 'Marketing / Creative',
    locationType: 'hybrid',
    workType: 'full-time',
    country: 'Indonesia',
    timezone: 'GMT+7',
    status: 'rejected',
    dateCreated: '2026-06-15',
    dateApplied: '2026-06-16',
    interviewDates: [],
    atsScore: 72,
    suitabilityScale: 6,
    suitabilityExplanation: 'Sebab penolakan mungkin karena kandidat kurang memiliki pengalaman dalam mega-campaign ecommerce (seperti 11.11 atau Waktu Indonesia Belanja) yang memerlukan koordinasi budget besar.',
    optimizedResume: 'Tokopedia Campaign Resume...',
    gapAnalysis: 'Kurang pengalaman dalam marketing ecommerce skala multi-miliar rupiah.',
    optimizationDetails: 'Mencoba menonjolkan kemampuan analisis data bulanan TikTok.',
    notes: 'Menerima email penolakan otomatis tanggal 30 Juni.',
    jobDescription: 'Tokopedia is seeking a Campaign & Social Media Coordinator to design interactive campaigns, drive user acquisition, and execute online influencer activations.'
  }
];
