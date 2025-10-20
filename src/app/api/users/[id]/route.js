// app/api/users/[id]/route.js
import { getDatabase } from '@/lib/database';
import { NextResponse } from 'next/server';

// GET /api/users/[id] - Get specific user
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDatabase();
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const { name, email } = await request.json();
    
    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is taken by another user
    const emailCheck = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
    if (emailCheck) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Update user
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(name, email, id);
    
    // Get updated user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDatabase();
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (tasks will be deleted due to CASCADE)
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}