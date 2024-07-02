import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Strong = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');

  useEffect(() => {
    loadWorkoutState();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          saveWorkoutState(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadWorkoutState = async () => {
    try {
      const savedTime = await AsyncStorage.getItem('workoutTime');
      const savedIsRunning = await AsyncStorage.getItem('isTimerRunning');
      if (savedTime !== null) {
        setTime(parseInt(savedTime, 10));
      }
      if (savedIsRunning !== null) {
        setIsTimerRunning(JSON.parse(savedIsRunning));
      }
    } catch (error) {
      console.error('Error loading workout state:', error);
    }
  };

  const saveWorkoutState = async (currentTime) => {
    try {
      await AsyncStorage.setItem('workoutTime', currentTime.toString());
      await AsyncStorage.setItem('isTimerRunning', JSON.stringify(isTimerRunning));
    } catch (error) {
      console.error('Error saving workout state:', error);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const stopWorkout = async () => {
    setIsTimerRunning(false);
    alert(`Good job! You worked out for ${formatTime(time)}`);
    setTime(0);
    await AsyncStorage.removeItem('workoutTime');
    await AsyncStorage.removeItem('isTimerRunning');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const addExercise = () => {
    if (newExercise && sets) {
      const setsArray = Array.from({ length: parseInt(sets) }, () => ({ reps: '', weight: '' }));
      setExercises([...exercises, { name: newExercise, sets: setsArray }]);
      setNewExercise('');
      setSets('');
    }
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Strong Workout</Text>
      
      <TouchableOpacity
        style={[styles.button, isTimerRunning ? styles.yellowButton : styles.greenButton]}
        onPress={toggleTimer}
      >
        <Text style={styles.buttonText}>
          {isTimerRunning ? 'Pause' : 'Start'} Workout
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.timerText}>{formatTime(time)}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Exercise name"
          value={newExercise}
          onChangeText={setNewExercise}
        />
        <TextInput
          style={[styles.input, styles.setsInput]}
          placeholder="Sets"
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={addExercise}
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index: exerciseIndex }) => (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            {item.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setContainer}>
                <Text style={styles.setText}>Set {setIndex + 1}:</Text>
                <TextInput
                  style={styles.setInput}
                  placeholder="Reps"
                  value={set.reps}
                  onChangeText={(reps) => updateSet(exerciseIndex, setIndex, 'reps', reps)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="Weight"
                  value={set.weight}
                  onChangeText={(weight) => updateSet(exerciseIndex, setIndex, 'weight', weight)}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
        )}
      />
      
      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={stopWorkout}
      >
        <Text style={styles.buttonText}>Stop Workout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: '#4CAF50',
  },
  yellowButton: {
    backgroundColor: '#FFC107',
  },
  stopButton: {
    backgroundColor: '#f44336',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  setsInput: {
    flex: 0,
    width: 50,
  },
  exerciseContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  setText: {
    width: 50,
  },
  setInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    width: 50,
    marginLeft: 10,
  },
});

export default Strong;
