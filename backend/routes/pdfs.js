// routes/pdfs.js — PDF upload, list, delete, and AI summarize endpoints
const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { db } = require('../db');

// ─── Multer setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    },
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// ─── GET /courses/:courseId/pdfs ──────────────────────────────────────────────
// Returns all PDFs for a course
router.get('/', (req, res) => {
    try {
        const { courseId } = req.params;
        const pdfs = db.prepare(
            'SELECT * FROM pdfs WHERE course_id = ? ORDER BY uploaded_at DESC'
        ).all(courseId);
        res.json(pdfs);
    } catch (err) {
        console.error('GET /pdfs error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /courses/:courseId/pdfs ─────────────────────────────────────────────
// Upload a new PDF
router.post('/', upload.single('pdf'), (req, res) => {
    try {
        const { courseId } = req.params;
        if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const result = db.prepare(`
      INSERT INTO pdfs (course_id, original_name, filename, file_path, size)
      VALUES (?, ?, ?, ?, ?)
    `).run(
            courseId,
            req.file.originalname,
            req.file.filename,
            req.file.path,
            req.file.size
        );

        const pdf = db.prepare('SELECT * FROM pdfs WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(pdf);
    } catch (err) {
        console.error('POST /pdfs error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── DELETE /courses/:courseId/pdfs/:pdfId ─────────────────────────────────────
// Delete a PDF from disk and database
router.delete('/:pdfId', (req, res) => {
    try {
        const { courseId, pdfId } = req.params;

        const pdf = db.prepare(
            'SELECT * FROM pdfs WHERE id = ? AND course_id = ?'
        ).get(pdfId, courseId);

        if (!pdf) return res.status(404).json({ error: 'PDF not found' });

        // Delete file from disk
        if (fs.existsSync(pdf.file_path)) {
            fs.unlinkSync(pdf.file_path);
        }

        db.prepare('DELETE FROM pdfs WHERE id = ?').run(pdfId);
        res.json({ message: 'PDF deleted successfully' });
    } catch (err) {
        console.error('DELETE /pdfs error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /courses/:courseId/pdfs/:pdfId/summarize ────────────────────────────
// Extract text from PDF and summarize with Groq AI
router.post('/:pdfId/summarize', async (req, res) => {
    try {
        const { courseId, pdfId } = req.params;

        const pdf = db.prepare(
            'SELECT * FROM pdfs WHERE id = ? AND course_id = ?'
        ).get(pdfId, courseId);

        if (!pdf) return res.status(404).json({ error: 'PDF not found' });

        // Return cached summary if exists
        if (pdf.summary && pdf.summary.trim() !== '') {
            return res.json({ summary: pdf.summary, cached: true });
        }

        // Extract text from PDF file
        const fileBuffer = fs.readFileSync(pdf.file_path);
        const pdfData = await pdfParse(fileBuffer);
        const extractedText = pdfData.text.trim();

        if (!extractedText || extractedText.length < 50) {
            return res.status(400).json({
                error: 'Could not extract enough text from this PDF'
            });
        }

        // Trim to 3000 characters to stay within token limits
        const trimmedText = extractedText.substring(0, 3000);

        // Call Groq API
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const groqResponse = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful study assistant. Summarize the given PDF content into exactly 6 clear bullet points. Each bullet point must start with "• ". Focus on the most important concepts a student needs to know. Return only bullet points, nothing else.'
                        },
                        {
                            role: 'user',
                            content: `Summarize this PDF content:\n\n${trimmedText}`
                        }
                    ],
                    max_tokens: 600,
                    temperature: 0.4
                })
            }
        );

        if (!groqResponse.ok) {
            const err = await groqResponse.text();
            console.error('Groq API error:', err);
            return res.status(502).json({ error: 'Groq API failed', details: err });
        }

        const groqData = await groqResponse.json();
        const summary = groqData.choices[0].message.content;

        // Save summary to database
        db.prepare('UPDATE pdfs SET summary = ? WHERE id = ?').run(summary, pdfId);

        res.json({ summary, cached: false });

    } catch (err) {
        console.error('POST /pdfs/summarize error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;
