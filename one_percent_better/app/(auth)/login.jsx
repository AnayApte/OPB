// auth/login.jsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../ThemeContext'; // Import useTheme
export default function Login() {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { theme } = useTheme();

  const handleLogin = async () => {
    try {
      let loginEmail = userOrEmail;

      // Check if the input is a username and fetch the corresponding email
      if (!userOrEmail.includes('@')) {
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', userOrEmail)
          .single();

        if (userError || !userRecord) {
          console.error('Error fetching email for username:', userError?.message || 'User not found');
          return;
        }
        loginEmail = userRecord.email;
      }

      // Authenticate the user with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        console.error('Error during login:', error.message);
        return;
      }

      const userId = data.user.id;

      // Store the user ID securely and navigate to the home page
      await SecureStore.setItemAsync('userId', userId);
      router.replace('/home');

      console.log('Login successful');
    } catch (error) {
      console.error('Unexpected error during login:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {       
      flex: 1,       
      backgroundColor: theme.background,     
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
      color: theme.primary,     
    },     
    input: {       
      width: '100%',       
      height: 40,       
      borderColor: theme.border,       
      borderWidth: 1,       
      borderRadius: 5,       
      marginBottom: 16,       
      paddingHorizontal: 10,
      color: theme.text,
      backgroundColor: theme.inputBackground,     
    },     
    loginButton: {       
      backgroundColor: theme.primary,       
      paddingHorizontal: 32,       
      paddingVertical: 12,       
      borderRadius: 8,       
      width: '100%',       
      alignItems: 'center',     
    },     
    buttonText: {       
      color: theme.buttonText,       
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
      color: theme.link,
      fontSize: 16,
    },
  });

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
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Forgot password? </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}


