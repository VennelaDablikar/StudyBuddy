// routes/analytics.js — Analytics data for the dashboard
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /analytics — Returns all analytics data for the logged-in user
router.get('/', (req, res) => {
    try {
        const userId = req.user.id;

        // ── Overall stats ──────────────────────────────
        const totalCourses = db.prepare(
            'SELECT COUNT(*) as count FROM courses WHERE user_id = ?'
        ).get(userId).count;

        const totalNotes = db.prepare(`
            SELECT COUNT(*) as count FROM notes n 
            JOIN courses c ON n.course_id = c.id 
            WHERE c.user_id = ?
        `).get(userId).count;

        const totalPdfs = db.prepare(`
            SELECT COUNT(*) as count FROM pdfs p 
            JOIN courses c ON p.course_id = c.id 
            WHERE c.user_id = ?
        `).get(userId).count;

        const totalSummaries = db.prepare(`
            SELECT COUNT(*) as count FROM notes n 
            JOIN courses c ON n.course_id = c.id 
            WHERE c.user_id = ? AND n.summary IS NOT NULL AND n.summary != ''
        `).get(userId).count;

        const reviewedNotes = db.prepare(`
            SELECT COUNT(*) as count FROM notes n 
            JOIN courses c ON n.course_id = c.id 
            WHERE c.user_id = ? AND n.is_reviewed = 1
        `).get(userId).count;

        const totalSessions = db.prepare(
            'SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ?'
        ).get(userId).count;

        const completedSessions = db.prepare(
            'SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ? AND completed = 1'
        ).get(userId).count;

        // ── Notes created per day (last 7 days) ───────
        const notesPerDay = db.prepare(`
            SELECT DATE(n.created_at) as date, COUNT(*) as count
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            WHERE c.user_id = ? AND n.created_at >= DATE('now', '-6 days')
            GROUP BY DATE(n.created_at)
            ORDER BY date ASC
        `).all(userId);

        // ── Notes per course ──────────────────────────
        const notesPerCourse = db.prepare(`
            SELECT c.name, COUNT(n.id) as noteCount, COUNT(p.id) as pdfCount
            FROM courses c
            LEFT JOIN notes n ON n.course_id = c.id
            LEFT JOIN pdfs p ON p.course_id = c.id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY noteCount DESC
            LIMIT 10
        `).all(userId);

        // ── Recent activity (last 10 notes) ───────────
        const recentNotes = db.prepare(`
            SELECT n.title, n.created_at, c.name as courseName
            FROM notes n
            JOIN courses c ON n.course_id = c.id
            WHERE c.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT 10
        `).all(userId);

        // ── Study sessions this week ──────────────────
        const sessionsThisWeek = db.prepare(`
            SELECT COUNT(*) as count FROM study_sessions
            WHERE user_id = ? AND session_date >= DATE('now', '-6 days')
        `).get(userId).count;

        res.json({
            stats: {
                totalCourses,
                totalNotes,
                totalPdfs,
                totalSummaries,
                reviewedNotes,
                totalSessions,
                completedSessions,
                sessionsThisWeek
            },
            notesPerDay,
            notesPerCourse,
            recentNotes
        });
    } catch (err) {
        console.error('GET /analytics error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
