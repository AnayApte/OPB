import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { formatTime, calculateOneRepMax, formatExerciseName } from '../../utils/helpers';

const WorkoutScreen = () => {
  const router = useRouter();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const endWorkout = async () => {
    // Save workout data to Supabase
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: 'user_id_here', // Replace with actual user ID
        date: new Date().toISOString(),
        duration: time,
        exercises: exercises,
      });

    if (error) console.error('Error saving workout:', error);
    else {
      // Update PRs
      exercises.forEach(async (exercise) => {
        const maxSet = exercise.sets.reduce((max, set) => {
          const oneRepMax = calculateOneRepMax(set.weight, set.reps);
          return oneRepMax > max ? oneRepMax : max;
        }, 0);

        const { data: prData, error: prError } = await supabase
          .from('personal_records')
          .upsert({
            user_id: 'user_id_here', // Replace with actual user ID
            exercise_id: exercise.id,
            one_rep_max: maxSet,
            date: new Date().toISOString(),
          }, {
            onConflict: 'user_id, exercise_id',
          });

        if (prError) console.error('Error updating PR:', prError);
      });
    }

    router.push('/strong');
  };

  const addExercise = () => {
    if (newExercise && sets) {
      const formattedName = formatExerciseName(newExercise);
      const setsArray = Array.from({ length: parseInt(sets) }, () => ({ reps: '', weight: '' }));
      setExercises([...exercises, { name: formattedName, sets: setsArray }]);
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
    <View style={styles.container}>
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
        onPress={endWorkout}
      >
        <Text style={styles.buttonText}>End Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: 15,
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

export default WorkoutScreen;
