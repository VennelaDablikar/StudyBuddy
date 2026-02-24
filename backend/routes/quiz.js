// routes/quiz.js — AI-powered Quiz Generator endpoints
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// ─── POST /courses/:id/quiz/generate ──────────────────────────────────────────
// Collects all notes + PDF summaries for the course, sends to Groq AI to
// generate 5 MCQs, saves the quiz, and returns it.
router.post('/:id/quiz/generate', async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    try {
        // Verify course belongs to user
        const course = db.prepare('SELECT * FROM courses WHERE id = ? AND user_id = ?').get(courseId, userId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Gather all note bodies for this course
        const notes = db.prepare('SELECT title, body FROM notes WHERE course_id = ?').all(courseId);

        // Gather all PDF summaries
        const pdfs = db.prepare('SELECT original_name, summary FROM pdfs WHERE course_id = ? AND summary IS NOT NULL AND summary != \'\'').all(courseId);

        // Build study material text
        let material = '';
        if (notes.length > 0) {
            material += 'NOTES:\n';
            notes.forEach(n => {
                material += `\n--- ${n.title} ---\n${n.body || '(empty)'}\n`;
            });
        }
        if (pdfs.length > 0) {
            material += '\nPDF SUMMARIES:\n';
            pdfs.forEach(p => {
                material += `\n--- ${p.original_name} ---\n${p.summary}\n`;
            });
        }

        if (material.trim().length < 50) {
            return res.status(400).json({
                error: 'Not enough study material to generate a quiz. Add more notes or summarize your PDFs first.'
            });
        }

        // Truncate to ~4000 chars to fit context window
        if (material.length > 4000) {
            material = material.substring(0, 4000) + '\n...(truncated)';
        }

        // Call Groq AI
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
            return res.status(500).json({ error: 'AI API key not configured' });
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                        content: `You are a quiz generator for students. Given study material, generate exactly 5 multiple-choice questions to test understanding.

Return ONLY a valid JSON array with this exact format (no markdown, no code fences, no extra text):
[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Rules:
- Exactly 5 questions
- Exactly 4 options each
- correctIndex is 0-3 (index of the correct option)
- Questions should test understanding, not just memorization
- Mix difficulty levels
- Return ONLY the JSON array, nothing else`
                    },
                    {
                        role: 'user',
                        content: `Generate a quiz from this study material:\n\n${material}`,
                    },
                ],
                max_tokens: 1500,
                temperature: 0.5,
            }),
        });

        if (!groqResponse.ok) {
            const err = await groqResponse.text();
            console.error('Groq API error:', err);
            return res.status(502).json({ error: 'AI service unavailable', details: err });
        }

        const groqData = await groqResponse.json();
        let content = groqData.choices[0].message.content.trim();

        // Clean up response — strip markdown code fences if present
        content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

        let questions;
        try {
            questions = JSON.parse(content);
        } catch (parseErr) {
            console.error('Failed to parse quiz JSON:', content);
            return res.status(502).json({ error: 'AI returned invalid quiz format. Please try again.' });
        }

        // Validate structure
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(502).json({ error: 'AI returned empty quiz. Please try again.' });
        }

        // Ensure each question has required fields
        questions = questions.slice(0, 5).map((q, i) => ({
            question: q.question || `Question ${i + 1}`,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        }));

        // Save quiz to DB
        const title = `${course.name} Quiz — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        const result = db.prepare(
            'INSERT INTO quizzes (user_id, course_id, title, questions, total) VALUES (?, ?, ?, ?, ?)'
        ).run(userId, courseId, title, JSON.stringify(questions), questions.length);

        res.status(201).json({
            id: result.lastInsertRowid,
            title,
            questions,
            total: questions.length,
            score: null,
            created_at: new Date().toISOString(),
        });

    } catch (err) {
        console.error('POST /quiz/generate error:', err);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// ─── POST /courses/:id/quiz/:quizId/submit ────────────────────────────────────
// Accepts user answers, scores them, and updates the quiz record.
router.post('/:id/quiz/:quizId/submit', (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body; // array of selected indices [0, 2, 1, 3, 0]

    try {
        const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND user_id = ?').get(quizId, userId);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const questions = JSON.parse(quiz.questions);

        if (!Array.isArray(answers) || answers.length !== questions.length) {
            return res.status(400).json({ error: `Expected ${questions.length} answers` });
        }

        // Score the quiz
        let score = 0;
        const results = questions.map((q, i) => {
            const correct = answers[i] === q.correctIndex;
            if (correct) score++;
            return {
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                selectedIndex: answers[i],
                correct,
            };
        });

        // Update DB
        db.prepare(
            'UPDATE quizzes SET answers = ?, score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(JSON.stringify(answers), score, quizId);

        res.json({
            score,
            total: questions.length,
            percentage: Math.round((score / questions.length) * 100),
            results,
        });

    } catch (err) {
        console.error('POST /quiz/submit error:', err);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// ─── GET /courses/:id/quiz/history ────────────────────────────────────────────
// Returns all past quizzes for this course (newest first).
router.get('/:id/quiz/history', (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    try {
        const quizzes = db.prepare(
            'SELECT id, title, score, total, completed_at, created_at FROM quizzes WHERE course_id = ? AND user_id = ? ORDER BY created_at DESC'
        ).all(courseId, userId);

        res.json(quizzes);
    } catch (err) {
        console.error('GET /quiz/history error:', err);
        res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
});

module.exports = router;
