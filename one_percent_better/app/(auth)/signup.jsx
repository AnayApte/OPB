// auth/signup.jsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import *  as SecureStore from 'expo-secure-store';


export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        console.error('Error during signup:', error.message);
        return;
      }
  
      const userId = data.user.id;  // This is the Supabase Auth user ID
  
      // Step 2: Insert the user data into your `users` table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([{ userId: userId, email: email, username: username }]);
  
      if (userError) {
        console.error('Error inserting user into custom table:', userError.message);
        return;
      }
  
      // Step 3: Store the user ID securely and navigate to the profile completion page
      await SecureStore.setItemAsync('userId', userId);
      router.replace('/profile');  // Redirect to the profile completion page
      
      console.log('Signup and user creation successful');
    } catch (error) {
      console.error('Unexpected error during signup:', error);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput           
        style={styles.input}           
        placeholder="Email"           
        value={email}           
        onChangeText={setEmail}         
        />         
        <TextInput           
        style={styles.input}           
        placeholder="Username"           
        value={username}           
        onChangeText={setUsername}         
        />         
        <TextInput           
        style={styles.input}           
        placeholder="Password"           
        secureTextEntry           
        value={password}           
        onChangeText={setPassword}         
        />         
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View style={styles.bottomLink}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Have an account? Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  signupButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomLink: {
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    fontSize: 16,
  },
});
