import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { TextInput, Button, Surface, Text, Card } from 'react-native-paper';

const defaultTheme = {
  background: '#3b0051',
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: defaultTheme.background }]}>
      <View style={styles.centerContainer}>
        <ScrollView 
          style={styles.scrollViewContent} 
          contentContainerStyle={[styles.scrollViewContentContainer, styles.topPadding]}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.title, { color: '#3b0051' }]}>Create Your Account</Text>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                outlineColor={theme.inputBorder}
                theme={{ colors: { primary: '#3b0051', text: theme.inputText } }}
              />
              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                mode="outlined"
                outlineColor={theme.inputBorder}
                theme={{ colors: { primary: '#3b0051', text: theme.inputText } }}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                outlineColor={theme.inputBorder}
                theme={{ colors: { primary: '#3b0051', text: theme.inputText } }}
              />
              <Button 
                mode="contained" 
                onPress={handleSignup} 
                style={styles.signupButton}
                buttonColor="#3b0051"
                textColor={theme.buttonText}
              >
                Sign Up
              </Button>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Content>
              <Link href="/(auth)/login" asChild>
                <Button 
                  mode="outlined" 
                  style={styles.button} 
                  textColor="#3b0051"
                  buttonColor="transparent"
                >
                  Already have an account? Sign in
                </Button>
              </Link>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    width: '100%',
    paddingHorizontal: 16,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  signupButton: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
  topPadding: {
    paddingTop: 0,
  },
});

const Signup = () => (
  <ThemeProvider>
    <SignupContent />
  </ThemeProvider>
);

export default Signup;