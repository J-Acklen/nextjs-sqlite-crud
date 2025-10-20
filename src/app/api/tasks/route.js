// app/api/tasks/route.js (TEMPORARY VERSION WITH DELETE)
import { getDatabase } from '@/lib/database';
import { NextResponse } from 'next/server';

// GET /api/tasks - Get all tasks with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const db = getDatabase();
    
    let query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (userId) {
      conditions.push('t.user_id = ?');
      params.push(userId);
    }
    
    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }
    
    if (priority) {
      conditions.push('t.priority = ?');
      params.push(priority);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const tasks = db.prepare(query).all(...params);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request) {
  try {
    const { title, description, status, priority, user_id, due_date } = await request.json();
    
    // Validation
    if (!title || !user_id) {
      return NextResponse.json(
        { error: 'Title and user_id are required' },
        { status: 400 }
      );
    }

    // Validate status and priority values
    const validStatuses = ['pending', 'in_progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];
    
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if user exists
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Insert new task
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, user_id, due_date) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      title,
      description || null,
      status || 'pending',
      priority || 'medium',
      user_id,
      due_date || null
    );
    
    // Get the created task with user info
    const newTask = db.prepare(`
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// TEMPORARY DELETE METHOD - normally this would be in [id]/route.js
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    
    // Extract ID from URL path: /api/tasks/6 -> get "6"
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    console.log('DELETE request URL:', url.pathname);
    console.log('Path segments:', pathSegments);
    console.log('Extracted ID:', id);
    
    if (!id || id === 'tasks' || id === '') {
      console.log('Invalid ID detected:', id);
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if task exists
    const existingTask = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      console.log('Task not found with ID:', id);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete task
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    
    console.log('Delete result:', result);
    
    return NextResponse.json({ 
      message: 'Task deleted successfully',
      deletedId: id 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}