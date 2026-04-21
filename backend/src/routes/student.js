import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// All student routes require authentication + student role
router.use(authenticateToken, authorizeRoles('student'));

// Get student profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.name, u.email FROM students s 
       JOIN users u ON s.user_id = u.id WHERE s.user_id = ?`, [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance summary
router.get('/attendance', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });
    const studentId = student[0].id;

    const [rows] = await pool.query(`
      SELECT 
        sub.id as subject_id, sub.name as subject_name, sub.code,
        COUNT(a.id) as total_classes,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as attended,
        ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id), 1) as percentage
      FROM student_subjects ss
      JOIN subjects sub ON ss.subject_id = sub.id
      LEFT JOIN attendance a ON a.student_id = ss.student_id AND a.subject_id = ss.subject_id
      WHERE ss.student_id = ?
      GROUP BY sub.id, sub.name, sub.code
    `, [studentId]);

    // Smart insights
    const insights = rows.map(r => {
      const total = r.total_classes || 0;
      const attended = r.attended || 0;
      const pct = r.percentage || 0;
      
      // Calculate classes needed to reach 80%
      let classesNeeded = 0;
      let classesCanSkip = 0;
      
      if (total > 0) {
        // To maintain 80%: attended + x >= 0.8 * (total + x)
        // x >= (0.8 * total - attended) / 0.2
        if (pct < 80) {
          classesNeeded = Math.ceil((0.8 * total - attended) / 0.2);
        } else {
          // Can skip: attended >= 0.8 * (total + y)
          // y <= (attended / 0.8) - total
          classesCanSkip = Math.floor(attended / 0.8 - total);
        }
      }

      return {
        ...r,
        classesNeeded: Math.max(0, classesNeeded),
        classesCanSkip: Math.max(0, classesCanSkip),
        riskLevel: pct < 75 ? 'high' : pct < 80 ? 'warning' : 'safe'
      };
    });

    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get marks
router.get('/marks', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const [rows] = await pool.query(`
      SELECT m.*, sub.name as subject_name, sub.code
      FROM marks m
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE m.student_id = ?
      ORDER BY sub.name, m.exam_type
    `, [student[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects
router.get('/subjects', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const [rows] = await pool.query(`
      SELECT sub.* FROM student_subjects ss
      JOIN subjects sub ON ss.subject_id = sub.id
      WHERE ss.student_id = ?
    `, [student[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignments
router.get('/assignments', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const [rows] = await pool.query(`
      SELECT a.*, sub.name as subject_name, sub.code,
        s.id as submission_id, s.file_path as submitted_file, s.submitted_at
      FROM assignments a
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN student_subjects ss ON ss.subject_id = a.subject_id AND ss.student_id = ?
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
      ORDER BY a.deadline DESC
    `, [student[0].id, student[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit assignment
router.post('/assignments/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const filePath = req.file ? req.file.path : null;
    
    await pool.query(`
      INSERT INTO submissions (assignment_id, student_id, file_path)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE file_path = ?, submitted_at = CURRENT_TIMESTAMP
    `, [req.params.id, student[0].id, filePath, filePath]);

    res.json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get materials
router.get('/materials', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const [rows] = await pool.query(`
      SELECT m.*, sub.name as subject_name, sub.code
      FROM materials m
      JOIN subjects sub ON m.subject_id = sub.id
      JOIN student_subjects ss ON ss.subject_id = m.subject_id AND ss.student_id = ?
      ORDER BY m.uploaded_at DESC
    `, [student[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get shared notes
router.get('/notes', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const [rows] = await pool.query(`
      SELECT n.*, u.name as author_name FROM notes n
      JOIN students s ON n.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE n.shared = true OR n.student_id = ?
      ORDER BY n.uploaded_at DESC
    `, [student[0].id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload note
router.post('/notes', upload.single('file'), async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const { title, shared } = req.body;
    const filePath = req.file ? req.file.path : null;

    const [result] = await pool.query(
      'INSERT INTO notes (student_id, title, file_path, shared) VALUES (?, ?, ?, ?)',
      [student[0].id, title || 'Untitled Note', filePath, shared === 'true']
    );

    res.status(201).json({ id: result.insertId, message: 'Note uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get announcements for students
router.get('/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name as posted_by FROM announcements a
      JOIN users u ON a.admin_id = u.id
      WHERE a.target_role IN ('all', 'student')
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id, course, semester FROM students WHERE user_id = ?', [req.user.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });
    const sid = student[0].id;

    // Get overall attendance
    const [attendance] = await pool.query(`
      SELECT 
        COUNT(id) as total, 
        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as attended
      FROM attendance WHERE student_id = ?
    `, [sid]);

    // Get subject count
    const [subjects] = await pool.query('SELECT COUNT(*) as count FROM student_subjects WHERE student_id = ?', [sid]);

    // Get pending assignments
    const [assignments] = await pool.query(`
      SELECT COUNT(*) as count FROM assignments a
      JOIN student_subjects ss ON ss.subject_id = a.subject_id AND ss.student_id = ?
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
      WHERE s.id IS NULL
    `, [sid, sid]);

    // Get average marks
    const [marks] = await pool.query(`
      SELECT AVG(marks / max_marks * 100) as avg_percentage FROM marks WHERE student_id = ?
    `, [sid]);

    // Get pending fees
    const [fees] = await pool.query(`
      SELECT SUM(amount) as pending FROM fees WHERE student_id = ? AND status != 'paid'
    `, [sid]);

    // Recent announcements
    const [announcements] = await pool.query(`
      SELECT title, content, created_at FROM announcements 
      WHERE target_role IN ('all', 'student') 
      ORDER BY created_at DESC LIMIT 3
    `);

    const totalClasses = attendance[0]?.total || 0;
    const attendedClasses = attendance[0]?.attended || 0;
    const overallAttendance = totalClasses > 0 ? Math.round(attendedClasses / totalClasses * 100) : 0;

    res.json({
      profile: student[0],
      overallAttendance,
      totalClasses,
      attendedClasses,
      subjectCount: subjects[0]?.count || 0,
      pendingAssignments: assignments[0]?.count || 0,
      avgMarks: Math.round(marks[0]?.avg_percentage || 0),
      pendingFees: fees[0]?.pending || 0,
      announcements,
      riskLevel: overallAttendance < 75 ? 'high' : overallAttendance < 80 ? 'warning' : 'safe'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
