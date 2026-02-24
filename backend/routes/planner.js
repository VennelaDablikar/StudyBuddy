// routes/planner.js — Study session CRUD for the planner/calendar
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /planner — All sessions for logged-in user (optionally filter by month)
router.get('/', (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        let sessions;
        if (month && year) {
            // Filter by specific month (month is 1-indexed)
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
            sessions = db.prepare(`
                SELECT s.*, c.name as courseName
                FROM study_sessions s
                LEFT JOIN courses c ON s.course_id = c.id
                WHERE s.user_id = ? AND s.session_date BETWEEN ? AND ?
                ORDER BY s.session_date ASC, s.start_time ASC
            `).all(userId, startDate, endDate);
        } else {
            sessions = db.prepare(`
                SELECT s.*, c.name as courseName
                FROM study_sessions s
                LEFT JOIN courses c ON s.course_id = c.id
                WHERE s.user_id = ?
                ORDER BY s.session_date ASC, s.start_time ASC
            `).all(userId);
        }

        res.json(sessions);
    } catch (err) {
        console.error('GET /planner error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /planner — Create a new study session
router.post('/', (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, course_id, session_date, start_time, end_time } = req.body;

        if (!title || !session_date) {
            return res.status(400).json({ error: 'Title and date are required' });
        }

        const result = db.prepare(`
            INSERT INTO study_sessions (user_id, title, description, course_id, session_date, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, title, description || null, course_id || null, session_date, start_time || null, end_time || null);

        const session = db.prepare(`
            SELECT s.*, c.name as courseName
            FROM study_sessions s
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE s.id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(session);
    } catch (err) {
        console.error('POST /planner error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /planner/:id — Update a study session
router.put('/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, course_id, session_date, start_time, end_time, completed } = req.body;

        const existing = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?').get(id, userId);
        if (!existing) return res.status(404).json({ error: 'Session not found' });

        db.prepare(`
            UPDATE study_sessions 
            SET title = ?, description = ?, course_id = ?, session_date = ?, 
                start_time = ?, end_time = ?, completed = ?
            WHERE id = ? AND user_id = ?
        `).run(
            title || existing.title,
            description !== undefined ? description : existing.description,
            course_id !== undefined ? course_id : existing.course_id,
            session_date || existing.session_date,
            start_time !== undefined ? start_time : existing.start_time,
            end_time !== undefined ? end_time : existing.end_time,
            completed !== undefined ? completed : existing.completed,
            id, userId
        );

        const session = db.prepare(`
            SELECT s.*, c.name as courseName
            FROM study_sessions s
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE s.id = ?
        `).get(id);

        res.json(session);
    } catch (err) {
        console.error('PUT /planner error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /planner/:id/toggle — Toggle completed status
router.patch('/:id/toggle', (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const existing = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?').get(id, userId);
        if (!existing) return res.status(404).json({ error: 'Session not found' });

        const newStatus = existing.completed ? 0 : 1;
        db.prepare('UPDATE study_sessions SET completed = ? WHERE id = ?').run(newStatus, id);

        res.json({ ...existing, completed: newStatus });
    } catch (err) {
        console.error('PATCH /planner toggle error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /planner/:id — Delete a study session
router.delete('/:id', (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const existing = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?').get(id, userId);
        if (!existing) return res.status(404).json({ error: 'Session not found' });

        db.prepare('DELETE FROM study_sessions WHERE id = ?').run(id);
        res.json({ message: 'Session deleted' });
    } catch (err) {
        console.error('DELETE /planner error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
