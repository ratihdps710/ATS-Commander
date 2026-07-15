import React, { useState } from 'react';
import { Project, JobApplication, OptimizationResponse } from '../types';
import { 
  Sparkles, Clipboard, Check, RefreshCw, AlertCircle, HelpCircle, 
  ArrowRight, FileText, BarChart3, ShieldAlert, BadgeInfo, CheckCircle2,
  BookmarkPlus, Link2, MapPin, Globe, Compass, Clock, Download, Printer
} from 'lucide-react';

interface ResumeOptimizerProps {
  activeProject: Project | undefined;
  onSaveApplication: (application: Omit<JobApplication, 'id' | 'dateCreated'>) => void;
}

const LOADING_STEPS = [
  "Menganalisis deskripsi pekerjaan target...",
  "Mengidentifikasi kata kunci ATS (hard & soft skills) krusial...",
  "Mengevaluasi keselarasan riwayat pengalaman dari resume dasar...",
  "Mentransfer kualifikasi secara jujur dengan kata kerja aktif...",
  "Menyusun kalimat profesional berstandar screening ATS modern...",
  "Menyusun formulasi penyesuaian tata bahasa...",
  "Memformulasikan penjelasan kesenjangan (gap analysis) jujur..."
];

export default function ResumeOptimizer({ activeProject, onSaveApplication }: ResumeOptimizerProps) {
  // Input states
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobCategory, setJobCategory] = useState('Sales / Business Development');
  const [locationType, setLocationType] = useState<'remote' | 'hybrid' | 'on site'>('hybrid');
  const [workType, setWorkType] = useState<'full-time' | 'part-time' | 'internship' | 'freelance'>('full-time');
  const [country, setCountry] = useState('Indonesia');
  const [timezone, setTimezone] = useState('GMT+7');

  // Tracker state
  const [saveStatus, setSaveStatus] = useState<'applied' | 'not_applied'>('not_applied');

  // UI States
  const [resumeLanguage, setResumeLanguage] = useState<'id' | 'en'>('id');
  const [resumeViewMode, setResumeViewMode] = useState<'plain' | 'a4'>('a4');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSavedToTracker, setIsSavedToTracker] = useState(false);

  const startLoadingAnimation = () => {
    setLoadingStepIdx(0);
    const interval = setInterval(() => {
      setLoadingStepIdx(prev => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);
    return interval;
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    if (!company.trim() || !title.trim() || !jobDescription.trim()) {
      setError("Silakan lengkapi Nama Perusahaan, Posisi Pekerjaan, dan Deskripsi Pekerjaan.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsSavedToTracker(false);

    const animationInterval = startLoadingAnimation();

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseResume: activeProject.baseResume,
          jobDescription: jobDescription,
          roleName: activeProject.name,
          language: resumeLanguage
        })
      });

      const data = await response.json();
      clearInterval(animationInterval);

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi server kecerdasan buatan.");
      }

      setResult(data);
    } catch (err: any) {
      clearInterval(animationInterval);
      setError(err.message || "Terjadi kesalahan koneksi sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToTracker = () => {
    if (!result || !activeProject) return;
    
    // Auto save the result to application state
    onSaveApplication({
      projectId: activeProject.id,
      company: company,
      title: title,
      jobDescription: jobDescription,
      jobUrl: jobUrl || undefined,
      platform: platform || undefined,
      jobCategory: jobCategory,
      locationType: locationType,
      workType: workType,
      country: country,
      timezone: timezone,
      status: saveStatus,
      dateApplied: saveStatus === 'applied' ? new Date().toISOString().split('T')[0] : '',
      interviewDates: [],
      atsScore: result.atsScore,
      suitabilityScale: result.suitabilityScale,
      suitabilityExplanation: result.suitabilityExplanation,
      optimizedResume: result.optimizedResume,
      gapAnalysis: result.gapAnalysis,
      optimizationDetails: result.optimizationDetails,
      notes: saveStatus === 'applied'
        ? `Secara otomatis disimpan sebagai Applied (Sudah Melamar) setelah dioptimalkan menggunakan AI untuk bidang ${activeProject.name}.`
        : `Secara otomatis disimpan sebagai Draft (Belum Melamar) setelah dioptimalkan menggunakan AI untuk bidang ${activeProject.name}.`
    });

    setIsSavedToTracker(true);
  };

  const downloadAsWord = () => {
    if (!result?.optimizedResume) return;
    const content = result.optimizedResume;
    const lines = content.split('\n');
    const firstHeaderIdx = lines.findIndex(l => l.startsWith('## '));
    
    const wordContent = lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return `<h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;">${line.substring(2)}</h1>`;
      } else if (firstHeaderIdx !== -1 && idx < firstHeaderIdx) {
        if (line.trim() === '') return '';
        const isSecondLine = idx === 1 || (idx > 0 && lines[idx - 1].startsWith('# '));
        if (isSecondLine) {
          return `<div style="text-align: center; font-size: 11pt; font-weight: bold; color: #333333; margin-bottom: 2px;">${line}</div>`;
        }
        return `<div style="text-align: center; font-size: 9.5pt; color: #555555; margin-bottom: 2px;">${line}</div>`;
      } else if (line.startsWith('## ')) {
        return `<h2 style="font-size: 11pt; border-bottom: 2px solid #111111; margin-top: 14px; margin-bottom: 6px; padding-bottom: 2px; font-weight: bold; text-transform: uppercase; text-align: left;">${line.substring(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        const h3Content = line.substring(4);
        if (h3Content.includes('|')) {
          const parts = h3Content.split('|');
          return `
            <table border="0" cellspacing="0" cellpadding="0" style="width:100%; margin-top:6px; margin-bottom:2px;">
              <tr>
                <td align="left" style="font-weight:bold; font-size:10pt; color:#111111; font-family: Arial, sans-serif;">${parts[0].trim()}</td>
                <td align="right" style="font-size:9pt; color:#666666; font-style:italic; font-family: Arial, sans-serif;">${parts[1].trim()}</td>
              </tr>
            </table>
          `;
        }
        return `<h3 style="font-size: 10pt; margin-top: 8px; margin-bottom: 2px; font-weight: bold;">${h3Content}</h3>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        let itemText = line.substring(2);
        const parts = itemText.split('**');
        itemText = parts.map((part, index) => index % 2 === 1 ? `<b>${part}</b>` : part).join('');
        return `<li style="margin-bottom: 2.5px; font-size: 9.5pt; text-align: justify;">${itemText}</li>`;
      } else if (line.trim() === '') {
        return '';
      } else {
        let itemText = line;
        if (itemText.includes('|')) {
          const parts = itemText.split('|');
          return `
            <table border="0" cellspacing="0" cellpadding="0" style="width:100%; margin-bottom:4px;">
              <tr>
                <td align="left" style="font-size:9.5pt; color:#444444; font-family: Arial, sans-serif;">${parts[0].trim()}</td>
                <td align="right" style="font-size:9.5pt; color:#444444; font-family: Arial, sans-serif;">${parts[1].trim()}</td>
              </tr>
            </table>
          `;
        }
        const parts = itemText.split('**');
        itemText = parts.map((part, index) => index % 2 === 1 ? `<b>${part}</b>` : part).join('');
        return `<p style="margin: 0 0 4px 0; font-size: 9.5pt; text-align: justify;">${itemText}</p>`;
      }
    }).filter(html => html !== '').join('\n');
    
    const formattedHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Resume Tailored - ${company || "ATS"}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.35; font-size: 10pt; color: #333333; margin: 1in; }
          h1, h2, h3, p, div, li { font-family: 'Arial', sans-serif; }
          p { margin: 0 0 4px 0; font-size: 9.5pt; text-align: justify; }
          ul { margin: 0 0 6px 18px; }
          li { margin-bottom: 2px; font-size: 9.5pt; }
        </style>
      </head>
      <body>
        <div style="width: 100%;">
          ${wordContent}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff' + formattedHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_Tailored_${(company || 'ATS').replace(/\s+/g, '_')}_${(title || 'Job').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    if (!result?.optimizedResume) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;
    
    const content = result.optimizedResume;
    const lines = content.split('\n');
    const firstHeaderIdx = lines.findIndex(l => l.startsWith('## '));
    
    const htmlLines = lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return `<h1 style="font-size: 20px; text-align: center; margin-top: 0; margin-bottom: 4px; font-weight: bold; color: #111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">${line.substring(2)}</h1>`;
      } else if (firstHeaderIdx !== -1 && idx < firstHeaderIdx) {
        if (line.trim() === '') return '';
        const isSecondLine = idx === 1 || (idx > 0 && lines[idx - 1].startsWith('# '));
        if (isSecondLine) {
          return `<div style="font-size: 11px; text-align: center; font-weight: bold; color: #111; margin-bottom: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${line}</div>`;
        }
        return `<div style="font-size: 9.5px; text-align: center; color: #555; margin-bottom: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${line}</div>`;
      } else if (line.startsWith('## ')) {
        return `<h2 style="font-size: 11px; border-bottom: 1.5px solid #111; margin-top: 16px; margin-bottom: 6px; font-weight: bold; padding-bottom: 2px; text-transform: uppercase; color: #111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: left;">${line.substring(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        const h3Content = line.substring(4);
        if (h3Content.includes('|')) {
          const parts = h3Content.split('|');
          return `
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; margin-bottom: 2px;">
              <span style="font-size: 10px; font-weight: bold; color: #111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${parts[0].trim()}</span>
              <span style="font-size: 9px; font-weight: bold; color: #555; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-style: italic;">${parts[1].trim()}</span>
            </div>
          `;
        }
        return `<h3 style="font-size: 10px; margin-top: 10px; margin-bottom: 2px; font-weight: bold; color: #111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${h3Content}</h3>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        let itemText = line.substring(2);
        const parts = itemText.split('**');
        itemText = parts.map((part, index) => index % 2 === 1 ? `<strong style="font-weight: bold; color: #111;">${part}</strong>` : part).join('');
        return `<li style="margin-bottom: 3.5px; line-height: 1.35; font-size: 9.5px; color: #333; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: justify; list-style-type: disc; margin-left: 15px;">${itemText}</li>`;
      } else if (line.trim() === '') {
        return '';
      } else {
        let itemText = line;
        if (itemText.includes('|')) {
          const parts = itemText.split('|');
          return `
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 2px; margin-bottom: 4px;">
              <span style="font-size: 9.5px; color: #444; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 500;">${parts[0].trim()}</span>
              <span style="font-size: 9.5px; color: #444; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 500;">${parts[1].trim()}</span>
            </div>
          `;
        }
        const parts = itemText.split('**');
        itemText = parts.map((part, index) => index % 2 === 1 ? `<strong style="font-weight: bold; color: #111;">${part}</strong>` : part).join('');
        return `<p style="margin: 0 0 5px 0; font-size: 9.5px; line-height: 1.4; text-align: justify; color: #333; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${itemText}</p>`;
      }
    }).filter(html => html !== '').join('\n');
    
    doc.write(`
      <html>
      <head>
        <title>Resume_Tailored_${company || 'ATS'}_${title || 'Job'}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #2D3748;
            margin: 0;
            padding: 0;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          ul {
            margin: 0 0 8px 0;
            padding-left: 15px;
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 5px;">
          ${htmlLines}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.parent.document.body.removeChild(window.frameElement);
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    doc.close();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-teal-700 bg-teal-50 border-teal-200";
    if (score >= 70) return "text-teal-700 bg-teal-50 border-teal-200"; // above 70% optimized is success
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  return (
    <div id="resume-optimizer-view" className="space-y-6">
      {!activeProject ? (
        <div className="bg-amber-50 border border-amber-200 text-stone-750 p-5 rounded-2xl shadow-sm flex gap-3 relative overflow-hidden">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 font-display">Perhatian:</span> Anda harus membuat atau memilih target bidang pekerjaan (project) terlebih dahulu di tab <strong className="text-teal-700">"Manajemen Bidang"</strong> sebelum dapat melakukan optimasi resume.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Form Inputs */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/60 bento-shadow space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-150">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 font-display">AI Resume Optimizer</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Bidang Kerja: <strong className="text-teal-700 font-mono">{activeProject.name}</strong></p>
                </div>
              </div>

              <form onSubmit={handleOptimize} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Nama Perusahaan</label>
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="Contoh: GoTo, Shopee"
                      className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm placeholder-stone-400 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Posisi Pekerjaan</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Contoh: Senior B2B Sales"
                      className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm placeholder-stone-400 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Kategori Pekerjaan</label>
                    <select
                      value={jobCategory}
                      onChange={e => setJobCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-650"
                    >
                      <option value="Sales / Business Development">Sales / Business Development</option>
                      <option value="Operations / Logistics">Operations / Logistics</option>
                      <option value="Marketing / Creative">Marketing / Creative</option>
                      <option value="Engineering / Technology">Engineering / Technology</option>
                      <option value="Finance / Accounting">Finance / Accounting</option>
                      <option value="Human Resources / Admin">Human Resources / Admin</option>
                      <option value="Lainnya">Kategori Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Tipe Lokasi</label>
                    <div className="grid grid-cols-3 gap-1 bg-stone-100 border border-stone-200/60 p-1 rounded-xl">
                      {(['remote', 'hybrid', 'on site'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setLocationType(type)}
                          className={`py-1 text-center text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                            locationType === type 
                              ? 'bg-teal-600 text-white shadow-sm' 
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Tipe Kontrak</label>
                    <select
                      value={workType}
                      onChange={e => setWorkType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-650 cursor-pointer"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="internship">Internship / Magang</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Platform Melamar *</label>
                    <input
                      type="text"
                      value={platform}
                      onChange={e => setPlatform(e.target.value)}
                      placeholder="LinkedIn, Jobstreet, Indeed, dll."
                      className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm placeholder-stone-400 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Link Lowongan (Opsional)</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={e => setJobUrl(e.target.value)}
                    placeholder="https://example.com/job-post"
                    className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm placeholder-stone-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Negara Penempatan</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Contoh: Indonesia"
                      className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm placeholder-stone-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1">Zona Waktu Kerja</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      placeholder="Contoh: GMT+7 atau WIB"
                      className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm placeholder-stone-400 font-medium"
                    />
                  </div>
                </div>

                {/* Pilihan Bahasa Target Hasil Resume */}
                <div className="bg-stone-50 border border-stone-250 p-4 rounded-xl space-y-2.5">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
                    Bahasa Target Hasil Resume (Resume Language)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResumeLanguage('id')}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        resumeLanguage === 'id'
                          ? 'bg-teal-600 text-white shadow-sm font-extrabold'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 shadow-xs'
                      }`}
                    >
                      🇮🇩 Bahasa Indonesia
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeLanguage('en')}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        resumeLanguage === 'en'
                          ? 'bg-teal-600 text-white shadow-sm font-extrabold'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800 shadow-xs'
                      }`}
                    >
                      🇬🇧 English (Bhs Inggris)
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 font-mono">
                    Sistem akan secara otomatis menerjemahkan dan mengoptimalkan isi resume dasar Anda ke bahasa yang dipilih.
                  </p>
                </div>

                <div>
                  <textarea
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    rows={10}
                    placeholder="Tempel persyaratan kerja, tanggung jawab harian, dan kualifikasi dari situs lowongan di sini..."
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm leading-relaxed placeholder-stone-400"
                    required
                  />
                  <p className="text-[10px] text-stone-400 font-mono mt-1">
                    SARAN: Berikan informasi kualifikasi selengkap mungkin agar mesin ATS Gemini dapat memetakan kata kunci yang sesuai secara akurat.
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-550/10 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 animate-bounce" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isLoading 
                      ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      MEMPROSES OPTIMASI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      OPTIMALKAN RESUME DENGAN AI
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI Output Analysis & Resume */}
          <div className="xl:col-span-7">
            {isLoading ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 bento-shadow flex flex-col items-center justify-center min-h-[500px] text-center space-y-6 relative overflow-hidden">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
                  <Sparkles className="w-10 h-10 text-teal-650 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-3 max-w-md relative z-10">
                  <h4 className="font-extrabold text-stone-900 text-base tracking-wider uppercase font-mono">Gemini AI sedang Bekerja</h4>
                  <p className="text-teal-700 font-extrabold text-sm tracking-wide">
                    {LOADING_STEPS[loadingStepIdx]}
                  </p>
                  <p className="text-stone-400 text-xs leading-relaxed font-medium mt-3">
                    Proses ini biasanya memakan waktu 10-15 detik karena kami menyusun analisis kualifikasi yang mendalam dan memetakan kata kunci ATS yang kompleks.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Score Summary Banner */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/60 bento-shadow relative overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* ATS Score circle gauge */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-r border-stone-150">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32">
                          <circle className="text-stone-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="52" cx="64" cy="64" />
                          <circle className="text-teal-600 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - result.atsScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="52" cx="64" cy="64" transform="rotate(-90 64 64)" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-3xl font-black text-stone-900 font-mono">{result.atsScore}%</span>
                          <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-widest font-mono mt-0.5">ATS Score</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          result.atsScore >= 70 
                            ? 'bg-teal-50 text-teal-700 border-teal-200' 
                            : 'bg-amber-50 text-amber-750 border-amber-200'
                        }`}>
                          {result.atsScore >= 70 ? "🎯 Lolos Screening ATS" : "⚠️ Perlu Ditinjau Lagi"}
                        </span>
                      </div>
                    </div>

                    {/* Suitability & Fit scale */}
                    <div className="md:col-span-8 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Tingkat Kesesuaian Latar Belakang</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-700 font-mono">Skala {result.suitabilityScale}/10</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                            result.suitabilityScale >= 8 
                              ? 'bg-teal-50 border-teal-200 text-teal-700' 
                              : result.suitabilityScale >= 6 
                              ? 'bg-amber-50 border-amber-200 text-amber-700' 
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {result.suitabilityScale >= 8 ? "Sangat Cocok" : result.suitabilityScale >= 6 ? "Sedang" : "Kurang Relevan"}
                          </span>
                        </div>
                      </div>

                      {/* Suitability range dots */}
                      <div className="flex gap-1.5 h-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-sm ${
                              i < result.suitabilityScale 
                                ? result.suitabilityScale >= 8 ? 'bg-teal-600' : 'bg-amber-500' 
                                : 'bg-stone-100'
                            }`} 
                          />
                        ))}
                      </div>

                      <p className="text-stone-600 text-xs leading-relaxed italic bg-stone-50 p-3.5 rounded-xl border border-stone-150 font-medium">
                        "{result.suitabilityExplanation}"
                      </p>
                    </div>
                  </div>

                  {/* Save to application tracker CTA */}
                  <div className="mt-6 pt-4 border-t border-stone-150 space-y-4">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 text-left">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Pengaturan Penyimpanan Pelacak</span>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                          {/* Platform display/input reminder */}
                          <div className="text-xs text-stone-600">
                            Platform: <strong className="text-stone-850 font-bold">{platform || '-'}</strong>
                          </div>
                          
                          {/* Status option */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500 font-semibold">Status Simpan:</span>
                            <div className="inline-flex bg-stone-200/60 p-0.5 rounded-lg border border-stone-200">
                              <button
                                type="button"
                                disabled={isSavedToTracker}
                                onClick={() => setSaveStatus('not_applied')}
                                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                                  saveStatus === 'not_applied'
                                    ? 'bg-white text-stone-850 shadow-xs font-black'
                                    : 'text-stone-500 hover:text-stone-850'
                                }`}
                              >
                                📝 Belum Melamar (Draft)
                              </button>
                              <button
                                type="button"
                                disabled={isSavedToTracker}
                                onClick={() => setSaveStatus('applied')}
                                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                                  saveStatus === 'applied'
                                    ? 'bg-white text-teal-700 shadow-xs font-black'
                                    : 'text-stone-500 hover:text-stone-850'
                                }`}
                              >
                                🚀 Applied (Telah Dikirim)
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <button
                          onClick={handleSaveToTracker}
                          disabled={isSavedToTracker}
                          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                            isSavedToTracker
                              ? 'bg-teal-50 border-teal-200 text-teal-700 cursor-default font-black'
                              : 'bg-teal-600 hover:bg-teal-700 text-white border-transparent'
                          }`}
                        >
                          {isSavedToTracker ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                              Tersimpan di Tracker
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              Simpan ke Pelacak (Tracker)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords Tagging cloud */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow">
                  <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-600" />
                    Kata Kunci ATS yang Berhasil Diintegrasikan
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedKeywords.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-stone-50 border border-stone-150 text-stone-600 rounded-lg text-[10px] font-mono font-medium transition-colors">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gap & Optimization details bento cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gap Analysis */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow space-y-2 relative overflow-hidden">
                    <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-650" />
                      Analisis Celah (Gap Analysis)
                    </h4>
                    <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-line font-medium font-mono">
                      {result.gapAnalysis}
                    </p>
                  </div>

                  {/* Optimization Details */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow space-y-2 relative overflow-hidden">
                    <h4 className="text-[10px] font-bold text-teal-750 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <BadgeInfo className="w-4 h-4 text-teal-600" />
                      Catatan Perubahan (Optimasi AI)
                    </h4>
                    <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-line font-medium">
                      {result.optimizationDetails}
                    </p>
                  </div>
                </div>

                {/* Optimized Resume Textbox with A4 PDF Page Preview */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/60 bento-shadow space-y-4 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-150">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm font-display">Resume Hasil Optimasi AI</h4>
                        <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Format Standar ATS Profesional</p>
                      </div>
                    </div>

                    {/* Tabs switcher: Plain Text vs A4 PDF layout */}
                    <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200/60 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setResumeViewMode('a4')}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          resumeViewMode === 'a4'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        📄 Desain Lembar A4 (PDF)
                      </button>
                      <button
                        type="button"
                        onClick={() => setResumeViewMode('plain')}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          resumeViewMode === 'plain'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        📝 Teks Bersih ATS
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar: Downloads & Copy */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-150">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Download Word */}
                      <button
                        onClick={downloadAsWord}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sky-800 bg-sky-50 border border-sky-200/60 hover:bg-sky-100/80 font-extrabold rounded-lg text-xs transition-all cursor-pointer"
                        title="Download file sebagai format document Word (.doc)"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-700" />
                        Download Word (.doc)
                      </button>

                      {/* Download PDF / Print */}
                      <button
                        onClick={downloadAsPDF}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-rose-800 bg-rose-50 border border-rose-200/60 hover:bg-rose-100/80 font-extrabold rounded-lg text-xs transition-all cursor-pointer"
                        title="Unduh / Cetak resume sebagai file PDF A4 berkualitas tinggi"
                      >
                        <Printer className="w-3.5 h-3.5 text-rose-650" />
                        Download / Cetak PDF
                      </button>
                    </div>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold font-mono uppercase tracking-wider border border-stone-200 hover:bg-stone-100 text-stone-600 rounded-lg bg-white transition-all cursor-pointer shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3px]" />
                          <span className="text-teal-600 font-extrabold">Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3.5 h-3.5" />
                          Salin Teks
                        </>
                      )}
                    </button>
                  </div>

                  {resumeViewMode === 'a4' ? (
                    /* Elegant A4 Simulation Card Wrapper */
                    <div className="bg-stone-200/55 p-3 sm:p-6 rounded-xl border border-stone-200/80 max-h-[700px] overflow-y-auto flex justify-center shadow-inner">
                      <div 
                        id="a4-resume-page" 
                        className="w-full max-w-[660px] min-h-[930px] bg-white border border-stone-300 shadow-xl p-8 sm:p-12 text-stone-850 text-left font-sans text-sm relative overflow-y-auto"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {/* A4 Badge Watermark indicator */}
                        <div className="absolute top-2.5 right-2.5 text-[8px] text-stone-400 font-bold uppercase tracking-widest font-mono select-none">
                          PRINTER-READY A4
                        </div>

                        {/* Formatting CV Text into real CV markup elements */}
                        <div className="space-y-3 font-sans text-xs">
                          {(() => {
                            const rLines = result.optimizedResume.split('\n');
                            const firstH2Idx = rLines.findIndex(l => l.startsWith('## '));
                            
                            const renderInlineFormatting = (text: string) => {
                              if (!text.includes('**')) return text;
                              const parts = text.split('**');
                              return parts.map((part, index) => {
                                if (index % 2 === 1) {
                                  return <strong key={index} className="font-extrabold text-stone-900">{part}</strong>;
                                }
                                return part;
                              });
                            };

                            return rLines.map((line, idx) => {
                              if (line.startsWith('# ')) {
                                return (
                                  <h1 key={idx} className="text-xl font-bold text-center text-stone-900 tracking-wide uppercase mb-1 font-display">
                                    {line.substring(2)}
                                  </h1>
                                );
                              } else if (firstH2Idx !== -1 && idx < firstH2Idx) {
                                if (line.trim() === '') return null;
                                const isSecondLine = idx === 1 || (idx > 0 && rLines[idx - 1].startsWith('# '));
                                if (isSecondLine) {
                                  return (
                                    <div key={idx} className="text-center font-bold text-stone-850 text-xs sm:text-[13px] tracking-wide mb-1">
                                      {line}
                                    </div>
                                  );
                                }
                                return (
                                  <div key={idx} className="text-center text-[10px] sm:text-[11px] text-stone-500 mb-1 leading-relaxed">
                                    {line}
                                  </div>
                                );
                              } else if (line.startsWith('## ')) {
                                return (
                                  <h2 key={idx} className="text-xs sm:text-[13px] font-bold text-stone-900 tracking-wider uppercase border-b-2 border-stone-800 pb-0.5 mt-5 mb-2.5 font-display text-left">
                                    {line.substring(3)}
                                  </h2>
                                );
                              } else if (line.startsWith('### ')) {
                                const h3Content = line.substring(4);
                                if (h3Content.includes('|')) {
                                  const parts = h3Content.split('|');
                                  return (
                                    <div key={idx} className="flex justify-between items-baseline mt-3.5 mb-1">
                                      <span className="font-bold text-xs text-stone-900">{parts[0].trim()}</span>
                                      <span className="text-[10px] text-stone-500 font-bold italic">{parts[1].trim()}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <h3 key={idx} className="text-xs font-bold text-stone-900 mt-3.5 mb-1">
                                    {h3Content}
                                  </h3>
                                );
                              } else if (line.startsWith('- ') || line.startsWith('* ')) {
                                return (
                                  <li key={idx} className="text-[11px] text-stone-700 ml-4 list-disc pl-1 leading-relaxed mb-1 text-justify">
                                    {renderInlineFormatting(line.substring(2))}
                                  </li>
                                );
                              } else if (line.trim() === '') {
                                return null;
                              } else {
                                let itemText = line;
                                if (itemText.includes('|')) {
                                  const parts = itemText.split('|');
                                  return (
                                    <div key={idx} className="flex justify-between items-baseline text-[11px] text-stone-600 mt-0.5 mb-1.5 font-medium">
                                      <span>{parts[0].trim()}</span>
                                      <span>{parts[1].trim()}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <p key={idx} className="text-[11px] text-stone-700 leading-relaxed text-justify mb-1">
                                    {renderInlineFormatting(itemText)}
                                  </p>
                                );
                              }
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Plain Text View area */
                    <div className="relative">
                      <textarea
                        readOnly
                        value={result.optimizedResume}
                        rows={18}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-650 font-mono leading-relaxed resize-none focus:outline-none"
                      />
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-white border border-stone-200 rounded text-[9px] text-stone-500 font-bold uppercase tracking-widest font-mono select-none shadow-sm">
                        FORMAT ATS FRIENDLY
                      </div>
                    </div>
                  )}

                  <div className="text-center text-[10px] text-stone-500 bg-stone-50 p-3.5 rounded-xl border border-dashed border-stone-200 mt-2 font-mono">
                    Format {resumeViewMode === 'a4' ? 'A4 PDF di atas diproyeksikan menyerupai kertas cetak standar' : 'teks bersih di atas disusun polos tanpa kolom ganda'} agar 100% kompatibel dengan sistem parser bot ATS (Workday, Taleo, Greenhouse).
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 bento-shadow p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[500px] text-stone-500 relative overflow-hidden">
                <div className="p-4 bg-stone-50 rounded-full border border-stone-150 mb-4">
                  <Sparkles className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-bold text-stone-900 text-base font-display">Hasil Optimasi AI Akan Tampil di Sini</h4>
                <p className="text-stone-400 text-xs max-w-sm mt-1 leading-relaxed">
                  Masukkan detail target pekerjaan di form sebelah kiri dan tekan tombol "Optimalkan Resume dengan AI" untuk memulai.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
