import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { TextInput, Button, Surface, Text, Card, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

const defaultTheme = {
  background: '#3b0051',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
  inputBackground: 'white',
  inputText: 'black',
  inputBorder: '#641f1f',
  link: '#3b0051',
};

function LoginContent() {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme = defaultTheme } = useTheme() || {};

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      setError('No internet connection. Please check your network and try again.');
      setIsLoading(false);
      return;
    }

    try {
      let loginEmail = userOrEmail;

      if (!userOrEmail.includes('@')) {
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', userOrEmail)
          .single();

        if (userError) {
          if (userError.code === 'PGRST116') {
            setError('User not found. Please check your username.');
          } else if (userError.message && userError.message.includes('Network request failed')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError('Error fetching user data. Please try again.');
          }
          setIsLoading(false);
          return;
        }
        
        if (!userRecord) {
          setError('User not found. Please check your username.');
          setIsLoading(false);
          return;
        }
        
        loginEmail = userRecord.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        if (error.message && error.message.includes('Network request failed')) {
          setError('Network error during sign-in. Please check your connection and try again.');
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      const userId = data.user.id;

      await SecureStore.setItemAsync('userId', userId);
      router.replace('/home');

      console.log('Login successful');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Unexpected error during login:', error);
    } finally {
      setIsLoading(false);
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
              <Text style={[styles.title, { color: '#3b0051' }]}>Welcome Back</Text>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5087/5087579.png' }}
                style={styles.image}
              />
              <TextInput
                label="Email or Username"
                value={userOrEmail}
                onChangeText={setUserOrEmail}
                style={styles.input}
                theme={{ colors: { primary: '#3b0051' } }}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                theme={{ colors: { primary: '#3b0051' } }}
              />
              <Button 
                mode="contained" 
                onPress={handleLogin} 
                style={styles.button} 
                buttonColor="#3b0051"
                textColor={theme.buttonText}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Link href="/(auth)/signup" asChild>
                <Button 
                  mode="outlined" 
                  style={styles.button} 
                  textColor="#3b0051"
                  buttonColor="transparent"
                >
                  Don't have an account? Sign up
                </Button>
              </Link>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{
          label: 'Close',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

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
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  topPadding: {
    paddingTop: 0,
  },
});

export default function Login() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
}