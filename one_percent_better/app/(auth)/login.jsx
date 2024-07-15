// auth/login.jsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { comparePassword } from '../../utils/passwordGenerator';
import { useAuth } from '../../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setUserId } = useAuth();

  const handleLogin = async () => {
    try {
      // Query by email/username
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('userId, hashedPassword')
        .or(`email.eq.${userOrEmail},username.eq.${userOrEmail}`)
        .single();

      if (emailError) throw emailError;

      if (!userByEmail) {
        console.log('User not found');
        return;
      }

      // Verify password
      if (comparePassword(password, userByEmail.hashedPassword)) {
        console.log('Login successful');
        // Store the user ID in secure storage and update context
        await SecureStore.setItemAsync('userId', userByEmail.userId);
        setUserId(userByEmail.userId);
        router.replace('/home');
      } else {
        console.log('Incorrect password');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          value={userOrEmail}
          onChangeText={setUserOrEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.signUp}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Don't have an account? Sign up instead</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View style={styles.forgotPassword}>
          <Link href="/(auth)/forgotPassword" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Forgot password?</Text>
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
  loginButton: {       
    backgroundColor: 'green',       
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
  signUp: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  forgotPassword: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    fontSize: 16,
  },
});
