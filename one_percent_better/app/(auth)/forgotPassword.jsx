import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASEURL, SUPABASEKEY } from '@env';

// Initialize Supabase client
const supabaseUrl = SUPABASEURL; // Replace with your Supabase project URL
const supabaseAnonKey = SUPABASEKEY; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://password-reset' // Your app’s deep link for password reset
      });

      if (error) throw error;
      
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title={loading ? 'Sending...' : 'Reset Password'} onPress={handleForgotPassword} disabled={loading} />
      {message ? <Text style={{ marginTop: 10, color: 'green' }}>{message}</Text> : null}
    </View>
  );
};

export default ForgotPasswordScreen;