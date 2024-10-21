import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, TextInput, Button, Surface, Text, Card, IconButton, ProgressBar } from 'react-native-paper';

function Medito() {
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

  const startTimer = () => {
    if (inputMinutes.trim() === '' && inputSeconds.trim() === '') return;
    
    const totalSeconds = parseInt(inputMinutes || '0') * 60 + parseInt(inputSeconds || '0');
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
    setIsInputVisible(false);
    setIsRunning(true);
    playSound();
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (sound) {
      sound.stopAsync();
    }
  };

  const resetTimer = () => {
    stopTimer();
    setIsInputVisible(true);
    setInputMinutes('');
    setInputSeconds('');
    setMinutes(0);
    setSeconds(0);
  };

  useEffect(() => {
    let interval;
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
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  return (
<View style={[styles.container, { backgroundColor: theme.background }]}>
        <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Medito" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.challenge, { color: theme.text }]}>Challenge: Meditate for 30 days.</Text>
            <Text style={[styles.title, { color: '#3b0051' }]}>Medito</Text>
            <Image
              source={{ uri: 'https://cdn1.iconfinder.com/data/icons/human-sitting-and-squatting-on-the-floor/167/man-002-512.png' }}
              style={styles.image}
            />
            <Text style={[styles.streak, { color: theme.text }]}>Current Streak: {streak} days</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            {isInputVisible ? (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Minutes"
                  value={inputMinutes}
                  onChangeText={setInputMinutes}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Seconds"
                  value={inputSeconds}
                  onChangeText={setInputSeconds}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Button mode="contained" buttonColor="#3b0051" onPress={startTimer} style={styles.button}>
                  Start Meditation
                </Button>
              </View>
            ) : (
              <View style={styles.timerContainer}>
                <Text style={[styles.timer, { color: '#3b0051' }]}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
                <ProgressBar
                  progress={1 - (minutes * 60 + seconds) / (parseInt(inputMinutes || '0') * 60 + parseInt(inputSeconds || '0'))}
                  color="#3b0051"
                  style={styles.progressBar}
                />
                <View style={styles.buttonContainer}>
                  <Button mode="contained" buttonColor="#3b0051" onPress={isRunning ? stopTimer : startTimer} style={styles.button}>
                    {isRunning ? 'Pause' : 'Resume'}
                  </Button>
                  <Button mode="outlined" buttonColor="#3b0051" onPress={resetTimer} style={styles.button}>
                    Reset
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
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
  challenge: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: '#3b0051',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
    color: '#3b0051'
  },
  progressBar: {
    height: 10,
    width: '100%',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
});

export default function MeditoWrapper() {
  return (
    <ThemeProvider>
      <Medito />
    </ThemeProvider>
  );
}