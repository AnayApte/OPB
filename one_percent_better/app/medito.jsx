import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [sound, setSound] = useState();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadStreak();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      playSound();
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/alarm.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const loadStreak = async () => {
    try {
      const storedStreak = await AsyncStorage.getItem('streak');
      const lastUsed = await AsyncStorage.getItem('lastUsed');
      const currentTime = new Date().getTime();

      if (storedStreak !== null && lastUsed !== null) {
        const lastUsedTime = parseInt(lastUsed);
        const timeDiff = (currentTime - lastUsedTime) / (1000 * 60 * 60 * 24); // Convert time difference to days

        console.log('storedStreak:', storedStreak);
        console.log('lastUsed:', new Date(lastUsedTime).toISOString());
        console.log('timeDiff:', timeDiff);

        if (timeDiff < 1) {
          setStreak(parseInt(storedStreak));
        } else if (timeDiff < 2) {
          setStreak(parseInt(storedStreak) + 1);
        } else {
          setStreak(1); // Reset streak to 1
        }
      } else {
        setStreak(1); // Initialize streak to 1
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStreak = async () => {
    try {
      const currentTime = new Date().getTime();
      const lastUsed = await AsyncStorage.getItem('lastUsed');

      if (lastUsed) {
        const lastUsedTime = parseInt(lastUsed);
        const timeDiff = (currentTime - lastUsedTime) / (1000 * 60 * 60 * 24); // Convert time difference to days

        if (timeDiff >= 1 && timeDiff < 2) {
          setStreak(prevStreak => {
            const newStreak = prevStreak + 1;
            AsyncStorage.setItem('streak', newStreak.toString());
            AsyncStorage.setItem('lastUsed', currentTime.toString());
            console.log('Updated streak to:', newStreak);
            return newStreak;
          });
        } else if (timeDiff >= 2) {
          setStreak(1);
          AsyncStorage.setItem('streak', '1');
          AsyncStorage.setItem('lastUsed', currentTime.toString());
          console.log('Streak reset to 1 due to timeDiff:', timeDiff);
        } else {
          AsyncStorage.setItem('lastUsed', currentTime.toString());
        }
      } else {
        setStreak(1);
        AsyncStorage.setItem('streak', '1');
        AsyncStorage.setItem('lastUsed', currentTime.toString());
        console.log('Initialized streak to 1');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startTimer = () => {
    const totalSeconds = parseInt(inputMinutes) * 60 + parseInt(inputSeconds);
    if (!isNaN(totalSeconds) && totalSeconds > 0) {
      setSeconds(totalSeconds);
      setIsRunning(true);
      setIsInputVisible(false);
      updateStreak();
    }
  };

  const handleInputChange = (text, type) => {
    if (type === 'minutes') {
      setInputMinutes(text);
    } else {
      setInputSeconds(text);
    }
  };

  const handleReset = () => {
    if (sound) {
      sound.stopAsync();
    }
    setIsRunning(false);
    setSeconds(0);
    setInputMinutes('');
    setInputSeconds('');
    setIsInputVisible(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medito</Text>
      <Image
        source={{ uri: 'https://cdn1.iconfinder.com/data/icons/human-sitting-and-squatting-on-the-floor/167/man-002-512.png' }}
        style={styles.image}
      />
      
      {isInputVisible ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter minutes"
            keyboardType="numeric"
            value={inputMinutes}
            onChangeText={(text) => handleInputChange(text, 'minutes')}
            placeholderTextColor="yellow"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter seconds"
            keyboardType="numeric"
            value={inputSeconds}
            onChangeText={(text) => handleInputChange(text, 'seconds')}
            placeholderTextColor="yellow"
          />
          <TouchableOpacity onPress={startTimer} style={styles.button}>
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.timerContainer}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.timer}>
              {minutes}:{remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
            </Text>
          </TouchableOpacity>
          {seconds === 0 && !isRunning ? (
            <TouchableOpacity onPress={handleReset} style={styles.button}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleStop} style={styles.button}>
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReset} style={styles.button}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <Text style={styles.streak}>Streak: {streak} days 🔥</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'purple',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'yellow',
  },
  inputContainer: {
    marginTop: 20,
    alignItems: 'center',
    color: 'yellow',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: 200,
    marginBottom: 10,
    textAlign: 'center',
    color: 'yellow',
    borderRadius: 10,
  },
  timerContainer: {
    alignItems: 'center',
    color: 'yellow',
  },
  timer: {
    fontSize: 48,
    marginTop: 20,
    color: 'yellow',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 20,
  },
  streak: {
    fontSize: 18,
    marginTop: 40,
    color: 'yellow',
    fontWeight: 'bold'
  },
  button: {
    borderRadius: 20,
    backgroundColor: 'yellow',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'purple',
    fontWeight: 'bold',
  },
});



export default Home;
