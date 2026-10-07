const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DATABASE_PATH || process.env.DB_PATH || process.env.DB_FILE || path.join(__dirname, '..', 'database', 'campuspulse.json');

// Default initial state structure
const initialData = {
  college_settings: {
    id: 'settings-1',
    college_name: "", // Starts empty / "No College Setup"
    college_logo: "",
    tag_line: "",
    address: "",
    website: "",
    contact_phone: "",
    contact_email: "",
    academic_year: "2026-2027",
    principal_name: "",
    alert_threshold: 85
  },
  departments: [],
  sections: [],
  advisers: [],
  students: [],
  attendance: [],
  motivational_quotes: [],
  flyers: [],
  users: []
};

class JSONDatabase {
  constructor() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.init();
  }

  init() {
    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...initialData, ...parsed };
      } catch (err) {
        console.error('Error reading database file, using fallback initial data:', err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  // Settings
  getSettings() {
    return this.data.college_settings;
  }

  updateSettings(newSettings) {
    this.data.college_settings = { ...this.data.college_settings, ...newSettings };
    this.save();
    return this.data.college_settings;
  }

  // Departments
  getDepartments() {
    return this.data.departments;
  }

  getDepartmentById(id) {
    return this.data.departments.find(d => d.id === id);
  }

  addDepartment(dept) {
    const newDept = {
      id: dept.id || `dept-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: dept.code,
      name: dept.name,
      hod_name: dept.hod_name || '',
      department_logo: dept.department_logo || '',
      description: dept.description || '',
      status: dept.status || 'ACTIVE',
      created_at: new Date().toISOString()
    };
    this.data.departments.push(newDept);
    this.save();
    return newDept;
  }

  updateDepartment(id, updates) {
    const index = this.data.departments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.data.departments[index] = { ...this.data.departments[index], ...updates };
      this.save();
      return this.data.departments[index];
    }
    return null;
  }

  deleteDepartment(id) {
    const index = this.data.departments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.data.departments.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Sections
  getSections(deptId = null, year = null) {
    let list = this.data.sections;
    if (deptId) list = list.filter(s => s.department_id === deptId);
    if (year) list = list.filter(s => s.year === year);
    return list;
  }

  getSectionById(id) {
    return this.data.sections.find(s => s.id === id);
  }

  addSection(sec) {
    const newSec = {
      id: sec.id || `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      department_id: sec.department_id,
      year: sec.year,
      section_name: sec.section_name,
      academic_year: sec.academic_year || '2026-2027',
      adviser_name: sec.adviser_name || 'Unassigned',
      adviser_email: sec.adviser_email || '',
      status: sec.status || 'ACTIVE'
    };
    this.data.sections.push(newSec);
    this.save();
    return newSec;
  }

  updateSection(id, updates) {
    const index = this.data.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.sections[index] = { ...this.data.sections[index], ...updates };
      this.save();
      return this.data.sections[index];
    }
    return null;
  }

  deleteSection(id) {
    const index = this.data.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.sections.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Advisers
  getAdvisers({ department_id, year, section_id } = {}) {
    let list = this.data.advisers || [];
    if (department_id) list = list.filter(a => a.department_id === department_id);
    if (year) list = list.filter(a => a.year === year);
    if (section_id) list = list.filter(a => a.section_id === section_id);
    return list;
  }

  getAdviserById(id) {
    return (this.data.advisers || []).find(a => a.id === id);
  }

  addAdviser(adv) {
    if (!this.data.advisers) this.data.advisers = [];
    const newAdviser = {
      id: adv.id || `adv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: adv.name,
      department_id: adv.department_id,
      year: adv.year,
      section_id: adv.section_id,
      photo_url: adv.photo_url || '',
      email: adv.email || '',
      phone: adv.phone || '',
      status: adv.status || 'ACTIVE'
    };
    this.data.advisers.push(newAdviser);
    this.save();
    return newAdviser;
  }

  updateAdviser(id, updates) {
    const index = (this.data.advisers || []).findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.advisers[index] = { ...this.data.advisers[index], ...updates };
      this.save();
      return this.data.advisers[index];
    }
    return null;
  }

  deleteAdviser(id) {
    const index = (this.data.advisers || []).findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.advisers.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Students
  getStudents({ department_id, year, section_id, search, gender } = {}) {
    let list = this.data.students;
    if (department_id) list = list.filter(s => s.department_id === department_id);
    if (year) list = list.filter(s => s.year === year);
    if (section_id) list = list.filter(s => s.section_id === section_id);
    if (gender) list = list.filter(s => s.gender.toLowerCase() === gender.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q) ||
        s.register_no.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getStudentById(id) {
    return this.data.students.find(s => s.id === id);
  }

  addStudent(stu) {
    const newStudent = {
      id: stu.id || `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: stu.name,
      roll_no: stu.roll_no,
      register_no: stu.register_no || `7100${stu.roll_no}`,
      gender: stu.gender || 'Male',
      department_id: stu.department_id,
      year: stu.year,
      section_id: stu.section_id,
      photo_url: stu.photo_url || '',
      status: stu.status || 'ACTIVE'
    };
    this.data.students.push(newStudent);
    this.save();
    return newStudent;
  }

  updateStudent(id, updates) {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.students[index] = { ...this.data.students[index], ...updates };
      this.save();
      return this.data.students[index];
    }
    return null;
  }

  deleteStudent(id) {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.students.splice(index, 1);
      this.data.attendance = this.data.attendance.filter(a => a.student_id !== id);
      this.save();
      return true;
    }
    return false;
  }

  // Attendance (Constraint: Unique student_id + date)
  getAttendance({ date, department_id, year, section_id } = {}) {
    let list = this.data.attendance;
    if (date) list = list.filter(a => a.date === date);

    return list.map(a => {
      const student = this.getStudentById(a.student_id);
      return {
        ...a,
        student: student || null
      };
    }).filter(a => {
      if (!a.student) return false;
      if (department_id && a.student.department_id !== department_id) return false;
      if (year && a.student.year !== year) return false;
      if (section_id && a.student.section_id !== section_id) return false;
      return true;
    });
  }

  // Grouped Attendance History
  getAttendanceHistory({ date, department_id, year, section_id } = {}) {
    let records = this.data.attendance.map(a => {
      const student = this.getStudentById(a.student_id);
      return { ...a, student };
    }).filter(a => a.student != null);

    if (date) records = records.filter(a => a.date === date);
    if (department_id) records = records.filter(a => a.student.department_id === department_id);
    if (year) records = records.filter(a => a.student.year === year);
    if (section_id) records = records.filter(a => a.student.section_id === section_id);

    const groups = new Map();
    records.forEach(r => {
      const key = `${r.date}_${r.student.department_id}_${r.student.year}_${r.student.section_id}`;
      if (!groups.has(key)) {
        const dept = this.getDepartmentById(r.student.department_id);
        const sec = this.getSectionById(r.student.section_id);
        groups.set(key, {
          key,
          date: r.date,
          department_id: r.student.department_id,
          department_code: dept?.code || 'DEPT',
          department_name: dept?.name || 'Department',
          year: r.student.year,
          section_id: r.student.section_id,
          section_name: sec?.section_name || 'Section',
          academic_year: sec?.academic_year || '2026-2027',
          marked_by: r.marked_by || 'Staff Adviser',
          updated_at: r.updated_at || r.created_at,
          presentCount: 0,
          absentCount: 0,
          totalStudents: 0
        });
      }
      const item = groups.get(key);
      item.totalStudents++;
      if (r.status === 'PRESENT') item.presentCount++;
      else item.absentCount++;
    });

    const result = Array.from(groups.values()).map(g => ({
      ...g,
      overallPct: g.totalStudents > 0 ? parseFloat(((g.presentCount / g.totalStudents) * 100).toFixed(1)) : 0
    }));

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  saveBulkAttendance(records, markedBy = 'Staff Adviser') {
    const updatedRecords = [];
    const now = new Date().toISOString();

    records.forEach(rec => {
      if (!rec.student_id || !rec.date) return;

      const existingIndex = this.data.attendance.findIndex(
        a => a.student_id === rec.student_id && a.date === rec.date
      );

      if (existingIndex !== -1) {
        this.data.attendance[existingIndex] = {
          ...this.data.attendance[existingIndex],
          status: rec.status,
          reason: rec.status === 'ABSENT' ? (rec.reason || 'Personal Issues') : null,
          custom_reason: rec.status === 'ABSENT' ? (rec.custom_reason || '') : '',
          marked_by: markedBy,
          updated_at: now
        };
        updatedRecords.push(this.data.attendance[existingIndex]);
      } else {
        const newRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          student_id: rec.student_id,
          date: rec.date,
          status: rec.status,
          reason: rec.status === 'ABSENT' ? (rec.reason || 'Personal Issues') : null,
          custom_reason: rec.status === 'ABSENT' ? (rec.custom_reason || '') : '',
          marked_by: markedBy,
          created_at: now,
          updated_at: now
        };
        this.data.attendance.push(newRecord);
        updatedRecords.push(newRecord);
      }
    });

    this.save();
    return updatedRecords;
  }

  // Motivational Quotes
  getQuotes() {
    return this.data.motivational_quotes;
  }

  getRandomQuote() {
    const active = this.data.motivational_quotes.filter(q => q.is_active);
    if (active.length === 0) {
      return {
        quote: "Every day is a new opportunity to learn and grow.",
        author: "CampusPulse AI"
      };
    }
    const randomIndex = Math.floor(Math.random() * active.length);
    return active[randomIndex];
  }

  addQuote(q) {
    const newQuote = {
      id: `quote-${Date.now()}`,
      quote: q.quote,
      author: q.author || 'Anonymous',
      category: q.category || 'General',
      is_active: q.is_active !== undefined ? q.is_active : true
    };
    this.data.motivational_quotes.push(newQuote);
    this.save();
    return newQuote;
  }

  // Flyers
  getFlyers({ date, department_id, section_id } = {}) {
    let list = this.data.flyers;
    if (date) list = list.filter(f => f.date === date);
    if (department_id) list = list.filter(f => f.department_id === department_id);
    if (section_id) list = list.filter(f => f.section_id === section_id);
    return list;
  }

  saveFlyer(flyerData) {
    const newFlyer = {
      id: `flyer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      department_id: flyerData.department_id,
      year: flyerData.year,
      section_id: flyerData.section_id,
      date: flyerData.date,
      theme: flyerData.theme || 'College Premium',
      flyer_data: flyerData.flyer_data,
      created_at: new Date().toISOString(),
      created_by: flyerData.created_by || 'Staff Adviser'
    };
    this.data.flyers.unshift(newFlyer);
    this.save();
    return newFlyer;
  }

  // Users
  getUsers() {
    return this.data.users;
  }

  getUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  addUser(user) {
    const newUser = {
      id: `user-${Date.now()}`,
      username: user.username,
      password: user.password || '123456',
      full_name: user.full_name,
      role: user.role,
      department_id: user.department_id || null
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
}

const db = new JSONDatabase();
module.exports = db;
