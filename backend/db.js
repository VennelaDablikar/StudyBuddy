// db.js — Database initialization and connection
const Database = require('better-sqlite3');
const path = require('path');

// Create/open the SQLite database file
const db = new Database(path.join(__dirname, 'studybuddy.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
// Enable foreign key support for CASCADE deletes
db.pragma('foreign_keys = ON');

/**
 * Initialize tables on server start.
 * Uses IF NOT EXISTS so it is safe to call every time.
 */
function initializeDatabase() {
  // Users table — must come before courses
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notes table — foreign key references courses(id) with CASCADE delete
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // PDFs table — stores uploaded PDF files per course
  db.exec(`
    CREATE TABLE IF NOT EXISTS pdfs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      size INTEGER,
      summary TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  // Add is_reviewed column if it doesn't exist yet (safe migration)
  try {
    db.prepare('ALTER TABLE notes ADD COLUMN is_reviewed INTEGER DEFAULT 0').run();
  } catch (e) {
    // Column already exists, ignore error
  }

  // Add user_id column to courses if it doesn't exist (safe migration)
  try {
    db.prepare('ALTER TABLE courses ADD COLUMN user_id INTEGER REFERENCES users(id)').run();
  } catch (e) {
    // Column already exists, ignore error
  }

  // Study sessions table — for the study planner/calendar
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      course_id INTEGER,
      session_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    )
  `);

  // Contact messages table — stores messages from the landing page contact form
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Quizzes table — stores AI-generated quizzes and user scores
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      answers TEXT,
      score INTEGER,
      total INTEGER NOT NULL,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully');
}

module.exports = { db, initializeDatabase };
