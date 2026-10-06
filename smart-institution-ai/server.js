const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, 'public', 'uploads', 'students'),
  path.join(__dirname, 'public', 'uploads', 'college'),
  path.join(__dirname, 'public', 'uploads', 'adviser'),
  path.join(__dirname, 'database')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage for student photos
const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads', 'students'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    cb(null, 'student-' + uniqueSuffix + ext);
  }
});

// Configure Multer storage for college settings (logo and adviser photo)
const settingsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'college_logo') {
      cb(null, path.join(__dirname, 'public', 'uploads', 'college'));
    } else {
      cb(null, path.join(__dirname, 'public', 'uploads', 'adviser'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Image file filter
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg\+xml|svg/;
  const mimeMatch = allowedTypes.test(file.mimetype);
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeMatch || extMatch) {
    return cb(null, true);
  }
  cb(new Error('Only valid image files (JPG, PNG, WEBP, SVG) are allowed!'));
};

const uploadStudent = multer({
  storage: studentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: imageFileFilter
});

const uploadSettings = multer({
  storage: settingsStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Serve institutional assets if present
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Route: Serve index.html from templates/ at '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// ==========================================
// REST API ROUTES
// ==========================================

/**
 * GET /api/dashboard
 * Returns summary counters: totalStudents, presentToday, absentToday
 */
app.get('/api/dashboard', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics',
      details: error.message
    });
  }
});

/**
 * GET /api/students
 * Returns all students
 */
app.get('/api/students', (req, res) => {
  try {
    const students = db.getAllStudents();
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve student records',
      details: error.message
    });
  }
});

/**
 * POST /api/students
 * Add a new student (with optional photo upload and leave reason)
 */
app.post('/api/students', uploadStudent.single('photo'), (req, res) => {
  try {
    const { name, roll_no, leave_reason } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Student Name is required.'
      });
    }

    if (!roll_no || !roll_no.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Roll Number is required.'
      });
    }

    let photo_url = '';
    if (req.file) {
      photo_url = '/uploads/students/' + req.file.filename;
    }

    const newStudent = db.addStudent({
      name,
      roll_no,
      photo_url,
      leave_reason: leave_reason || ''
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully!',
      data: newStudent
    });
  } catch (error) {
    console.error('Error adding student:', error);
    const statusCode = error.message && error.message.includes('already exists') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/students/:id
 * Return one student's complete attendance details
 */
app.get('/api/students/:id', (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID. ID must be a positive integer.'
      });
    }

    const student = db.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student with ID ' + studentId + ' not found.'
      });
    }

    const markedToday = db.hasAttendanceToday(studentId);

    res.json({
      success: true,
      data: {
        ...student,
        marked_today: markedToday
      }
    });
  } catch (error) {
    console.error('Error fetching student #' + req.params.id + ':', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve student details',
      details: error.message
    });
  }
});

/**
 * DELETE /api/students/:id
 * Delete a student and cascade attendance history
 */
app.delete('/api/students/:id', (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID. ID must be a positive integer.'
      });
    }

    const deleted = db.deleteStudent(studentId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Student with ID ' + studentId + ' does not exist.'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting student #' + req.params.id + ':', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student',
      details: error.message
    });
  }
});

/**
 * POST /api/attendance
 * Mark attendance for student today (Present or Absent + optional reason)
 */
app.post('/api/attendance', (req, res) => {
  try {
    const { student_id, status, reason } = req.body;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        error: 'student_id is required.'
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "Present" or "Absent".'
      });
    }

    const updatedStudent = db.recordAttendance({
      student_id: parseInt(student_id, 10),
      status,
      reason: reason || ''
    });

    res.json({
      success: true,
      message: 'Attendance marked as ' + status + ' for ' + updatedStudent.name,
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    const statusCode = error.message && error.message.includes('already been marked') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/attendance/today
 * Return today's attendance records
 */
app.get('/api/attendance/today', (req, res) => {
  try {
    const records = db.getTodayAttendance();
    res.json({
      success: true,
      date: db.getTodayDateString(),
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve today attendance',
      details: error.message
    });
  }
});

/**
 * GET /api/attendance/absentees
 * Return today's absent students with photo and leave reason
 */
app.get('/api/attendance/absentees', (req, res) => {
  try {
    const absentees = db.getTodayAbsentees();
    res.json({
      success: true,
      date: db.getTodayDateString(),
      count: absentees.length,
      data: absentees
    });
  } catch (error) {
    console.error('Error fetching today absentees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve today absentees',
      details: error.message
    });
  }
});

/**
 * GET /api/settings
 * Retrieve College & Department Settings
 */
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve college settings',
      details: error.message
    });
  }
});

/**
 * Helper to update settings from request
 */
const handleUpdateSettings = (req, res) => {
  try {
    const { college_name, department_name, section, adviser_name } = req.body;
    const updateData = {};

    if (college_name !== undefined) updateData.college_name = college_name.trim();
    if (department_name !== undefined) updateData.department_name = department_name.trim();
    if (section !== undefined) updateData.section = section.trim();
    if (adviser_name !== undefined) updateData.adviser_name = adviser_name.trim();

    if (req.files && req.files['college_logo'] && req.files['college_logo'][0]) {
      updateData.college_logo = '/uploads/college/' + req.files['college_logo'][0].filename;
    } else if (req.body && req.body.college_logo !== undefined) {
      updateData.college_logo = req.body.college_logo;
    }

    if (req.files && req.files['adviser_photo'] && req.files['adviser_photo'][0]) {
      updateData.adviser_photo = '/uploads/adviser/' + req.files['adviser_photo'][0].filename;
    } else if (req.body && req.body.adviser_photo !== undefined) {
      updateData.adviser_photo = req.body.adviser_photo;
    }

    const updated = db.updateSettings(updateData);
    res.json({
      success: true,
      message: 'Settings saved successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      details: error.message
    });
  }
};

/**
 * PUT /api/settings
 * Update College & Department Settings (single settings record, creates if not exists)
 */
app.put('/api/settings', uploadSettings.fields([
  { name: 'college_logo', maxCount: 1 },
  { name: 'adviser_photo', maxCount: 1 }
]), handleUpdateSettings);

/**
 * POST /api/settings
 * Also support POST for settings updates
 */
app.post('/api/settings', uploadSettings.fields([
  { name: 'college_logo', maxCount: 1 },
  { name: 'adviser_photo', maxCount: 1 }
]), handleUpdateSettings);

// Fallback 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Global error handler (handles Multer errors and unhandled exceptions)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'Upload error: ' + err.message
    });
  }
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred'
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(' Smart Institution AI - Attendance Management System');
  console.log(' AI & DS Department');
  console.log(' Server is running on port: ' + PORT);
  console.log('====================================================');
});

module.exports = { app, server };
