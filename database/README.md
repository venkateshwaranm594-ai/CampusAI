# CampusPulse AI

> AI-powered college attendance management and daily absence flyer platform.

CampusPulse AI is a complete platform designed for colleges to manage daily student attendance, monitor department level statistics, generate AI-driven attendance insights, and auto-generate cinematic daily absence flyers for staff and parents.

---

## 1. Features

- **College & Department Management**: Full setup for college details, logos, departments, HODs, and sections.
- **Student & Adviser Profiles**: Photo uploads and record management for students and faculty advisers.
- **Daily Attendance Marking**: Fast bulk attendance entry with Present/Absent status, reason tracking, and gender-wise statistics.
- **Attendance History**: Date-wise and section-wise historical logs and percentages.
- **Principal Dashboard**: Executive analytics, department rankings, threshold alerts, and high-level attendance insights.
- **Staff Dashboard**: Section-specific analytics, AI insights generation, and individual student status.
- **Flyer Studio**: Generate and preview customizable, cinematic daily absence flyers with motivational lines and multiple themes.
- **Flyer History**: Persistent history of generated daily flyers.
- **Global Search**: Instant search modal for students, advisers, and departments.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, html2canvas, jsPDF
- **Backend**: Node.js, Express.js, Multer (file uploads), CORS, dotenv
- **Database**: Persistent JSON Storage (`database/campuspulse.json`)
- **Deployment**: Render Web Service ready (Single full-stack service)

---

## 3. Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation
Clone the repository and install all dependencies:

```bash
git clone https://github.com/venkateshwaranm594-ai/CampusAI.git
cd CampusAI
npm run install:all
```

### Running Development Mode

Start Backend (Port 5000):
```bash
npm run dev:backend
```

Start Frontend (Port 3000):
```bash
npm run dev:frontend
```

Open http://localhost:3000 in your browser.

---

## 4. Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGIN=*
DATABASE_PATH=./database/campuspulse.json
UPLOADS_DIR=./uploads
```

---

## 5. Database Setup

CampusPulse AI uses persistent file-based JSON storage located at `database/campuspulse.json`.
- Initial seed data is pre-populated in `database/campuspulse.json`.
- To re-seed initial mock data if needed:
  ```bash
  npm run seed
  ```
- Custom database paths can be specified via the `DATABASE_PATH` environment variable.

---

## 6. Build Command

Build the production frontend bundle:

```bash
npm run build
```

---

## 7. Start Command

Run the production server:

```bash
npm start
```

The production Express server serves both the backend API (`/api/*`), uploads (`/uploads/*`), health check (`/health`), and static Vite frontend build.

---

## 8. Render Deployment Steps

Deploying to **Render** as a Web Service:

1. **New Web Service**: Connect your GitHub repository (`CampusAI`).
2. **Environment**: Node
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `PORT` = `10000` (or default provided by Render)
   - `NODE_ENV` = `production`
   - `HOST` = `0.0.0.0`
6. **Deploy**: Click **Create Web Service**.

---

## 9. Storage Requirements

The application stores persistent files for:
- Student photos (`uploads/students/`)
- Adviser photos (`uploads/advisers/`)
- College logos (`uploads/college/`)
- Department logos (`uploads/departments/`)
- Persistent JSON Database (`database/campuspulse.json`)

**Production Storage Note**: For Render or stateless hosting, mount a **Render Persistent Disk** at `/var/data` and set:
- `DATABASE_PATH=/var/data/campuspulse.json`
- `UPLOADS_DIR=/var/data/uploads`

---

## 10. Important Production Notes

- **Health Check Endpoint**: `GET /health` returns `{"status": "ok"}`.
- **CORS**: Dynamically configured via `CORS_ORIGIN` environment variable.
- **Port Binding**: Listens on `process.env.PORT` and `0.0.0.0` host.
- **Zero Breaking Changes**: All original features, UI styling, workflows, and API structures remain completely untouched.
