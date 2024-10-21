import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Image, TouchableWithoutFeedback, Keyboard, Pressable, Alert } from 'react-native';
import { Appbar, Card, Text, TextInput, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './ThemeContext';

const theme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
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
    if (inputMinutes.trim() === '' && inputSeconds.trim() === '') {
      Alert.alert('Error', 'Please enter a time');
      return;
    }
  
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

  const CustomButton = ({ onPress, title, style }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );

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
                theme={{ colors: { text: theme.background, placeholder: theme.background, primary: theme.background } }}
              />
              <TextInput
                style={styles.input}
                label="Seconds"
                value={inputSeconds}
                onChangeText={setInputSeconds}
                keyboardType="numeric"
                mode="outlined"
                theme={{ colors: { text: theme.background, placeholder: theme.background, primary: theme.background } }}
              />
              <CustomButton onPress={startTimer} title="Start Meditation" />
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
                <CustomButton
                  onPress={isRunning ? stopTimer : startTimer}
                  title={isRunning ? 'Pause' : 'Resume'}
                  style={styles.timerButton}
                />
                <CustomButton
                  onPress={resetTimer}
                  title="Reset"
                  style={styles.timerButton}
                />
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
    backgroundColor: theme.buttonBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: theme.secondary,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: theme.secondary,
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
    color: theme.secondary,
  },
  streak: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: theme.secondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: theme.buttonBackground,
  },
  button: {
    marginTop: 16,
    backgroundColor: theme.buttonBackground,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: 'bold',
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
  timerButton: {
    marginHorizontal: 8,
    minWidth: 100,
  },
});

export default function MeditoWrapper() {
  return (
    <ThemeProvider>
      <Medito />
    </ThemeProvider>
  );
}