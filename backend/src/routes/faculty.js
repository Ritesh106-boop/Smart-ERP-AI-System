import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.use(authenticateToken, authorizeRoles('faculty'));

// Get faculty profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, u.name, u.email FROM faculty f 
       JOIN users u ON f.user_id = u.id WHERE f.user_id = ?`, [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assigned subjects
router.get('/subjects', async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
    if (!fac.length) return res.status(404).json({ error: 'Faculty not found' });

    const [rows] = await pool.query(`
      SELECT sub.* FROM faculty_subjects fs
      JOIN subjects sub ON fs.subject_id = sub.id
      WHERE fs.faculty_id = ?
    `, [fac[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students for a subject
router.get('/subjects/:subjectId/students', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id as student_id, u.name, u.email, s.course, s.semester
      FROM student_subjects ss
      JOIN students s ON ss.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ss.subject_id = ?
      ORDER BY u.name
    `, [req.params.subjectId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance
router.post('/attendance', async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
    if (!fac.length) return res.status(404).json({ error: 'Faculty not found' });

    const { subject_id, date, records } = req.body;
    // records: [{ student_id, status }]

    if (!subject_id || !date || !records || !records.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    for (const record of records) {
      await pool.query(`
        INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = ?, marked_by = ?
      `, [record.student_id, subject_id, date, record.status, fac[0].id, record.status, fac[0].id]);
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for a subject
router.get('/attendance/:subjectId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name as student_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.subject_id = ?
      ORDER BY a.date DESC, u.name
    `, [req.params.subjectId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enter/Update marks
router.post('/marks', async (req, res) => {
  try {
    const { student_id, subject_id, exam_type, marks, max_marks } = req.body;

    await pool.query(`
      INSERT INTO marks (student_id, subject_id, exam_type, marks, max_marks)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE marks = ?, max_marks = ?
    `, [student_id, subject_id, exam_type || 'midterm', marks, max_marks || 100, marks, max_marks || 100]);

    res.json({ message: 'Marks updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get marks for a subject
router.get('/marks/:subjectId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, u.name as student_name
      FROM marks m
      JOIN students s ON m.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE m.subject_id = ?
      ORDER BY u.name, m.exam_type
    `, [req.params.subjectId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create assignment
router.post('/assignments', async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
    if (!fac.length) return res.status(404).json({ error: 'Faculty not found' });

    const { subject_id, title, description, deadline } = req.body;

    const [result] = await pool.query(
      'INSERT INTO assignments (subject_id, faculty_id, title, description, deadline) VALUES (?, ?, ?, ?, ?)',
      [subject_id, fac[0].id, title, description, deadline]
    );

    res.status(201).json({ id: result.insertId, message: 'Assignment created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignments
router.get('/assignments', async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
    if (!fac.length) return res.status(404).json({ error: 'Faculty not found' });

    const [rows] = await pool.query(`
      SELECT a.*, sub.name as subject_name, sub.code,
        (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE a.faculty_id = ?
      ORDER BY a.deadline DESC
    `, [fac[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload material
router.post('/materials', upload.single('file'), async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
    if (!fac.length) return res.status(404).json({ error: 'Faculty not found' });

    const { subject_id, title } = req.body;
    const filePath = req.file ? req.file.path : null;

    const [result] = await pool.query(
      'INSERT INTO materials (subject_id, faculty_id, title, file_path) VALUES (?, ?, ?, ?)',
      [subject_id, fac[0].id, title, filePath]
    );

    res.status(201).json({ id: result.insertId, message: 'Material uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const [fac] = await pool.query('SELECT id, department FROM faculty WHERE user_id = ?', [req.user.id]);
    if (!fac.length) return res.status(404).json({ error: 'Faculty not found' });

    const [subjects] = await pool.query('SELECT COUNT(*) as count FROM faculty_subjects WHERE faculty_id = ?', [fac[0].id]);
    const [assignments] = await pool.query('SELECT COUNT(*) as count FROM assignments WHERE faculty_id = ?', [fac[0].id]);
    const [materials] = await pool.query('SELECT COUNT(*) as count FROM materials WHERE faculty_id = ?', [fac[0].id]);

    // Total unique students
    const [students] = await pool.query(`
      SELECT COUNT(DISTINCT ss.student_id) as count FROM student_subjects ss
      JOIN faculty_subjects fs ON fs.subject_id = ss.subject_id
      WHERE fs.faculty_id = ?
    `, [fac[0].id]);

    const [announcements] = await pool.query(`
      SELECT title, content, created_at FROM announcements 
      WHERE target_role IN ('all', 'faculty') 
      ORDER BY created_at DESC LIMIT 3
    `);

    res.json({
      department: fac[0].department,
      subjectCount: subjects[0]?.count || 0,
      assignmentCount: assignments[0]?.count || 0,
      materialCount: materials[0]?.count || 0,
      studentCount: students[0]?.count || 0,
      announcements
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
