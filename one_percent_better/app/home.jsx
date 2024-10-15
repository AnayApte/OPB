// app/home.jsx

import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from './ThemeContext';
import { Appbar, Card, Title, Paragraph, Button, Surface } from 'react-native-paper';

const quotesArray = [
  "'The only limit to our realization of tomorrow is our doubts of today.' - Franklin D. Roosevelt",
  "'Success is not final, failure is not fatal: It is the courage to continue that counts.' - Winston Churchill",
  "'Do not wait to strike till the iron is hot, but make it hot by striking.' - William Butler Yeats",
  "'Perfection is not attainable, but if we chase perfection we can catch excellence. ' - Vince Lombardi",
  "'When you have a dream, you have got to grab it and never let go' - Carol Burnett",
  "'Either you run the day or the day runs you' - Jim Rohn",
  "'I do not like to gamble, but if there is one thing I am willing to bet on it is myself' - Beyonce",
  "'It is not whether you get knocked down, it is whether you get up' - Vince Lombardi",
  "'You miss 100% of the shots you do not take.' - Wayne Gretzky",
  "'It is hard to beat a person who never gives up' - Babe Ruth",
];

export default function Home() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(quotesArray[Math.floor(Math.random() * quotesArray.length)]);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="auto" />
      <Appbar.Header>
        <Appbar.Content title="One Percent Better" />
        <Appbar.Action icon="logout" onPress={handleSignOut} />
      </Appbar.Header>
      <View style={styles.content}>
        <Surface style={styles.surface}>
          <Card>
            <Card.Content>
              <Title>Welcome, {user?.name || 'User'}!</Title>
              <Paragraph>{quote}</Paragraph>
            </Card.Content>
          </Card>
        </Surface>
        <View style={styles.buttonContainer}>
          <Link href="/medito" asChild>
            <Button mode="contained" style={styles.button}>Meditate</Button>
          </Link>
          <Link href="/foodanalyzer" asChild>
            <Button mode="contained" style={styles.button}>Analyze Food</Button>
          </Link>
          <Link href="/strong" asChild>
            <Button mode="contained" style={styles.button}>Workout</Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  surface: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
});