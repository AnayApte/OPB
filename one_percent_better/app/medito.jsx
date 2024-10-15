// app/medito.jsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, TextInput, Button, Surface, Text, ProgressBar, Card } from 'react-native-paper';

export default function Medito() {
  const { theme } = useTheme();
  const router = useRouter();
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sound, setSound] = useState();

  useEffect(() => {
    loadStreak();
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadStreak = async () => {
    try {
      const value = await AsyncStorage.getItem('@meditation_streak');
      if (value !== null) {
        setStreak(parseInt(value));
      }
    } catch (e) {
      console.error('Failed to load the streak.', e);
    }
  };

  const updateStreak = async () => {
    try {
      const newStreak = streak + 1;
      await AsyncStorage.setItem('@meditation_streak', newStreak.toString());
      setStreak(newStreak);
    } catch (e) {
      console.error('Failed to save the streak.', e);
    }
  };

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/meditation-sound.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  const handleInputChange = (text, type) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (type === 'minutes') {
      setInputMinutes(numericValue);
    } else {
      setInputSeconds(numericValue);
    }
  };

  const startTimer = () => {
    const totalSeconds = parseInt(inputMinutes) * 60 + parseInt(inputSeconds);
    if (totalSeconds > 0) {
      setMinutes(Math.floor(totalSeconds / 60));
      setSeconds(totalSeconds % 60);
      setIsInputVisible(false);
      setIsRunning(true);
      playSound();
    }
  };

  const handleReset = () => {
    setIsInputVisible(true);
    setIsRunning(false);
    setInputMinutes('');
    setInputSeconds('');
    if (sound) {
      sound.stopAsync();
    }
  };

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          setIsRunning(false);
          updateStreak();
          if (sound) {
            sound.stopAsync();
          }
        }
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  return (
    <ThemeProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Meditation" />
        </Appbar.Header>
        <Surface style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.challenge, { color: theme.text }]}>Challenge: Meditate for 30 days.</Text>
              <Text style={[styles.title, { color: theme.primary }]}>Medito</Text>
              <Image
                source={{ uri: 'https://cdn1.iconfinder.com/data/icons/human-sitting-and-squatting-on-the-floor/167/man-002-512.png' }}
                style={styles.image}
              />
              <Text style={[styles.streak, { color: theme.text }]}>Current Streak: {streak} days</Text>
            </Card.Content>
          </Card>
          
          {isInputVisible ? (
            <View style={styles.inputContainer}>
              <TextInput
                label="Minutes"
                value={inputMinutes}
                onChangeText={(text) => handleInputChange(text, 'minutes')}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Seconds"
                value={inputSeconds}
                onChangeText={(text) => handleInputChange(text, 'seconds')}
                keyboardType="numeric"
                style={styles.input}
              />
              <Button mode="contained" onPress={startTimer} style={styles.button}>
                Start Timer
              </Button>
            </View>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={[styles.timer, { color: theme.primary }]} onPress={handleReset}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </Text>
              {seconds === 0 && !isRunning && (
                <Button mode="contained" onPress={handleReset} style={styles.button}>
                  Reset
                </Button>
              )}
            </View>
          )}
        </Surface>
      </KeyboardAvoidingView>
    </ThemeProvider>
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
  card: {
    marginBottom: 16,
  },
  challenge: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
  streak: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});