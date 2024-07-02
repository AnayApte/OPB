import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const Home = () => {
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [sound, setSound] = useState();

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

  const startTimer = () => {
    const totalSeconds = parseInt(inputMinutes) * 60 + parseInt(inputSeconds);
    if (!isNaN(totalSeconds) && totalSeconds > 0) {
      setSeconds(totalSeconds);
      setIsRunning(true);
      setIsInputVisible(false);
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
      {isInputVisible ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter minutes"
            keyboardType="numeric"
            value={inputMinutes}
            onChangeText={(text) => handleInputChange(text, 'minutes')}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter seconds"
            keyboardType="numeric"
            value={inputSeconds}
            onChangeText={(text) => handleInputChange(text, 'seconds')}
          />
          <Button title="Start Timer" onPress={startTimer} />
        </View>
      ) : (
        <View style={styles.timerContainer}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.timer}>
              {minutes}:{remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
            </Text>
          </TouchableOpacity>
          {seconds === 0 && !isRunning ? (
            <Button title="Reset" onPress={handleReset} />
          ) : (
            <View style={styles.buttonContainer}>
              <Button title="Stop" onPress={handleStop} />
              <Button title="Reset" onPress={handleReset} />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: 200,
    marginBottom: 10,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 20,
  },
});

export default Home;
