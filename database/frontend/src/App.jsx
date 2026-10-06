import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PrincipalDashboard from './components/PrincipalDashboard';
import StaffDashboard from './components/StaffDashboard';
import FlyerStudio from './components/FlyerStudio';
import FlyerHistory from './components/FlyerHistory';
import AdminManager from './components/AdminManager';
import GlobalSearchModal from './components/GlobalSearchModal';
import CinematicIntro from './components/CinematicIntro';
import Toast from './components/Toast';

export default function App() {
  const [activeRole, setActiveRole] = useState('STAFF');
  const [activeTab, setActiveTab] = useState('staff');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Cinematic Intro Setting (Saved in localStorage)
  const [cinematicEnabled, setCinematicEnabled] = useState(() => {
    const saved = localStorage.getItem('campuspulse_cinematic');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showIntro, setShowIntro] = useState(() => cinematicEnabled);

  // Global Data States
  const [settings, setSettings] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Selection Filters for Staff Dashboard
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedYear, setSelectedYear] = useState('2nd Year');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal & Toast States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFlyerStudioOpen, setIsFlyerStudioOpen] = useState(false);
  const [currentAttendanceData, setCurrentAttendanceData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [settRes, deptRes, secRes, stuRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/departments'),
        fetch('/api/sections'),
        fetch('/api/students')
      ]);

      const [settData, deptData, secData, stuData] = await Promise.all([
        settRes.json(),
        deptRes.json(),
        secRes.json(),
        stuRes.json()
      ]);

      setSettings(settData);
      setDepartments(deptData || []);
      setSections(secData || []);
      setStudents(stuData || []);

      if (deptData && deptData.length > 0 && !selectedDeptId) {
        const firstDept = deptData[0].id;
        setSelectedDeptId(firstDept);
        const matchSec = (secData || []).find(s => s.department_id === firstDept);
        if (matchSec) setSelectedSectionId(matchSec.id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const toggleCinematicExperience = (enabled) => {
    setCinematicEnabled(enabled);
    localStorage.setItem('campuspulse_cinematic', JSON.stringify(enabled));
    showToast(enabled ? '🎬 Cinematic Intro enabled' : '🎬 Cinematic Intro disabled');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handleOpenFlyerStudio = (attendanceData) => {
    setCurrentAttendanceData(attendanceData);
    setIsFlyerStudioOpen(true);
  };

  const currentDeptObj = departments.find(d => d.id === selectedDeptId);
  const currentSecObj = sections.find(s => s.id === selectedSectionId);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-300 relative`}>
      
      {/* Short 1-2s Cinematic Opening Intro */}
      {showIntro && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Top Header Navigation */}
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        settings={settings}
      />

      {/* Main Content View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Staff Attendance & Daily Flyer View */}
        {activeTab === 'staff' && (
          <StaffDashboard
            departments={departments}
            sections={sections}
            selectedDeptId={selectedDeptId}
            setSelectedDeptId={setSelectedDeptId}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onGenerateFlyer={handleOpenFlyerStudio}
            showToast={showToast}
          />
        )}

        {/* Principal Executive Intelligence Dashboard View */}
        {activeTab === 'principal' && (
          <PrincipalDashboard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onSelectSection={(deptId, yr) => {
              setSelectedDeptId(deptId);
              setSelectedYear(yr);
              const matchSec = sections.find(s => s.department_id === deptId && s.year === yr);
              if (matchSec) setSelectedSectionId(matchSec.id);
              setActiveTab('staff');
            }}
          />
        )}

        {/* Flyer History Archive */}
        {activeTab === 'flyer-history' && (
          <FlyerHistory
            departments={departments}
            sections={sections}
            showToast={showToast}
          />
        )}

        {/* Admin Data Center & Storage Portal */}
        {activeTab === 'admin' && (
          <AdminManager
            departments={departments}
            sections={sections}
            students={students}
            settings={settings}
            onRefreshData={fetchInitialData}
            showToast={showToast}
          />
        )}

      </main>

      {/* Automated Flyer Generator Studio */}
      <FlyerStudio
        isOpen={isFlyerStudioOpen}
        onClose={() => setIsFlyerStudioOpen(false)}
        settings={settings}
        department={currentDeptObj}
        year={selectedYear}
        section={currentSecObj}
        date={selectedDate}
        attendanceData={currentAttendanceData}
        showToast={showToast}
      />

      {/* Global Student Search Overlay */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        departments={departments}
        sections={sections}
        onSelectStudent={(student) => {
          setSelectedDeptId(student.department_id);
          setSelectedYear(student.year);
          setSelectedSectionId(student.section_id);
          setActiveTab('staff');
          showToast(`Located ${student.name} (${student.roll_no})`);
        }}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

    </div>
  );
}
