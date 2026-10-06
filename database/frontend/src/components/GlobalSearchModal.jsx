import React, { useState, useEffect } from 'react';
import { Search, X, User, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, departments, sections, onSelectStudent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/students?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Failed to search students:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search Bar Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name, roll number (e.g. 22AD101), or register number..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400">
              Searching college database...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching student records found for "{query}".
            </div>
          )}

          {!query && (
            <div className="text-center py-8 text-xs text-slate-500">
              Type student name, roll number, or register number to quickly locate records.
            </div>
          )}

          {results.map((stu) => {
            const dept = departments.find(d => d.id === stu.department_id);
            const sec = sections.find(s => s.id === stu.section_id);

            return (
              <div
                key={stu.id}
                onClick={() => {
                  onSelectStudent(stu);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-indigo-900/30 border border-slate-700/50 hover:border-indigo-500/50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  {stu.photo_url ? (
                    <img src={stu.photo_url} alt={stu.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-700 text-indigo-300 font-bold text-sm">
                      {stu.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      {stu.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {stu.roll_no}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {dept?.code || 'Dept'} • {stu.year} • {sec?.section_name || 'Section'} • Reg: {stu.register_no}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    stu.gender === 'Female' ? 'bg-pink-500/20 text-pink-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {stu.gender}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
