// one_percent_better/utils/reseedDatabase.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hhaknhsygdajhabbanzu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYWtuaHN5Z2RhamhhYmJhbnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwMjQ3MjEsImV4cCI6MjAzNTYwMDcyMX0.kK8viaMqxFPqylFTr0RvC0V6BL6CtB2jLgZdn-AhGc4'

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function reseedDatabase() {
  try {
    // Step 1: Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@gmail.com',
      password: 'abc123',
    });

    if (authError) {
      console.error('Error during signup:', authError.message);
      return;
    }

    const userId = authData.user.id;  // This is the Supabase Auth user ID

    // Step 2: Insert the user data into your `users` table with additional fields
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert([{
        userId: userId, 
        email: 'test@gmail.com', 
        username: 'supabasetest',
        age: 18,  // Default age
        weight: 200,  // Default weight
        gender: true,  // Default gender (assuming true is male, adjust as needed)
      }]);

    if (userError) {
      console.error('Error inserting user into custom table:', userError.message);
      return;
    }

    console.log('Database reseeded with the test user successfully.');
  } catch (error) {
    console.error('Unexpected error during reseeding:', error);
  }
}

// Execute the function
reseedDatabase();
