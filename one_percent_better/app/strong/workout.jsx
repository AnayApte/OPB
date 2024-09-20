import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { formatTime, calculateOneRepMax, formatExerciseName } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import 'react-native-get-random-values';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkoutScreen = () => {
  const router = useRouter();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');
  const { userId } = useAuth();

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
    if (!userId) {
      console.error('No user logged in');
      return;
    }
  
    try {
      // Insert workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          userId: userId,
          date: new Date().toISOString(),
          duration: time,
        })
        .select('workoutId')
        .single();
  
      if (workoutError) throw workoutError;
      const workoutId = workoutData.workoutId;
  
      // Process each exercise
      for (const exercise of exercises) {
        // Check if exercise exists, if not, create it
        let { data: existingExercise, error: exerciseError } = await supabase
          .from('exercises')
          .select('exerciseId')
          .eq('name', exercise.name)
          .single();
  
        if (exerciseError && exerciseError.code !== 'PGRST116') {
          throw exerciseError;
        }
  
        let exerciseId;
        if (!existingExercise) {
          const { data: newExercise, error: newExerciseError } = await supabase
            .from('exercises')
            .insert({ name: exercise.name })
            .select('exerciseId')
            .single();
          
          if (newExerciseError) throw newExerciseError;
          exerciseId = newExercise.exerciseId;
        } else {
          exerciseId = existingExercise.exerciseId;
        }
  
        // Insert workout exercise
        const { data: workoutExerciseData, error: workoutExerciseError } = await supabase
          .from('workoutExercises')
          .insert({ workoutId: workoutId, exerciseId: exerciseId })
          .select('workoutExerciseId')
          .single();
  
        if (workoutExerciseError) throw workoutExerciseError;
        const workoutExerciseId = workoutExerciseData.workoutExerciseId;
  
        let bestSetId = null;
        let bestOneRepMax = 0;
  
        // Process each set
        for (let i = 0; i < exercise.sets.length; i++) {
          const set = exercise.sets[i];
          const oneRepMax = calculateOneRepMax(parseFloat(set.weight), parseInt(set.reps));
  
          const { data: setData, error: setError } = await supabase
            .from('sets')
            .insert({
              workoutExerciseId: workoutExerciseId,
              setNumber: i + 1,
              reps: parseInt(set.reps),
              weight: parseFloat(set.weight),
            })
            .select('setId')
            .single();
  
          if (setError) throw setError;
  
          if (oneRepMax > bestOneRepMax) {
            bestOneRepMax = oneRepMax;
            bestSetId = setData.setId;
          }
        }
  
        // Check and update PR
        const { data: existingPR, error: prError } = await supabase
          .from('personalRecords')
          .select('*')
          .eq('userId', userId)
          .eq('exerciseId', exerciseId)
          .eq('isCurrent', true)
          .single();
  
        if (prError && prError.code !== 'PGRST116') throw prError;
  
        if (!existingPR || bestOneRepMax > existingPR.oneRepMax) {
          // Set all previous records for this exercise to not current
          const { error: updatePreviousError } = await supabase
            .from('personalRecords')
            .update({ isCurrent: false })
            .eq('userId', userId)
            .eq('exerciseId', exerciseId);
  
          if (updatePreviousError) throw updatePreviousError;
  
          // Insert new record
          const { error: insertError } = await supabase
            .from('personalRecords')
            .insert({
              userId: userId,
              exerciseId: exerciseId,
              setId: bestSetId,
              oneRepMax: bestOneRepMax,
              date: new Date().toISOString(),
              isCurrent: true
            });
          if (insertError) throw insertError;
        }
      }
  
      console.log('Workout saved successfully');
      router.push('/strong');
    } catch (error) {
      console.error('Error saving workout:', error);
    }
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
    <SafeAreaView style={styles.container}>
      <BackButton destination="/home"/>
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
    </SafeAreaView>
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
