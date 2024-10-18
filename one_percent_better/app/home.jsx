import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from './ThemeContext';
import { Appbar, Card, Title, Paragraph, Button, Surface, Text } from 'react-native-paper';

const quotes = [
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
  const { signOut } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#4a0e4e' }]}>
      <StatusBar style="light" />
      <Appbar.Header style={{ backgroundColor: '#7b1fa2' }}>
        <Appbar.Content title="Home" titleStyle={{ color: '#ffffff' }} />
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: '#9c27b0' }]}>
          <Card.Content>
            <Title style={{ color: '#ffffff' }}>Welcome to the App!</Title>
            <Paragraph style={{ color: '#f3e5f5' }}>This is your home screen.</Paragraph>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: '#7b1fa2' }]}>
          <Card.Content>
            <Title style={{ color: '#ffffff' }}>Quote of the Day</Title>
            <Paragraph style={{ color: '#e1bee7', fontStyle: 'italic' }}>{quote}</Paragraph>
          </Card.Content>
        </Card>
        <Surface style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push('/profile')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Go to Profile
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push('/medito')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Medito
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push('/todolist0')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Todo List
          </Button>
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Sign Out
          </Button>
        </Surface>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#6a1b9a',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});