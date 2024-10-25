require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASEURL;
const supabaseAnonKey = process.env.SUPABASEKEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function reseedDatabase() {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@gmail.com',
      password: 'abc123',
    });

    if (authError) {
      console.error('Error during signup:', authError.message);
      return;
    }

    const userId = authData.user.id;

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert([{
        userId: userId, 
        email: 'test@gmail.com', 
        username: 'supabasetest',
        age: 18,
        weight: 200,
        gender: 'Male',
        activity_level: 'Sedentary',
        height: 70,
        lose_weight: 0,
        gain_weight: 0,
        weeks: 12,
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

reseedDatabase();
