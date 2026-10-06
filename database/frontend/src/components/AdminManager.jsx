import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Quote, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Check, 
  Save, 
  Layers,
  Sparkles,
  UserCheck,
  Search,
  Database,
  FileText,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminManager({ 
  departments, 
  sections, 
  students, 
  settings, 
  onRefreshData, 
  showToast 
}) {
  const [activeSubTab, setActiveSubTab] = useState('data-center'); 
  // 'data-center', 'college', 'depts', 'sections', 'advisers', 'students', 'attendance-history'

  const [advisers, setAdvisers] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [historyStudents, setHistoryStudents] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // College Setup State & Search Auto-Suggestions
  const [collegeForm, setCollegeForm] = useState(settings || {});
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [collegeLogoUploading, setCollegeLogoUploading] = useState(false);
  const [collegeLogoPreview, setCollegeLogoPreview] = useState(settings?.college_logo || '');

  // Department Form
  const [deptForm, setDeptForm] = useState({ id: '', code: '', name: '', hod_name: '', department_logo: '', description: '' });
  const [deptLogoUploading, setDeptLogoUploading] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);

  // Section Form
  const [secForm, setSecForm] = useState({ id: '', department_id: '', year: '2nd Year', section_name: '', academic_year: '2026-2027', adviser_name: '', adviser_email: '' });
  const [editingSecId, setEditingSecId] = useState(null);

  // Adviser Form
  const [adviserForm, setAdviserForm] = useState({ id: '', name: '', department_id: '', year: '2nd Year', section_id: '', photo_url: '', email: '', phone: '' });
  const [adviserPhotoUploading, setAdviserPhotoUploading] = useState(false);
  const [adviserPhotoPreview, setAdviserPhotoPreview] = useState('');
  const [editingAdviserId, setEditingAdviserId] = useState(null);

  // Student Form
  const [stuForm, setStuForm] = useState({ id: '', name: '', roll_no: '', register_no: '', gender: 'Male', department_id: '', year: '2nd Year', section_id: '', photo_url: '' });
  const [stuPhotoUploading, setStuPhotoUploading] = useState(false);
  const [stuPhotoPreview, setStuPhotoPreview] = useState('');
  const [editingStuId, setEditingStuId] = useState(null);

  useEffect(() => {
    if (settings) {
      setCollegeForm(settings);
      setCollegeLogoPreview(settings.college_logo || '');
      setCollegeSearchQuery(settings.college_name || '');
    }
  }, [settings]);

  useEffect(() => {
    fetchAdvisers();
    fetchAttendanceHistory();
  }, []);

  const fetchAdvisers = async () => {
    try {
      const res = await fetch('/api/advisers');
      const json = await res.json();
      setAdvisers(json || []);
    } catch (err) {
      console.error('Failed to fetch advisers:', err);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await fetch('/api/attendance/history');
      const json = await res.json();
      setAttendanceHistory(json || []);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    }
  };

  const handleCollegeQueryChange = async (val) => {
    setCollegeSearchQuery(val);
    setCollegeForm(prev => ({ ...prev, college_name: val }));
    if (!val || val.trim().length < 1) {
      setCollegeSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/colleges/suggestions?q=${encodeURIComponent(val)}`);
      const json = await res.json();
      setCollegeSuggestions(json || []);
    } catch (err) {
      console.error('Failed to fetch college suggestions:', err);
    }
  };

  const handleSelectCollegeSuggestion = (sug) => {
    setCollegeForm(prev => ({
      ...prev,
      college_name: sug.name,
      address: `${sug.city}, ${sug.state}`,
      college_logo: sug.logo || prev.college_logo
    }));
    if (sug.logo) setCollegeLogoPreview(sug.logo);
    setCollegeSearchQuery(sug.name);
    setCollegeSuggestions([]);
  };

  const handleCollegeLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCollegeLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/college/upload-logo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.logo_url) {
        setCollegeForm(prev => ({ ...prev, college_logo: data.logo_url }));
        setCollegeLogoPreview(data.logo_url);
        showToast('✓ College logo uploaded successfully');
      }
    } catch (err) {
      showToast('❌ College logo upload failed.');
    } finally {
      setCollegeLogoUploading(false);
    }
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collegeForm)
      });
      if (res.ok) {
        showToast('✓ College information saved successfully');
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Failed to save college details.');
    }
  };

  // Department CRUD
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.code || !deptForm.name) return showToast('⚠️ Dept Code & Name required!');
    try {
      const method = editingDeptId ? 'PUT' : 'POST';
      const url = editingDeptId ? `/api/departments/${editingDeptId}` : '/api/departments';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm)
      });
      if (res.ok) {
        showToast(editingDeptId ? '✓ Department updated successfully' : '✓ Department added successfully');
        setDeptForm({ id: '', code: '', name: '', hod_name: '', department_logo: '', description: '' });
        setEditingDeptId(null);
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Failed to save department.');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Department deleted successfully');
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Delete failed.');
    }
  };

  // Section CRUD
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!secForm.department_id || !secForm.section_name || !secForm.year) {
      return showToast('⚠️ Department, Year, and Section Name required!');
    }
    try {
      const method = editingSecId ? 'PUT' : 'POST';
      const url = editingSecId ? `/api/sections/${editingSecId}` : '/api/sections';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secForm)
      });
      if (res.ok) {
        showToast(editingSecId ? '✓ Section updated successfully' : '✓ Section added successfully');
        setSecForm({ id: '', department_id: '', year: '2nd Year', section_name: '', academic_year: '2026-2027', adviser_name: '', adviser_email: '' });
        setEditingSecId(null);
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Failed to save section.');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete/deactivate this section?')) return;
    try {
      const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Section deleted successfully');
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Delete failed.');
    }
  };

  // Adviser CRUD
  const handleAdviserPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAdviserPhotoUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('/api/advisers/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.photo_url) {
        setAdviserForm(prev => ({ ...prev, photo_url: data.photo_url }));
        setAdviserPhotoPreview(data.photo_url);
        showToast('✓ Adviser photo uploaded successfully');
      }
    } catch (err) {
      showToast('❌ Adviser photo upload failed.');
    } finally {
      setAdviserPhotoUploading(false);
    }
  };

  const handleSaveAdviser = async (e) => {
    e.preventDefault();
    if (!adviserForm.name || !adviserForm.department_id || !adviserForm.section_id) {
      return showToast('⚠️ Adviser Name, Department & Section required!');
    }
    try {
      const method = editingAdviserId ? 'PUT' : 'POST';
      const url = editingAdviserId ? `/api/advisers/${editingAdviserId}` : '/api/advisers';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adviserForm)
      });
      if (res.ok) {
        showToast(editingAdviserId ? '✓ Adviser updated successfully' : '✓ Adviser saved successfully');
        setAdviserForm({ id: '', name: '', department_id: '', year: '2nd Year', section_id: '', photo_url: '', email: '', phone: '' });
        setAdviserPhotoPreview('');
        setEditingAdviserId(null);
        fetchAdvisers();
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Failed to save adviser.');
    }
  };

  const handleDeleteAdviser = async (id) => {
    if (!confirm('Are you sure you want to delete this adviser?')) return;
    try {
      const res = await fetch(`/api/advisers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Adviser deleted successfully');
        fetchAdvisers();
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Delete failed.');
    }
  };

  // Student CRUD
  const handleStudentPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStuPhotoUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('/api/students/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.photo_url) {
        setStuForm(prev => ({ ...prev, photo_url: data.photo_url }));
        setStuPhotoPreview(data.photo_url);
        showToast('✓ Student photo uploaded successfully');
      }
    } catch (err) {
      showToast('❌ Student photo upload failed.');
    } finally {
      setStuPhotoUploading(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!stuForm.name || !stuForm.roll_no || !stuForm.department_id || !stuForm.section_id) {
      return showToast('⚠️ Student Name, Roll No, Department & Section required!');
    }
    try {
      const method = editingStuId ? 'PUT' : 'POST';
      const url = editingStuId ? `/api/students/${editingStuId}` : '/api/students';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stuForm)
      });
      if (res.ok) {
        showToast(editingStuId ? '✓ Student updated successfully' : '✓ Student saved successfully');
        setStuForm({ id: '', name: '', roll_no: '', register_no: '', gender: 'Male', department_id: '', year: '2nd Year', section_id: '', photo_url: '' });
        setStuPhotoPreview('');
        setEditingStuId(null);
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Failed to save student.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Student record deleted');
        onRefreshData();
      }
    } catch (err) {
      showToast('❌ Delete failed.');
    }
  };

  // View Attendance Details Modal Handler
  const handleViewAttendanceDetails = async (item) => {
    setSelectedHistoryItem(item);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${item.date}&department_id=${item.department_id}&year=${item.year}&section_id=${item.section_id}`);
      const json = await res.json();
      setHistoryStudents(json.students || []);
    } catch (err) {
      console.error('Failed to fetch attendance history details:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-cyan-400" />
            Admin Data Center & Storage Portal
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage college setup, dynamic departments, sections, advisers, students, photos & persistent attendance records.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'data-center', name: 'Overview', icon: Database },
            { id: 'college', name: 'College Setup', icon: Settings },
            { id: 'depts', name: '+ Add Dept', icon: Building2 },
            { id: 'sections', name: '+ Add Section', icon: Layers },
            { id: 'advisers', name: '+ Add Adviser', icon: UserCheck },
            { id: 'students', name: '+ Add Student', icon: Users },
            { id: 'attendance-history', name: 'Attendance Records', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeSubTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. OVERVIEW DATA CENTER */}
      {activeSubTab === 'data-center' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card p-6 rounded-3xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">College Profile</span>
              <div className="text-lg font-extrabold text-white truncate">
                {settings?.college_name || "No College Setup"}
              </div>
              <p className="text-xs text-slate-400">{settings?.address || 'Address not configured'}</p>
              <button onClick={() => setActiveSubTab('college')} className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300">
                [Edit College Setup &rarr;]
              </button>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Departments</span>
              <div className="text-2xl font-extrabold text-cyan-400">{departments.length}</div>
              <p className="text-xs text-slate-400">Dynamic departments stored</p>
              <button onClick={() => setActiveSubTab('depts')} className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300">
                [+ Add Department &rarr;]
              </button>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Sections</span>
              <div className="text-2xl font-extrabold text-purple-400">{sections.length}</div>
              <p className="text-xs text-slate-400">Dynamic sections created</p>
              <button onClick={() => setActiveSubTab('sections')} className="mt-2 text-xs font-bold text-purple-400 hover:text-purple-300">
                [+ Add Section &rarr;]
              </button>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled Students</span>
              <div className="text-2xl font-extrabold text-emerald-400">{students.length}</div>
              <p className="text-xs text-slate-400">Students with photos</p>
              <button onClick={() => setActiveSubTab('students')} className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                [+ Add Student &rarr;]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. COLLEGE SETUP */}
      {activeSubTab === 'college' && (
        <div className="max-w-3xl glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> College Setup & Branding
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Search college name or enter manually. Upload official logo to render across dashboards & flyers.
            </p>
          </div>

          <form onSubmit={handleSaveCollege} className="space-y-4 text-xs">
            <div className="relative">
              <label className="block font-bold text-slate-300 mb-1.5">
                Search College Name (Type e.g. "Erode", "E", "PSG", "Anna")
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={collegeSearchQuery}
                  onChange={(e) => handleCollegeQueryChange(e.target.value)}
                  placeholder="Start typing college name..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {collegeSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase text-indigo-400 px-2 py-1">Matching Colleges</div>
                  {collegeSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCollegeSuggestion(sug)}
                      className="p-2 rounded-lg hover:bg-indigo-600/30 cursor-pointer flex items-center justify-between text-xs text-slate-200"
                    >
                      <span className="font-bold">{sug.name}</span>
                      <span className="text-[10px] text-slate-400">{sug.city}, {sug.state}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="block font-bold text-slate-300">Upload Official College Logo</label>
              <div className="flex items-center gap-4">
                {collegeLogoPreview ? (
                  <img src={collegeLogoPreview} alt="College Logo Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                    No Logo
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCollegeLogoUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                  />
                  {collegeLogoUploading && <span className="text-[10px] text-cyan-400 font-bold block mt-1">Uploading logo...</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={collegeForm.tag_line || ''}
                  onChange={(e) => setCollegeForm(prev => ({ ...prev, tag_line: e.target.value }))}
                  placeholder="Turn Attendance Into Insight."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Principal Name</label>
                <input
                  type="text"
                  value={collegeForm.principal_name || ''}
                  onChange={(e) => setCollegeForm(prev => ({ ...prev, principal_name: e.target.value }))}
                  placeholder="Dr. V. Venkatachalam, Ph.D."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Full Address</label>
              <input
                type="text"
                value={collegeForm.address || ''}
                onChange={(e) => setCollegeForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Thudupathi, Erode - 638057"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg transition"
            >
              Save College Setup
            </button>
          </form>
        </div>
      )}

      {/* 3. DYNAMIC SECTIONS MANAGER (+ Add Section) */}
      {activeSubTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" /> {editingSecId ? 'Edit Section' : '+ Add Section'}
            </h3>

            <form onSubmit={handleSaveSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Department</label>
                <select
                  value={secForm.department_id}
                  onChange={(e) => setSecForm(prev => ({ ...prev, department_id: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Year</label>
                  <select
                    value={secForm.year}
                    onChange={(e) => setSecForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Section Name (e.g. A, B, C, A1)</label>
                  <input
                    type="text"
                    value={secForm.section_name}
                    onChange={(e) => setSecForm(prev => ({ ...prev, section_name: e.target.value }))}
                    placeholder="Section A, B, C, A1..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={secForm.academic_year || '2026-2027'}
                  onChange={(e) => setSecForm(prev => ({ ...prev, academic_year: e.target.value }))}
                  placeholder="2026-2027"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Assign Class Adviser Name</label>
                <input
                  type="text"
                  value={secForm.adviser_name}
                  onChange={(e) => setSecForm(prev => ({ ...prev, adviser_name: e.target.value }))}
                  placeholder="Prof. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md transition"
              >
                {editingSecId ? 'Update Section' : 'Create Section'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white">Dynamic Sections Database ({sections.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map(s => {
                const dept = departments.find(d => d.id === s.department_id);
                return (
                  <div key={s.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-300 uppercase">{dept?.code} • {s.academic_year || '2026-2027'}</span>
                      <h4 className="text-sm font-bold text-white">{s.year} • {s.section_name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Adviser: {s.adviser_name}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSecId(s.id);
                          setSecForm(s);
                        }}
                        className="p-1.5 text-indigo-400 hover:bg-indigo-600/20 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(s.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE HISTORY & STORED RECORDS PORTAL */}
      {activeSubTab === 'attendance-history' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Date-Wise Saved Attendance Records Log
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Browse persistent database logs grouped by Date, Department, Year, and Section.
                </p>
              </div>

              <button
                onClick={fetchAttendanceHistory}
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-500 transition"
              >
                Refresh Records
              </button>
            </div>

            {attendanceHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No attendance logs found in database. Mark attendance in Staff View to populate history records.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800">
                      <th className="py-3 px-4">Attendance Date</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4 text-center">Present</th>
                      <th className="py-3 px-4 text-center">Absent</th>
                      <th className="py-3 px-4 text-center">Rate %</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {attendanceHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          {item.date}
                        </td>

                        <td className="py-3 px-4 font-bold text-indigo-300">
                          {item.department_code}
                        </td>

                        <td className="py-3 px-4 text-slate-200">
                          {item.year} • {item.section_name}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-emerald-400">
                          {item.presentCount}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-rose-400">
                          {item.absentCount}
                        </td>

                        <td className="py-3 px-4 text-center font-extrabold text-cyan-300">
                          {item.overallPct}%
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleViewAttendanceDetails(item)}
                            className="px-3 py-1.5 text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl transition flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal for View Details */}
          {selectedHistoryItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Saved Attendance Log Details
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedHistoryItem.date} • {selectedHistoryItem.department_code} • {selectedHistoryItem.year} {selectedHistoryItem.section_name}
                    </p>
                  </div>
                  <button onClick={() => setSelectedHistoryItem(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {historyLoading ? (
                  <div className="text-center py-8 text-slate-400 text-xs">Loading records...</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {historyStudents.map(stu => (
                      <div key={stu.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {stu.photo_url ? (
                            <img src={stu.photo_url} alt={stu.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center">
                              {stu.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white">{stu.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">Roll: {stu.roll_no}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            stu.attendance_status === 'PRESENT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {stu.attendance_status}
                          </span>
                          {stu.attendance_status === 'ABSENT' && (
                            <span className="text-[10px] font-semibold text-rose-300">
                              ({stu.reason || 'Personal'})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. ADD DEPARTMENT TAB */}
      {activeSubTab === 'depts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> {editingDeptId ? 'Edit Department' : '+ Add Department'}
            </h3>

            <form onSubmit={handleSaveDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Dept Code (e.g. AI & DS, Biotech)</label>
                <input
                  type="text"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="AI & DS, Biotech..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Full Department Name</label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Artificial Intelligence & Data Science"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">HOD Name (Optional)</label>
                <input
                  type="text"
                  value={deptForm.hod_name || ''}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, hod_name: e.target.value }))}
                  placeholder="Dr. S. Kanthaswamy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  {editingDeptId ? 'Update Department' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white">Active College Departments ({departments.length})</h3>
            <div className="space-y-3">
              {departments.map(d => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {d.code}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{d.name}</h4>
                    {d.hod_name && <p className="text-xs text-slate-400">HOD: {d.hod_name}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingDeptId(d.id);
                        setDeptForm(d);
                      }}
                      className="p-2 text-indigo-400 hover:bg-indigo-600/20 rounded-xl transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(d.id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD ADVISER TAB */}
      {activeSubTab === 'advisers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" /> {editingAdviserId ? 'Edit Adviser' : '+ Add Adviser'}
            </h3>

            <form onSubmit={handleSaveAdviser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Adviser Name</label>
                <input
                  type="text"
                  value={adviserForm.name}
                  onChange={(e) => setAdviserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Prof. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Department</label>
                  <select
                    value={adviserForm.department_id}
                    onChange={(e) => setAdviserForm(prev => ({ ...prev, department_id: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Section</label>
                  <select
                    value={adviserForm.section_id}
                    onChange={(e) => setAdviserForm(prev => ({ ...prev, section_id: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select Section</option>
                    {sections.filter(s => s.department_id === adviserForm.department_id).map(s => (
                      <option key={s.id} value={s.id}>{s.year} - {s.section_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Upload Adviser Photo</label>
                <div className="flex items-center gap-3">
                  {adviserPhotoPreview ? (
                    <img src={adviserPhotoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      Photo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdviserPhotoUpload}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white cursor-pointer"
                  />
                </div>
                {adviserPhotoUploading && <span className="text-[10px] text-cyan-400 font-bold block mt-1">Uploading...</span>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  {editingAdviserId ? 'Update Adviser' : 'Save Adviser'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white">Configured Class Advisers ({advisers.length})</h3>
            <div className="space-y-3">
              {advisers.map(adv => {
                const dept = departments.find(d => d.id === adv.department_id);
                const sec = sections.find(s => s.id === adv.section_id);

                return (
                  <div key={adv.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {adv.photo_url ? (
                        <img src={adv.photo_url} alt={adv.name} className="w-11 h-11 rounded-full object-cover border-2 border-purple-500 shadow" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-purple-950 text-purple-200 font-bold flex items-center justify-center text-sm border border-purple-700">
                          {adv.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{adv.name}</h4>
                        <p className="text-xs text-slate-400">
                          {dept?.code} • {adv.year || sec?.year} • {sec?.section_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAdviserId(adv.id);
                          setAdviserForm(adv);
                          setAdviserPhotoPreview(adv.photo_url || '');
                        }}
                        className="p-2 text-indigo-400 hover:bg-indigo-600/20 rounded-xl transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdviser(adv.id)}
                        className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD STUDENT TAB */}
      {activeSubTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> {editingStuId ? 'Edit Student' : '+ Add Student'}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={stuForm.name}
                  onChange={(e) => setStuForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Venkatesh Raman"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Roll No</label>
                  <input
                    type="text"
                    value={stuForm.roll_no}
                    onChange={(e) => setStuForm(prev => ({ ...prev, roll_no: e.target.value }))}
                    placeholder="22AD101"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Gender</label>
                  <select
                    value={stuForm.gender}
                    onChange={(e) => setStuForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Department</label>
                  <select
                    value={stuForm.department_id}
                    onChange={(e) => {
                      setStuForm(prev => ({ ...prev, department_id: e.target.value }));
                      const match = sections.find(s => s.department_id === e.target.value);
                      if (match) setStuForm(prev => ({ ...prev, section_id: match.id }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Section</label>
                  <select
                    value={stuForm.section_id}
                    onChange={(e) => setStuForm(prev => ({ ...prev, section_id: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select Section</option>
                    {sections.filter(s => s.department_id === stuForm.department_id).map(s => (
                      <option key={s.id} value={s.id}>{s.year} - {s.section_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">Upload Student Photo</label>
                <div className="flex items-center gap-3">
                  {stuPhotoPreview ? (
                    <img src={stuPhotoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      Photo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStudentPhotoUpload}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white cursor-pointer"
                  />
                </div>
                {stuPhotoUploading && <span className="text-[10px] text-cyan-400 font-bold block mt-1">Uploading...</span>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition"
                >
                  {editingStuId ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-white">Enrolled Students ({students.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {students.map(s => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center border border-indigo-700">
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.name} ({s.roll_no})</h4>
                      <p className="text-[10px] text-slate-400">{s.gender} • Reg: {s.register_no}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingStuId(s.id);
                        setStuForm(s);
                        setStuPhotoPreview(s.photo_url || '');
                      }}
                      className="p-2 text-indigo-400 hover:bg-indigo-600/20 rounded-xl transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s.id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
