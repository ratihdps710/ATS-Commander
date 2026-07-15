import React, { useState } from 'react';
import { Project, JobApplication } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Bookmark, Users, ClipboardCheck, ArrowUpRight } from 'lucide-react';

interface CalendarViewProps {
  applications: JobApplication[];
  selectedProjectId: string;
}

export default function CalendarView({ applications, selectedProjectId }: CalendarViewProps) {
  // Let's anchor the calendar around the current month/year.
  // The system's current simulated time is July 13, 2026, so let July 2026 be the default.
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed: 6 is July

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Filter applications by active role (project) context
  const activeApps = selectedProjectId === 'all'
    ? applications
    : applications.filter(app => app.projectId === selectedProjectId);

  // Helper to check if a ISO date (YYYY-MM-DD) falls on a given calendar day
  const getApplicationsOnDay = (year: number, month: number, day: number) => {
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${paddedMonth}-${paddedDay}`;
    return activeApps.filter(app => app.dateApplied === targetDateStr);
  };

  const getInterviewsOnDay = (year: number, month: number, day: number) => {
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${paddedMonth}-${paddedDay}`;
    return activeApps.filter(app => app.interviewDates.includes(targetDateStr));
  };

  // Build month calendar grid days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartingDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const startDayOfWeek = getStartingDayOfWeek(currentYear, currentMonth);

  // Stats Calculations for viewed month
  const targetYearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  // 1. Month stats
  const appsThisMonth = activeApps.filter(app => app.dateApplied.startsWith(targetYearMonth));
  const totalAppliedThisMonth = appsThisMonth.length;

  const interviewsThisMonth = activeApps.filter(app => 
    app.interviewDates.some(date => date.startsWith(targetYearMonth))
  );
  
  // Total interview events scheduled in this month
  let totalInterviewsThisMonth = 0;
  activeApps.forEach(app => {
    app.interviewDates.forEach(date => {
      if (date.startsWith(targetYearMonth)) {
        totalInterviewsThisMonth++;
      }
    });
  });

  // 2. Weekly stats breakdown for the viewed month (5 weeks)
  const getWeeklyBreakdown = () => {
    const weeks = [
      { name: "Minggu 1 (Tgl 1-7)", applied: 0, interview: 0 },
      { name: "Minggu 2 (Tgl 8-14)", applied: 0, interview: 0 },
      { name: "Minggu 3 (Tgl 15-21)", applied: 0, interview: 0 },
      { name: "Minggu 4 (Tgl 22-28)", applied: 0, interview: 0 },
      { name: "Minggu 5 (Tgl 29+)", applied: 0, interview: 0 },
    ];

    // Distribute applied apps
    appsThisMonth.forEach(app => {
      const day = parseInt(app.dateApplied.split('-')[2], 10);
      if (day <= 7) weeks[0].applied++;
      else if (day <= 14) weeks[1].applied++;
      else if (day <= 21) weeks[2].applied++;
      else if (day <= 28) weeks[3].applied++;
      else weeks[4].applied++;
    });

    // Distribute interviews
    activeApps.forEach(app => {
      app.interviewDates.forEach(date => {
        if (date.startsWith(targetYearMonth)) {
          const day = parseInt(date.split('-')[2], 10);
          if (day <= 7) weeks[0].interview++;
          else if (day <= 14) weeks[1].interview++;
          else if (day <= 21) weeks[2].interview++;
          else if (day <= 28) weeks[3].interview++;
          else weeks[4].interview++;
        }
      });
    });

    return weeks;
  };

  const weeklyBreakdown = getWeeklyBreakdown();

  return (
    <div id="calendar-view" className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Calendar Grid */}
        <div className="xl:col-span-8 bg-white p-6 rounded-2xl border border-stone-200/60 bento-shadow space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-150">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-stone-900 text-base font-display">
                Kalender Aktivitas Lamaran & Wawancara
              </h3>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 transition-all cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-stone-800 text-sm font-sans min-w-[120px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 transition-all cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week headers */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {daysOfWeek.map((day, idx) => (
              <div 
                key={idx} 
                className={`text-xs font-bold uppercase tracking-wider py-1 ${
                  idx === 0 || idx === 6 ? 'text-rose-500 font-mono' : 'text-stone-400 font-mono'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 auto-rows-[90px]">
            {/* Empty days padding before 1st of month */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-stone-50/50 rounded-xl border border-dashed border-stone-150" />
            ))}

            {/* Real month days */}
            {Array.from({ length: daysCount }).map((_, idx) => {
              const dayNum = idx + 1;
              const appliedList = getApplicationsOnDay(currentYear, currentMonth, dayNum);
              const interviewList = getInterviewsOnDay(currentYear, currentMonth, dayNum);
              
              const hasApplied = appliedList.length > 0;
              const hasInterview = interviewList.length > 0;

              // Highlight July 13, 2026 as simulated current day
              const isTodaySimulated = currentYear === 2026 && currentMonth === 6 && dayNum === 13;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isTodaySimulated 
                      ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600/30 bento-shadow-md' 
                      : 'border-stone-150 hover:border-stone-250 bg-stone-50/30 shadow-sm'
                  }`}
                >
                  {/* Day number */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${
                      isTodaySimulated 
                        ? 'text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md font-mono' 
                        : 'text-stone-400 font-mono'
                    }`}>
                      {dayNum}
                    </span>
                    {isTodaySimulated && (
                      <span className="text-[8px] font-black text-teal-700 uppercase tracking-widest font-mono">Hari Ini</span>
                    )}
                  </div>

                  {/* Day events indicator */}
                  <div className="space-y-1">
                    {hasApplied && (
                      <div className="px-1.5 py-0.5 bg-teal-50 border border-teal-200 rounded text-[9px] font-extrabold text-teal-700 flex items-center justify-between font-mono">
                        <span>🚀 Applied</span>
                        <span className="font-black">{appliedList.length}</span>
                      </div>
                    )}
                    {hasInterview && (
                      <div className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[9px] font-extrabold text-amber-700 flex items-center justify-between font-mono">
                        <span>💬 Interview</span>
                        <span className="font-black">{interviewList.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Statistics Reports (Weekly & Monthly Metrics) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Monthly stats card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow space-y-4">
            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              Metrik Bulan Ini ({monthNames[currentMonth]})
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50/30 p-4 rounded-xl border border-teal-100/60 text-center">
                <Bookmark className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <div className="text-2xl font-black text-teal-700 font-mono">{totalAppliedThisMonth}</div>
                <div className="text-[9px] text-stone-500 font-bold uppercase tracking-wider font-mono mt-1">Total Apply</div>
              </div>

              <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100/60 text-center">
                <Users className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <div className="text-2xl font-black text-amber-700 font-mono">{totalInterviewsThisMonth}</div>
                <div className="text-[9px] text-stone-500 font-bold uppercase tracking-wider font-mono mt-1">Total Interview</div>
              </div>
            </div>
          </div>

          {/* Weekly Stats breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/60 bento-shadow space-y-4">
            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              Laporan Mingguan Bulan Ini
            </h4>

            <div className="space-y-4">
              {weeklyBreakdown.map((week, idx) => {
                const totalActivity = week.applied + week.interview;
                const maxVal = Math.max(...weeklyBreakdown.map(w => w.applied + w.interview)) || 1;
                const percentage = Math.round((totalActivity / maxVal) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-700 font-sans">{week.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono font-bold">
                        {week.applied} Apply • {week.interview} Interview
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="relative w-full h-2.5 bg-stone-50 border border-stone-100 rounded-full overflow-hidden flex">
                      {week.applied > 0 && (
                        <div 
                          className="bg-teal-650 h-full transition-all duration-500" 
                          style={{ width: `${(week.applied / (totalActivity || 1)) * percentage}%` }}
                          title={`${week.applied} Lamar`}
                        />
                      )}
                      {week.interview > 0 && (
                        <div 
                          className="bg-amber-500 h-full transition-all duration-500" 
                          style={{ width: `${(week.interview / (totalActivity || 1)) * percentage}%` }}
                          title={`${week.interview} Interview`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-stone-500 bg-stone-50 p-3.5 rounded-xl border border-stone-100 flex items-start gap-1.5 leading-relaxed font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>
                Bar teal menunjukkan rasio lamaran terkirim, bar oranye menunjukkan jadwal wawancara minggu terkait.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
