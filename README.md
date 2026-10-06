# Smart Institution AI – Attendance Management System

An intelligent, full-stack Attendance Management System built for the **Department of Artificial Intelligence & Data Science**. This application provides real-time attendance analytics, automated daily status tracking, interactive student rosters, and instantaneous student attendance profiling powered by Node.js, Express, SQLite, and vanilla modern web technologies.

---

## 🎯 Project Overview & Purpose

Managing attendance in modern collegiate institutions requires fast, accurate, and transparent visibility for both faculty and department heads. 

**Smart Institution AI** delivers:
- **Live Institutional Dashboard:** Instant counts of Total Enrolled Students, Present Today, and Absent Today.
- **Dynamic Daily Attendance:** Real-time visibility into today's classroom sessions with status breakdowns.
- **Instant Absentee Identification:** Quick-action cards displaying students on leave today with "Today Leave" tags.
- **Student Roster & Profiles:** Responsive cards showcasing individual student attendance percentage and progress rings.
- **Detailed Audit Modal:** Instant popups showing Total Working Days, Present Days, Absent Days, and academic eligibility alerts.
- **Instant Search:** Zero-latency client-side search by Student Name or Roll Number.

---

## 🛠️ Technology Stack

### Frontend
- **HTML5:** Semantic markup, accessible modals, and responsive layout.
- **CSS3:** Custom responsive design system, professional blue/white palette, glassmorphism, fluid cards, and micro-animations.
- **JavaScript (ES6+):** Asynchronous `fetch()` API calls, real-time filtering, DOM controllers, and event management (no heavy frameworks required).

### Backend
- **Node.js:** Fast, asynchronous JavaScript runtime.
- **Express.js:** Lightweight REST API server and static file provider.

### Database
- **SQLite:** Serverless, zero-configuration SQL database engine.
- **better-sqlite3:** High-performance synchronous SQLite driver with WAL mode enabled.

---

## 📂 Project Structure

```
smart-institution-ai/
│
├── public/
│   ├── style.css           # Modern blue & white design system with responsive layouts
│   └── script.js           # Dynamic fetch() API integration, search, & modal logic
│
├── templates/
│   └── index.html          # Semantic dashboard structure with accessible modal dialogs
│
├── database/
│   └── institution.db      # SQLite database file (auto-generated & seeded on startup)
│
├── database.js             # SQLite connection, schema creation, sample seed data, and queries
├── server.js               # Express application server and RESTful API endpoints
├── package.json            # Project dependencies and startup scripts
└── README.md               # Complete project documentation and guide
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes bundled with Node.js)

### Step 1: Open Terminal in Project Directory
```bash
cd smart-institution-ai
```
*(Or directly in the project root where `package.json` is located)*

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Application
```bash
npm start
```
For development mode with automatic restart on file edits:
```bash
npm run dev
```

### Step 4: Open in Web Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🌐 How Frontend → Backend → Database Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                       │
│  templates/index.html + public/style.css + public/script.js │
└──────────────────────────────┬──────────────────────────────┘
                               │
            fetch('/api/...')  │  JSON responses
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend Server                   │
│                          server.js                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
           better-sqlite3      │  SQL Query results
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database Engine                   │
│             database.js -> database/institution.db         │
└─────────────────────────────────────────────────────────────┘
```

1. **Client Request:** When the user visits `http://localhost:3000`, Express serves `templates/index.html`.
2. **Dynamic Data Fetching:** `public/script.js` fires asynchronous `fetch()` requests to Express REST API endpoints (`/api/dashboard`, `/api/students`, `/api/attendance/absentees`).
3. **Backend Processing:** `server.js` routes each request and queries the SQLite database using prepared statements in `database.js`.
4. **Data Persistence:** `better-sqlite3` reads and writes directly to `database/institution.db`.
5. **Interactive UI Update:** The browser receives clean JSON payloads and dynamically updates metric counters, progress bars, modal cards, and absentee lists without full-page reloads.

---

## 📡 REST API Documentation

All responses are returned in JSON format.

### 1. Dashboard Overview Statistics
- **Endpoint:** `GET /api/dashboard`
- **Description:** Returns summary counts for the dashboard header cards.
- **Example Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 6,
    "presentToday": 4,
    "absentToday": 2,
    "date": "2026-09-22"
  }
}
```

### 2. Get All Students
- **Endpoint:** `GET /api/students`
- **Description:** Returns the complete directory of enrolled students.
- **Example Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "name": "Arun Kumar",
      "roll_no": "AI101",
      "total_days": 60,
      "present_days": 55,
      "absent_days": 5,
      "attendance": 92
    }
  ]
}
```

### 3. Get Single Student Details
- **Endpoint:** `GET /api/students/:id`
- **Description:** Returns detailed attendance figures for a specific student by ID.
- **Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Arun Kumar",
    "roll_no": "AI101",
    "total_days": 60,
    "present_days": 55,
    "absent_days": 5,
    "attendance": 92
  }
}
```

### 4. Today's Attendance Roster
- **Endpoint:** `GET /api/attendance/today`
- **Description:** Returns attendance status for all students for the current session.
- **Example Response:**
```json
{
  "success": true,
  "date": "2026-09-22",
  "count": 6,
  "data": [
    {
      "attendance_id": 1,
      "date": "2026-09-22",
      "status": "Present",
      "student_id": 1,
      "name": "Arun Kumar",
      "roll_no": "AI101",
      "overall_attendance": 92
    }
  ]
}
```

### 5. Today's Absentees
- **Endpoint:** `GET /api/attendance/absentees`
- **Description:** Returns students currently marked as absent for today's session.
- **Example Response:**
```json
{
  "success": true,
  "date": "2026-09-22",
  "count": 2,
  "data": [
    {
      "student_id": 3,
      "name": "Dinesh Raj",
      "roll_no": "AI103",
      "date": "2026-09-22",
      "status": "Absent"
    },
    {
      "student_id": 5,
      "name": "Praveen M",
      "roll_no": "AI105",
      "date": "2026-09-22",
      "status": "Absent"
    }
  ]
}
```

---

## 🛡️ Error Handling & Validations

- **404 Handling:** Requests to invalid student IDs (`/api/students/999`) or unregistered routes return clear JSON error descriptions.
- **Input Validation:** Route parameters are sanitized and verified before querying SQLite.
- **Empty States:** The frontend handles zero-match searches or zero absentee days with pleasant contextual placeholders.
- **Database Self-Healing:** The database file and tables are automatically created if they do not exist when starting the server.

---

## 👨‍💻 Sample Seed Data

| Name | Roll Number | Total Days | Present | Absent | Attendance % |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Arun Kumar** | AI101 | 60 | 55 | 5 | 92% |
| **Bala Kumar** | AI102 | 60 | 52 | 8 | 87% |
| **Dinesh Raj** | AI103 | 60 | 47 | 13 | 78% |
| **Karthik S** | AI104 | 60 | 57 | 3 | 95% |
| **Praveen M** | AI105 | 60 | 50 | 10 | 84% |
| **Vijay Kumar** | AI106 | 60 | 55 | 5 | 91% |
