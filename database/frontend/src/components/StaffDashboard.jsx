import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  UserX, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Save, 
  Calendar, 
  Search, 
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

const REASON_OPTIONS = [
  'Fever',
  'Medical',
  'Personal Issues',
  'On Duty',
  'Family Reason',
  'Emergency',
  'Other'
];

export default function StaffDashboard({
  departments,
  sections,
  selectedDeptId,
  setSelectedDeptId,
  selectedYear,
  setSelectedYear,
  selectedSectionId,
  setSelectedSectionId,
  selectedDate,
  setSelectedDate,
  onGenerateFlyer,
  showToast
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentsState, setStudentsState] = useState([]);
  const [hasExistingRecords, setHasExistingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [flyerGenStep, setFlyerGenStep] = useState(0);

  // Available sections for current department and year
  const availableSections = sections.filter(s => 
    s.department_id === selectedDeptId && s.year === selectedYear
  );

  useEffect(() => {
    if (selectedDeptId && selectedSectionId && selectedDate) {
      fetchAttendanceData();
    }
  }, [selectedDeptId, selectedYear, selectedSectionId, selectedDate]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}&department_id=${selectedDeptId}&year=${selectedYear}&section_id=${selectedSectionId}`);
      const json = await res.json();
      setData(json);
      setStudentsState(json.students || []);
      setHasExistingRecords(Boolean(json.hasExistingRecords));
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    setStudentsState(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          attendance_status: nextStatus,
          reason: nextStatus === 'ABSENT' ? (s.reason || 'Personal Issues') : ''
        };
      }
      return s;
    }));
  };

  const handleReasonChange = (studentId, reason, customReason = '') => {
    setStudentsState(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          reason,
          custom_reason: customReason !== undefined ? customReason : s.custom_reason
        };
      }
      return s;
    }));
  };

  const handleMarkAll = (status) => {
    setStudentsState(prev => prev.map(s => ({
      ...s,
      attendance_status: status,
      reason: status === 'ABSENT' ? (s.reason || 'Personal Issues') : ''
    })));
  };

  const handleSaveAttendance = async () => {
    if (studentsState.length === 0) return showToast('⚠️ No students available in this section.');
    setSaving(true);
    try {
      const payload = studentsState.map(s => ({
        student_id: s.id,
        date: selectedDate,
        status: s.attendance_status,
        reason: s.attendance_status === 'ABSENT' ? s.reason : null,
        custom_reason: s.attendance_status === 'ABSENT' ? s.custom_reason : ''
      }));

      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: payload, marked_by: 'Staff Adviser' })
      });

      if (res.ok) {
        const presentCount = studentsState.filter(s => s.attendance_status === 'PRESENT').length;
        const absentCount = studentsState.filter(s => s.attendance_status === 'ABSENT').length;
        
        showToast(`✓ Attendance saved successfully for ${selectedDate} (${currentDept?.code || ''} ${selectedYear} ${currentSec?.section_name || ''} | Present: ${presentCount}, Absent: ${absentCount})`);
        fetchAttendanceData();
      } else {
        showToast('❌ Failed to save attendance.');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      showToast('❌ Error saving attendance to database.');
    } finally {
      setSaving(false);
    }
  };

  // Cinematic Flyer Generation Trigger
  const handleStartCinematicFlyerGen = () => {
    if (studentsState.length === 0) return showToast('⚠️ Select a valid section with students first.');
    setIsGeneratingFlyer(true);
    setFlyerGenStep(1);

    setTimeout(() => setFlyerGenStep(2), 400);
    setTimeout(() => setFlyerGenStep(3), 800);
    setTimeout(() => {
      setIsGeneratingFlyer(false);
      onGenerateFlyer(data);
    }, 1200);
  };

  const currentDept = departments.find(d => d.id === selectedDeptId);
  const currentSec = sections.find(s => s.id === selectedSectionId);

  const filteredStudents = studentsState.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.roll_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = data?.statistics || {
    totalStudents: 0, presentCount: 0, absentCount: 0, overallPct: 0,
    boys: { total: 0, present: 0, absent: 0, pct: 0 },
    girls: { total: 0, present: 0, absent: 0, pct: 0 }
  };

  const isBelowThreshold = stats.overallPct < 85;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Controls: Dept, Year, Section, Date */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              Daily Class Attendance Portal
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Select department, year, section, and date to manage daily attendance.
            </p>
          </div>

          {/* Glowing AI Flyer Trigger Button */}
          <button
            onClick={handleStartCinematicFlyerGen}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            ✨ Generate Today's AI Flyer
          </button>
        </div>

        {/* Dynamic Class & Date Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          
          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                const matchSec = sections.find(s => s.department_id === e.target.value);
                if (matchSec) setSelectedSectionId(matchSec.id);
                else setSelectedSectionId('');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {departments.length === 0 ? (
                <option value="">No departments added</option>
              ) : (
                departments.map(d => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          {/* Dynamic Section (NO Hard-coded defaults) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {availableSections.length > 0 ? (
                availableSections.map(s => (
                  <option key={s.id} value={s.id}>{s.section_name} (Adviser: {s.adviser_name})</option>
                ))
              ) : (
                <option value="">No Sections Added — Please Add Section in Admin</option>
              )}
            </select>
          </div>

          {/* Selected Date Picker (User Selected Date) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Attendance Date</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-indigo-500/40 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-100">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent w-full text-slate-100 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Section Summary & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              {currentDept?.code || 'Dept'} • {selectedYear} • {currentSec?.section_name || 'Section'} Summary
            </h3>
            <span className="text-xs font-bold text-indigo-300">
              Date: {selectedDate}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
              <div className="text-xl font-extrabold text-white mt-1">{stats.totalStudents}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Present</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">{stats.presentCount}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400">Absent</span>
              <div className="text-xl font-extrabold text-rose-400 mt-1">{stats.absentCount}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-[10px] uppercase font-bold text-indigo-300">Attendance Rate</span>
              <div className="text-xl font-extrabold text-indigo-300 mt-1">{stats.overallPct}%</div>
            </div>
          </div>

          {/* Gender Breakdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300">Boys Attendance</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Present: <strong className="text-cyan-400">{stats.boys.present} P</strong> / Absent: <strong className="text-rose-400">{stats.boys.absent} A</strong> ({stats.boys.pct}%)
                </p>
              </div>
              <span className="text-lg font-extrabold text-cyan-400">{stats.boys.pct}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-950/20 border border-pink-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-pink-300">Girls Attendance</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Present: <strong className="text-pink-400">{stats.girls.present} P</strong> / Absent: <strong className="text-rose-400">{stats.girls.absent} A</strong> ({stats.girls.pct}%)
                </p>
              </div>
              <span className="text-lg font-extrabold text-pink-400">{stats.girls.pct}%</span>
            </div>
          </div>
        </div>

        {/* AI Insight & Alert Box */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
              <h3 className="text-sm font-bold text-white">Smart AI Attendance Insight</h3>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {stats.absentCount === 0 ? (
                `✨ Outstanding! ${currentDept?.code || 'Class'} ${selectedYear} ${currentSec?.section_name || ''} recorded 100% attendance on ${selectedDate} with zero absences!`
              ) : (
                `🤖 AI Insight: ${currentDept?.code || 'Class'} ${selectedYear} ${currentSec?.section_name || ''} recorded ${stats.overallPct}% attendance on ${selectedDate}. ${stats.absentCount} students absent.`
              )}
            </p>
          </div>

          {isBelowThreshold && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold">Attendance Alert</h4>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Class attendance ({stats.overallPct}%) is below configured 85% threshold.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Attendance Sheet */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                Interactive Attendance Sheet
              </h3>
              {hasExistingRecords && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Saved Records Loaded
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select date ({selectedDate}) & toggle Present/Absent for each student.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name/roll..."
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
            </select>

            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-2 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-2 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition"
            >
              Mark All Absent
            </button>

            {/* Save / Update Attendance Button */}
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : hasExistingRecords ? 'Update Attendance' : 'Save Attendance'}
            </button>

          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4 text-center">Attendance Status</th>
                <th className="py-3.5 px-4">Absence Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    Loading student roster for {selectedDate}...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    No students enrolled in this section yet. Add students in Admin Data Center.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isPresent = student.attendance_status === 'PRESENT';

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-900/40 transition ${
                        !isPresent ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.photo_url ? (
                            <img 
                              src={student.photo_url} 
                              alt={student.name} 
                              className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center border border-indigo-700">
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-100">{student.name}</div>
                            <div className="text-[10px] text-slate-400">Reg: {student.register_no}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                        {student.roll_no}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          student.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {student.gender}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(student.id, student.attendance_status)}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                            isPresent 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>PRESENT</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span>ABSENT</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        {!isPresent ? (
                          <div className="space-y-1.5">
                            <select
                              value={student.reason || 'Personal Issues'}
                              onChange={(e) => handleReasonChange(student.id, e.target.value)}
                              className="bg-slate-950 border border-rose-500/40 text-xs text-rose-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-400 w-full"
                            >
                              {REASON_OPTIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>

                            {student.reason === 'Other' && (
                              <input
                                type="text"
                                value={student.custom_reason || ''}
                                onChange={(e) => handleReasonChange(student.id, 'Other', e.target.value)}
                                placeholder="Enter specific reason..."
                                className="bg-slate-950 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-indigo-500"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-medium">— Present —</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Cinematic Flyer Generation Modal Overlay */}
      {isGeneratingFlyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center mx-auto text-cyan-300">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-base font-extrabold text-white">Generating AI Absence Flyer</h3>

            <div className="text-xs text-indigo-300 space-y-2 font-mono">
              <p className={flyerGenStep >= 1 ? 'opacity-100 text-cyan-300' : 'opacity-40'}>
                ✓ Fetching DB Records for {selectedDate}...
              </p>
              <p className={flyerGenStep >= 2 ? 'opacity-100 text-purple-300' : 'opacity-40'}>
                ✓ Assembling Student Photos & Reasons...
              </p>
              <p className={flyerGenStep >= 3 ? 'opacity-100 text-emerald-300 font-bold' : 'opacity-40'}>
                ✓ Rendering Flyer Theme Layout...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
