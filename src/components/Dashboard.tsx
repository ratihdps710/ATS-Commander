import React, { useState } from 'react';
import { Project, JobApplication, ApplicationStatus, LocationType, WorkType } from '../types';
import { getAutomatedStatus } from '../utils/helpers';
import { 
  Search, SlidersHorizontal, Plus, Calendar, ExternalLink, Info, Trash2, 
  MapPin, CheckCircle, Clock, AlertTriangle, ArrowRight, X, Eye, Edit2, 
  Tag, Flag, HelpCircle, FileCheck, Globe, Download, Printer, FileText,
  Clipboard, Check, ShieldAlert
} from 'lucide-react';

const renderFormattedList = (text: string, type: 'rose' | 'teal') => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  return (
    <div className="space-y-3 mt-2 text-left w-full font-sans">
      {lines.map((line, idx) => {
        // Check for numbered point like: "1. **Title**: Description" or "1. **Title** Description"
        const numberedRegex = /^(\d+)\.\s*\*\*(.*?)\*\*[:\s]*(.*)$/;
        const match = line.match(numberedRegex);
        
        if (match) {
          const [_, num, title, description] = match;
          return (
            <div key={idx} className="flex gap-3 p-3.5 rounded-xl border border-stone-150/80 bg-stone-50/50 hover:bg-stone-50 transition-all w-full">
              <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                type === 'rose' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                  : 'bg-teal-50 text-teal-700 border border-teal-100'
              }`}>
                {num}
              </span>
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="font-extrabold text-stone-900 text-xs sm:text-[13px] block">
                  {title}
                </span>
                <p className="text-stone-650 text-xs leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          );
        }
        
        // Bullet list option: "- **Title**: Description"
        const bulletRegex = /^[-*]\s*\*\*(.*?)\*\*[:\s]*(.*)$/;
        const bulletMatch = line.match(bulletRegex);
        if (bulletMatch) {
          const [_, title, description] = bulletMatch;
          return (
            <div key={idx} className="flex gap-2.5 items-start pl-1">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${type === 'rose' ? 'bg-rose-500' : 'bg-teal-500'}`} />
              <div className="text-xs">
                <strong className="font-extrabold text-stone-900">{title}</strong>: {description}
              </div>
            </div>
          );
        }

        // Plain formatting fallback with bold word conversion
        const parts = line.split('**');
        return (
          <p key={idx} className="text-stone-650 text-xs leading-relaxed pl-1 text-left">
            {parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="font-extrabold text-stone-900">{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
};

interface DashboardProps {
  projects: Project[];
  selectedProjectId: string; // can be 'all' or specific
  applications: JobApplication[];
  onAddApplication: (app: JobApplication) => void;
  onUpdateApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
}

export default function Dashboard({
  projects,
  selectedProjectId,
  applications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
}: DashboardProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [workFilter, setWorkFilter] = useState<string>('all');

  // Modal / Add manual entry states
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<JobApplication | null>(null);

  // Form states for manual adding
  const [manualProjId, setManualProjId] = useState(projects[0]?.id || '');
  const [manualCompany, setManualCompany] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState('');
  const [manualStatus, setManualStatus] = useState<ApplicationStatus>('not_applied');
  const [manualCategory, setManualCategory] = useState('Sales / Business Development');
  const [manualLoc, setManualLoc] = useState<LocationType>('hybrid');
  const [manualWork, setManualWork] = useState<WorkType>('full-time');
  const [manualCountry, setManualCountry] = useState('Indonesia');
  const [manualTz, setManualTz] = useState('GMT+7');
  const [manualUrl, setManualUrl] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Filtering calculations
  const filteredApps = applications.filter(app => {
    // Project filter
    if (selectedProjectId !== 'all' && app.projectId !== selectedProjectId) {
      return false;
    }
    // Search filter
    const matchesSearch = 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;

    // Location type filter
    if (locationFilter !== 'all' && app.locationType !== locationFilter) return false;

    // Work type filter
    if (workFilter !== 'all' && app.workType !== workFilter) return false;

    return true;
  });

  // KPI Statistics relative to filtered/active context
  const contextApps = selectedProjectId === 'all' 
    ? applications 
    : applications.filter(app => app.projectId === selectedProjectId);

  const totalApplied = contextApps.length;
  const totalInterviews = contextApps.filter(app => app.status === 'interview').length;
  const totalRejections = contextApps.filter(app => app.status === 'rejected').length;
  
  // Calculate average ATS Score of tailored resumes
  const ratedApps = contextApps.filter(app => app.atsScore !== undefined);
  const averageAts = ratedApps.length > 0 
    ? Math.round(ratedApps.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / ratedApps.length)
    : 0;

  // Stale warning count
  const staleCount = contextApps.filter(app => {
    const automated = getAutomatedStatus(app.dateApplied, app.status);
    return automated.text.includes('Tanpa Kabar');
  }).length;

  // Submit manual app
  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCompany || !manualTitle) return;

    const todayDate = new Date().toISOString().split('T')[0];

    const newApp: JobApplication = {
      id: `app-manual-${Date.now()}`,
      projectId: selectedProjectId === 'all' ? manualProjId : selectedProjectId,
      company: manualCompany,
      title: manualTitle,
      platform: manualPlatform || undefined,
      jobCategory: manualCategory,
      locationType: manualLoc,
      workType: manualWork,
      country: manualCountry,
      timezone: manualTz,
      status: manualStatus,
      dateCreated: todayDate,
      dateApplied: manualStatus === 'applied' ? todayDate : '',
      interviewDates: [],
      notes: manualNotes,
      jobDescription: manualDesc,
      jobUrl: manualUrl || undefined,
    };

    onAddApplication(newApp);
    setIsAddingManual(false);

    // Reset fields
    setManualCompany('');
    setManualTitle('');
    setManualPlatform('');
    setManualStatus('not_applied');
    setManualUrl('');
    setManualDesc('');
    setManualNotes('');
  };

  // Update application from detail view (e.g. changing status, notes, interview dates)
  const handleUpdateStatusAndNotes = (status: ApplicationStatus, notes: string, interviewDates: string[], updatedFields?: Partial<JobApplication>) => {
    if (!selectedAppForDetails) return;
    
    let dateApplied = selectedAppForDetails.dateApplied || '';
    if (status === 'applied' && !dateApplied) {
      dateApplied = new Date().toISOString().split('T')[0];
    } else if (status === 'not_applied') {
      dateApplied = '';
    }

    const updated = {
      ...selectedAppForDetails,
      status,
      notes,
      interviewDates,
      dateApplied,
      ...updatedFields
    };
    onUpdateApplication(updated);
    setSelectedAppForDetails(updated); // Update drawer state
  };

  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [drawerResumeViewMode, setDrawerResumeViewMode] = useState<'plain' | 'a4'>('a4');
  const [drawerCopied, setDrawerCopied] = useState(false);

  const downloadDrawerWord = () => {
    if (!selectedAppForDetails?.optimizedResume) return;
    const content = selectedAppForDetails.optimizedResume;
    const lines = content.split('\n');
    const firstHeaderIdx = lines.findIndex(l => l.startsWith('## '));
    
    const wordContent = lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return `<h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; color: #111111; font-family: Arial, sans-serif;">${line.substring(2)}</h1>`;
      } else if (firstHeaderIdx !== -1 && idx < firstHeaderIdx) {
        if (line.trim() === '') return '';
        const isSecondLine = idx === 1 || (idx > 0 && lines[idx - 1].startsWith('# '));
        if (isSecondLine) {
          return `<div style="text-align: center; font-size: 11pt; font-weight: bold; color: #111111; margin-bottom: 2px; text-transform: uppercase; font-family: Arial, sans-serif;"><b>${line}</b></div>`;
        }
        return `<div style="text-align: center; font-size: 9.5pt; color: #555555; margin-bottom: 2px; font-family: Arial, sans-serif;">${line}</div>`;
      } else if (line.startsWith('## ')) {
        return `<h2 style="font-size: 11pt; border: none; border-bottom: solid #111111 1.5pt; padding: 0in 0in 2pt 0in; margin-top: 16pt; margin-bottom: 6pt; font-weight: bold; text-transform: uppercase; text-align: left; color: #111111; font-family: Arial, sans-serif;">${line.substring(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        const h3Content = line.substring(4);
        if (h3Content.includes('|')) {
          const parts = h3Content.split('|');
          return `
            <table border="0" cellspacing="0" cellpadding="0" style="width:100%; margin-top:6px; margin-bottom:2px;">
              <tr>
                <td align="left" style="font-weight:bold; font-size:10pt; color:#111111; font-family: Arial, sans-serif;">${parts[0].trim()}</td>
                <td align="right" style="font-size:9pt; color:#555555; font-style:italic; font-family: Arial, sans-serif;">${parts[1].trim()}</td>
              </tr>
            </table>
          `;
        }
        return `<h3 style="font-size: 10pt; margin-top: 8px; margin-bottom: 2px; font-weight: bold; color: #111111; font-family: Arial, sans-serif;">${h3Content}</h3>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        let itemText = line.substring(2);
        const parts = itemText.split('**');
        itemText = parts.map((part, index) => index % 2 === 1 ? `<b>${part}</b>` : part).join('');
        return `
          <table border="0" cellspacing="0" cellpadding="0" style="width:100%; margin-top:0px; margin-bottom:4px;">
            <tr>
              <td valign="top" style="width: 12pt; font-size: 9.5pt; font-weight: bold; color: #111111; font-family: Arial, sans-serif; padding-top: 1px;">•</td>
              <td valign="top" align="left" style="font-size: 9.5pt; color: #333333; font-family: Arial, sans-serif; line-height: 1.35; text-align: left;">${itemText}</td>
            </tr>
          </table>
        `;
      } else if (line.trim() === '') {
        return '';
      } else {
        let itemText = line;
        if (itemText.includes('|')) {
          const parts = itemText.split('|');
          return `
            <table border="0" cellspacing="0" cellpadding="0" style="width:100%; margin-bottom:4px;">
              <tr>
                <td align="left" style="font-size:9.5pt; color:#444444; font-family: Arial, sans-serif; font-weight: bold;">${parts[0].trim()}</td>
                <td align="right" style="font-size:9.5pt; color:#444444; font-family: Arial, sans-serif; font-weight: bold;">${parts[1].trim()}</td>
              </tr>
            </table>
          `;
        }
        const parts = itemText.split('**');
        itemText = parts.map((part, index) => index % 2 === 1 ? `<b>${part}</b>` : part).join('');
        return `<p style="margin: 0 0 4px 0; font-size: 9.5pt; text-align: left; font-family: Arial, sans-serif; color: #333333; line-height: 1.35;">${itemText}</p>`;
      }
    }).filter(html => html !== '').join('\n');
    
    const formattedHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Resume Tailored - ${selectedAppForDetails.company || "ATS"}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.35; font-size: 10pt; color: #333333; margin: 1in; }
          h1, h2, h3, p, div, li { font-family: 'Arial', sans-serif; }
          p { margin: 0 0 4px 0; font-size: 9.5pt; text-align: left; }
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
    a.download = `Resume_Tailored_${(selectedAppForDetails.company || 'ATS').replace(/\s+/g, '_')}_${(selectedAppForDetails.title || 'Job').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDrawerPDF = () => {
    if (!selectedAppForDetails?.optimizedResume) return;
    
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
    
    const content = selectedAppForDetails.optimizedResume;
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
        return `<li style="margin-bottom: 3.5px; line-height: 1.35; font-size: 9.5px; color: #333; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: left; list-style-type: disc; margin-left: 15px;">${itemText}</li>`;
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
        return `<p style="margin: 0 0 5px 0; font-size: 9.5px; line-height: 1.4; text-align: left; color: #333; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${itemText}</p>`;
      }
    }).filter(html => html !== '').join('\n');
    
    doc.write(`
      <html>
      <head>
        <title>Resume_Tailored_${selectedAppForDetails.company || 'ATS'}_${selectedAppForDetails.title || 'Job'}</title>
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

  const handleCopyToClipboard = () => {
    if (!selectedAppForDetails?.optimizedResume) return;
    navigator.clipboard.writeText(selectedAppForDetails.optimizedResume);
    setDrawerCopied(true);
    setTimeout(() => setDrawerCopied(false), 2500);
  };
  const handleAddInterviewDate = () => {
    if (!selectedAppForDetails || !newInterviewDate) return;
    const currentDates = [...selectedAppForDetails.interviewDates];
    if (!currentDates.includes(newInterviewDate)) {
      currentDates.push(newInterviewDate);
      currentDates.sort(); // Keep sorted chronological
      handleUpdateStatusAndNotes(
        'interview', // Switch status to interview automatically if date is added
        selectedAppForDetails.notes || '',
        currentDates
      );
      setNewInterviewDate('');
    }
  };

  const handleRemoveInterviewDate = (dateToRemove: string) => {
    if (!selectedAppForDetails) return;
    const filtered = selectedAppForDetails.interviewDates.filter(d => d !== dateToRemove);
    handleUpdateStatusAndNotes(
      selectedAppForDetails.status,
      selectedAppForDetails.notes || '',
      filtered
    );
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* KPI: Total Applied */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-stone-500/5 blur-[25px] rounded-full"></div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Total Dilamar</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-black text-stone-900 font-display tracking-tight">{totalApplied}</div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Posisi</div>
          </div>
          <div className="text-[9px] text-stone-500 font-mono mt-3 border-t border-stone-100 pt-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            TERCATAT DI SISTEM
          </div>
        </div>

        {/* KPI: Active Interviews */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-500/5 blur-[25px] rounded-full"></div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Tahap Wawancara</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-black text-amber-600 font-display tracking-tight">{totalInterviews}</div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Proses</div>
          </div>
          <div className="text-[9px] text-amber-600 font-mono mt-3 border-t border-stone-100 pt-2 flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            INTERVIEW AKTIF
          </div>
        </div>

        {/* KPI: Rejections */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-rose-500/5 blur-[25px] rounded-full"></div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Belum Berhasil</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-black text-rose-500 font-display tracking-tight">{totalRejections}</div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Ditolak</div>
          </div>
          <div className="text-[9px] text-rose-500 font-mono mt-3 border-t border-stone-100 pt-2 flex items-center gap-1.5 font-bold">
            <X className="w-3.5 h-3.5" />
            TETAP OPTIMIS!
          </div>
        </div>

        {/* KPI: Avg ATS Match Score */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-teal-500/5 blur-[25px] rounded-full"></div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Rata-rata Skor ATS</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-black text-teal-600 font-display tracking-tight">{averageAts}%</div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Kecocokan</div>
          </div>
          <div className="text-[9px] text-teal-600 font-mono mt-3 border-t border-stone-100 pt-2 flex items-center gap-1.5 font-bold">
            <FileCheck className="w-3.5 h-3.5" />
            KOMPATIBILITAS TINGGI
          </div>
        </div>

        {/* KPI: Stale warning warnings */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow flex flex-col justify-between col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-500/5 blur-[25px] rounded-full"></div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Butuh Tindak Lanjut</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-black text-amber-600 font-display tracking-tight">{staleCount}</div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Stale &gt;14d</div>
          </div>
          <div className="text-[9px] text-amber-600 font-mono mt-3 border-t border-stone-100 pt-2 flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {staleCount > 0 ? "HUBUNGI PEREKRUT" : "SEMUA AKTIF"}
          </div>
        </div>
      </div>

      {/* Control bar: Search, Filters & Add Manual */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama perusahaan atau posisi pekerjaan..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl focus:outline-none transition-all text-sm text-stone-800 font-medium placeholder-stone-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLocationFilter('all');
                setWorkFilter('all');
              }}
              className="px-3.5 py-2.5 text-xs font-bold font-mono tracking-wider uppercase border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-50 hover:text-stone-800 transition-all cursor-pointer"
            >
              Reset Filter
            </button>
            <button
              id="btn-add-manual"
              onClick={() => setIsAddingManual(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white stroke-[3px]" />
              Catat Lamaran Manual
            </button>
          </div>
        </div>

        {/* Dropdown filters block */}
        <div className="pt-3.5 border-t border-stone-150 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-500 uppercase tracking-widest font-mono">Status Tahapan</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-stone-200 rounded-xl bg-white text-xs text-stone-700 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">Semua Tahapan (All)</option>
              <option value="applied">Applied (Telah Dikirim)</option>
              <option value="interview">Interview (Wawancara)</option>
              <option value="rejected">Rejected (Ditolak)</option>
              <option value="job canceled">Job Canceled (Dibatalkan)</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-500 uppercase tracking-widest font-mono">Jenis Lokasi Kerja</label>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-stone-200 rounded-xl bg-white text-xs text-stone-700 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">Semua Tipe Lokasi</option>
              <option value="remote">Remote (Kerja Jarak Jauh)</option>
              <option value="hybrid">Hybrid (Gabungan)</option>
              <option value="on site">On Site (Di Kantor)</option>
            </select>
          </div>

          {/* Work Type Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-500 uppercase tracking-widest font-mono">Tipe Kontrak</label>
            <select
              value={workFilter}
              onChange={e => setWorkFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-stone-200 rounded-xl bg-white text-xs text-stone-700 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">Semua Tipe Kontrak</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship / Magang</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Manual Form Panel Modal */}
      {isAddingManual && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200 relative">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base font-display">Catat Pengajuan Lamaran Secara Manual</h3>
              <button onClick={() => setIsAddingManual(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedProjectId === 'all' && (
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Target Bidang Kerja (Project)</label>
                  <select
                    value={manualProjId}
                    onChange={e => setManualProjId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="text-stone-700">{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Nama Perusahaan *</label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={e => setManualCompany(e.target.value)}
                    placeholder="Contoh: PT Tokopedia"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Posisi Pekerjaan *</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={e => setManualTitle(e.target.value)}
                    placeholder="Contoh: Sales Marketing Executive"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Kategori Pekerjaan</label>
                  <select
                    value={manualCategory}
                    onChange={e => setManualCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
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
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Jenis Lokasi Kerja</label>
                  <select
                    value={manualLoc}
                    onChange={e => setManualLoc(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                  >
                    <option value="remote">Remote (Jarak Jauh)</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on site">On Site (Di Kantor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Tipe Kontrak</label>
                  <select
                    value={manualWork}
                    onChange={e => setManualWork(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship / Magang</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Platform Melamar *</label>
                  <input
                    type="text"
                    value={manualPlatform}
                    onChange={e => setManualPlatform(e.target.value)}
                    placeholder="Contoh: LinkedIn, Jobstreet, Indeed"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Link Lowongan Kerja (Opsional)</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://example.com/job-post"
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                />
              </div>

              {/* Status Pilihan Awal */}
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1.5">Status Lamaran Saat Ini</label>
                <div className="grid grid-cols-2 gap-2 bg-stone-100/80 p-1.5 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setManualStatus('not_applied')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      manualStatus === 'not_applied'
                        ? 'bg-white text-stone-850 shadow-sm font-extrabold font-display'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    📝 Belum Melamar (Draft)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('applied')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      manualStatus === 'applied'
                        ? 'bg-white text-teal-700 shadow-sm font-extrabold font-display'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    🚀 Applied (Telah Dilamar)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Negara</label>
                  <input
                    type="text"
                    value={manualCountry}
                    onChange={e => setManualCountry(e.target.value)}
                    placeholder="Contoh: Indonesia"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Zona Waktu</label>
                  <input
                    type="text"
                    value={manualTz}
                    onChange={e => setManualTz(e.target.value)}
                    placeholder="Contoh: GMT+7"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Deskripsi Pekerjaan (Opsional)</label>
                <textarea
                  value={manualDesc}
                  onChange={e => setManualDesc(e.target.value)}
                  rows={4}
                  placeholder="Tempel deskripsi tugas atau syarat pekerjaan di sini..."
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm leading-relaxed focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Catatan Pribadi (Catatan Interview/Kontak)</label>
                <textarea
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Menghubungi HRD lewat LinkedIn, respon biasanya 3 hari..."
                  className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm leading-relaxed focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddingManual(false)}
                  className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-sm shadow-sm transition-all cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-stone-200/60 bento-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/60 text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
                <th className="py-4 px-5">Perusahaan & Posisi</th>
                <th className="py-4 px-4">Tipe / Lokasi</th>
                <th className="py-4 px-4">Tanggal Daftar</th>
                <th className="py-4 px-4">ATS Score</th>
                <th className="py-4 px-4">Status Tahapan</th>
                <th className="py-4 px-4">Status Otomatis</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-600 text-xs">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 bg-stone-50/30">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <SlidersHorizontal className="w-8 h-8 text-stone-300" />
                      <div className="font-bold text-stone-500 font-display">Tidak ada data pelacakan ditemukan</div>
                      <p className="text-stone-400 text-xs max-w-xs">
                        Coba bersihkan filter pencarian atau buat optimasi resume baru untuk menambah data secara otomatis.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const automated = getAutomatedStatus(app.dateApplied, app.status);
                  const matchingProject = projects.find(p => p.id === app.projectId);

                  return (
                    <tr 
                      key={app.id} 
                      className="hover:bg-stone-50/50 transition-colors group cursor-pointer border-b border-stone-100"
                      onClick={() => setSelectedAppForDetails(app)}
                    >
                      {/* Company & Title */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-stone-900 text-sm group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                          {app.company}
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-stone-400 hover:text-teal-600 p-0.5 rounded transition-colors"
                              title="Buka link lowongan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-stone-500 mt-0.5 font-medium">{app.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {app.platform && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-50 border border-teal-150 text-teal-700 rounded text-[9px] font-bold font-mono">
                              <Globe className="w-2.5 h-2.5 text-teal-600" />
                              {app.platform}
                            </span>
                          )}
                          {selectedProjectId === 'all' && matchingProject && (
                            <span className="inline-block px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                              Bidang: {matchingProject.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location & Contract types */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1 text-stone-700 font-bold capitalize text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          {app.locationType}
                        </div>
                        <div className="inline-block px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 font-semibold rounded text-[10px] capitalize font-mono">
                          {app.workType}
                        </div>
                      </td>

                      {/* Date Applied */}
                      <td className="py-4 px-4 font-bold text-stone-500 font-mono">
                        {app.dateApplied || <span className="text-stone-300">-</span>}
                      </td>

                      {/* ATS Score */}
                      <td className="py-4 px-4">
                        {app.atsScore !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-1 rounded-lg font-extrabold font-mono text-xs ${
                              app.atsScore >= 80 
                                ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                                : app.atsScore >= 70 
                                ? 'bg-teal-50/50 text-teal-600 border border-teal-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {app.atsScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Application status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[9px] uppercase tracking-wider border ${
                          app.status === 'not_applied'
                            ? 'bg-stone-50 text-stone-600 border-stone-200/80'
                            : app.status === 'interview'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                            : app.status === 'applied'
                            ? 'bg-teal-50 text-teal-700 border-teal-200/50'
                            : app.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/50'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.status === 'not_applied' ? 'bg-stone-400' : app.status === 'interview' ? 'bg-amber-500 animate-pulse' : app.status === 'applied' ? 'bg-teal-500' : app.status === 'rejected' ? 'bg-rose-500' : 'bg-stone-400'
                          }`} />
                          {app.status === 'not_applied' ? 'Belum Melamar' : app.status === 'interview' ? 'Wawancara' : app.status === 'applied' ? 'Applied' : app.status === 'rejected' ? 'Ditolak' : 'Batal'}
                        </span>
                      </td>

                      {/* Automated Status tracking helper */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight border ${
                          automated.text.includes('Lancar') || automated.text.includes('Aktif')
                            ? 'bg-teal-50 text-teal-700 border-teal-100'
                            : automated.text.includes('Tanpa Kabar') || automated.text.includes('peringatan')
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-stone-100 text-stone-500 border-stone-200/60'
                        }`}>
                          {automated.text}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAppForDetails(app)}
                            className="p-1.5 text-stone-400 hover:text-teal-600 hover:bg-stone-100 rounded-lg transition-all cursor-pointer"
                            title="Buka Detail Lamaran"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus catatan lamaran dari ${app.company}?`)) {
                                onDeleteApplication(app.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus Lamaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side Drawer Panel */}
      {selectedAppForDetails && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-hidden flex flex-col border-l border-stone-200/85 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-stone-150 flex justify-between items-center bg-stone-50/50">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Detail Riwayat Lamaran</span>
                <h3 className="font-bold text-stone-900 text-lg leading-tight mt-0.5 font-display">{selectedAppForDetails.company}</h3>
                <p className="text-stone-500 text-xs font-semibold mt-0.5">{selectedAppForDetails.title}</p>
              </div>
              <button 
                onClick={() => setSelectedAppForDetails(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Top Quick Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50/60 p-4 rounded-xl border border-stone-100">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider font-mono">Tanggal Apply</span>
                  <div className="text-xs font-bold text-stone-800 mt-1 font-mono">{selectedAppForDetails.dateApplied}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider font-mono">Lokasi / Tipe</span>
                  <div className="text-xs font-semibold text-stone-600 mt-1 capitalize">{selectedAppForDetails.locationType} - {selectedAppForDetails.workType}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider font-mono">Negara / Waktu</span>
                  <div className="text-xs font-semibold text-stone-600 mt-1">{selectedAppForDetails.country} ({selectedAppForDetails.timezone})</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider font-mono">Kategori</span>
                  <div className="text-xs font-semibold text-stone-600 mt-1">{selectedAppForDetails.jobCategory}</div>
                </div>
              </div>

              {/* Status Update Sector */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Update Status Tahapan Kerja</span>
                <div className="flex flex-wrap gap-2">
                  {(['not_applied', 'applied', 'interview', 'rejected', 'job canceled'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatusAndNotes(st, selectedAppForDetails.notes || '', selectedAppForDetails.interviewDates)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold capitalize transition-all cursor-pointer ${
                        selectedAppForDetails.status === st
                          ? 'bg-teal-600 text-white border-transparent shadow-sm'
                          : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-800'
                      }`}
                    >
                      {st === 'not_applied' ? '📝 Belum Melamar' : st === 'applied' ? '🚀 Applied' : st === 'interview' ? '📅 Interview' : st === 'rejected' ? '❌ Ditolak' : '🚫 Batal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interviews Tracker Sector */}
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest font-mono">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Agenda Wawancara (Interview Dates)
                </div>
                <div className="space-y-2">
                  {selectedAppForDetails.interviewDates.length === 0 ? (
                    <p className="text-xs text-amber-600/75 italic font-mono">Belum ada jadwal wawancara yang terdaftar.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAppForDetails.interviewDates.map((date, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-bold rounded-lg font-mono">
                          {date}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveInterviewDate(date)} 
                            className="p-0.5 rounded hover:bg-amber-100 text-amber-700 font-black ml-1 text-sm leading-none cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add new interview schedule */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="date"
                      value={newInterviewDate}
                      onChange={e => setNewInterviewDate(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterviewDate}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Tambah Jadwal
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Notes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Catatan Log Lamaran & Kontak</span>
                <textarea
                  value={selectedAppForDetails.notes || ''}
                  onChange={e => handleUpdateStatusAndNotes(selectedAppForDetails.status, e.target.value, selectedAppForDetails.interviewDates)}
                  rows={4}
                  placeholder="Masukkan catatan perkembangan lamaran, tautan berkas tambahan, atau rincian penawaran gaji harian di sini..."
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-750 leading-relaxed focus:outline-none focus:border-teal-600 placeholder-stone-300"
                />
              </div>

              {/* AI Tailoring reports if optimized via platform */}
              {selectedAppForDetails.atsScore !== undefined && (
                <div className="space-y-4 pt-4 border-t border-stone-150">
                  <div className="flex items-center gap-2 text-teal-750">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                    <h4 className="font-bold text-stone-900 text-sm font-display">Hasil Optimasi Gemini AI</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider font-mono">Skor ATS Lamaran</span>
                      <div className="text-base font-extrabold text-teal-700 mt-1">{selectedAppForDetails.atsScore}% Cocok</div>
                    </div>
                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">Skala Kecocokan</span>
                      <div className="text-base font-extrabold text-indigo-700 mt-1">Skala {selectedAppForDetails.suitabilityScale}/10</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Penjelasan Kecocokan AI</span>
                    <p className="text-stone-600 text-xs italic bg-stone-50 p-3.5 rounded-xl leading-relaxed border border-stone-150 font-medium">
                      "{selectedAppForDetails.suitabilityExplanation}"
                    </p>
                  </div>

                  {selectedAppForDetails.gapAnalysis && (
                    <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow space-y-2 relative overflow-hidden flex flex-col">
                      <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-650" />
                        Analisis Celah (Gap Analysis)
                      </h4>
                      {renderFormattedList(selectedAppForDetails.gapAnalysis, 'rose')}
                    </div>
                  )}

                  {selectedAppForDetails.optimizedResume && (
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-stone-150">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Resume Hasil Tailoring</span>
                        
                        {/* Tabs switcher: Plain Text vs A4 PDF layout */}
                        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200/60 self-stretch sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setDrawerResumeViewMode('a4')}
                            className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                              drawerResumeViewMode === 'a4'
                                ? 'bg-white text-teal-750 shadow-sm'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                          >
                            📄 Desain A4 (PDF)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawerResumeViewMode('plain')}
                            className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                              drawerResumeViewMode === 'plain'
                                ? 'bg-white text-teal-750 shadow-sm'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                          >
                            📝 Teks Bersih
                          </button>
                        </div>
                      </div>

                      {/* Actions Bar: Downloads & Copy */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Download Word */}
                          <button
                            onClick={downloadDrawerWord}
                            className="flex items-center gap-1 px-2.5 py-1 text-sky-800 bg-sky-50 border border-sky-250 hover:bg-sky-100/80 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                            title="Download file sebagai format document Word (.doc)"
                          >
                            <Download className="w-3 h-3 text-sky-700" />
                            Download Word (.doc)
                          </button>

                          {/* Download PDF / Print */}
                          <button
                            onClick={downloadDrawerPDF}
                            className="flex items-center gap-1 px-2.5 py-1 text-rose-800 bg-rose-50 border border-rose-250 hover:bg-rose-100/80 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                            title="Unduh / Cetak resume sebagai file PDF A4 berkualitas tinggi"
                          >
                            <Printer className="w-3 h-3 text-rose-650" />
                            Download / Cetak PDF
                          </button>
                        </div>

                        {/* Copy to Clipboard */}
                        <button
                          onClick={handleCopyToClipboard}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider border border-stone-200 hover:bg-stone-100 text-stone-600 rounded-lg bg-white transition-all cursor-pointer"
                        >
                          {drawerCopied ? (
                            <>
                              <Check className="w-3 h-3 text-teal-600 stroke-[3px]" />
                              <span className="text-teal-600 font-extrabold">Berhasil!</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3 h-3" />
                              Salin Teks
                            </>
                          )}
                        </button>
                      </div>

                      {drawerResumeViewMode === 'a4' ? (
                        /* Elegant A4 Simulation Card Wrapper */
                        <div className="bg-stone-200/55 p-3 sm:p-5 rounded-xl border border-stone-200/80 max-h-[500px] overflow-y-auto flex justify-center shadow-inner">
                          <div 
                            id="drawer-a4-resume-page" 
                            className="w-full max-w-[620px] min-h-[850px] bg-white border border-stone-300 shadow-xl p-6 sm:p-10 text-stone-850 text-left font-sans text-xs relative overflow-y-auto"
                            style={{ wordBreak: 'break-word' }}
                          >
                            {/* A4 Badge Watermark indicator */}
                            <div className="absolute top-2.5 right-2.5 text-[8px] text-stone-400 font-bold uppercase tracking-widest font-mono select-none">
                              PRINTER-READY A4
                            </div>

                            {/* Formatting CV Text into real CV markup elements */}
                            <div className="space-y-3 font-sans text-[11px]">
                              {(() => {
                                const rLines = selectedAppForDetails.optimizedResume.split('\n');
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
                                      <h1 key={idx} className="text-base font-bold text-center text-stone-900 tracking-wide uppercase mb-1 font-display">
                                        {line.substring(2)}
                                      </h1>
                                    );
                                  } else if (firstH2Idx !== -1 && idx < firstH2Idx) {
                                    if (line.trim() === '') return null;
                                    const isSecondLine = idx === 1 || (idx > 0 && rLines[idx - 1].startsWith('# '));
                                    if (isSecondLine) {
                                      return (
                                        <div key={idx} className="text-center font-bold text-stone-800 text-[11px] sm:text-xs tracking-wide mb-1">
                                          {line}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={idx} className="text-center text-[10px] text-stone-500 mb-1 leading-relaxed">
                                        {line}
                                      </div>
                                    );
                                  } else if (line.startsWith('## ')) {
                                    return (
                                      <h2 key={idx} className="text-[11px] sm:text-xs font-bold text-stone-900 tracking-wider uppercase border-b-2 border-stone-800 pb-0.5 mt-4 mb-2 font-display text-left">
                                        {line.substring(3)}
                                      </h2>
                                    );
                                  } else if (line.startsWith('### ')) {
                                    const h3Content = line.substring(4);
                                    if (h3Content.includes('|')) {
                                      const parts = h3Content.split('|');
                                      return (
                                        <div key={idx} className="flex justify-between items-baseline mt-3 mb-1">
                                          <span className="font-bold text-[11px] text-stone-900">{parts[0].trim()}</span>
                                          <span className="text-[9px] text-stone-500 font-bold italic font-mono">{parts[1].trim()}</span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <h3 key={idx} className="text-[11px] font-bold text-stone-900 mt-3 mb-1">
                                        {h3Content}
                                      </h3>
                                    );
                                  } else if (line.startsWith('- ') || line.startsWith('* ')) {
                                    return (
                                      <li key={idx} className="text-[10px] text-stone-700 ml-4 list-disc pl-1 leading-relaxed mb-1 text-left">
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
                                        <div key={idx} className="flex justify-between items-baseline text-[10px] text-stone-600 mt-0.5 mb-1 font-medium">
                                          <span>{parts[0].trim()}</span>
                                          <span>{parts[1].trim()}</span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <p key={idx} className="text-[10px] text-stone-700 leading-relaxed text-left mb-1">
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
                            value={selectedAppForDetails.optimizedResume}
                            rows={12}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-650 font-mono leading-relaxed resize-none focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Show Job Description segment if manual */}
              {selectedAppForDetails.jobDescription && !selectedAppForDetails.atsScore && (
                <div className="space-y-2 pt-4 border-t border-stone-150">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block font-mono">Deskripsi Lowongan Kerja</span>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 max-h-[180px] overflow-y-auto text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
                    {selectedAppForDetails.jobDescription}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
