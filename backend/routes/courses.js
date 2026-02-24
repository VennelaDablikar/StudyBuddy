// routes/courses.js — CRUD endpoints for courses (user-scoped)
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// ─── GET /courses ──────────────────────────────────────────────────────────────
// Returns all courses belonging to the logged-in user
router.get('/', (req, res) => {
    try {
        const courses = db.prepare(`
            SELECT c.*,
                (SELECT COUNT(*) FROM notes n WHERE n.course_id = c.id) as note_count,
                (SELECT COUNT(*) FROM pdfs p WHERE p.course_id = c.id) as pdf_count
            FROM courses c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `).all(req.user.id);
        res.json(courses);
    } catch (err) {
        console.error('GET /courses error:', err);
        res.status(500).json({ error: 'Failed to fetch courses.' });
    }
});

// ─── GET /courses/stats ───────────────────────────────────────────────────────
// IMPORTANT: must be registered BEFORE /:id routes so "stats" isn't treated as id
// Returns aggregate counts for the dashboard stats bar (user-scoped)
router.get('/stats', (req, res) => {
    try {
        const totalCourses = db.prepare(
            'SELECT COUNT(*) as count FROM courses WHERE user_id = ?'
        ).get(req.user.id).count;

        const totalNotes = db.prepare(
            `SELECT COUNT(*) as count FROM notes
             JOIN courses ON notes.course_id = courses.id
             WHERE courses.user_id = ?`
        ).get(req.user.id).count;

        const totalSummaries = db.prepare(
            `SELECT COUNT(*) as count FROM notes
             JOIN courses ON notes.course_id = courses.id
             WHERE courses.user_id = ?
             AND notes.summary IS NOT NULL AND notes.summary != ''`
        ).get(req.user.id).count;

        const totalPdfs = db.prepare(
            `SELECT COUNT(*) as count FROM pdfs
             JOIN courses ON pdfs.course_id = courses.id
             WHERE courses.user_id = ?`
        ).get(req.user.id).count;

        const totalPdfSummaries = db.prepare(
            `SELECT COUNT(*) as count FROM pdfs
             JOIN courses ON pdfs.course_id = courses.id
             WHERE courses.user_id = ?
             AND pdfs.summary IS NOT NULL AND pdfs.summary != ''`
        ).get(req.user.id).count;

        res.json({ totalCourses, totalNotes, totalSummaries, totalPdfs, totalPdfSummaries });
    } catch (err) {
        console.error('GET /courses/stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

// ─── GET /search?q=searchterm ──────────────────────────────────────────────────
// Global search across courses, notes, and PDFs (user-scoped)
router.get('/search', (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 1) {
            return res.json({ courses: [], notes: [], pdfs: [] });
        }

        const searchTerm = `%${q.trim()}%`;

        const courses = db.prepare(`
            SELECT id, name, description, created_at
            FROM courses
            WHERE user_id = ? AND (name LIKE ? OR description LIKE ?)
        `).all(req.user.id, searchTerm, searchTerm);

        const notes = db.prepare(`
            SELECT notes.id, notes.title, notes.body, notes.course_id,
                   notes.created_at, courses.name as course_name
            FROM notes
            JOIN courses ON notes.course_id = courses.id
            WHERE courses.user_id = ? AND (notes.title LIKE ? OR notes.body LIKE ?)
        `).all(req.user.id, searchTerm, searchTerm);

        const pdfs = db.prepare(`
            SELECT pdfs.id, pdfs.original_name, pdfs.filename,
                   pdfs.course_id, pdfs.uploaded_at, courses.name as course_name
            FROM pdfs
            JOIN courses ON pdfs.course_id = courses.id
            WHERE courses.user_id = ? AND pdfs.original_name LIKE ?
        `).all(req.user.id, searchTerm);

        res.json({ courses, notes, pdfs });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /courses/:id/progress ────────────────────────────────────────────────
// Returns progress tracker data for a course
router.get('/:id/progress', (req, res) => {
    try {
        const { id } = req.params;
        const total = db.prepare(
            'SELECT COUNT(*) as count FROM notes WHERE course_id = ?'
        ).get(id);
        const reviewed = db.prepare(
            'SELECT COUNT(*) as count FROM notes WHERE course_id = ? AND is_reviewed = 1'
        ).get(id);
        res.json({
            total: total.count,
            reviewed: reviewed.count,
            percentage: total.count > 0
                ? Math.round((reviewed.count / total.count) * 100)
                : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /courses ─────────────────────────────────────────────────────────────
// Creates a new course (assigned to logged-in user)
router.post('/', (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Course name is required.' });
    }

    try {
        const stmt = db.prepare('INSERT INTO courses (name, description, user_id) VALUES (?, ?, ?)');
        const result = stmt.run(name.trim(), description ? description.trim() : null, req.user.id);
        const newCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newCourse);
    } catch (err) {
        console.error('POST /courses error:', err);
        res.status(500).json({ error: 'Failed to create course.' });
    }
});

// ─── PUT /courses/:id ─────────────────────────────────────────────────────────
// Updates an existing course's name and/or description (user-scoped)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Course name is required.' });
    }

    try {
        const existing = db.prepare(
            'SELECT * FROM courses WHERE id = ? AND user_id = ?'
        ).get(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        db.prepare('UPDATE courses SET name = ?, description = ? WHERE id = ? AND user_id = ?')
            .run(name.trim(), description ? description.trim() : null, id, req.user.id);

        const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        res.json(updated);
    } catch (err) {
        console.error('PUT /courses/:id error:', err);
        res.status(500).json({ error: 'Failed to update course.' });
    }
});

// ─── DELETE /courses/:id ──────────────────────────────────────────────────────
// Deletes a course — only if it belongs to the user
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const existing = db.prepare(
            'SELECT * FROM courses WHERE id = ? AND user_id = ?'
        ).get(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        db.prepare('DELETE FROM courses WHERE id = ? AND user_id = ?').run(id, req.user.id);
        res.json({ message: 'Course deleted successfully.' });
    } catch (err) {
        console.error('DELETE /courses/:id error:', err);
        res.status(500).json({ error: 'Failed to delete course.' });
    }
});

module.exports = router;
