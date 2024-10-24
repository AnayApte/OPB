import {SUPABASEURL, SUPABASEKEY} from '@env'

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = SUPABASEURL;
const supabaseServiceKey = SUPABASEKEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllUsers() {
  try {
    const { data, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error('Error fetching users:', fetchError.message);
      return;
    }

    if (!data || !Array.isArray(data.users)) {
      console.error('Unexpected data format:', data);
      return;
    }

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
  await deleteAllUsers(); 
  await deleteAllData();    
}

destroyDatabase();
