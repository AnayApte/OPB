import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Appbar, TextInput, Button, Card, Text } from 'react-native-paper';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#641f1f',
  buttonText: '#f2f5ea',
  inputBackground: 'white',
  inputText: 'black',
  inputBorder: '#641f1f',
  link: '#1e90ff',
};

const SignupContent = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { theme = defaultTheme } = useTheme() || {};

  const handleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error during signup:', error.message);
        return;
      }

      const userId = data.user.id;

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([{ userId: userId, email: email, username: username }]);

      if (userError) {
        console.error('Error inserting user into custom table:', userError.message);
        return;
      }

      await SecureStore.setItemAsync('userId', userId);
      router.replace('/profile');
      
      console.log('Signup and user creation successful');
    } catch (error) {
      console.error('Unexpected error during signup:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.secondary }}>
        <Appbar.Content title="Sign Up" titleStyle={{ color: theme.buttonText }} />
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: theme.text }]}>Create Your Account</Text>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.inputBorder}
              theme={{ colors: { primary: theme.primary, text: theme.inputText } }}
            />
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              mode="outlined"
              outlineColor={theme.inputBorder}
              theme={{ colors: { primary: theme.primary, text: theme.inputText } }}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              outlineColor={theme.inputBorder}
              theme={{ colors: { primary: theme.primary, text: theme.inputText } }}
            />
            <Button 
              mode="contained" 
              onPress={handleSignup} 
              style={styles.signupButton}
              buttonColor={theme.buttonBackground}
              textColor={theme.buttonText}
            >
              Sign Up
            </Button>
          </Card.Content>
        </Card>
        <View style={styles.bottomLink}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.link }]}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Signup = () => (
  <ThemeProvider>
    <SignupContent />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  bottomLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
  },
});

export default Signup; 