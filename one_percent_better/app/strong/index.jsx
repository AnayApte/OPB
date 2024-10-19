import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import BackButton from '../../utils/BackButton';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function StrongHomeContent() {
  const router = useRouter();
  const { theme = defaultTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Appbar.Header>
      <BackButton destination="/home"/>
        <Appbar.Content title="Strong" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: theme.primary }]}>Welcome to Strong</Text>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png' }}
              style={styles.image}
            />
            <Text style={[styles.description, { color: theme.text }]}>Track your workouts and progress</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              mode="contained" 
              onPress={() => router.push('/strong/workout')} 
              style={styles.button} 
              buttonColor={theme.buttonBackground}
            >
              Start New Workout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
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
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default function StrongHome() {
  return (
    <ThemeProvider>
      <StrongHomeContent />
    </ThemeProvider>
  );
}