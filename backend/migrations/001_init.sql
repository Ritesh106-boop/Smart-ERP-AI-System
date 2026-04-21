-- SmartERP AI Database Schema
CREATE DATABASE IF NOT EXISTS smarterp;
USE smarterp;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  course VARCHAR(100) DEFAULT 'B.Tech CSE',
  semester INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department VARCHAR(100) DEFAULT 'Computer Science',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  credits INT DEFAULT 3,
  semester INT DEFAULT 1
);

-- Faculty-Subject mapping
CREATE TABLE IF NOT EXISTS faculty_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  subject_id INT NOT NULL,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(faculty_id, subject_id)
);

-- Student-Subject mapping
CREATE TABLE IF NOT EXISTS student_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id)
);

-- Attendance table (per-date tracking)
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent') NOT NULL,
  marked_by INT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES faculty(id),
  UNIQUE(student_id, subject_id, date)
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  exam_type VARCHAR(50) DEFAULT 'midterm',
  marks DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) DEFAULT 100,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  faculty_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_path VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(assignment_id, student_id)
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  faculty_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  file_path VARCHAR(500),
  shared BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
  description VARCHAR(200) DEFAULT 'Tuition Fee',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  file_path VARCHAR(500),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  target_role ENUM('all', 'student', 'faculty') DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- SEED DATA
-- =====================

-- Password for all demo users: "password123" (bcrypt hash)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@smarterp.com', '$2a$10$Hd5evrYGFHJs/sSqkxrdm8KM7Og.eb9JyOa6Dtk6ZzC29d', 'admin'),
('Dr. Sarah Johnson', 'sarah@smarterp.com', '$2a$10$Hd5evrYGFHJs/sSqkxrdm8KM7Og.eb9JyOa6Dtk6ZzC29d', 'faculty'),
('Dr. Raj Patel', 'raj@smarterp.com', '$2a$10$Hd5evrYGFHJs/sSqkxrdm8KM7Og.eb9JyOa6Dtk6ZzC29d', 'faculty'),
('Alice Smith', 'alice@smarterp.com', '$2a$10$Hd5evrYGFHJs/sSqkxrdm8KM7Og.eb9JyOa6Dtk6ZzC29d', 'student'),
('Bob Wilson', 'bob@smarterp.com', '$2a$10$Hd5evrYGFHJs/sSqkxrdm8KM7Og.eb9JyOa6Dtk6ZzC29d', 'student'),
('Charlie Brown', 'charlie@smarterp.com', '$2a$10$Hd5evrYGFHJs/sSqkxrdm8KM7Og.eb9JyOa6Dtk6ZzC29d', 'student');

-- Faculty records
INSERT INTO faculty (user_id, department) VALUES
(2, 'Computer Science'),
(3, 'Mathematics');

-- Student records
INSERT INTO students (user_id, course, semester) VALUES
(4, 'B.Tech CSE', 4),
(5, 'B.Tech CSE', 4),
(6, 'B.Tech CSE', 3);

-- Subjects
INSERT INTO subjects (name, code, credits, semester) VALUES
('Data Structures', 'CS201', 4, 3),
('Operating Systems', 'CS301', 4, 4),
('Database Management', 'CS302', 3, 4),
('Discrete Mathematics', 'MA201', 3, 3),
('Computer Networks', 'CS303', 3, 4),
('Software Engineering', 'CS304', 3, 4);

-- Faculty-Subject mapping
INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6);

-- Student-Subject mapping
INSERT INTO student_subjects (student_id, subject_id) VALUES
(1, 2), (1, 3), (1, 5), (1, 6),
(2, 2), (2, 3), (2, 5), (2, 6),
(3, 1), (3, 4);

-- Attendance data (sample)
INSERT INTO attendance (student_id, subject_id, date, status, marked_by) VALUES
(1, 2, '2024-01-08', 'present', 1), (1, 2, '2024-01-10', 'present', 1),
(1, 2, '2024-01-12', 'absent', 1), (1, 2, '2024-01-15', 'present', 1),
(1, 2, '2024-01-17', 'present', 1), (1, 2, '2024-01-19', 'present', 1),
(1, 2, '2024-01-22', 'absent', 1), (1, 2, '2024-01-24', 'present', 1),
(1, 2, '2024-01-26', 'present', 1), (1, 2, '2024-01-29', 'present', 1),
(1, 3, '2024-01-09', 'present', 1), (1, 3, '2024-01-11', 'present', 1),
(1, 3, '2024-01-16', 'absent', 1), (1, 3, '2024-01-18', 'present', 1),
(1, 3, '2024-01-23', 'present', 1), (1, 3, '2024-01-25', 'present', 1),
(1, 3, '2024-01-30', 'absent', 1), (1, 3, '2024-02-01', 'absent', 1),
(1, 5, '2024-01-08', 'present', 2), (1, 5, '2024-01-10', 'present', 2),
(1, 5, '2024-01-15', 'absent', 2), (1, 5, '2024-01-17', 'present', 2),
(1, 5, '2024-01-22', 'present', 2), (1, 5, '2024-01-24', 'absent', 2),
(2, 2, '2024-01-08', 'present', 1), (2, 2, '2024-01-10', 'absent', 1),
(2, 2, '2024-01-12', 'absent', 1), (2, 2, '2024-01-15', 'present', 1),
(2, 2, '2024-01-17', 'absent', 1), (2, 2, '2024-01-19', 'present', 1),
(2, 3, '2024-01-09', 'present', 1), (2, 3, '2024-01-11', 'present', 1),
(2, 3, '2024-01-16', 'present', 1), (2, 3, '2024-01-18', 'present', 1),
(3, 1, '2024-01-08', 'present', 1), (3, 1, '2024-01-10', 'present', 1),
(3, 1, '2024-01-12', 'present', 1), (3, 1, '2024-01-15', 'absent', 1);

-- Marks data
INSERT INTO marks (student_id, subject_id, exam_type, marks, max_marks) VALUES
(1, 2, 'midterm', 78, 100), (1, 2, 'quiz1', 18, 25),
(1, 3, 'midterm', 65, 100), (1, 3, 'quiz1', 20, 25),
(1, 5, 'midterm', 82, 100), (1, 5, 'quiz1', 22, 25),
(1, 6, 'midterm', 45, 100),
(2, 2, 'midterm', 55, 100), (2, 2, 'quiz1', 12, 25),
(2, 3, 'midterm', 72, 100), (2, 3, 'quiz1', 19, 25),
(3, 1, 'midterm', 88, 100), (3, 1, 'quiz1', 23, 25),
(3, 4, 'midterm', 35, 100);

-- Assignments
INSERT INTO assignments (subject_id, faculty_id, title, description, deadline) VALUES
(2, 1, 'OS Process Scheduling', 'Implement FCFS, SJF, and Round Robin scheduling algorithms', '2024-02-15 23:59:59'),
(3, 1, 'Database Normalization', 'Normalize the given schema to 3NF and BCNF', '2024-02-20 23:59:59'),
(1, 1, 'Binary Search Tree', 'Implement BST with insert, delete, and traversal', '2024-02-10 23:59:59'),
(5, 2, 'TCP Socket Programming', 'Build a simple client-server chat application', '2024-02-25 23:59:59');

-- Fees
INSERT INTO fees (student_id, amount, due_date, status, description) VALUES
(1, 75000.00, '2024-01-31', 'paid', 'Semester 4 Tuition'),
(1, 15000.00, '2024-02-15', 'pending', 'Lab Fee'),
(2, 75000.00, '2024-01-31', 'pending', 'Semester 4 Tuition'),
(2, 15000.00, '2024-02-15', 'pending', 'Lab Fee'),
(3, 75000.00, '2024-01-31', 'paid', 'Semester 3 Tuition'),
(3, 15000.00, '2024-02-15', 'overdue', 'Lab Fee');

-- Announcements
INSERT INTO announcements (admin_id, title, content, target_role) VALUES
(1, 'Mid-Semester Exams Schedule', 'Mid-semester examinations will begin from February 20, 2024. Detailed schedule will be shared soon.', 'all'),
(1, 'Fee Payment Deadline', 'Last date for fee payment without late charges is January 31, 2024.', 'student'),
(1, 'Faculty Meeting', 'All faculty members are requested to attend the department meeting on Feb 5.', 'faculty');
