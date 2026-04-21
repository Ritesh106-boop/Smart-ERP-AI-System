import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin'));

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [faculty] = await pool.query('SELECT COUNT(*) as count FROM faculty');
    const [subjects] = await pool.query('SELECT COUNT(*) as count FROM subjects');
    
    const [fees] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as collected,
        SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END) as pending,
        SUM(amount) as total
      FROM fees
    `);

    const [documents] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM documents
    `);

    const [recentStudents] = await pool.query(`
      SELECT u.name, u.email, s.course, s.semester, u.created_at
      FROM students s JOIN users u ON s.user_id = u.id
      ORDER BY u.created_at DESC LIMIT 5
    `);

    res.json({
      studentCount: students[0]?.count || 0,
      facultyCount: faculty[0]?.count || 0,
      subjectCount: subjects[0]?.count || 0,
      feeCollected: fees[0]?.collected || 0,
      feePending: fees[0]?.pending || 0,
      feeTotal: fees[0]?.total || 0,
      documentsPending: documents[0]?.pending || 0,
      documentsTotal: documents[0]?.total || 0,
      recentStudents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage students
router.get('/students', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.course, s.semester, u.id as user_id, u.name, u.email, u.created_at
      FROM students s JOIN users u ON s.user_id = u.id
      ORDER BY u.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const { name, course, semester } = req.body;
    const [student] = await pool.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    if (name) await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, student[0].user_id]);
    if (course || semester) {
      await pool.query('UPDATE students SET course = COALESCE(?, course), semester = COALESCE(?, semester) WHERE id = ?',
        [course, semester, req.params.id]);
    }
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  try {
    const [student] = await pool.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    if (!student.length) return res.status(404).json({ error: 'Student not found' });
    await pool.query('DELETE FROM users WHERE id = ?', [student[0].user_id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fee management
router.get('/fees', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.name as student_name, s.course, s.semester
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY f.status, u.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update fee status
router.put('/fees/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE fees SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Fee status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subject management
router.get('/subjects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY semester, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { name, code, credits, semester } = req.body;
    const [result] = await pool.query(
      'INSERT INTO subjects (name, code, credits, semester) VALUES (?, ?, ?, ?)',
      [name, code, credits || 3, semester || 1]
    );
    res.status(201).json({ id: result.insertId, message: 'Subject created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements
router.get('/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name as posted_by FROM announcements a
      JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const { title, content, target_role } = req.body;
    const [result] = await pool.query(
      'INSERT INTO announcements (admin_id, title, content, target_role) VALUES (?, ?, ?, ?)',
      [req.user.id, title, content, target_role || 'all']
    );
    res.status(201).json({ id: result.insertId, message: 'Announcement posted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
