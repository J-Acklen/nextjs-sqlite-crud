// app/api/tasks/[id]/route.js
import { getDatabase } from '@/lib/database';
import { NextResponse } from 'next/server';

// GET /api/tasks/[id] - Get specific task
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDatabase();
    
    const task = db.prepare(`
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
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
    
    // Check if task exists
    const existingTask = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update task
    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, user_id = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(title, description, status, priority, user_id, due_date, id);
    
    // Get updated task with user info
    const updatedTask = db.prepare(`
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(id);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if task exists
    const existingTask = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete task
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    
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