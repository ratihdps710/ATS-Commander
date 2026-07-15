import React, { useState, useEffect } from 'react';
import { Project, JobApplication } from './types';
import { defaultProjects, defaultApplications } from './utils/helpers';
import ProjectManager from './components/ProjectManager';
import ResumeOptimizer from './components/ResumeOptimizer';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import { 
  Sparkles, Briefcase, Calendar, Folder, ListFilter, LayoutDashboard, 
  User, CheckCircle2, ChevronDown, Compass, RefreshCw, AlertCircle
} from 'lucide-react';

export default function App() {
  // --- STATE PERSISTENCE ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ats_projects');
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('ats_applications');
    return saved ? JSON.parse(saved) : defaultApplications;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('ats_selected_project_id');
    return saved || 'all'; // Default to 'all' to see everything or specific
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'optimizer' | 'projects' | 'calendar'>('dashboard');

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('ats_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ats_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('ats_selected_project_id', selectedProjectId);
  }, [selectedProjectId]);

  // Ensure selectedProjectId is valid if a project gets deleted
  useEffect(() => {
    if (selectedProjectId !== 'all' && !projects.some(p => p.id === selectedProjectId)) {
      setSelectedProjectId('all');
    }
  }, [projects, selectedProjectId]);

  // --- ACTIONS ---
  const handleCreateProject = (name: string, baseResume: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      baseResume,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProj]);
    setSelectedProjectId(newProj.id); // Auto select the new project
  };

  const handleUpdateProject = (id: string, name: string, baseResume: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, baseResume } : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Also delete associated applications as they are linked to this project
    setApplications(prev => prev.filter(app => app.projectId !== id));
  };

  const handleAddApplication = (newApp: JobApplication) => {
    setApplications(prev => [newApp, ...prev]);
  };

  const handleUpdateApplication = (updatedApp: JobApplication) => {
    setApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const handleDeleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  // Called when AI resume optimizer successfully generates a resume & user clicks "Simpan ke Tracker"
  const handleSaveOptimizedApplication = (newAppFields: Omit<JobApplication, 'id' | 'dateCreated'>) => {
    const newApp: JobApplication = {
      ...newAppFields,
      id: `app-ai-${Date.now()}`,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    handleAddApplication(newApp);
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-700 font-sans flex flex-col antialiased">
      {/* Top Header Navigation bar */}
      <header className="bg-white/95 border-b border-stone-200/60 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-sm font-black text-stone-900 leading-none tracking-tight font-display">ATS COMMANDER</h1>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1 block font-mono">AI-Powered Optimizer</span>
              </div>
            </div>

            {/* Right side role switcher / contextual project switcher */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Target Bidang:</span>
              <div className="relative">
                <select
                  id="project-switcher"
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="bg-white hover:bg-stone-50 border border-stone-200 focus:border-teal-600 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="all">🌐 Semua Bidang (Combined)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>💼 {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner Informational Context */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/50 bento-shadow relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Decorative subtle gradient radial glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 blur-[40px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600 flex-shrink-0 border border-teal-100">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-display">
                Workspace: {selectedProjectId === 'all' ? 'Semua Bidang Karir Aktif' : `Fokus Bidang ${activeProject?.name}`}
              </h2>
              <p className="text-stone-500 text-xs mt-0.5 max-w-2xl">
                {selectedProjectId === 'all' 
                  ? 'Melihat keseluruhan riwayat lamaran dari berbagai latar belakang pengalaman. Sempurna untuk mengamati rekapitulasi statistik bulanan Anda.' 
                  : `Hanya menampilkan pelacakan lamaran kerja dan menggunakan resume dasar spesifik untuk profesi ${activeProject?.name}.`
                }
              </p>
            </div>
          </div>

          {/* Quick Context Action */}
          {selectedProjectId !== 'all' && activeProject && (
            <div className="flex items-center gap-2 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-100 text-xs relative z-10">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-teal-700 font-bold font-mono text-[10px] tracking-wider">RESUME DASAR TERPASANG</span>
            </div>
          )}
        </div>

        {/* Tab View Selection */}
        <div className="flex border-b border-stone-200/80 gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 font-display ${
              activeTab === 'dashboard'
                ? 'bg-teal-50 border-teal-600 text-teal-700'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard & Pelacak Lamaran
          </button>
          
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 font-display ${
              activeTab === 'optimizer'
                ? 'bg-teal-50 border-teal-600 text-teal-700'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Optimasi Resume AI (ATS Lab)
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 font-display ${
              activeTab === 'projects'
                ? 'bg-teal-50 border-teal-600 text-teal-700'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            <Folder className="w-4 h-4" />
            Manajemen Bidang (Role CV)
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 font-display ${
              activeTab === 'calendar'
                ? 'bg-teal-50 border-teal-600 text-teal-700'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Kalender & Aktivitas
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-2">
          {activeTab === 'dashboard' && (
            <Dashboard
              projects={projects}
              selectedProjectId={selectedProjectId}
              applications={applications}
              onAddApplication={handleAddApplication}
              onUpdateApplication={handleUpdateApplication}
              onDeleteApplication={handleDeleteApplication}
            />
          )}

          {activeTab === 'optimizer' && (
            <div>
              {selectedProjectId === 'all' ? (
                <div className="bg-white p-8 rounded-2xl border border-stone-200/60 text-center max-w-md mx-auto space-y-4 my-12 relative overflow-hidden bento-shadow-md">
                  {/* Decorative subtle gradient radial glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 blur-[40px] rounded-full pointer-events-none"></div>
                  
                  <div className="p-3.5 bg-teal-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-teal-600 border border-teal-100">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-stone-900 font-display text-base">Silakan Pilih Bidang Target Kerja Dahulu</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Optimasi resume membutuhkan satu basis referensi data resume Anda. Gunakan menu dropdown di pojok kanan atas untuk memilih salah satu target bidang kerja (misal: <strong>B2B Sales Specialist</strong>) sebelum membuka modul optimalisasi AI.
                  </p>
                  <div className="pt-2">
                    <select
                      value={selectedProjectId}
                      onChange={e => setSelectedProjectId(e.target.value)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs px-4 py-2 shadow-md transition-all cursor-pointer focus:outline-none"
                    >
                      <option value="all" disabled>-- Pilih salah satu bidang --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="text-stone-700">{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <ResumeOptimizer
                  activeProject={activeProject}
                  onSaveApplication={handleSaveOptimizedApplication}
                />
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectManager
              projects={projects}
              selectedProjectId={selectedProjectId === 'all' ? (projects[0]?.id || '') : selectedProjectId}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              applications={applications}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              applications={applications}
              selectedProjectId={selectedProjectId}
            />
          )}
        </div>

      </main>

      {/* Footer footer */}
      <footer className="bg-stone-100 border-t border-stone-200/80 py-8 mt-16 text-center text-xs text-stone-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-display tracking-tight text-stone-600">ATS COMMANDER — Professional Resume Optimizer & Application Tracker</p>
          <p className="text-[10px] text-stone-400 font-mono">INTEGRASI ENGINE: GOOGLE GEMINI AI • REACT 18 • VITE TAILWIND v4</p>
        </div>
      </footer>
    </div>
  );
}
