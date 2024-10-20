import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '../ThemeContext';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#8B4513',  // Changed to brown
  buttonText: '#f2f5ea',
  inputBackground: 'white',
  inputText: 'black',
  inputBorder: '#641f1f',
  link: '#1e90ff',
};

const LoginContent = () => {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { theme = defaultTheme } = useTheme() || {};

  const handleLogin = async () => {
    try {
      let loginEmail = userOrEmail;

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        console.error('Error during login:', error.message);
        return;
      }

      const userId = data.user.id;

      await SecureStore.setItemAsync('userId', userId);
      router.replace('/home');

      console.log('Login successful');
    } catch (error) {
      console.error('Unexpected error during login:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Login</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
          placeholder="Email or Username"
          placeholderTextColor={theme.text}
          value={userOrEmail}
          onChangeText={setUserOrEmail}
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
          placeholder="Password"
          placeholderTextColor={theme.text}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={[styles.loginButton, { backgroundColor: '#641f1f' }]} onPress={handleLogin}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Login</Text>
        </TouchableOpacity>
        <View style={styles.signUp}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.link }]}>Don't have an account? Sign up instead</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View style={styles.forgotPassword}>
          <Link href="/(auth)/forgotPassword" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.link }]}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Login = () => (
  <ThemeProvider>
    <LoginContent />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'brown',
  },
  buttonText: {
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
    fontSize: 16,
  },
});

export default Login;