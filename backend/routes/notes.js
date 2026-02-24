// routes/notes.js — CRUD + AI summarize endpoints for notes
const express = require('express');
const router = express.Router({ mergeParams: true });
const { db } = require('../db');

// ─── GET /courses/:id/notes ───────────────────────────────────────────────────
// Returns all notes for a course
router.get('/:id/notes', (req, res) => {
    const { id } = req.params;

    try {
        // Ensure the course exists
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        const notes = db.prepare(
            'SELECT * FROM notes WHERE course_id = ? ORDER BY created_at DESC'
        ).all(id);
        res.json(notes);
    } catch (err) {
        console.error('GET /courses/:id/notes error:', err);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
});

// ─── POST /courses/:id/notes ──────────────────────────────────────────────────
// Creates a new note under a course
router.post('/:id/notes', (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Note title is required.' });
    }

    try {
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        const stmt = db.prepare(
            'INSERT INTO notes (course_id, title, body) VALUES (?, ?, ?)'
        );
        const result = stmt.run(id, title.trim(), body ? body.trim() : null);
        const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newNote);
    } catch (err) {
        console.error('POST /courses/:id/notes error:', err);
        res.status(500).json({ error: 'Failed to create note.' });
    }
});

// ─── PUT /courses/:id/notes/:noteId ──────────────────────────────────────────
// Updates a note's title and/or body
router.put('/:id/notes/:noteId', (req, res) => {
    const { id, noteId } = req.params;
    const { title, body } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Note title is required.' });
    }

    try {
        const note = db.prepare(
            'SELECT * FROM notes WHERE id = ? AND course_id = ?'
        ).get(noteId, id);

        if (!note) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        // When content changes, clear old summary so user can regenerate
        const bodyChanged = body !== note.body;
        db.prepare(
            'UPDATE notes SET title = ?, body = ?, summary = ? WHERE id = ?'
        ).run(title.trim(), body ? body.trim() : null, bodyChanged ? null : note.summary, noteId);

        const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
        res.json(updated);
    } catch (err) {
        console.error('PUT /courses/:id/notes/:noteId error:', err);
        res.status(500).json({ error: 'Failed to update note.' });
    }
});

// ─── DELETE /courses/:id/notes/:noteId ───────────────────────────────────────
// Deletes a single note
router.delete('/:id/notes/:noteId', (req, res) => {
    const { id, noteId } = req.params;

    try {
        const note = db.prepare(
            'SELECT * FROM notes WHERE id = ? AND course_id = ?'
        ).get(noteId, id);

        if (!note) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        db.prepare('DELETE FROM notes WHERE id = ?').run(noteId);
        res.json({ message: 'Note deleted successfully.' });
    } catch (err) {
        console.error('DELETE /courses/:id/notes/:noteId error:', err);
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});

// ─── POST /courses/:id/notes/:noteId/summarize ────────────────────────────────
// Calls Groq API to summarize note body, saves & returns summary.
// Returns { summary, cached } — cached:true means the DB value was returned
// without calling the API again.
router.post('/:id/notes/:noteId/summarize', async (req, res) => {
    const { id: courseId, noteId } = req.params;

    try {
        // Step 1 — Fetch the note
        const note = db.prepare(
            'SELECT * FROM notes WHERE id = ? AND course_id = ?'
        ).get(noteId, courseId);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Guard: body must be present and at least 10 characters
        if (!note.body || note.body.trim().length < 10) {
            return res.status(400).json({ error: 'Note is too short to summarize' });
        }

        // Step 2 — Return cached summary without hitting the API
        if (note.summary) {
            return res.json({ summary: note.summary, cached: true });
        }

        // Step 3 — Validate API key before calling Groq
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Step 3 — Call Groq API (native fetch, Node 18+)
        let groqResponse;
        try {
            groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful study assistant. Summarize study notes into exactly 5 clear, concise bullet points. Each bullet point should capture one key concept. Return only the bullet points, no introduction or extra text.',
                        },
                        {
                            role: 'user',
                            content: `Summarize these study notes:\n\n${note.body}`,
                        },
                    ],
                    max_tokens: 500,
                    temperature: 0.4,
                }),
            });
        } catch (fetchErr) {
            console.error('Groq fetch error:', fetchErr);
            return res.status(502).json({
                error: 'AI service unavailable',
                details: fetchErr.message,
            });
        }

        if (!groqResponse.ok) {
            const errBody = await groqResponse.json().catch(() => ({}));
            console.error('Groq API non-OK response:', errBody);
            return res.status(502).json({
                error: 'AI service unavailable',
                details: errBody?.error?.message || `HTTP ${groqResponse.status}`,
            });
        }

        // Step 4 — Extract summary text
        const responseData = await groqResponse.json();
        const summary = responseData.choices?.[0]?.message?.content?.trim();

        if (!summary) {
            return res.status(502).json({
                error: 'AI service unavailable',
                details: 'Empty response from model',
            });
        }

        // Step 5 — Persist in DB
        db.prepare('UPDATE notes SET summary = ? WHERE id = ?').run(summary, noteId);

        // Step 6 — Return with cached: false (freshly generated)
        res.json({ summary, cached: false });

    } catch (err) {
        console.error('POST /summarize error:', err);
        res.status(500).json({
            error: 'AI service unavailable',
            details: err.message,
        });
    }
});

// ─── PATCH /courses/:courseId/notes/:noteId/toggle-reviewed ────────────────────
// Toggle the is_reviewed status of a note
router.patch('/:courseId/notes/:noteId/toggle-reviewed', (req, res) => {
    try {
        const { courseId, noteId } = req.params;
        const note = db.prepare(
            'SELECT * FROM notes WHERE id = ? AND course_id = ?'
        ).get(noteId, courseId);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const newValue = note.is_reviewed === 1 ? 0 : 1;
        db.prepare(
            'UPDATE notes SET is_reviewed = ? WHERE id = ?'
        ).run(newValue, noteId);

        res.json({ is_reviewed: newValue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

