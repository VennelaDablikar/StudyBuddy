// server.js — Express application entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');

// Import route handlers
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const coursesRouter = require('./routes/courses');
const notesRouter = require('./routes/notes');
const pdfsRouter = require('./routes/pdfs');
const analyticsRouter = require('./routes/analytics');
const plannerRouter = require('./routes/planner');
const contactRouter = require('./routes/contact');
const quizRouter = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
// Allow requests from any localhost port (3000, 3001, 5173, etc.)
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Serve uploaded PDF files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Auth routes (public — no middleware)
app.use('/auth', authRouter);
app.use('/contact', contactRouter);

// Protected routes (require valid JWT)
app.use('/courses', authMiddleware, coursesRouter);
app.use('/courses', authMiddleware, notesRouter);
app.use('/courses/:courseId/pdfs', authMiddleware, pdfsRouter);
app.use('/analytics', authMiddleware, analyticsRouter);
app.use('/planner', authMiddleware, plannerRouter);
app.use('/courses', authMiddleware, quizRouter);

// Health-check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'StudyBuddy API is running 🚀' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🚀 StudyBuddy backend running at http://localhost:${PORT}`);
});
