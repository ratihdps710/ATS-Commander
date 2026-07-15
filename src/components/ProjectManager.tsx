import React, { useState } from 'react';
import { Project, JobApplication } from '../types';
import { Plus, Folder, Briefcase, Calendar, Trash2, Edit3, Save, FileText, CheckCircle } from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, baseResume: string) => void;
  onUpdateProject: (id: string, name: string, baseResume: string) => void;
  onDeleteProject: (id: string) => void;
  applications: JobApplication[];
}

export default function ProjectManager({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  applications,
}: ProjectManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // State for forms
  const [newName, setNewName] = useState('');
  const [newResume, setNewResume] = useState('');
  const [editName, setEditName] = useState('');
  const [editResume, setEditResume] = useState('');

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newResume.trim()) return;
    onCreateProject(newName, newResume);
    setNewName('');
    setNewResume('');
    setIsCreating(false);
  };

  const handleStartEdit = (proj: Project) => {
    setIsEditing(proj.id);
    setEditName(proj.name);
    setEditResume(proj.baseResume);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || !editResume.trim()) return;
    onUpdateProject(id, editName, editResume);
    setIsEditing(null);
  };

  const getApplicationCount = (projectId: string) => {
    return applications.filter(app => app.projectId === projectId).length;
  };

  const getSuccessRate = (projectId: string) => {
    const projApps = applications.filter(app => app.projectId === projectId);
    if (projApps.length === 0) return 0;
    const activeOrInterviews = projApps.filter(app => app.status === 'interview' || app.status === 'applied').length;
    return Math.round((activeOrInterviews / projApps.length) * 100);
  };

  return (
    <div id="project-manager-view" className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200/60 bento-shadow">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 font-display">
            <Folder className="w-5 h-5 text-teal-600" />
            Manajemen Bidang Pekerjaan / Target Role
          </h2>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Pisahkan resume dasar Anda ke dalam beberapa "Project" bidang kerja yang berbeda untuk menyesuaikan target lamaran.
          </p>
        </div>
        <button
          id="btn-add-project"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white stroke-[3px]" />
          Tambah Target Bidang Baru
        </button>
      </div>

      {/* New Project Form */}
      {isCreating && (
        <form onSubmit={handleCreate} id="new-project-form" className="bg-white p-6 rounded-2xl border border-dashed border-stone-300 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h3 className="font-bold text-stone-900 text-base font-display">Buat Target Bidang & Resume Dasar Baru</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-2">Nama Bidang / Posisi Pekerjaan</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Contoh: B2B Sales Specialist, Fullstack Developer, Social Media Manager"
                className="w-full px-4 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm font-medium placeholder-stone-400"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-2">
                Resume Dasar (Base Resume) - Ketik atau Tempel CV asli Anda di sini
              </label>
              <textarea
                value={newResume}
                onChange={e => setNewResume(e.target.value)}
                rows={8}
                placeholder="Tuliskan pengalaman kerja, skill, pendidikan, dsb secara detail. AI akan menggunakan teks ini sebagai landasan data untuk tailoring."
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal-650 text-stone-850 text-sm font-mono placeholder-stone-400"
                required
              />
              <p className="text-[10px] text-stone-400 font-mono mt-2">
                TIPS: Tuliskan sedetail mungkin. AI akan secara otomatis menyeleksi bagian yang cocok ketika dicocokkan dengan lowongan pekerjaan target.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm cursor-pointer transition-all"
            >
              Simpan Target Bidang
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Target Roles */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono mb-1">
            Daftar Bidang Pekerjaan Anda
          </div>
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            const appCount = getApplicationCount(proj.id);
            const rate = getSuccessRate(proj.id);
            
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-teal-50/40 border-teal-600 ring-1 ring-teal-600/30 bento-shadow-md'
                    : 'bg-white border-stone-200/60 hover:border-stone-300 bento-shadow'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Briefcase className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-stone-400'}`} />
                    {proj.name}
                  </div>
                  {projects.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete({ id: proj.id, name: proj.name });
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                      title="Hapus bidang ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-stone-100">
                  <div>
                    <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Total Lamaran</div>
                    <div className="text-xs font-bold text-stone-700 mt-1 font-mono">{appCount} Pekerjaan</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Rasio Sukses</div>
                    <div className={`text-xs font-bold mt-1 font-mono ${rate > 70 ? 'text-teal-700' : 'text-amber-700'}`}>
                      {rate}% Aktif
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Edit Base Resume & Statistics */}
        <div className="lg:col-span-2">
          {activeProject ? (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/60 bento-shadow space-y-6">
              {isEditing === activeProject.id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-stone-150">
                    <h3 className="font-bold text-stone-900 font-display">Edit Mode: {activeProject.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100 rounded-lg transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSaveEdit(activeProject.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono mb-1.5">Nama Bidang Pekerjaan</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-4 py-2 bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-none focus:border-teal-650 text-stone-850 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono mb-1.5">Resume Dasar (Base Resume)</label>
                    <textarea
                      value={editResume}
                      onChange={e => setEditResume(e.target.value)}
                      rows={14}
                      className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-lg focus:outline-none focus:border-teal-650 text-stone-850 text-sm font-mono leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-stone-150">
                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono block">Resume Dasar Saat Ini</span>
                      <h3 className="text-base font-bold text-stone-900 font-display mt-1">{activeProject.name}</h3>
                    </div>
                    <button
                      onClick={() => handleStartEdit(activeProject)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                      Edit Nama & Base Resume
                    </button>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 max-h-[450px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Isi Teks Resume Dasar</span>
                    </div>
                    <pre className="text-xs text-stone-600 font-mono whitespace-pre-wrap leading-relaxed">
                      {activeProject.baseResume}
                    </pre>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-teal-800 bg-teal-50/40 p-4 rounded-xl border border-teal-100 leading-relaxed font-medium">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>
                      Resume Dasar ini digunakan sebagai landasan informasi oleh Gemini AI. Saat mengoptimasi untuk lowongan tertentu, AI akan mengacu pada data di atas untuk ditransfer secara relevan.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center bg-white p-12 rounded-2xl border border-stone-200 bento-shadow text-stone-400 font-mono text-xs">
              Silakan pilih salah satu target bidang pekerjaan di kolom kiri atau buat bidang baru.
            </div>
          )}
        </div>
      </div>

      {/* Custom Deletion Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <Trash2 className="w-6 h-6 stroke-[2px]" />
              <h3 className="font-bold text-stone-900 text-base font-display">Hapus Bidang Pekerjaan?</h3>
            </div>
            <p className="text-stone-500 text-xs leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus target bidang <strong className="text-stone-800">"{projectToDelete.name}"</strong> beserta semua riwayat lamaran yang terhubung? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
