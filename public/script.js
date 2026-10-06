/**
 * Smart Institution AI – Attendance Management System
 * Frontend Controller & API Integration Script
 * Includes: Student CRUD, Attendance Marking, College Settings & Flyer Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    students: [],
    filteredStudents: [],
    absentees: [],
    dashboard: null,
    settings: null,
    selectedStudent: null,
    todayRecords: [],
    activeFilter: 'all',
    isLoading: false
  };

  // DOM Elements
  const elements = {
    // Header & Meta
    dateDisplay: document.getElementById('dateDisplay'),
    currentYear: document.getElementById('currentYear'),
    refreshDataBtn: document.getElementById('refreshDataBtn'),
    headerDeptSubtitle: document.getElementById('headerDeptSubtitle'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),

    // Dashboard Cards
    totalStudentsCount: document.getElementById('totalStudentsCount'),
    presentTodayCount: document.getElementById('presentTodayCount'),
    absentTodayCount: document.getElementById('absentTodayCount'),
    presentPercentageTag: document.getElementById('presentPercentageTag'),
    absentPercentageTag: document.getElementById('absentPercentageTag'),

    // Search & Quick Actions
    studentSearchInput: document.getElementById('studentSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    openAddStudentModalBtn: document.getElementById('openAddStudentModalBtn'),
    viewTodayAttendanceBtn: document.getElementById('viewTodayAttendanceBtn'),

    // Absentees Section
    absenteesContainer: document.getElementById('absenteesContainer'),
    absenteesBadgeCount: document.getElementById('absenteesBadgeCount'),
    openFlyerGeneratorBtn: document.getElementById('openFlyerGeneratorBtn'),

    // Students Section
    studentsContainer: document.getElementById('studentsContainer'),
    studentResultsCount: document.getElementById('studentResultsCount'),

    // Add Student Modal
    addStudentModal: document.getElementById('addStudentModal'),
    closeAddStudentModalBtn: document.getElementById('closeAddStudentModalBtn'),
    cancelAddStudentBtn: document.getElementById('cancelAddStudentBtn'),
    addStudentForm: document.getElementById('addStudentForm'),
    newStudentPhoto: document.getElementById('newStudentPhoto'),
    newStudentPhotoLabel: document.getElementById('newStudentPhotoLabel'),
    newStudentPhotoPreviewContainer: document.getElementById('newStudentPhotoPreviewContainer'),
    newStudentPhotoPreview: document.getElementById('newStudentPhotoPreview'),
    removePhotoBtn: document.getElementById('removePhotoBtn'),
    saveStudentBtn: document.getElementById('saveStudentBtn'),

    // Student Details & Attendance Modal
    studentDetailsModal: document.getElementById('studentDetailsModal'),
    closeStudentModalBtn: document.getElementById('closeStudentModalBtn'),
    closeStudentModalFooterBtn: document.getElementById('closeStudentModalFooterBtn'),
    modalStudentName: document.getElementById('modalStudentName'),
    modalStudentRollNo: document.getElementById('modalStudentRollNo'),
    modalStudentAvatarWrap: document.getElementById('modalStudentAvatarWrap'),
    modalStudentAvatarIcon: document.getElementById('modalStudentAvatarIcon'),
    modalStudentAvatarImg: document.getElementById('modalStudentAvatarImg'),
    modalAttendancePct: document.getElementById('modalAttendancePct'),
    modalAttendanceStatus: document.getElementById('modalAttendanceStatus'),
    modalAttendanceRemark: document.getElementById('modalAttendanceRemark'),
    modalProgressBar: document.getElementById('modalProgressBar'),
    modalScoreCircle: document.getElementById('modalScoreCircle'),
    modalTotalDays: document.getElementById('modalTotalDays'),
    modalPresentDays: document.getElementById('modalPresentDays'),
    modalAbsentDays: document.getElementById('modalAbsentDays'),
    modalAttendancePctDetail: document.getElementById('modalAttendancePctDetail'),

    // Attendance Action Controls
    modalLeaveReasonInput: document.getElementById('modalLeaveReasonInput'),
    attendanceAlreadyMarkedNotice: document.getElementById('attendanceAlreadyMarkedNotice'),
    attendanceControlsActionWrap: document.getElementById('attendanceControlsActionWrap'),
    markPresentBtn: document.getElementById('markPresentBtn'),
    markAbsentBtn: document.getElementById('markAbsentBtn'),
    deleteStudentBtn: document.getElementById('deleteStudentBtn'),

    // Today's Attendance Sheet Modal
    todayAttendanceModal: document.getElementById('todayAttendanceModal'),
    closeTodayAttendanceModalBtn: document.getElementById('closeTodayAttendanceModalBtn'),
    closeTodayAttendanceModalFooterBtn: document.getElementById('closeTodayAttendanceModalFooterBtn'),
    todayModalDate: document.getElementById('todayModalDate'),
    todayAttendanceTableBody: document.getElementById('todayAttendanceTableBody'),
    filterAllCount: document.getElementById('filterAllCount'),
    filterPresentCount: document.getElementById('filterPresentCount'),
    filterAbsentCount: document.getElementById('filterAbsentCount'),
    tabButtons: document.querySelectorAll('.tab-btn'),

    // College Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
    cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
    settingsForm: document.getElementById('settingsForm'),
    settingCollegeName: document.getElementById('settingCollegeName'),
    settingDepartmentName: document.getElementById('settingDepartmentName'),
    settingSection: document.getElementById('settingSection'),
    settingAdviserName: document.getElementById('settingAdviserName'),
    settingCollegeLogo: document.getElementById('settingCollegeLogo'),
    settingCollegeLogoLabel: document.getElementById('settingCollegeLogoLabel'),
    settingAdviserPhoto: document.getElementById('settingAdviserPhoto'),
    settingAdviserPhotoLabel: document.getElementById('settingAdviserPhotoLabel'),

    // Flyer Modal
    flyerModal: document.getElementById('flyerModal'),
    closeFlyerModalBtn: document.getElementById('closeFlyerModalBtn'),
    closeFlyerModalFooterBtn: document.getElementById('closeFlyerModalFooterBtn'),
    editFlyerSettingsBtn: document.getElementById('editFlyerSettingsBtn'),
    downloadFlyerPngBtn: document.getElementById('downloadFlyerPngBtn'),
    flyerNoAbsenteesState: document.getElementById('flyerNoAbsenteesState'),
    flyerViewport: document.getElementById('flyerViewport'),
    attendanceFlyerPoster: document.getElementById('attendanceFlyerPoster'),
    flyerCollegeLogo: document.getElementById('flyerCollegeLogo'),
    flyerCollegeName: document.getElementById('flyerCollegeName'),
    flyerDeptName: document.getElementById('flyerDeptName'),
    flyerSectionName: document.getElementById('flyerSectionName'),
    flyerFormattedDate: document.getElementById('flyerFormattedDate'),
    flyerStudentsGrid: document.getElementById('flyerStudentsGrid'),
    flyerAdviserPhoto: document.getElementById('flyerAdviserPhoto'),
    flyerAdviserIcon: document.getElementById('flyerAdviserIcon'),
    flyerAdviserName: document.getElementById('flyerAdviserName'),
    closeNoAbsenteesFlyerBtn: document.getElementById('closeNoAbsenteesFlyerBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // Set Current Year in Footer
  if (elements.currentYear) {
    elements.currentYear.textContent = new Date().getFullYear();
  }

  // ==========================================
  // API FETCH FUNCTIONS
  // ==========================================

  /**
   * Fetch Dashboard Statistics
   * Endpoint: GET /api/dashboard
   */
  async function fetchDashboardData() {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        state.dashboard = result.data;
        updateDashboardUI(result.data);
      } else {
        throw new Error(result.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      showToast('Could not load dashboard statistics. ' + error.message, 'error');
    }
  }

  /**
   * Fetch All Students Roster
   * Endpoint: GET /api/students
   */
  async function fetchStudentsData() {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        state.students = result.data;
        // Re-apply active search filter if any
        const currentQuery = elements.studentSearchInput ? elements.studentSearchInput.value : '';
        if (currentQuery) {
          handleSearch(currentQuery);
        } else {
          state.filteredStudents = result.data;
          renderStudentsGrid(state.filteredStudents);
        }
      } else {
        throw new Error(result.error || 'Failed to retrieve students');
      }
    } catch (error) {
      console.error('Error in fetchStudentsData:', error);
      elements.studentsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation text-danger"></i>
          <h4>Failed to load students</h4>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
      showToast('Error loading student roster.', 'error');
    }
  }

  /**
   * Fetch Today's Absent Students
   * Endpoint: GET /api/attendance/absentees
   */
  async function fetchAbsenteesData() {
    try {
      const response = await fetch('/api/attendance/absentees');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        state.absentees = result.data;
        renderAbsenteesGrid(result.data);
      } else {
        throw new Error(result.error || 'Failed to load absentees');
      }
    } catch (error) {
      console.error('Error in fetchAbsenteesData:', error);
      elements.absenteesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation text-danger"></i>
          <h4>Unable to load absentees</h4>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }

  /**
   * Fetch Specific Student Details for Modal
   * Endpoint: GET /api/students/:id
   */
  async function fetchStudentDetail(studentId) {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error(`Student not found or server error (${response.status})`);
      const result = await response.json();
      if (result.success && result.data) {
        state.selectedStudent = result.data;
        populateAndOpenStudentModal(result.data);
      } else {
        throw new Error(result.error || 'Student details not found');
      }
    } catch (error) {
      console.error('Error fetching student detail:', error);
      showToast('Failed to open student details: ' + error.message, 'error');
    }
  }

  /**
   * Fetch Today's Complete Attendance Sheet
   * Endpoint: GET /api/attendance/today
   */
  async function fetchTodayAttendanceSheet() {
    try {
      const response = await fetch('/api/attendance/today');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        state.todayRecords = result.data;
        populateAndOpenTodayModal(result.data, result.date);
      } else {
        throw new Error(result.error || "Failed to load today's attendance");
      }
    } catch (error) {
      console.error('Error fetching today attendance sheet:', error);
      showToast("Unable to load today's attendance sheet: " + error.message, 'error');
    }
  }

  /**
   * Fetch College & Department Settings
   * Endpoint: GET /api/settings
   */
  function updateFlyerSettingsUI(settings) {
    if (!settings) return;
    if (elements.flyerCollegeName && settings.college_name !== undefined) {
      elements.flyerCollegeName.textContent = settings.college_name;
    }
    if (elements.flyerDeptName && settings.department_name !== undefined) {
      elements.flyerDeptName.textContent = settings.department_name;
    }
    if (elements.flyerSectionName && settings.section !== undefined) {
      elements.flyerSectionName.textContent = settings.section;
    }
    if (elements.flyerAdviserName && settings.adviser_name !== undefined) {
      elements.flyerAdviserName.textContent = settings.adviser_name;
    }
    if (elements.headerDeptSubtitle && settings.department_name) {
      elements.headerDeptSubtitle.textContent = `${settings.department_name} - Attendance Management System`;
    }
    if (elements.flyerCollegeLogo && settings.college_logo) {
      elements.flyerCollegeLogo.src = settings.college_logo;
    }
    if (elements.flyerAdviserPhoto && elements.flyerAdviserIcon) {
      if (settings.adviser_photo) {
        elements.flyerAdviserPhoto.src = settings.adviser_photo;
        elements.flyerAdviserPhoto.style.display = 'block';
        elements.flyerAdviserIcon.style.display = 'none';
      } else {
        elements.flyerAdviserPhoto.style.display = 'none';
        elements.flyerAdviserIcon.style.display = 'block';
      }
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        state.settings = result.data;
        populateSettingsForm(result.data);
        updateFlyerSettingsUI(result.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // ==========================================
  // UI RENDER FUNCTIONS
  // ==========================================

  /**
   * Update Dashboard Counters & Badges
   */
  function updateDashboardUI(stats) {
    const total = stats.totalStudents || 0;
    const present = stats.presentToday || 0;
    const absent = stats.absentToday || 0;

    elements.totalStudentsCount.textContent = total;
    elements.presentTodayCount.textContent = present;
    elements.absentTodayCount.textContent = absent;

    // Calculate dynamic percentages
    if (total > 0) {
      const presentRate = Math.round((present / total) * 100);
      const absentRate = Math.round((absent / total) * 100);
      elements.presentPercentageTag.textContent = `${presentRate}% Present`;
      elements.absentPercentageTag.textContent = `${absentRate}% Absent`;
    } else {
      elements.presentPercentageTag.textContent = 'In Classroom';
      elements.absentPercentageTag.textContent = 'On Leave';
    }

    // Format & display date
    if (stats.date) {
      const parsedDate = new Date(stats.date + 'T00:00:00');
      const formatted = parsedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      elements.dateDisplay.textContent = formatted;
    }
  }

  /**
   * Render Today's Absentees Section
   */
  function renderAbsenteesGrid(absentees) {
    elements.absenteesBadgeCount.textContent = `${absentees.length} Absent Today`;

    if (!absentees || absentees.length === 0) {
      elements.absenteesContainer.innerHTML = `
        <div class="empty-state" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); width: 100%; grid-column: 1 / -1;">
          <i class="fa-solid fa-circle-check text-success" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <h4 style="color: #065f46; font-weight: 700;">No Absentees Today!</h4>
          <p style="color: #047857;">All students are accounted for in current active sessions.</p>
        </div>
      `;
      return;
    }

    elements.absenteesContainer.innerHTML = absentees.map(student => {
      const avatarContent = student.photo_url
        ? `<img src="${escapeHtml(student.photo_url)}" alt="${escapeHtml(student.name)}" class="absentee-photo-thumb" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\\'absentee-initial-avatar\\'>${escapeHtml(student.name[0] || 'A')}</div>';" />`
        : `<div class="absentee-initial-avatar">${escapeHtml((student.name || 'A')[0].toUpperCase())}</div>`;

      const reasonDisplay = student.reason && student.reason.trim()
        ? escapeHtml(student.reason)
        : 'Personal Leave';

      return `
        <div class="absentee-card" data-student-id="${student.student_id}" title="Click to view ${escapeHtml(student.name)} details">
          <div class="absentee-left">
            ${avatarContent}
            <div class="absentee-info">
              <span class="absentee-name">${escapeHtml(student.name)}</span>
              <span class="absentee-roll">${escapeHtml(student.roll_no)}</span>
            </div>
          </div>
          <div class="absentee-right">
            <div class="leave-badge">
              <i class="fa-regular fa-clock"></i> Today Leave
            </div>
            <span class="absentee-reason-pill" title="Reason: ${reasonDisplay}">
              ${reasonDisplay}
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Clicking absentee card opens student modal
    elements.absenteesContainer.querySelectorAll('.absentee-card').forEach(card => {
      card.addEventListener('click', () => {
        const studentId = card.getAttribute('data-student-id');
        if (studentId) fetchStudentDetail(studentId);
      });
    });
  }

  /**
   * Render Student Directory Cards
   */
  function renderStudentsGrid(students) {
    elements.studentResultsCount.textContent = `Showing ${students.length} of ${state.students.length} students`;

    if (!students || students.length === 0) {
      elements.studentsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h4>No students found</h4>
          <p>No student records matched your search query. Try typing a different name or roll number.</p>
        </div>
      `;
      return;
    }

    elements.studentsContainer.innerHTML = students.map(student => {
      const pct = Math.round(student.attendance || 0);
      let colorClass = 'pct-high';
      let barClass = 'bar-high';

      if (pct < 75) {
        colorClass = 'pct-low';
        barClass = 'bar-low';
      } else if (pct < 85) {
        colorClass = 'pct-mid';
        barClass = 'bar-mid';
      }

      // Avatar with image or initials
      const initials = student.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const avatarMarkup = student.photo_url
        ? `<div class="student-avatar"><img src="${escapeHtml(student.photo_url)}" alt="${escapeHtml(student.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='${initials}';" /></div>`
        : `<div class="student-avatar">${initials}</div>`;

      return `
        <div class="student-card" data-student-id="${student.id}" tabindex="0" role="button" aria-label="View attendance for ${escapeHtml(student.name)}">
          <div class="student-card-header">
            <div class="student-meta">
              ${avatarMarkup}
              <div class="student-identity">
                <h3 class="student-name">${escapeHtml(student.name)}</h3>
                <span class="student-roll">${escapeHtml(student.roll_no)}</span>
              </div>
            </div>
            <div class="student-card-actions">
              <div class="student-pct-badge ${colorClass}">
                ${pct}%
              </div>
              <button type="button" class="student-card-delete-btn" data-student-id="${student.id}" title="Delete Student" aria-label="Delete student ${escapeHtml(student.name)}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="student-progress-wrapper">
            <div class="student-progress-labels">
              <span>Attendance Track</span>
              <span>${student.present_days || 0}/${student.total_days || 0} Days</span>
            </div>
            <div class="card-progress-track">
              <div class="card-progress-bar ${barClass}" style="width: ${Math.min(pct, 100)}%;"></div>
            </div>
          </div>

          <div class="card-footer-prompt">
            <span>Manage & Attendance</span>
            <i class="fa-solid fa-arrow-right"></i>
          </div>
        </div>
      `;
    }).join('');

    // Attach delete button listeners on cards
    elements.studentsContainer.querySelectorAll('.student-card-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const studentId = btn.getAttribute('data-student-id');
        if (studentId) {
          await deleteStudentById(studentId);
        }
      });
    });

    // Attach click and keyboard listeners to each student card
    elements.studentsContainer.querySelectorAll('.student-card').forEach(card => {
      card.addEventListener('click', () => {
        const studentId = card.getAttribute('data-student-id');
        if (studentId) fetchStudentDetail(studentId);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const studentId = card.getAttribute('data-student-id');
          if (studentId) fetchStudentDetail(studentId);
        }
      });
    });
  }

  // ==========================================
  // MODAL MANAGEMENT & POPULATION
  // ==========================================

  /**
   * Populate and Display Student Details Modal
   */
  function populateAndOpenStudentModal(student) {
    const pct = Math.round(student.attendance || 0);

    elements.modalStudentName.textContent = student.name;
    elements.modalStudentRollNo.textContent = `Roll No: ${student.roll_no} • AI & Data Science`;
    elements.modalAttendancePct.textContent = `${pct}%`;
    elements.modalAttendancePctDetail.textContent = `${pct}%`;
    elements.modalTotalDays.textContent = student.total_days || 0;
    elements.modalPresentDays.textContent = student.present_days || 0;
    elements.modalAbsentDays.textContent = student.absent_days || 0;

    // Avatar image or icon
    if (student.photo_url) {
      elements.modalStudentAvatarImg.src = student.photo_url;
      elements.modalStudentAvatarImg.style.display = 'block';
      elements.modalStudentAvatarIcon.style.display = 'none';
    } else {
      elements.modalStudentAvatarImg.src = '';
      elements.modalStudentAvatarImg.style.display = 'none';
      elements.modalStudentAvatarIcon.style.display = 'block';
    }

    // Determine status text & colors
    let barColor = '#10b981';
    let circleBg = '#ecfdf5';
    let circleColor = '#047857';

    if (pct < 75) {
      elements.modalAttendanceStatus.textContent = 'Critical Attendance (Shortage)';
      elements.modalAttendanceRemark.textContent = 'Attendance falls below the mandatory 75% department threshold. Clarification required.';
      barColor = '#f43f5e';
      circleBg = '#fff1f2';
      circleColor = '#be123c';
    } else if (pct < 85) {
      elements.modalAttendanceStatus.textContent = 'Average Attendance';
      elements.modalAttendanceRemark.textContent = 'Meets minimum attendance requirement. Improvement encouraged for optimal academic rating.';
      barColor = '#f59e0b';
      circleBg = '#fffbeb';
      circleColor = '#d97706';
    } else {
      elements.modalAttendanceStatus.textContent = 'Good Standing';
      elements.modalAttendanceRemark.textContent = 'Attendance criteria meets department eligibility for semester evaluation.';
      barColor = '#10b981';
      circleBg = '#ecfdf5';
      circleColor = '#047857';
    }

    elements.modalProgressBar.style.width = `${Math.min(pct, 100)}%`;
    elements.modalProgressBar.style.backgroundColor = barColor;
    elements.modalScoreCircle.style.backgroundColor = circleBg;
    elements.modalScoreCircle.style.color = circleColor;

    // Reset attendance inputs
    elements.modalLeaveReasonInput.value = student.today_reason || '';

    // Attendance status display
    if (student.marked_today && student.today_status) {
      const isPresent = student.today_status === 'Present';
      const statusIcon = isPresent ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-danger"></i>';
      const reasonText = !isPresent && student.today_reason ? ` (Reason: ${escapeHtml(student.today_reason)})` : '';
      elements.attendanceAlreadyMarkedNotice.innerHTML = `${statusIcon} <span>Today's Status: <strong>${student.today_status}</strong>${reasonText}. You can update it below.</span>`;
      elements.attendanceAlreadyMarkedNotice.style.display = 'flex';
    } else {
      elements.attendanceAlreadyMarkedNotice.innerHTML = '<i class="fa-solid fa-circle-info"></i> <span>Attendance not recorded yet for today. Mark status below.</span>';
      elements.attendanceAlreadyMarkedNotice.style.display = 'flex';
    }

    // Keep action buttons always visible and active
    elements.attendanceControlsActionWrap.style.display = 'block';

    // Highlight current status on buttons
    if (student.marked_today && student.today_status === 'Present') {
      elements.markPresentBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Present (Active)';
      elements.markPresentBtn.style.opacity = '1';
      elements.markAbsentBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Change to Absent';
      elements.markAbsentBtn.style.opacity = '0.85';
    } else if (student.marked_today && student.today_status === 'Absent') {
      elements.markPresentBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Change to Present';
      elements.markPresentBtn.style.opacity = '0.85';
      elements.markAbsentBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Absent (Active)';
      elements.markAbsentBtn.style.opacity = '1';
    } else {
      elements.markPresentBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mark Present';
      elements.markPresentBtn.style.opacity = '1';
      elements.markAbsentBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Mark Absent';
      elements.markAbsentBtn.style.opacity = '1';
    }

    openModal(elements.studentDetailsModal);
  }

  /**
   * Populate and Display Today's Attendance Sheet Modal
   */
  function populateAndOpenTodayModal(records, dateStr) {
    if (dateStr) {
      const parsedDate = new Date(dateStr + 'T00:00:00');
      elements.todayModalDate.textContent = `Session: ${parsedDate.toDateString()} (AI & DS Class Roster)`;
    }

    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;

    elements.filterAllCount.textContent = records.length;
    elements.filterPresentCount.textContent = presentCount;
    elements.filterAbsentCount.textContent = absentCount;

    renderTodayTable(records, state.activeFilter);
    openModal(elements.todayAttendanceModal);
  }

  /**
   * Render Filtered Rows in Today's Modal Table
   */
  function renderTodayTable(records, filter) {
    let filtered = records;
    if (filter === 'Present') {
      filtered = records.filter(r => r.status === 'Present');
    } else if (filter === 'Absent') {
      filtered = records.filter(r => r.status === 'Absent');
    }

    if (filtered.length === 0) {
      elements.todayAttendanceTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="table-loading" style="text-align: center; padding: 2rem;">
            No students found under status "${escapeHtml(filter)}".
          </td>
        </tr>
      `;
      return;
    }

    elements.todayAttendanceTableBody.innerHTML = filtered.map((rec, index) => {
      const isPresent = rec.status === 'Present';
      const statusPill = isPresent
        ? `<span class="status-pill present"><i class="fa-solid fa-circle-check"></i> Present</span>`
        : `<span class="status-pill absent"><i class="fa-solid fa-circle-xmark"></i> Absent</span>`;

      return `
        <tr>
          <td><strong>${index + 1}</strong></td>
          <td><code>${escapeHtml(rec.roll_no)}</code></td>
          <td><strong>${escapeHtml(rec.name)}</strong></td>
          <td>${Math.round(rec.overall_attendance || 0)}%</td>
          <td>${statusPill}</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Populate College Settings Modal Form
   */
  function populateSettingsForm(settings) {
    if (!settings) return;
    if (elements.settingCollegeName) elements.settingCollegeName.value = settings.college_name || '';
    if (elements.settingDepartmentName) elements.settingDepartmentName.value = settings.department_name || '';
    if (elements.settingSection) elements.settingSection.value = settings.section || '';
    if (elements.settingAdviserName) elements.settingAdviserName.value = settings.adviser_name || '';
    if (elements.headerDeptSubtitle && settings.department_name) {
      elements.headerDeptSubtitle.textContent = `${settings.department_name} – Attendance Management System`;
    }
  }

  /**
   * Open Flyer Generator Modal with Dynamic Content
   */
  async function openFlyerModal() {
    // Fetch latest absentees & settings
    await Promise.all([
      fetchAbsenteesData(),
      fetchSettings()
    ]);

    const absentees = state.absentees || [];

    // Populate Settings & Metadata in Flyer from database
    if (state.settings) {
      updateFlyerSettingsUI(state.settings);
    }

    // Check: No absentees condition
    if (absentees.length === 0) {
      elements.flyerNoAbsenteesState.style.display = 'block';
      elements.flyerViewport.style.display = 'none';
      elements.downloadFlyerPngBtn.disabled = true;
      elements.downloadFlyerPngBtn.style.opacity = '0.5';
      openModal(elements.flyerModal);
      return;
    }

    elements.flyerNoAbsenteesState.style.display = 'none';
    elements.flyerViewport.style.display = 'flex';
    elements.downloadFlyerPngBtn.disabled = false;
    elements.downloadFlyerPngBtn.style.opacity = '1';

    // Format Date: e.g. 22 SEPTEMBER 2026
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
    elements.flyerFormattedDate.textContent = formattedDate;

    // Render Absent Students Grid in Flyer
    elements.flyerStudentsGrid.innerHTML = absentees.map(student => {
      const photoHtml = student.photo_url
        ? `<img src="${escapeHtml(student.photo_url)}" alt="${escapeHtml(student.name)}" class="poster-student-img" />`
        : `<div class="poster-initial-avatar">${escapeHtml((student.name || 'A')[0].toUpperCase())}</div>`;

      const reason = student.reason && student.reason.trim()
        ? student.reason.trim()
        : 'Personal Leave';

      return `
        <div class="poster-student-card">
          <div class="poster-student-photo-box">
            ${photoHtml}
          </div>
          <div class="poster-student-meta">
            <h4 class="poster-student-name">${escapeHtml(student.name)}</h4>
            <span class="poster-student-roll">${escapeHtml(student.roll_no)}</span>
            <span class="poster-leave-reason">Reason: ${escapeHtml(reason)}</span>
          </div>
        </div>
      `;
    }).join('');

    openModal(elements.flyerModal);
  }

  /**
   * Generate & Download Flyer as High-Res PNG
   */
  async function downloadFlyerAsPng() {
    if (!window.html2canvas) {
      showToast('html2canvas library is still loading. Please try again in a moment.', 'error');
      return;
    }

    const poster = elements.attendanceFlyerPoster;
    if (!poster) return;

    elements.downloadFlyerPngBtn.disabled = true;
    elements.downloadFlyerPngBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PNG...';

    try {
      // Temporarily reset transform for pristine capture
      const prevTransform = poster.style.transform;
      poster.style.transform = 'none';

      const canvas = await html2canvas(poster, {
        scale: 2, // High resolution (2x)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Restore transform
      poster.style.transform = prevTransform;

      // Download trigger
      const imageURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const todayStr = state.dashboard && state.dashboard.date ? state.dashboard.date : new Date().toISOString().split('T')[0];
      downloadLink.download = `Attendance_Flyer_${todayStr}.png`;
      downloadLink.href = imageURL;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast('Attendance Flyer downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating flyer PNG:', error);
      showToast('Failed to generate PNG image. ' + error.message, 'error');
    } finally {
      elements.downloadFlyerPngBtn.disabled = false;
      elements.downloadFlyerPngBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PNG';
    }
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ==========================================
  // SEARCH & FILTERING
  // ==========================================

  function handleSearch(query) {
    const term = (query || '').trim().toLowerCase();

    if (term.length > 0) {
      elements.clearSearchBtn.style.display = 'block';
    } else {
      elements.clearSearchBtn.style.display = 'none';
    }

    state.filteredStudents = state.students.filter(student => {
      const nameMatch = (student.name || '').toLowerCase().includes(term);
      const rollMatch = (student.roll_no || '').toLowerCase().includes(term);
      return nameMatch || rollMatch;
    });

    renderStudentsGrid(state.filteredStudents);
  }

  // ==========================================
  // EVENT LISTENERS & ACTIONS
  // ==========================================

  // Live Search
  elements.studentSearchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.studentSearchInput.value = '';
    handleSearch('');
    elements.studentSearchInput.focus();
  });

  // Open Add Student Modal
  elements.openAddStudentModalBtn.addEventListener('click', () => {
    elements.addStudentForm.reset();
    elements.newStudentPhotoPreviewContainer.style.display = 'none';
    elements.newStudentPhotoLabel.textContent = 'Click or drop student photo here';
    openModal(elements.addStudentModal);
  });

  elements.closeAddStudentModalBtn.addEventListener('click', () => {
    closeModal(elements.addStudentModal);
  });

  elements.cancelAddStudentBtn.addEventListener('click', () => {
    closeModal(elements.addStudentModal);
  });

  // Student Photo Upload Preview
  elements.newStudentPhoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      elements.newStudentPhotoLabel.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (event) => {
        elements.newStudentPhotoPreview.src = event.target.result;
        elements.newStudentPhotoPreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  elements.removePhotoBtn.addEventListener('click', () => {
    elements.newStudentPhoto.value = '';
    elements.newStudentPhotoPreview.src = '';
    elements.newStudentPhotoPreviewContainer.style.display = 'none';
    elements.newStudentPhotoLabel.textContent = 'Click or drop student photo here';
  });

  // Submit Add Student Form
  elements.addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.addStudentForm);

    elements.saveStudentBtn.disabled = true;
    elements.saveStudentBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create student');
      }

      showToast(`Student "${result.data.name}" enrolled successfully!`, 'success');
      closeModal(elements.addStudentModal);
      elements.addStudentForm.reset();

      // Refresh data
      await Promise.all([
        fetchDashboardData(),
        fetchStudentsData(),
        fetchAbsenteesData()
      ]);
    } catch (error) {
      console.error('Error in addStudent:', error);
      showToast(error.message, 'error');
    } finally {
      elements.saveStudentBtn.disabled = false;
      elements.saveStudentBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Student';
    }
  });

  // Mark Present Button
  elements.markPresentBtn.addEventListener('click', async () => {
    if (!state.selectedStudent) return;
    await recordStudentAttendance('Present', '');
  });

  // Mark Absent Button
  elements.markAbsentBtn.addEventListener('click', async () => {
    if (!state.selectedStudent) return;
    const reason = elements.modalLeaveReasonInput.value.trim() || 'Personal Leave';
    await recordStudentAttendance('Absent', reason);
  });

  async function recordStudentAttendance(status, reason) {
    const student = state.selectedStudent;
    if (!student) return;

    elements.markPresentBtn.disabled = true;
    elements.markAbsentBtn.disabled = true;

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          status,
          reason
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not record attendance');
      }

      showToast(`Attendance updated to ${status} for ${student.name}!`, 'success');

      // Update modal view with updated student data
      state.selectedStudent = result.data;
      populateAndOpenStudentModal(state.selectedStudent);

      // Refresh dashboard, roster, absentees in background
      await Promise.all([
        fetchDashboardData(),
        fetchStudentsData(),
        fetchAbsenteesData()
      ]);
    } catch (error) {
      console.error('Error in recordStudentAttendance:', error);
      showToast(error.message, 'error');
    } finally {
      elements.markPresentBtn.disabled = false;
      elements.markAbsentBtn.disabled = false;
    }
  }

  // Delete Student Helper
  async function deleteStudentById(studentId) {
    if (!studentId) return;

    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    if (elements.deleteStudentBtn) {
      elements.deleteStudentBtn.disabled = true;
      elements.deleteStudentBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete student');
      }

      showToast("Student deleted successfully", "success");

      if (elements.studentDetailsModal && elements.studentDetailsModal.classList.contains('active')) {
        closeModal(elements.studentDetailsModal);
      }

      await Promise.all([
        fetchDashboardData(),
        fetchStudentsData(),
        fetchAbsenteesData()
      ]);
    } catch (error) {
      console.error('Error deleting student:', error);
      showToast(error.message, 'error');
    } finally {
      if (elements.deleteStudentBtn) {
        elements.deleteStudentBtn.disabled = false;
        elements.deleteStudentBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete Student';
      }
    }
  }

  // Delete Student from Modal
  elements.deleteStudentBtn.addEventListener('click', async () => {
    const student = state.selectedStudent;
    if (!student) return;
    await deleteStudentById(student.id);
  });



  // Settings Modal Triggers
  elements.openSettingsBtn.addEventListener('click', async () => {
    await fetchSettings();
    openModal(elements.settingsModal);
  });

  elements.closeSettingsModalBtn.addEventListener('click', () => {
    closeModal(elements.settingsModal);
  });

  elements.cancelSettingsBtn.addEventListener('click', () => {
    closeModal(elements.settingsModal);
  });

  elements.settingCollegeLogo.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      elements.settingCollegeLogoLabel.textContent = e.target.files[0].name;
    }
  });

  elements.settingAdviserPhoto.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      elements.settingAdviserPhotoLabel.textContent = e.target.files[0].name;
    }
  });

  // Save Settings
  elements.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(elements.settingsForm);

    elements.saveSettingsBtn.disabled = true;
    elements.saveSettingsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: formData
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }

      state.settings = result.data;
      populateSettingsForm(result.data);
      updateFlyerSettingsUI(result.data);
      showToast('Settings saved successfully', 'success');
      closeModal(elements.settingsModal);
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.message, 'error');
    } finally {
      elements.saveSettingsBtn.disabled = false;
      elements.saveSettingsBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Settings';
    }
  });

  // Attendance Flyer Triggers
  elements.openFlyerGeneratorBtn.addEventListener('click', () => {
    openFlyerModal();
  });

  elements.closeFlyerModalBtn.addEventListener('click', () => {
    closeModal(elements.flyerModal);
  });

  elements.closeFlyerModalFooterBtn.addEventListener('click', () => {
    closeModal(elements.flyerModal);
  });

  elements.closeNoAbsenteesFlyerBtn.addEventListener('click', () => {
    closeModal(elements.flyerModal);
  });

  elements.editFlyerSettingsBtn.addEventListener('click', async () => {
    closeModal(elements.flyerModal);
    await fetchSettings();
    openModal(elements.settingsModal);
  });

  elements.downloadFlyerPngBtn.addEventListener('click', () => {
    downloadFlyerAsPng();
  });

  // View Today's Attendance Sheet
  elements.viewTodayAttendanceBtn.addEventListener('click', () => {
    fetchTodayAttendanceSheet();
  });

  // Dashboard Refresh Button
  elements.refreshDataBtn.addEventListener('click', async () => {
    elements.refreshDataBtn.disabled = true;
    elements.refreshDataBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing';
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchStudentsData(),
        fetchAbsenteesData()
      ]);
      showToast('Dashboard data refreshed successfully!', 'success');
    } finally {
      elements.refreshDataBtn.disabled = false;
      elements.refreshDataBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refresh';
    }
  });

  // Modal Closers
  elements.closeStudentModalBtn.addEventListener('click', () => closeModal(elements.studentDetailsModal));
  elements.closeStudentModalFooterBtn.addEventListener('click', () => closeModal(elements.studentDetailsModal));
  elements.closeTodayAttendanceModalBtn.addEventListener('click', () => closeModal(elements.todayAttendanceModal));
  elements.closeTodayAttendanceModalFooterBtn.addEventListener('click', () => closeModal(elements.todayAttendanceModal));

  // Close modals on clicking overlay backdrop
  [
    elements.addStudentModal,
    elements.studentDetailsModal,
    elements.todayAttendanceModal,
    elements.settingsModal,
    elements.flyerModal
  ].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [
        elements.addStudentModal,
        elements.studentDetailsModal,
        elements.todayAttendanceModal,
        elements.settingsModal,
        elements.flyerModal
      ].forEach(closeModal);
    }
  });

  // Table filter tabs
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.getAttribute('data-filter');
      renderTodayTable(state.todayRecords, state.activeFilter);
    });
  });

  // ==========================================
  // UTILITIES
  // ==========================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    
    let icon = '<i class="fa-solid fa-circle-info"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';

    toast.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ==========================================
  // APP BOOTSTRAP
  // ==========================================
  async function initializeApp() {
    await Promise.all([
      fetchDashboardData(),
      fetchStudentsData(),
      fetchAbsenteesData(),
      fetchSettings()
    ]);
  }

  initializeApp();
});
