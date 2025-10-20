// app/api/users/route.js
import { getDatabase } from '@/lib/database';
import { NextResponse } from 'next/server';

// GET /api/users - Get all users
export async function GET() {
  try {
    const db = getDatabase();
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request) {
  try {
    const { name, email } = await request.json();
    
    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Insert new user
    const stmt = db.prepare(`
      INSERT INTO users (name, email) 
      VALUES (?, ?)
    `);
    
    const result = stmt.run(name, email);
    
    // Get the created user
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}