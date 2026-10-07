require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const corsOptions = process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {};
app.use(cors(corsOptions));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use(express.json({ limit: '10mb' }));

// Ensure upload folders exist
const uploadsBaseDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const studentUploadsDir = path.join(uploadsBaseDir, 'students');
const adviserUploadsDir = path.join(uploadsBaseDir, 'advisers');
const collegeUploadsDir = path.join(uploadsBaseDir, 'college');
const deptUploadsDir = path.join(uploadsBaseDir, 'departments');

[uploadsBaseDir, studentUploadsDir, adviserUploadsDir, collegeUploadsDir, deptUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsBaseDir));

// Generic Multer File Filter for Images (JPG, JPEG, PNG, WEBP)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP images are supported.'));
  }
};

const createMulterUpload = (subFolder, filePrefix) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = path.join(uploadsBaseDir, subFolder);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${filePrefix}-${uniqueSuffix}${ext}`);
    }
  });
  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });
};

const uploadStudentPhoto = createMulterUpload('students', 'student');
const uploadAdviserPhoto = createMulterUpload('advisers', 'adviser');
const uploadCollegeLogo = createMulterUpload('college', 'college-logo');
const uploadDeptLogo = createMulterUpload('departments', 'dept-logo');

function calculateAttendanceStats(students, attendanceRecords) {
  const totalStudents = students.length;
  const boys = students.filter(s => s.gender === 'Male');
  const girls = students.filter(s => s.gender === 'Female');

  const attendanceMap = new Map();
  attendanceRecords.forEach(a => {
    attendanceMap.set(a.student_id, a);
  });

  let presentCount = 0;
  let absentCount = 0;

  let boysPresent = 0;
  let boysAbsent = 0;

  let girlsPresent = 0;
  let girlsAbsent = 0;

  const absentList = [];
  const presentList = [];

  students.forEach(s => {
    const record = attendanceMap.get(s.id);
    const isPresent = record ? record.status === 'PRESENT' : true;
    const isBoys = s.gender === 'Male';

    if (isPresent) {
      presentCount++;
      if (isBoys) boysPresent++;
      else girlsPresent++;
      presentList.push(s);
    } else {
      absentCount++;
      if (isBoys) boysAbsent++;
      else girlsAbsent++;
      absentList.push({
        ...s,
        reason: record.reason || 'Personal Issues',
        custom_reason: record.custom_reason || ''
      });
    }
  });

  const overallPct = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
  const boysPct = boys.length > 0 ? ((boysPresent / boys.length) * 100).toFixed(1) : 0;
  const girlsPct = girls.length > 0 ? ((girlsPresent / girls.length) * 100).toFixed(1) : 0;

  return {
    totalStudents,
    presentCount,
    absentCount,
    overallPct: parseFloat(overallPct),
    boys: {
      total: boys.length,
      present: boysPresent,
      absent: boysAbsent,
      pct: parseFloat(boysPct)
    },
    girls: {
      total: girls.length,
      present: girlsPresent,
      absent: girlsAbsent,
      pct: parseFloat(girlsPct)
    },
    absentList,
    presentList
  };
}

// Famous Colleges Suggestion Dataset
const FAMOUS_COLLEGES = [
  { name: "Erode Sengunthar Engineering College", city: "Erode", state: "Tamil Nadu", logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80" },
  { name: "Erode Institute of Technology", city: "Erode", state: "Tamil Nadu", logo: "" },
  { name: "IRTT - Institute of Road and Transport Technology", city: "Erode", state: "Tamil Nadu", logo: "" },
  { name: "Velalar College of Engineering and Technology", city: "Erode", state: "Tamil Nadu", logo: "" },
  { name: "Bannari Amman Institute of Technology", city: "Sathyamangalam", state: "Tamil Nadu", logo: "" },
  { name: "PSG College of Technology", city: "Coimbatore", state: "Tamil Nadu", logo: "" },
  { name: "Coimbatore Institute of Technology", city: "Coimbatore", state: "Tamil Nadu", logo: "" },
  { name: "KPR Institute of Engineering and Technology", city: "Coimbatore", state: "Tamil Nadu", logo: "" },
  { name: "Kumaraguru College of Technology", city: "Coimbatore", state: "Tamil Nadu", logo: "" },
  { name: "IIT Madras - Indian Institute of Technology", city: "Chennai", state: "Tamil Nadu", logo: "" },
  { name: "Anna University - College of Engineering Guindy", city: "Chennai", state: "Tamil Nadu", logo: "" },
  { name: "Vellore Institute of Technology (VIT)", city: "Vellore", state: "Tamil Nadu", logo: "" },
  { name: "SRM Institute of Science and Technology", city: "Kanchipuram", state: "Tamil Nadu", logo: "" }
];

app.get('/api/colleges/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);
  const query = q.toLowerCase();
  const matches = FAMOUS_COLLEGES.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.city.toLowerCase().includes(query)
  );
  res.json(matches);
});

// College Settings API
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.post('/api/college/upload-logo', uploadCollegeLogo.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No logo file uploaded' });
  }
  const logoUrl = `${req.protocol}://${req.get('host')}/uploads/college/${req.file.filename}`;
  res.json({ logo_url: logoUrl });
});

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user = db.getUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const { password: _, ...userNoPassword } = user;
  res.json({
    token: `token-${user.id}-${Date.now()}`,
    user: userNoPassword
  });
});

// Departments API
app.get('/api/departments', (req, res) => {
  res.json(db.getDepartments());
});

app.post('/api/departments', (req, res) => {
  const { code, name, hod_name, department_logo, description, status } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Code and Name are required' });
  }
  const newDept = db.addDepartment({ code, name, hod_name, department_logo, description, status });
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', (req, res) => {
  const updated = db.updateDepartment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Department not found' });
  res.json(updated);
});

app.delete('/api/departments/:id', (req, res) => {
  const success = db.deleteDepartment(req.params.id);
  if (!success) return res.status(404).json({ error: 'Department not found' });
  res.json({ message: 'Department deleted successfully' });
});

app.post('/api/departments/upload-logo', uploadDeptLogo.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No logo uploaded' });
  }
  const logoUrl = `${req.protocol}://${req.get('host')}/uploads/departments/${req.file.filename}`;
  res.json({ logo_url: logoUrl });
});

// Sections API
app.get('/api/sections', (req, res) => {
  const { department_id, year } = req.query;
  res.json(db.getSections(department_id, year));
});

app.post('/api/sections', (req, res) => {
  const { department_id, year, section_name, academic_year, adviser_name, adviser_email } = req.body;
  if (!department_id || !year || !section_name) {
    return res.status(400).json({ error: 'Department, Year and Section Name are required' });
  }
  const newSec = db.addSection({ department_id, year, section_name, academic_year, adviser_name, adviser_email });
  res.status(201).json(newSec);
});

app.put('/api/sections/:id', (req, res) => {
  const updated = db.updateSection(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Section not found' });
  res.json(updated);
});

app.delete('/api/sections/:id', (req, res) => {
  const success = db.deleteSection(req.params.id);
  if (!success) return res.status(404).json({ error: 'Section not found' });
  res.json({ message: 'Section deleted successfully' });
});

// Advisers API
app.get('/api/advisers', (req, res) => {
  const { department_id, year, section_id } = req.query;
  res.json(db.getAdvisers({ department_id, year, section_id }));
});

app.post('/api/advisers', (req, res) => {
  const { name, department_id, year, section_id, photo_url, email, phone } = req.body;
  if (!name || !department_id || !year || !section_id) {
    return res.status(400).json({ error: 'Name, Department, Year, and Section are required' });
  }
  const newAdviser = db.addAdviser({ name, department_id, year, section_id, photo_url, email, phone });
  
  const sec = db.getSectionById(section_id);
  if (sec) {
    db.updateSection(section_id, { adviser_name: name, adviser_email: email || sec.adviser_email });
  }

  res.status(201).json(newAdviser);
});

app.put('/api/advisers/:id', (req, res) => {
  const updated = db.updateAdviser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Adviser not found' });
  
  if (updated.section_id && updated.name) {
    db.updateSection(updated.section_id, { adviser_name: updated.name, adviser_email: updated.email || '' });
  }

  res.json(updated);
});

app.delete('/api/advisers/:id', (req, res) => {
  const success = db.deleteAdviser(req.params.id);
  if (!success) return res.status(404).json({ error: 'Adviser not found' });
  res.json({ message: 'Adviser deleted successfully' });
});

app.post('/api/advisers/upload-photo', uploadAdviserPhoto.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/advisers/${req.file.filename}`;
  res.json({ photo_url: photoUrl });
});

// Students API
app.get('/api/students', (req, res) => {
  const { department_id, year, section_id, search, gender } = req.query;
  const students = db.getStudents({ department_id, year, section_id, search, gender });
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { name, roll_no, register_no, gender, department_id, year, section_id, photo_url } = req.body;
  if (!name || !roll_no || !department_id || !year || !section_id) {
    return res.status(400).json({ error: 'Name, Roll No, Department, Year and Section are required' });
  }
  const newStudent = db.addStudent({
    name, roll_no, register_no, gender, department_id, year, section_id, photo_url
  });
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const updated = db.updateStudent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Student not found' });
  res.json(updated);
});

app.delete('/api/students/:id', (req, res) => {
  const success = db.deleteStudent(req.params.id);
  if (!success) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student deleted successfully' });
});

app.post('/api/students/upload-photo', uploadStudentPhoto.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/students/${req.file.filename}`;
  res.json({ photo_url: photoUrl });
});

// Daily Attendance API
app.get('/api/attendance', (req, res) => {
  const { date, department_id, year, section_id } = req.query;
  if (!date) return res.status(400).json({ error: 'Date query parameter is required' });

  const students = db.getStudents({ department_id, year, section_id });
  const attendanceRecords = db.getAttendance({ date, department_id, year, section_id });

  const stats = calculateAttendanceStats(students, attendanceRecords);

  const studentRecords = students.map(s => {
    const record = attendanceRecords.find(a => a.student_id === s.id);
    return {
      ...s,
      attendance_status: record ? record.status : 'PRESENT',
      reason: record ? record.reason : '',
      custom_reason: record ? record.custom_reason : ''
    };
  });

  res.json({
    date,
    hasExistingRecords: attendanceRecords.length > 0,
    statistics: stats,
    students: studentRecords
  });
});

app.get('/api/attendance/history', (req, res) => {
  const { date, department_id, year, section_id } = req.query;
  const history = db.getAttendanceHistory({ date, department_id, year, section_id });
  res.json(history);
});

app.post('/api/attendance/bulk', (req, res) => {
  const { records, marked_by } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Records array is required' });
  }

  const updated = db.saveBulkAttendance(records, marked_by || 'Staff Adviser');
  res.json({
    message: 'Attendance saved successfully',
    updated_count: updated.length
  });
});

// Principal Analytics API
app.get('/api/analytics/principal', (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const allStudents = db.getStudents();
  const allAttendance = db.getAttendance({ date: targetDate });

  const overallStats = calculateAttendanceStats(allStudents, allAttendance);

  const departments = db.getDepartments().filter(d => d.status === 'ACTIVE');
  const departmentBreakdown = departments.map(dept => {
    const deptStudents = allStudents.filter(s => s.department_id === dept.id);
    const deptAttendance = allAttendance.filter(a => a.student && a.student.department_id === dept.id);
    const stats = calculateAttendanceStats(deptStudents, deptAttendance);

    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      hod_name: dept.hod_name || '',
      department_logo: dept.department_logo || '',
      ...stats
    };
  });

  let highestDept = null;
  let lowestDept = null;
  let mostAbsentDept = null;

  if (departmentBreakdown.length > 0) {
    const sortedByPct = [...departmentBreakdown].sort((a, b) => b.overallPct - a.overallPct);
    highestDept = sortedByPct[0];
    lowestDept = sortedByPct[sortedByPct.length - 1];

    const sortedByAbsent = [...departmentBreakdown].sort((a, b) => b.absentCount - a.absentCount);
    mostAbsentDept = sortedByAbsent[0];
  }

  res.json({
    date: targetDate,
    overall: overallStats,
    departments: departmentBreakdown,
    highlights: {
      highestAttendanceDept: highestDept ? { code: highestDept.code, pct: highestDept.overallPct } : null,
      lowestAttendanceDept: lowestDept ? { code: lowestDept.code, pct: lowestDept.overallPct } : null,
      mostAbsentDept: mostAbsentDept ? { code: mostAbsentDept.code, count: mostAbsentDept.absentCount } : null
    }
  });
});

// Staff / AI Insights API
app.get('/api/analytics/staff', (req, res) => {
  const { department_id, year, section_id, date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const students = db.getStudents({ department_id, year, section_id });
  const attendance = db.getAttendance({ date: targetDate, department_id, year, section_id });

  const stats = calculateAttendanceStats(students, attendance);

  const dept = db.getDepartmentById(department_id);
  const sec = db.getSectionById(section_id);
  const adviser = db.getAdvisers({ department_id, year, section_id })[0] || null;

  let aiInsightText = '';
  if (students.length === 0) {
    aiInsightText = 'No students found for the selected department and section.';
  } else if (stats.absentCount === 0) {
    aiInsightText = `✨ Outstanding! ${dept ? dept.code : 'Class'} ${sec ? sec.year + ' ' + sec.section_name : ''} achieved 100% attendance today with zero absences.`;
  } else {
    const medicalCount = stats.absentList.filter(a => a.reason === 'Medical' || a.reason === 'Fever').length;
    const odCount = stats.absentList.filter(a => a.reason === 'On Duty').length;

    let breakDetails = [];
    if (medicalCount > 0) breakDetails.push(`${medicalCount} medical/fever`);
    if (odCount > 0) breakDetails.push(`${odCount} On Duty`);
    const otherCount = stats.absentCount - medicalCount - odCount;
    if (otherCount > 0) breakDetails.push(`${otherCount} personal/other`);

    aiInsightText = `🤖 AI Insight: ${dept ? dept.code : 'Class'} ${sec ? sec.year + ' ' + sec.section_name : ''} recorded ${stats.overallPct}% attendance today (${stats.presentCount} present, ${stats.absentCount} absent). Primary absence reasons include: ${breakDetails.join(', ')}.`;
  }

  res.json({
    date: targetDate,
    stats,
    adviser,
    aiInsightText,
    isBelowThreshold: stats.overallPct < (db.getSettings().alert_threshold || 85)
  });
});

// Attendance Trends API
app.get('/api/analytics/trends', (req, res) => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    dates.push(dt.toISOString().split('T')[0]);
  }

  const allStudents = db.getStudents();

  const trendData = dates.map(dStr => {
    const att = db.getAttendance({ date: dStr });
    const stats = calculateAttendanceStats(allStudents, att);
    return {
      date: dStr,
      displayDate: new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      attendancePct: stats.overallPct,
      present: stats.presentCount,
      absent: stats.absentCount
    };
  });

  res.json(trendData);
});

// Motivational Quotes API
app.get('/api/quotes', (req, res) => {
  res.json(db.getQuotes());
});

app.get('/api/quotes/random', (req, res) => {
  res.json(db.getRandomQuote());
});

app.post('/api/quotes', (req, res) => {
  const { quote, author, category } = req.body;
  if (!quote) return res.status(400).json({ error: 'Quote text is required' });
  const newQuote = db.addQuote({ quote, author, category });
  res.status(201).json(newQuote);
});

// Flyers API
app.get('/api/flyers', (req, res) => {
  const { date, department_id, section_id } = req.query;
  res.json(db.getFlyers({ date, department_id, section_id }));
});

app.post('/api/flyers', (req, res) => {
  const { department_id, year, section_id, date, theme, flyer_data, created_by } = req.body;
  if (!department_id || !section_id || !date || !flyer_data) {
    return res.status(400).json({ error: 'Missing required flyer fields' });
  }

  const saved = db.saveFlyer({ department_id, year, section_id, date, theme, flyer_data, created_by });
  res.status(201).json(saved);
});

// Start Server
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`🚀 CampusPulse AI Server running on http://System.Management.Automation.Internal.Host.InternalHost:${PORT}`);
});
