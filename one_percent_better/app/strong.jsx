import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, TextInput, FlatList, AppState } from 'react-native';
import { styled } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledTouchableOpacity = styled(TouchableOpacity)
const StyledTextInput = styled(TextInput)

const Strong = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');

  useEffect(() => {
    loadWorkoutState();
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateSubscription.remove();
    };
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

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      loadWorkoutState();
    }
  };

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
    <StyledView className="flex-1 p-5 bg-gray-100">
      <StyledText className="text-2xl font-bold mb-5">Strong Workout</StyledText>
      
      <StyledTouchableOpacity
        className={`p-3 rounded-md items-center mb-3 ${isTimerRunning ? 'bg-yellow-500' : 'bg-green-500'}`}
        onPress={toggleTimer}
      >
        <StyledText className="text-white font-bold">
          {isTimerRunning ? 'Pause' : 'Start'} Workout
        </StyledText>
      </StyledTouchableOpacity>
      
      <StyledText className="text-2xl font-bold text-center mb-5">{formatTime(time)}</StyledText>
      
      <StyledView className="flex-row mb-5">
        <StyledTextInput
          className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
          placeholder="Exercise name"
          value={newExercise}
          onChangeText={setNewExercise}
        />
        <StyledTextInput
          className="w-20 border border-gray-300 rounded-md p-2 mr-2"
          placeholder="Sets"
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
        />
        <StyledTouchableOpacity
          className="bg-blue-500 p-3 rounded-md justify-center"
          onPress={addExercise}
        >
          <StyledText className="text-white font-bold">Add</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
      
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index: exerciseIndex }) => (
          <StyledView className="bg-white p-3 rounded-md mb-3">
            <StyledText className="text-lg font-bold mb-2">{item.name}</StyledText>
            {item.sets.map((set, setIndex) => (
              <StyledView key={setIndex} className="flex-row items-center mb-2">
                <StyledText className="w-16">Set {setIndex + 1}:</StyledText>
                <StyledTextInput
                  className="border border-gray-300 rounded-md p-1 w-16 mr-2"
                  placeholder="Reps"
                  value={set.reps}
                  onChangeText={(reps) => updateSet(exerciseIndex, setIndex, 'reps', reps)}
                  keyboardType="numeric"
                />
                <StyledTextInput
                  className="border border-gray-300 rounded-md p-1 w-16"
                  placeholder="Weight"
                  value={set.weight}
                  onChangeText={(weight) => updateSet(exerciseIndex, setIndex, 'weight', weight)}
                  keyboardType="numeric"
                />
              </StyledView>
            ))}
          </StyledView>
        )}
      />
      
      <StyledTouchableOpacity
        className="bg-red-500 p-3 rounded-md items-center mt-5"
        onPress={stopWorkout}
      >
        <StyledText className="text-white font-bold">Stop Workout</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};

export default Strong;
