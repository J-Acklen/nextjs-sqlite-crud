// test-api.js - Run this script to test your API endpoints
// Usage: node test-api.js

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Next.js SQLite CRUD API...\n');

  try {
    // Test 1: Get all users
    console.log('1️⃣ Testing GET /api/users');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    const users = await usersResponse.json();
    console.log(`✅ Found ${users.length} users`);
    console.log('Sample user:', users[0]);
    console.log('');

    // Test 2: Create a new user
    console.log('2️⃣ Testing POST /api/users');
    const newUser = {
      name: 'Test User',
      email: 'test@example.com'
    };
    const createUserResponse = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    if (createUserResponse.ok) {
      const createdUser = await createUserResponse.json();
      console.log('✅ User created:', createdUser);
      
      // Test 3: Update the user
      console.log('');
      console.log('3️⃣ Testing PUT /api/users/:id');
      const updatedUserData = {
        name: 'Updated Test User',
        email: 'updated@example.com'
      };
      const updateResponse = await fetch(`${BASE_URL}/api/users/${createdUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData)
      });
      
      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        console.log('✅ User updated:', updatedUser);
      }
      
      // Test 4: Create a task for this user
      console.log('');
      console.log('4️⃣ Testing POST /api/tasks');
      const newTask = {
        title: 'Test Task',
        description: 'This is a test task created via API',
        status: 'pending',
        priority: 'high',
        user_id: createdUser.id,
        due_date: '2024-12-31'
      };
      
      const createTaskResponse = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      
      if (createTaskResponse.ok) {
        const createdTask = await createTaskResponse.json();
        console.log('✅ Task created:', createdTask);
        
        // Test 5: Update the task
        console.log('');
        console.log('5️⃣ Testing PUT /api/tasks/:id');
        const updatedTaskData = {
          title: 'Updated Test Task',
          description: 'This task has been updated',
          status: 'completed',
          priority: 'medium',
          user_id: createdUser.id,
          due_date: '2024-12-25'
        };
        
        const updateTaskResponse = await fetch(`${BASE_URL}/api/tasks/${createdTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTaskData)
        });
        
        if (updateTaskResponse.ok) {
          const updatedTask = await updateTaskResponse.json();
          console.log('✅ Task updated:', updatedTask);
        }
        
        // Test 6: Get all tasks
        console.log('');
        console.log('6️⃣ Testing GET /api/tasks');
        const tasksResponse = await fetch(`${BASE_URL}/api/tasks`);
        const tasks = await tasksResponse.json();
        console.log(`✅ Found ${tasks.length} tasks`);
        
        // Test 7: Get tasks filtered by user
        console.log('');
        console.log('7️⃣ Testing GET /api/tasks?userId=:id');
        const userTasksResponse = await fetch(`${BASE_URL}/api/tasks?userId=${createdUser.id}`);
        const userTasks = await userTasksResponse.json();
        console.log(`✅ Found ${userTasks.length} tasks for user ${createdUser.id}`);
        
        // Test 8: Delete the task
        console.log('');
        console.log('8️⃣ Testing DELETE /api/tasks/:id');
        const deleteTaskResponse = await fetch(`${BASE_URL}/api/tasks/${createdTask.id}`, {
          method: 'DELETE'
        });
        
        if (deleteTaskResponse.ok) {
          console.log('✅ Task deleted successfully');
        }
      }
      
      // Test 9: Delete the user
      console.log('');
      console.log('9️⃣ Testing DELETE /api/users/:id');
      const deleteUserResponse = await fetch(`${BASE_URL}/api/users/${createdUser.id}`, {
        method: 'DELETE'
      });
      
      if (deleteUserResponse.ok) {
        console.log('✅ User deleted successfully');
      }
      
    } else {
      const error = await createUserResponse.json();
      console.log('❌ Failed to create user:', error);
    }

    console.log('');
    console.log('🎉 All tests completed!');
    console.log('');
    console.log('📋 API Endpoints Summary:');
    console.log('• GET    /api/users          - Get all users');
    console.log('• POST   /api/users          - Create user');
    console.log('• GET    /api/users/:id      - Get specific user');
    console.log('• PUT    /api/users/:id      - Update user');
    console.log('• DELETE /api/users/:id      - Delete user');
    console.log('• GET    /api/tasks          - Get all tasks (with filters)');
    console.log('• POST   /api/tasks          - Create task');
    console.log('• GET    /api/tasks/:id      - Get specific task');
    console.log('• PUT    /api/tasks/:id      - Update task');
    console.log('• DELETE /api/tasks/:id      - Delete task');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Make sure your Next.js development server is running on http://localhost:3000');
  }
}

// Run the tests
testAPI();