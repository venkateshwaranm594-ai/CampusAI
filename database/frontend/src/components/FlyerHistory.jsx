import React, { useState, useEffect } from 'react';
import { History, Calendar, Eye, Download, Search, Filter, Sparkles, Building2 } from 'lucide-react';

export default function FlyerHistory({ departments, sections, showToast }) {
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedFlyer, setSelectedFlyer] = useState(null);

  useEffect(() => {
    fetchFlyers();
  }, [selectedDeptId]);

  const fetchFlyers = async () => {
    setLoading(true);
    try {
      let url = '/api/flyers';
      if (selectedDeptId) url += `?department_id=${selectedDeptId}`;
      const res = await fetch(url);
      const json = await res.json();
      setFlyers(json || []);
    } catch (err) {
      console.error('Failed to fetch flyer history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-400" />
            Smart Flyer History Archive
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse, reopen, and download past generated daily absence flyers across all college departments.
          </p>
        </div>

        {/* Dept Filter */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer font-semibold"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Archived Flyers */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading flyer history archive...</div>
      ) : flyers.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white">No Generated Flyers Found in Archive</h3>
          <p className="text-xs text-slate-400">
            Generate your first daily absence flyer from the Staff Attendance tab to archive it here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flyers.map(f => {
            const data = f.flyer_data || {};
            const stats = data.stats || {};

            return (
              <div
                key={f.id}
                className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {data.department_code || 'DEPT'}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {f.date}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white">
                    {data.year} • {data.section_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adviser: {data.adviser_name || f.created_by}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-semibold">Present</span>
                      <span className="font-bold text-white">{stats.presentCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-400 block font-semibold">Absent</span>
                      <span className="font-bold text-white">{data.absent_count || stats.absentCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 block font-semibold">Rate</span>
                      <span className="font-bold text-cyan-300">{stats.overallPct || 0}%</span>
                    </div>
                  </div>

                  {data.quote && (
                    <p className="mt-3 text-[11px] italic text-indigo-200/80 line-clamp-2 bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/20">
                      "{data.quote.quote}"
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">Theme: {f.theme || 'College Premium'}</span>
                  <button
                    onClick={() => setSelectedFlyer(f)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <Eye className="w-3.5 h-3.5" /> Reopen Flyer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Preview for Reopened Flyer */}
      {selectedFlyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Archived Flyer Snapshot</h3>
              <button onClick={() => setSelectedFlyer(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong>Department:</strong> {selectedFlyer.flyer_data?.department_code}</p>
              <p><strong>Year & Section:</strong> {selectedFlyer.flyer_data?.year} - {selectedFlyer.flyer_data?.section_name}</p>
              <p><strong>Date:</strong> {selectedFlyer.date}</p>
              <p><strong>Absentees Count:</strong> {selectedFlyer.flyer_data?.absent_count}</p>
              <p><strong>Class Adviser:</strong> {selectedFlyer.flyer_data?.adviser_name}</p>
              <p><strong>Quote Used:</strong> "{selectedFlyer.flyer_data?.quote?.quote}"</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedFlyer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
