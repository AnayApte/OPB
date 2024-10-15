// one_percent_better/utils/destroyDatabase.js

// Update this as you add more tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hhaknhsygdajhabbanzu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYWtuaHN5Z2RhamhhYmJhbnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDAyNDcyMSwiZXhwIjoyMDM1NjAwNzIxfQ.4IjCkSrU8ljIZUc4mpRXESiC7_YM78ZFZIsL82MU8oM'

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllUsers() {
  try {
    // Fetch all users
    const { data, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error('Error fetching users:', fetchError.message);
      return;
    }

    if (!data || !Array.isArray(data.users)) {
      console.error('Unexpected data format:', data);
      return;
    }

    // Iterate over each user and delete them
    for (const user of data.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`Error deleting user ${user.id}:`, deleteError.message);
      } else {
        console.log(`User ${user.email} deleted successfully.`);
      }
    }

    console.log('All users have been deleted from Supabase Auth.');
  } catch (error) {
    console.error('Error deleting all users:', error.message);
  }
}

async function deleteAllData() {
  try {
    const tables = [
      'users',
      'exercises',
      'personalRecords',
      'recipes',
      'sets',
      'workoutExercises',
      'workouts',
      'journals',
      'todos'
    ];

    for (const table of tables) {
      const { error: truncateError } = await supabase.rpc('truncate_table', { table_name: table });
      if (truncateError) {
        console.error(`Error truncating table ${table}:`, truncateError.message);
      } else {
        console.log(`Table ${table} truncated successfully.`);
      }
    }

    console.log('All tables have been truncated.');
  } catch (error) {
    console.error('Error deleting all data:', error.message);
  }
}

async function destroyDatabase() {
  await deleteAllUsers();  // Delete all users from Supabase Auth
  await deleteAllData();    // Truncate all tables
}

// Execute the function
destroyDatabase();
