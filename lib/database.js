// lib/database.js
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db = null;

export function getDatabase() {
  if (!db) {
    // Create database directory if it doesn't exist
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Initialize database
    const dbPath = path.join(dbDir, 'app.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    initializeTables();
  }
  
  return db;
}

function initializeTables() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      user_id INTEGER NOT NULL,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Insert sample data if tables are empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    insertSampleData();
  }
}

function insertSampleData() {
  // Insert sample users
  const insertUser = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  const users = [
    ['John Doe', 'john@example.com'],
    ['Jane Smith', 'jane@example.com'],
    ['Bob Johnson', 'bob@example.com']
  ];
  
  users.forEach(user => insertUser.run(...user));

  // Insert sample tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, user_id, due_date) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const tasks = [
    ['Complete project proposal', 'Write and submit the Q4 project proposal', 'pending', 'high', 1, '2024-12-01'],
    ['Review code changes', 'Review the latest pull requests', 'in_progress', 'medium', 1, '2024-11-25'],
    ['Update documentation', 'Update the API documentation', 'completed', 'low', 2, '2024-11-20'],
    ['Fix bug in login system', 'Resolve authentication issues', 'pending', 'high', 2, '2024-11-28'],
    ['Plan team meeting', 'Organize next sprint planning meeting', 'pending', 'medium', 3, '2024-11-30']
  ];
  
  tasks.forEach(task => insertTask.run(...task));
}

// Graceful shutdown
process.on('exit', () => {
  if (db) {
    db.close();
  }
});

process.on('SIGINT', () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});