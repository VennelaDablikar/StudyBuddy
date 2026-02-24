// routes/contact.js — Public contact form endpoint
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /contact — Save a contact form message
router.post('/', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required.' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const stmt = db.prepare(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
        );
        stmt.run(name.trim(), email.trim(), (subject || '').trim(), message.trim());

        res.status(201).json({ message: 'Thank you! Your message has been sent successfully.' });
    } catch (err) {
        console.error('POST /contact error:', err);
        res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
});

module.exports = router;
