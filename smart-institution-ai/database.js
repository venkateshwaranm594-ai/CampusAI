const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'institution.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize tables and seed initial data
function initializeDatabase() {
  // 1. Create students table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_no TEXT NOT NULL UNIQUE,
      total_days INTEGER NOT NULL DEFAULT 0,
      present_days INTEGER NOT NULL DEFAULT 0,
      absent_days INTEGER NOT NULL DEFAULT 0,
      attendance REAL NOT NULL DEFAULT 0,
      photo_url TEXT DEFAULT ''
    );
  `);

  // Migration: Ensure photo_url column exists in students table
  const studentColumns = db.prepare("PRAGMA table_info(students)").all().map(c => c.name);
  if (!studentColumns.includes('photo_url')) {
    db.exec("ALTER TABLE students ADD COLUMN photo_url TEXT DEFAULT ''");
  }

  // 2. Create attendance table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
      reason TEXT DEFAULT '',
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  // Migration: Ensure reason column exists in attendance table
  const attendanceColumns = db.prepare("PRAGMA table_info(attendance)").all().map(c => c.name);
  if (!attendanceColumns.includes('reason')) {
    db.exec("ALTER TABLE attendance ADD COLUMN reason TEXT DEFAULT ''");
  }

  // 3. Create settings table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      college_name TEXT NOT NULL,
      department_name TEXT NOT NULL,
      section TEXT NOT NULL,
      adviser_name TEXT NOT NULL,
      college_logo TEXT DEFAULT '',
      adviser_photo TEXT DEFAULT ''
    );
  `);

  // Seed default settings if empty
  const settingsCount = db.prepare('SELECT COUNT(*) AS count FROM settings').get().count;
  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO settings (id, college_name, department_name, section, adviser_name, college_logo, adviser_photo)
      VALUES (1, @college_name, @department_name, @section, @adviser_name, @college_logo, @adviser_photo)
    `).run({
      college_name: 'SMART INSTITUTION OF ENGINEERING & TECHNOLOGY',
      department_name: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      section: 'III Year – Section A',
      adviser_name: 'Dr. S. K. Ramanathan, M.E., Ph.D.',
      college_logo: '/assets/college-crest.svg',
      adviser_photo: ''
    });
    console.log('Seeded default college settings.');
  }

  // 4. Seed Students if table is empty
  const studentCount = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;

  if (studentCount === 0) {
    const insertStudent = db.prepare(`
      INSERT INTO students (name, roll_no, total_days, present_days, absent_days, attendance, photo_url)
      VALUES (@name, @roll_no, @total_days, @present_days, @absent_days, @attendance, @photo_url)
    `);

    const sampleStudents = [
      { name: 'Arun Kumar', roll_no: 'AI101', total_days: 60, present_days: 55, absent_days: 5, attendance: 92, photo_url: '' },
      { name: 'Bala Kumar', roll_no: 'AI102', total_days: 60, present_days: 52, absent_days: 8, attendance: 87, photo_url: '' },
      { name: 'Dinesh Raj', roll_no: 'AI103', total_days: 60, present_days: 47, absent_days: 13, attendance: 78, photo_url: '' },
      { name: 'Karthik S', roll_no: 'AI104', total_days: 60, present_days: 57, absent_days: 3, attendance: 95, photo_url: '' },
      { name: 'Praveen M', roll_no: 'AI105', total_days: 60, present_days: 50, absent_days: 10, attendance: 84, photo_url: '' },
      { name: 'Vijay Kumar', roll_no: 'AI106', total_days: 60, present_days: 55, absent_days: 5, attendance: 91, photo_url: '' }
    ];

    const insertManyStudents = db.transaction((students) => {
      for (const student of students) {
        insertStudent.run(student);
      }
    });

    insertManyStudents(sampleStudents);
    console.log('Seeded 6 sample students into SQLite database.');
  }

  // 5. Seed Attendance for today if not already present
  seedTodayAttendance();
}

// Function to get current formatted date (YYYY-MM-DD) in local time
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Seed or ensure today's attendance has entries
function seedTodayAttendance() {
  const today = getTodayDateString();
  const todayCount = db.prepare('SELECT COUNT(*) AS count FROM attendance WHERE date = ?').get(today).count;

  if (todayCount === 0) {
    const students = db.prepare('SELECT id, roll_no FROM students ORDER BY id ASC').all();
    const insertAttendance = db.prepare(`
      INSERT INTO attendance (student_id, date, status, reason)
      VALUES (?, ?, ?, ?)
    `);

    // Assign realistic sample status for today:
    // AI103 (Dinesh Raj) & AI105 (Praveen M) absent with reasons, others present
    const seedRecords = db.transaction(() => {
      for (const student of students) {
        let status = 'Present';
        let reason = '';
        if (student.roll_no === 'AI103') {
          status = 'Absent';
          reason = 'Fever & Medical Rest';
        } else if (student.roll_no === 'AI105') {
          status = 'Absent';
          reason = 'Family Function Leave';
        }
        insertAttendance.run(student.id, today, status, reason);
      }
    });

    seedRecords();
    console.log(`Seeded today's attendance records for ${today}`);
  } else {
    // If today's records exist without reasons for absentees, ensure reasons are set
    const emptyReasonAbsentees = db.prepare(`
      SELECT a.id, s.roll_no 
      FROM attendance a 
      JOIN students s ON a.student_id = s.id 
      WHERE a.date = ? AND a.status = 'Absent' AND (a.reason IS NULL OR a.reason = '')
    `).all(today);

    if (emptyReasonAbsentees.length > 0) {
      const updateReason = db.prepare('UPDATE attendance SET reason = ? WHERE id = ?');
      for (const item of emptyReasonAbsentees) {
        let sampleReason = 'Personal Leave';
        if (item.roll_no === 'AI103') sampleReason = 'Fever & Medical Rest';
        if (item.roll_no === 'AI105') sampleReason = 'Family Function Leave';
        updateReason.run(sampleReason, item.id);
      }
    }
  }
}

// Initialize database right away
initializeDatabase();

// Database Query Helpers
module.exports = {
  db,
  getTodayDateString,

  // Get all students
  getAllStudents: () => {
    return db.prepare('SELECT * FROM students ORDER BY id ASC').all();
  },

  // Get single student by ID
  getStudentById: (id) => {
    return db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  },

  // Add new student
  addStudent: ({ name, roll_no, photo_url = '', leave_reason = '' }) => {
    const cleanRollNo = roll_no.trim().toUpperCase();
    const cleanName = name.trim();

    // Check duplicate roll number
    const existing = db.prepare('SELECT id FROM students WHERE UPPER(roll_no) = ?').get(cleanRollNo);
    if (existing) {
      throw new Error(`A student with Roll Number "${cleanRollNo}" already exists.`);
    }

    const insertStudent = db.prepare(`
      INSERT INTO students (name, roll_no, total_days, present_days, absent_days, attendance, photo_url)
      VALUES (?, ?, 0, 0, 0, 0, ?)
    `);

    let studentId;
    const executeAdd = db.transaction(() => {
      const info = insertStudent.run(cleanName, cleanRollNo, photo_url);
      studentId = info.lastInsertRowid;

      // If an optional initial leave reason is provided, mark absent for today
      if (leave_reason && leave_reason.trim()) {
        const today = getTodayDateString();
        db.prepare(`
          INSERT INTO attendance (student_id, date, status, reason)
          VALUES (?, ?, 'Absent', ?)
        `).run(studentId, today, leave_reason.trim());

        db.prepare(`
          UPDATE students 
          SET total_days = 1, absent_days = 1, attendance = 0
          WHERE id = ?
        `).run(studentId);
      }
    });

    executeAdd();
    return db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  },

  // Delete student and cascade attendance
  deleteStudent: (id) => {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) return null;

    const executeDelete = db.transaction(() => {
      db.prepare('DELETE FROM attendance WHERE student_id = ?').run(id);
      db.prepare('DELETE FROM students WHERE id = ?').run(id);
    });

    executeDelete();
    return student;
  },

  // Check if attendance already marked for student on specific date
  hasAttendanceToday: (studentId, date = getTodayDateString()) => {
    const row = db.prepare('SELECT id, status FROM attendance WHERE student_id = ? AND date = ?').get(studentId, date);
    return !!row;
  },

  // Mark attendance for student today
  recordAttendance: ({ student_id, status, reason = '', date = getTodayDateString() }) => {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
    if (!student) {
      throw new Error(`Student with ID ${student_id} not found.`);
    }

    if (!['Present', 'Absent'].includes(status)) {
      throw new Error('Invalid status. Must be "Present" or "Absent".');
    }

    // Check duplicate attendance for today
    const existing = db.prepare('SELECT id, status FROM attendance WHERE student_id = ? AND date = ?').get(student_id, date);
    if (existing) {
      throw new Error(`Attendance for this student has already been marked as "${existing.status}" for today (${date}).`);
    }

    const cleanReason = (reason || '').trim();

    const executeMark = db.transaction(() => {
      // 1. Insert into attendance table
      db.prepare(`
        INSERT INTO attendance (student_id, date, status, reason)
        VALUES (?, ?, ?, ?)
      `).run(student_id, date, status, cleanReason);

      // 2. Increment student total_days & present/absent counts
      const newTotal = student.total_days + 1;
      const newPresent = status === 'Present' ? student.present_days + 1 : student.present_days;
      const newAbsent = status === 'Absent' ? student.absent_days + 1 : student.absent_days;
      const newPct = Math.round((newPresent / newTotal) * 100);

      db.prepare(`
        UPDATE students
        SET total_days = ?, present_days = ?, absent_days = ?, attendance = ?
        WHERE id = ?
      `).run(newTotal, newPresent, newAbsent, newPct, student_id);
    });

    executeMark();
    return db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
  },

  // Get College Settings
  getSettings: () => {
    let settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    if (!settings) {
      db.prepare(`
        INSERT INTO settings (id, college_name, department_name, section, adviser_name, college_logo, adviser_photo)
        VALUES (1, @college_name, @department_name, @section, @adviser_name, @college_logo, @adviser_photo)
      `).run({
        college_name: 'SMART INSTITUTION OF ENGINEERING & TECHNOLOGY',
        department_name: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
        section: 'III Year – Section A',
        adviser_name: 'Dr. S. K. Ramanathan, M.E., Ph.D.',
        college_logo: '/assets/college-crest.svg',
        adviser_photo: ''
      });
      settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    }
    return settings;
  },

  // Update College Settings
  updateSettings: (data) => {
    const current = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {
      college_name: 'SMART INSTITUTION OF ENGINEERING & TECHNOLOGY',
      department_name: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      section: 'III Year – Section A',
      adviser_name: 'Dr. S. K. Ramanathan, M.E., Ph.D.',
      college_logo: '/assets/college-crest.svg',
      adviser_photo: ''
    };
    const college_name = data.college_name !== undefined ? data.college_name : (current.college_name || '');
    const department_name = data.department_name !== undefined ? data.department_name : (current.department_name || '');
    const section = data.section !== undefined ? data.section : (current.section || '');
    const adviser_name = data.adviser_name !== undefined ? data.adviser_name : (current.adviser_name || '');
    const college_logo = data.college_logo !== undefined ? data.college_logo : (current.college_logo || '');
    const adviser_photo = data.adviser_photo !== undefined ? data.adviser_photo : (current.adviser_photo || '');

    db.prepare(`
      INSERT INTO settings (id, college_name, department_name, section, adviser_name, college_logo, adviser_photo)
      VALUES (1, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        college_name = excluded.college_name,
        department_name = excluded.department_name,
        section = excluded.section,
        adviser_name = excluded.adviser_name,
        college_logo = excluded.college_logo,
        adviser_photo = excluded.adviser_photo
    `).run(college_name, department_name, section, adviser_name, college_logo, adviser_photo);

    return db.prepare('SELECT * FROM settings WHERE id = 1').get();
  },

  // Get today's attendance records with student names, roll numbers, photos, and reasons
  getTodayAttendance: () => {
    const today = getTodayDateString();
    return db.prepare(`
      SELECT 
        a.id AS attendance_id,
        a.date,
        a.status,
        a.reason,
        s.id AS student_id,
        s.name,
        s.roll_no,
        s.photo_url,
        s.attendance AS overall_attendance
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = ?
      ORDER BY s.id ASC
    `).all(today);
  },

  // Get today's absentees with photo and leave reason
  getTodayAbsentees: () => {
    const today = getTodayDateString();
    return db.prepare(`
      SELECT 
        s.id AS student_id,
        s.name,
        s.roll_no,
        s.photo_url,
        a.date,
        a.status,
        COALESCE(NULLIF(a.reason, ''), 'Personal Leave') AS reason
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = ? AND a.status = 'Absent'
      ORDER BY s.id ASC
    `).all(today);
  },

  // Get dashboard counts: totalStudents, presentToday, absentToday
  getDashboardStats: () => {
    const today = getTodayDateString();

    const totalStudentsRow = db.prepare('SELECT COUNT(*) AS total FROM students').get();
    const totalStudents = totalStudentsRow ? totalStudentsRow.total : 0;

    const presentRow = db.prepare(`
      SELECT COUNT(*) AS present 
      FROM attendance 
      WHERE date = ? AND status = 'Present'
    `).get(today);
    const presentToday = presentRow ? presentRow.present : 0;

    const absentRow = db.prepare(`
      SELECT COUNT(*) AS absent 
      FROM attendance 
      WHERE date = ? AND status = 'Absent'
    `).get(today);
    const absentToday = absentRow ? absentRow.absent : 0;

    return {
      totalStudents,
      presentToday,
      absentToday,
      date: today
    };
  }
};
