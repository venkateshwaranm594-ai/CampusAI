import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Copy, 
  FileText, 
  RefreshCw, 
  Layers, 
  X, 
  UserX, 
  Quote, 
  Save,
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const THEMES = [
  { id: 'College Premium', name: 'College Premium', icon: '✨', bg: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-indigo-500/40' },
  { id: 'Modern Corporate', name: 'Modern Corporate', icon: '🏢', bg: 'bg-slate-900 text-white border-slate-700' },
  { id: 'Minimal Academic', name: 'Minimal Academic', icon: '🎓', bg: 'bg-zinc-950 text-zinc-100 border-zinc-800' },
  { id: 'Dark AI Neon', name: 'Dark AI Neon', icon: '⚡', bg: 'bg-[#060812] text-cyan-100 border-cyan-500/40 glow-cyan' },
  { id: 'Festival Special', name: 'Festival / Special Day', icon: '🎉', bg: 'bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 text-amber-100 border-purple-500/50' }
];

export default function FlyerStudio({
  isOpen,
  onClose,
  settings,
  department,
  year,
  section,
  date,
  attendanceData,
  showToast
}) {
  const [selectedTheme, setSelectedTheme] = useState('College Premium');
  const [currentQuote, setCurrentQuote] = useState({ quote: "Every day is a new opportunity to learn.", author: "CampusPulse AI" });
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignedAdviser, setAssignedAdviser] = useState(null);
  const flyerRef = useRef(null);

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  useEffect(() => {
    if (department && section) {
      fetchAssignedAdviser();
    }
  }, [department, section]);

  const fetchAssignedAdviser = async () => {
    try {
      const res = await fetch(`/api/advisers?department_id=${department.id}&year=${year}&section_id=${section.id}`);
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setAssignedAdviser(json[0]);
      } else {
        setAssignedAdviser(null);
      }
    } catch (err) {
      console.error('Failed to fetch adviser for flyer:', err);
    }
  };

  const fetchRandomQuote = async () => {
    try {
      const res = await fetch('/api/quotes/random');
      const json = await res.json();
      if (json && json.quote) {
        setCurrentQuote(json);
      }
    } catch (err) {
      console.error('Failed to fetch quote:', err);
    }
  };

  if (!isOpen) return null;

  const stats = attendanceData?.statistics || {
    totalStudents: 0, presentCount: 0, absentCount: 0, overallPct: 0,
    boys: { total: 0, present: 0, absent: 0, pct: 0 },
    girls: { total: 0, present: 0, absent: 0, pct: 0 },
    absentList: []
  };

  const absentStudents = stats.absentList || [];
  const pageSize = 12;
  const totalPages = Math.ceil(absentStudents.length / pageSize) || 1;

  const displayedAbsentees = absentStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const adviserName = assignedAdviser?.name || section?.adviser_name || 'Class Adviser';
  const adviserPhoto = assignedAdviser?.photo_url || '';

  const handleDownloadPNG = async () => {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0b0f19'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `CampusPulse_Absence_Flyer_${department?.code}_${date}.png`;
      link.href = dataUrl;
      link.click();
      showToast('🎉 Flyer downloaded as high-res PNG!');
    } catch (err) {
      console.error('PNG export failed:', err);
      showToast('❌ Failed to export PNG image.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadJPG = async () => {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0b0f19'
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `CampusPulse_Absence_Flyer_${department?.code}_${date}.jpg`;
      link.href = dataUrl;
      link.click();
      showToast('🎉 Flyer downloaded as high-quality JPG!');
    } catch (err) {
      console.error('JPG export failed:', err);
      showToast('❌ Failed to export JPG image.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CampusPulse_Absence_Flyer_${department?.code}_${date}.pdf`);
      showToast('📄 Flyer exported as PDF document!');
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('❌ Failed to export PDF document.');
    } finally {
      setExporting(false);
    }
  };

  const handleSaveToHistory = async () => {
    try {
      const payload = {
        department_id: department?.id,
        year,
        section_id: section?.id,
        date,
        theme: selectedTheme,
        flyer_data: {
          college_name: settings?.college_name || 'College Attendance Notice',
          department_code: department?.code,
          year,
          section_name: section?.section_name,
          adviser_name: adviserName,
          adviser_photo: adviserPhoto,
          stats,
          quote: currentQuote,
          absent_count: absentStudents.length
        },
        created_by: adviserName
      };

      const res = await fetch('/api/flyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('💾 Flyer saved to history!');
      } else {
        showToast('❌ Failed to save flyer to history.');
      }
    } catch (err) {
      console.error('Failed to save flyer history:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📢 *${settings?.college_name || 'COLLEGE ATTENDANCE NOTICE'}*\n` +
      `📅 Date: ${date}\n` +
      `🏫 Dept: ${department?.code} (${year} - ${section?.section_name})\n` +
      `👤 Adviser: ${adviserName}\n` +
      `✅ Present: ${stats.presentCount} (${stats.overallPct}%)\n` +
      `❌ Absent Count: ${stats.absentCount}\n\n` +
      `*Absent Students List:*\n` +
      absentStudents.map((s, idx) => `${idx + 1}. ${s.name} (${s.roll_no}) - Reason: ${s.reason}`).join('\n') +
      `\n\n💬 Quote: "${currentQuote.quote}"`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const activeThemeObj = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Studio Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Automated AI Absence Flyer Studio
              </h2>
              <p className="text-xs text-slate-400">
                {department?.code} • {year} {section?.section_name} • {date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToHistory}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              Save History
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Toolbar (Theme Selection & Export Buttons) */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          
          {/* Theme Selector */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Theme:
            </span>
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedTheme === theme.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{theme.icon}</span>
                <span>{theme.name}</span>
              </button>
            ))}
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRandomQuote}
              className="p-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Change Motivational Quote"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> PNG
            </button>

            <button
              onClick={handleDownloadJPG}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" /> JPG
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

        </div>

        {/* Live Canvas Scroll Container */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center bg-[#07090e]">
          
          {totalPages > 1 && (
            <div className="mb-4 flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-300">
              <span>Flyer Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-2 py-0.5 bg-slate-800 rounded disabled:opacity-40"
              >
                &larr; Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-2 py-0.5 bg-slate-800 rounded disabled:opacity-40"
              >
                Next &rarr;
              </button>
            </div>
          )}

          {/* FLYER PREVIEW CONTAINER */}
          <div
            ref={flyerRef}
            className={`w-full max-w-2xl rounded-3xl border-2 p-8 shadow-2xl transition-all ${activeThemeObj.bg}`}
          >
            
            {/* TOP HEADER */}
            <div className="text-center space-y-3 pb-6 border-b border-white/10">
              
              <div className="flex items-center justify-center gap-3">
                {settings?.college_logo ? (
                  <img src={settings.college_logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover shadow-md border border-white/20" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                    CP
                  </div>
                )}
                <div className="text-left">
                  <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">
                    {settings?.college_name || "COLLEGE ATTENDANCE NOTICE"}
                  </h1>
                  <p className="text-[11px] text-indigo-300 font-medium tracking-wide">
                    {settings?.address || "Official Daily Attendance Record"}
                  </p>
                </div>
              </div>

              {/* Department & Section Banner */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  DEPARTMENT OF {department?.name || 'AI & DS'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  {year} • {section?.section_name}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  📅 {date}
                </span>
              </div>

            </div>

            {/* MAIN ATTENDANCE STATS BANNER */}
            <div className="my-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-center font-bold text-xs uppercase tracking-widest text-indigo-300 mb-3">
                DAILY ATTENDANCE SUMMARY
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">PRESENT</span>
                  <div className="text-xl font-black text-emerald-400">{stats.presentCount}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30">
                  <span className="text-[10px] uppercase font-bold text-rose-300">ABSENT</span>
                  <div className="text-xl font-black text-rose-400">{stats.absentCount}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30">
                  <span className="text-[10px] uppercase font-bold text-cyan-300">ATTENDANCE %</span>
                  <div className="text-xl font-black text-cyan-300">{stats.overallPct}%</div>
                </div>
              </div>

              {/* Gender Pills */}
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-around text-xs font-semibold text-slate-300">
                <span>Boys: <strong className="text-cyan-300">{stats.boys.present} P</strong> / <strong className="text-rose-400">{stats.boys.absent} A</strong> ({stats.boys.pct}%)</span>
                <span>Girls: <strong className="text-pink-300">{stats.girls.present} P</strong> / <strong className="text-rose-400">{stats.girls.absent} A</strong> ({stats.girls.pct}%)</span>
              </div>
            </div>

            {/* ABSENT STUDENTS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-rose-400 flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  ABSENT STUDENTS ROSTER ({absentStudents.length})
                </h3>
                <span className="text-[10px] text-slate-400">Official Daily Record</span>
              </div>

              {displayedAbsentees.length === 0 ? (
                <div className="text-center py-8 text-sm font-semibold text-emerald-400 bg-emerald-950/20 rounded-2xl border border-emerald-500/30">
                  🎉 ALL STUDENTS ARE PRESENT TODAY! ZERO ABSENCES.
                </div>
              ) : (
                <div className={`grid gap-3.5 ${
                  displayedAbsentees.length <= 3 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
                }`}>
                  {displayedAbsentees.map((student) => (
                    <div
                      key={student.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md hover:bg-white/10 transition"
                    >
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-rose-500/40 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-rose-950 text-rose-200 font-black text-lg flex items-center justify-center border-2 border-rose-500/40 shrink-0">
                          {student.name.charAt(0)}
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{student.name}</h4>
                        <div className="text-[10px] font-mono text-indigo-300">{student.roll_no}</div>
                        <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/30 text-rose-200 border border-rose-400/30 truncate">
                          {student.reason} {student.custom_reason ? `(${student.custom_reason})` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTTOM FOOTER & ADVISER SIGN-OFF WITH PHOTO */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {adviserPhoto ? (
                    <img src={adviserPhoto} alt={adviserName} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-400 shrink-0 shadow" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm border-2 border-indigo-400 shrink-0">
                      {adviserName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Adviser</span>
                    <span className="font-extrabold text-white text-sm">{adviserName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Engine</span>
                  <span className="font-mono text-cyan-300 text-xs font-bold">CampusPulse AI</span>
                </div>
              </div>

              {/* Dynamic Motivational Quote */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center">
                <Quote className="w-4 h-4 text-cyan-400 mx-auto mb-1 opacity-80" />
                <p className="text-xs italic font-medium text-indigo-100">
                  "{currentQuote.quote}"
                </p>
                <span className="text-[10px] font-bold text-cyan-400 mt-1 block">
                  — {currentQuote.author || 'CampusPulse AI'}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
