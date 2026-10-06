import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PrincipalDashboard({ selectedDate, setSelectedDate, onSelectSection }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState({});

  useEffect(() => {
    fetchPrincipalData();
  }, [selectedDate]);

  const fetchPrincipalData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/principal?date=${selectedDate}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching principal dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDeptExpand = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading College-Wide Intelligence Dashboard...</p>
      </div>
    );
  }

  const overall = data.overall;
  const highlights = data.highlights;
  const departments = data.departments || [];

  const chartData = departments.map(d => ({
    name: d.code,
    AttendancePct: d.overallPct,
    Present: d.presentCount,
    Absent: d.absentCount
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Executive View
            </span>
            <span className="text-xs text-slate-400">Live College Overview</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            College Attendance Intelligence
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time automated presence breakdown across all departments and sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={fetchPrincipalData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-2xl transition shadow-lg shadow-indigo-600/30"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total College Students */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Enrolled Students</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{overall.totalStudents}</span>
            <span className="text-xs font-medium text-slate-400">students</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Present Today */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Present Today</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{overall.presentCount}</span>
            <span className="text-xs font-semibold text-emerald-500">({overall.overallPct}%)</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${overall.overallPct}%` }} />
          </div>
        </div>

        {/* Absent Today */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-rose-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Absent Today</span>
            <UserX className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{overall.absentCount}</span>
            <span className="text-xs font-semibold text-rose-500">({(100 - overall.overallPct).toFixed(1)}%)</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${100 - overall.overallPct}%` }} />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">College Attendance Rate</span>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-300">{overall.overallPct}%</span>
            <span className="text-xs text-slate-400">Overall Target &ge;85%</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${overall.overallPct}%` }} />
          </div>
        </div>

      </div>

      {/* Highlights & Comparison Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Highlights */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Daily Department Highlights
          </h3>

          <div className="space-y-3">
            
            {/* Highest Attendance */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Highest Attendance</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {highlights.highestAttendanceDept?.code || 'N/A'}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-emerald-400">
                  {highlights.highestAttendanceDept?.pct}%
                </span>
                <p className="text-[10px] text-emerald-300">Attendance Rate</p>
              </div>
            </div>

            {/* Lowest Attendance */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">Lowest Attendance</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {highlights.lowestAttendanceDept?.code || 'N/A'}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-rose-400">
                  {highlights.lowestAttendanceDept?.pct}%
                </span>
                <p className="text-[10px] text-rose-300">Attendance Rate</p>
              </div>
            </div>

            {/* Highest Absence Count */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Most Absences</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {highlights.mostAbsentDept?.code || 'N/A'}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-amber-400">
                  {highlights.mostAbsentDept?.count}
                </span>
                <p className="text-[10px] text-amber-300">Students Absent</p>
              </div>
            </div>

          </div>
        </div>

        {/* Department Comparison Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-cyan-400" />
              Department Attendance Comparison (%)
            </h3>
            <span className="text-xs text-slate-400">{selectedDate}</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                />
                <Bar dataKey="AttendancePct" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.AttendancePct >= 90 ? '#10b981' : entry.AttendancePct >= 85 ? '#06b6d4' : '#f43f5e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* College-Wide Department Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          Department Breakdown & Gender Statistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {departments.map((dept) => {
            const isExpanded = expandedDepts[dept.id];

            return (
              <div
                key={dept.id}
                className="glass-card p-6 rounded-3xl hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {dept.code}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1.5">{dept.name}</h3>
                  </div>

                  <div className="text-right">
                    <span className={`text-2xl font-black ${
                      dept.overallPct >= 90 ? 'text-emerald-400' : dept.overallPct >= 85 ? 'text-cyan-300' : 'text-rose-400'
                    }`}>
                      {dept.overallPct}%
                    </span>
                    <p className="text-[10px] text-slate-400">Attendance</p>
                  </div>
                </div>

                {/* Overall Dept Counts */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Total</div>
                    <div className="text-sm font-bold text-white">{dept.totalStudents}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400">Present</div>
                    <div className="text-sm font-bold text-emerald-400">{dept.presentCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-400">Absent</div>
                    <div className="text-sm font-bold text-rose-400">{dept.absentCount}</div>
                  </div>
                </div>

                {/* Gender Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Boys Stats */}
                  <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-cyan-300">Boys</span>
                      <span className="font-bold text-cyan-400">{dept.boys.pct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Present: {dept.boys.present}</span>
                      <span>Absent: {dept.boys.absent}</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${dept.boys.pct}%` }} />
                    </div>
                  </div>

                  {/* Girls Stats */}
                  <div className="p-3 rounded-2xl bg-pink-950/20 border border-pink-500/20">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-pink-300">Girls</span>
                      <span className="font-bold text-pink-400">{dept.girls.pct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Present: {dept.girls.present}</span>
                      <span>Absent: {dept.girls.absent}</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-pink-400 h-full rounded-full" style={{ width: `${dept.girls.pct}%` }} />
                    </div>
                  </div>

                </div>

                {/* Footer Quick Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <button
                    onClick={() => toggleDeptExpand(dept.id)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {isExpanded ? 'Hide Sections' : 'View Section Details'}
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onSelectSection(dept.id, '2nd Year')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition flex items-center gap-1"
                  >
                    Manage Attendance <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
