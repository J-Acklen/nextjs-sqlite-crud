// app/page.js
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    user_id: '',
    due_date: ''
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: ''
  });

  // Fetch data
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Task CRUD operations
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });

      if (response.ok) {
        await fetchTasks();
        resetTaskForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task');
    }
  };

  const deleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchTasks();
          console.log('Task deleted successfully');
        } else {
          const error = await response.json();
          console.error('Delete error response:', error);
          alert(`Error: ${error.error || 'Failed to delete task'}`);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(`Network error: ${error.message}`);
      }
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      user_id: task.user_id,
      due_date: task.due_date || ''
    });
    setShowTaskForm(true);
  };

  // User CRUD operations
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        await fetchUsers();
        resetUserForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user? This will also delete all their tasks.')) {
      try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchUsers();
          await fetchTasks();
          console.log('User deleted successfully');
        } else {
          const error = await response.json();
          console.error('Delete error response:', error);
          alert(`Error: ${error.error || 'Failed to delete user'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Network error: ${error.message}`);
      }
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email
    });
    setShowUserForm(true);
  };

  // Reset forms
  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      user_id: '',
      due_date: ''
    });
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const resetUserForm = () => {
    setUserForm({ name: '', email: '' });
    setEditingUser(null);
    setShowUserForm(false);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Task Management System</h1>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {/* Task Form Modal */}
            {showTaskForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </h3>
                  <form onSubmit={handleTaskSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={taskForm.status}
                          onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={taskForm.priority}
                          onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned User *
                      </label>
                      <select
                        required
                        value={taskForm.user_id}
                        onChange={(e) => setTaskForm({...taskForm, user_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a user</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                      >
                        {editingTask ? 'Update' : 'Create'} Task
                      </button>
                      <button
                        type="button"
                        onClick={resetTaskForm}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No tasks found. Create your first task!
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tasks.map(task => (
                    <div key={task.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(task.status)}
                            <h3 className="text-lg font-medium text-gray-900">
                              {task.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 mb-2">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {task.user_name}
                            </div>
                            <div>Status: {task.status.replace('_', ' ')}</div>
                            {task.due_date && (
                              <div>Due: {new Date(task.due_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => editTask(task)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Users</h2>
              <button
                onClick={() => setShowUserForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* User Form Modal */}
            {showUserForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={userForm.name}
                        onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                      >
                        {editingUser ? 'Update' : 'Create'} User
                      </button>
                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {users.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No users found. Create your first user!
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map(user => {
                    const userTasks = tasks.filter(task => task.user_id === user.id);
                    return (
                      <div key={user.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {user.name}
                            </h3>
                            <p className="text-gray-600 mb-2">{user.email}</p>
                            <div className="text-sm text-gray-500">
                              {userTasks.length} task(s) assigned • Created {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => editUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
              <div className="text-sm text-blue-800">Total Tasks</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-sm text-yellow-800">In Progress</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{users.length}</div>
              <div className="text-sm text-purple-800">Total Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}