import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Appbar, Button, Card, Text, TextInput, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './ThemeContext';

const theme = {
  background: '#f2e2fb',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function Medito() {
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.safeArea}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} color={theme.primary} />
          <Appbar.Content
            title="Meditation Station"
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Welcome to Meditation</Text>
              <Text style={styles.description}>
                Take a moment to relax and focus on your breath. Set your meditation timer and begin your journey to mindfulness.
              </Text>
              <Image
                source={{ uri: 'https://cdn1.iconfinder.com/data/icons/human-sitting-and-squatting-on-the-floor/167/man-002-512.png' }}
                style={styles.image}
              />
              <Text style={styles.challenge}>Challenge: Meditate for 30 days.</Text>
              <Text style={styles.streak}>Current Streak: {streak} days</Text>
            </Card.Content>
          </Card>

          {isInputVisible ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                label="Minutes"
                value={inputMinutes}
                onChangeText={setInputMinutes}
                keyboardType="numeric"
                mode="outlined"
              />
              <TextInput
                style={styles.input2}
                label="Seconds"
                value={inputSeconds}
                onChangeText={setInputSeconds}
                keyboardType="numeric"
                mode="outlined"
              />
              <Button
                mode="contained"
                onPress={startTimer}
                style={[styles.button, styles.startButton]}
                labelStyle={[styles.buttonText, styles.startButtonText]}
              >
                Start Meditation
              </Button>
            </View>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</Text>
              <ProgressBar
                progress={1 - (minutes * 60 + seconds) / (parseInt(inputMinutes || '0') * 60 + parseInt(inputSeconds || '0'))}
                style={styles.progressBar}
                color={theme.primary}
              />
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={isRunning ? stopTimer : startTimer}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  mode="contained"
                  onPress={resetTimer}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                >
                  Reset
                </Button>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: theme.primary,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: theme.text,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
  challenge: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: theme.text,
  },
  streak: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: theme.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: theme.secondary,
  },
  input2: {
    marginBottom: 15,
    backgroundColor: theme.secondary,
  },
  button: {
    marginBottom: 16,
    backgroundColor: theme.buttonBackground,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'center',
    width: '100%',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    color: theme.buttonText,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.primary,
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
});

export default function MeditoWrapper() {
  return (
    <ThemeProvider>
      <Medito />
    </ThemeProvider>
  );
}