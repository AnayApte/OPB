import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Appbar, Card, Text, ProgressBar } from 'react-native-paper';
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

function AudioVisualizer({ style }) {
  const [bars] = useState(new Array(20).fill(0).map(() => new Animated.Value(0)));

  useEffect(() => {
    const animations = bars.map(bar => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 1,
            duration: Math.random() * 1000 + 500,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0,
            duration: Math.random() * 1000 + 500,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []);

  return (
    <View style={[styles.audioVisualizerContainer, style]}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.visualizerBar,
            {
              transform: [
                {
                  scaleY: bar.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

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
  const scrollViewRef = useRef();

  useEffect(() => {
    loadStreak();
    return sound ? () => { sound.unloadAsync(); } : undefined;
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
      require('../assets/meditation-sound.mp3'),
      { shouldPlay: true, isLooping: true }
    );
    setSound(sound);
  };

  const startTimer = () => {
    if (!isRunning && minutes === 0 && seconds === 0) {
      const mins = parseInt(inputMinutes) || 0;
      const secs = parseInt(inputSeconds) || 0;
      if (mins === 0 && secs === 0) {
        Alert.alert('Error', 'Please enter a valid time');
        return;
      }
      setMinutes(mins);
      setSeconds(secs);
    }
    setIsInputVisible(false);
    setIsRunning(true);
    playSound();
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (sound) {
      sound.pauseAsync();
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.primary} />
        <Appbar.Content title="Meditation Station" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
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
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Minutes</Text>
                  <TextInput
                    style={styles.input}
                    value={inputMinutes}
                    onChangeText={(text) => {
                      const number = parseInt(text);
                      if (!isNaN(number) && number <= 60) {
                        setInputMinutes(text);
                      } else if (text === "") {
                        setInputMinutes(text);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={theme.secondary + '80'}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Seconds</Text>
                  <TextInput
                    style={styles.input}
                    value={inputSeconds}
                    onChangeText={(text) => {
                      const number = parseInt(text);
                      if (!isNaN(number) && number <= 60) {
                        setInputSeconds(text);
                      } else if (text === "") {
                        setInputSeconds(text);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={theme.secondary + '80'}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={startTimer}>
                <Text style={styles.buttonText}>Start Meditation</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.timer}>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</Text>
              <AudioVisualizer style={styles.audioVisualizer} />
              <ProgressBar
                progress={1 - (minutes * 60 + seconds) / ((parseInt(inputMinutes) || 0) * 60 + (parseInt(inputSeconds) || 0))}
                style={[styles.progressBar, { backgroundColor: 'transparent' }]}
                color={theme.primary}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={isRunning ? stopTimer : startTimer}>
                  <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Resume'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={resetTimer}>
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
    flexGrow: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  inputWrapper: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: theme.secondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(59, 0, 81, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    color: theme.secondary,
    textAlign: 'center',
    width: 80,
  },
  button: {
    backgroundColor: theme.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: theme.secondary,
  },
  audioVisualizerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: 16,
  },
  audioVisualizer: {
    marginBottom: 16,
  },
  visualizerBar: {
    width: 4,
    height: 40,
    backgroundColor: theme.background,
    borderRadius: 2,
  },
  progressBar: {
    height: 10,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default function MeditoWrapper() {
  return (
    <ThemeProvider>
      <Medito />
    </ThemeProvider>
  );
}