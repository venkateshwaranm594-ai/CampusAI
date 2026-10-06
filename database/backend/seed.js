const db = require('./db');

console.log("🌱 Starting CampusPulse AI database seeding...");

// 1. College Settings - Initialize with configurable College setup
db.updateSettings({
  id: 'settings-1',
  college_name: "Erode Sengunthar Engineering College",
  college_logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80",
  tag_line: "Empowering Minds, Shaping Tomorrow with AI",
  address: "Thudupathi, Erode - 638057, Tamil Nadu",
  website: "https://erode-sengunthar.ac.in",
  contact_phone: "+91 424 2337071",
  contact_email: "principal@erode-sengunthar.ac.in",
  academic_year: "2026-2027",
  principal_name: "Dr. V. Venkatachalam, Ph.D.",
  alert_threshold: 85
});

// 2. Departments
const departments = [
  { id: 'dept-aids', code: 'AI & DS', name: 'Artificial Intelligence & Data Science', hod_name: 'Dr. S. Kanthaswamy', department_logo: '', description: 'Department of AI, Machine Learning and Big Data Analytics', status: 'ACTIVE' },
  { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', hod_name: 'Dr. P. Selvaraj', department_logo: '', description: 'Department of Computing, Systems & Software Development', status: 'ACTIVE' },
  { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication', hod_name: 'Dr. R. Marappan', department_logo: '', description: 'Department of Embedded Systems, Telecommunications & VLSI', status: 'ACTIVE' },
  { id: 'dept-eee', code: 'EEE', name: 'Electrical & Electronics', hod_name: 'Dr. K. Ramesh', department_logo: '', description: 'Department of Power Systems & Renewable Energy', status: 'ACTIVE' },
  { id: 'dept-mech', code: 'Mechanical', name: 'Mechanical Engineering', hod_name: 'Dr. M. Gurunathan', department_logo: '', description: 'Department of Robotics, Dynamics & Thermal Engineering', status: 'ACTIVE' }
];

db.data.departments = [];
db.data.sections = [];
db.data.advisers = [];
db.data.students = [];
db.data.attendance = [];
db.data.motivational_quotes = [];
db.data.flyers = [];
db.data.users = [];

departments.forEach(d => db.addDepartment(d));

// 3. Sections
const sections = [
  { id: 'sec-aids-2a', department_id: 'dept-aids', year: '2nd Year', section_name: 'Section A', adviser_name: 'Prof. Sarah Jenkins', adviser_email: 'sarah.j@college.edu' },
  { id: 'sec-aids-2b', department_id: 'dept-aids', year: '2nd Year', section_name: 'Section B', adviser_name: 'Dr. Michael Chang', adviser_email: 'michael.c@college.edu' },
  { id: 'sec-aids-3a', department_id: 'dept-aids', year: '3rd Year', section_name: 'Section A', adviser_name: 'Prof. Priya Sharma', adviser_email: 'priya.s@college.edu' },
  
  { id: 'sec-cse-2a', department_id: 'dept-cse', year: '2nd Year', section_name: 'Section A', adviser_name: 'Prof. Alan Turing', adviser_email: 'alan.t@college.edu' },
  { id: 'sec-cse-2b', department_id: 'dept-cse', year: '2nd Year', section_name: 'Section B', adviser_name: 'Dr. Grace Hopper', adviser_email: 'grace.h@college.edu' },

  { id: 'sec-ece-2a', department_id: 'dept-ece', year: '2nd Year', section_name: 'Section A', adviser_name: 'Prof. Nikola Tesla', adviser_email: 'nikola.t@college.edu' },
  { id: 'sec-ece-3a', department_id: 'dept-ece', year: '3rd Year', section_name: 'Section A', adviser_name: 'Dr. Claude Shannon', adviser_email: 'claude.s@college.edu' },

  { id: 'sec-eee-2a', department_id: 'dept-eee', year: '2nd Year', section_name: 'Section A', adviser_name: 'Prof. Thomas Edison', adviser_email: 'thomas.e@college.edu' },
  { id: 'sec-mech-2a', department_id: 'dept-mech', year: '2nd Year', section_name: 'Section A', adviser_name: 'Prof. James Watt', adviser_email: 'james.w@college.edu' }
];

sections.forEach(s => db.addSection(s));

// 4. Advisers with Photo URLs
const advisers = [
  { id: 'adv-aids-2a', name: 'Prof. Sarah Jenkins', department_id: 'dept-aids', year: '2nd Year', section_id: 'sec-aids-2a', photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', email: 'sarah.j@college.edu', phone: '+91 98765 11111' },
  { id: 'adv-aids-2b', name: 'Dr. Michael Chang', department_id: 'dept-aids', year: '2nd Year', section_id: 'sec-aids-2b', photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', email: 'michael.c@college.edu', phone: '+91 98765 22222' },
  { id: 'adv-cse-2a', name: 'Prof. Alan Turing', department_id: 'dept-cse', year: '2nd Year', section_id: 'sec-cse-2a', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', email: 'alan.t@college.edu', phone: '+91 98765 33333' }
];

advisers.forEach(a => db.addAdviser(a));

// Avatars
const maleAvatars = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
];

const femaleAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
];

const rawStudents = [
  // AI & DS 2nd Year Sec A (Main Demo Section)
  { name: "Venkatesh Raman", gender: "Male", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD101" },
  { name: "Ananya Iyer", gender: "Female", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD102" },
  { name: "Karthik Subramanian", gender: "Male", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD103" },
  { name: "Deepika Padukone", gender: "Female", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD104" },
  { name: "Rohan Varma", gender: "Male", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD105" },
  { name: "Sneha Reddy", gender: "Female", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD106" },
  { name: "Siddharth Malhotra", gender: "Male", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD107" },
  { name: "Meera Nair", gender: "Female", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD108" },
  { name: "Aditya Roy", gender: "Male", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD109" },
  { name: "Pooja Hegde", gender: "Female", dept: "dept-aids", year: "2nd Year", sec: "sec-aids-2a", roll: "22AD110" },

  // CSE 2nd Year Sec A
  { name: "Gautam Gambhir", gender: "Male", dept: "dept-cse", year: "2nd Year", sec: "sec-cse-2a", roll: "22CS101" },
  { name: "Hansika Motwani", gender: "Female", dept: "dept-cse", year: "2nd Year", sec: "sec-cse-2a", roll: "22CS102" },
  { name: "Ishaan Khatter", gender: "Male", dept: "dept-cse", year: "2nd Year", sec: "sec-cse-2a", roll: "22CS103" },
  { name: "Jahnvi Kapoor", gender: "Female", dept: "dept-cse", year: "2nd Year", sec: "sec-cse-2a", roll: "22CS104" }
];

let maleAvatarIdx = 0;
let femaleAvatarIdx = 0;

const createdStudents = rawStudents.map((s, i) => {
  let photo = '';
  if (s.gender === 'Male') {
    photo = maleAvatars[maleAvatarIdx % maleAvatars.length];
    maleAvatarIdx++;
  } else {
    photo = femaleAvatars[femaleAvatarIdx % femaleAvatars.length];
    femaleAvatarIdx++;
  }

  return db.addStudent({
    id: `stu-${100 + i}`,
    name: s.name,
    roll_no: s.roll,
    register_no: `7100${s.roll}`,
    gender: s.gender,
    department_id: s.dept,
    year: s.year,
    section_id: s.sec,
    photo_url: photo,
    status: 'ACTIVE'
  });
});

// Seed Attendance Data (For Today & Last 7 Days)
const dates = [];
for (let d = 0; d < 7; d++) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dates.push(dt.toISOString().split('T')[0]);
}

const absenceReasons = ['Fever', 'Medical', 'Personal Issues', 'On Duty', 'Family Reason', 'Emergency', 'Other'];

dates.forEach((dateStr, dIdx) => {
  createdStudents.forEach((stu, sIdx) => {
    let status = 'PRESENT';
    let reason = null;
    let customReason = '';

    if (stu.section_id === 'sec-aids-2a') {
      if (dIdx === 0 && (sIdx === 1 || sIdx === 5 || sIdx === 9)) {
        status = 'ABSENT';
        if (sIdx === 1) { reason = 'Fever'; customReason = 'High fever rest'; }
        else if (sIdx === 5) { reason = 'Medical'; customReason = 'Doctor consultation'; }
        else { reason = 'On Duty'; customReason = 'Hackathon Event'; }
      } else if (dIdx > 0 && (sIdx + dIdx) % 5 === 0) {
        status = 'ABSENT';
        reason = absenceReasons[(sIdx + dIdx) % absenceReasons.length];
      }
    } else {
      if ((sIdx + dIdx) % 7 === 0) {
        status = 'ABSENT';
        reason = absenceReasons[(sIdx + dIdx) % absenceReasons.length];
      }
    }

    db.saveBulkAttendance([{
      student_id: stu.id,
      date: dateStr,
      status: status,
      reason: reason,
      custom_reason: customReason
    }], 'Staff Adviser');
  });
});

// Motivational Quotes
const quotes = [
  { quote: "Every day is a new opportunity to learn.", author: "CampusPulse AI", category: "Daily Inspiration" },
  { quote: "Be present today. Build your future tomorrow.", author: "CampusPulse AI", category: "Focus" },
  { quote: "Small steps every day create big achievements.", author: "CampusPulse AI", category: "Growth" }
];

quotes.forEach(q => db.addQuote(q));

// System Users
const users = [
  { username: 'admin', password: 'admin123', full_name: 'Administrator', role: 'ADMIN', department_id: null },
  { username: 'principal', password: 'principal123', full_name: 'Dr. V. Venkatachalam', role: 'PRINCIPAL', department_id: null },
  { username: 'staff_aids', password: 'staff123', full_name: 'Prof. Sarah Jenkins', role: 'STAFF', department_id: 'dept-aids' }
];

users.forEach(u => db.addUser(u));

console.log(`✅ Seeding complete!`);
console.log(`   - Departments: ${db.getDepartments().length}`);
console.log(`   - Sections: ${db.getSections().length}`);
console.log(`   - Advisers: ${db.getAdvisers().length}`);
console.log(`   - Students: ${db.getStudents().length}`);
