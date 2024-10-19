import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { formatTime, calculateOneRepMax, formatExerciseName } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Appbar, Button, Card, TextInput, Text, Modal, Portal } from 'react-native-paper';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function WorkoutContent() {
  const router = useRouter();
  const { userId } = useAuth();
  const { theme = defaultTheme } = useTheme();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

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

  const resetWorkout = () => {
    setTime(0);
    setExercises([]);
    setIsTimerRunning(false);
  };

  const showAlert = (title, message, onConfirm, onCancel) => {
    setAlertConfig({ title, message, onConfirm, onCancel });
    setAlertVisible(true);
  };

  const endWorkout = async () => {
    if (!userId) {
      console.error('No user logged in');
      return;
    }

    if (exercises.length === 0) {
      showAlert("No exercises", "You haven't added any exercises to this workout.", () => setAlertVisible(false));
      return;
    }

    showAlert(
      "End Workout",
      "Are you sure you want to end this workout?",
      async () => {
        setAlertVisible(false);
        try {
          showAlert("Saving workout...", "Please wait while we save your workout.", null);
          
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
      
          for (const exercise of exercises) {
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
      
            const { data: workoutExerciseData, error: workoutExerciseError } = await supabase
              .from('workoutExercises')
              .insert({ workoutId: workoutId, exerciseId: exerciseId })
              .select('workoutExerciseId')
              .single();
      
            if (workoutExerciseError) throw workoutExerciseError;
            const workoutExerciseId = workoutExerciseData.workoutExerciseId;
      
            let bestSetId = null;
            let bestOneRepMax = 0;
      
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
      
            const { data: existingPR, error: prError } = await supabase
              .from('personalRecords')
              .select('*')
              .eq('userId', userId)
              .eq('exerciseId', exerciseId)
              .eq('isCurrent', true)
              .single();
      
            if (prError && prError.code !== 'PGRST116') throw prError;
      
            if (!existingPR || bestOneRepMax > existingPR.oneRepMax) {
              const { error: updatePreviousError } = await supabase
                .from('personalRecords')
                .update({ isCurrent: false })
                .eq('userId', userId)
                .eq('exerciseId', exerciseId);
      
              if (updatePreviousError) throw updatePreviousError;
      
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
      
          showAlert("Success", "Workout saved successfully", () => {
            setAlertVisible(false);
            resetWorkout();
            router.push('/strong');
          });
        } catch (error) {
          console.error('Error saving workout:', error);
          showAlert("Error", "Failed to save workout. Please try again.", () => setAlertVisible(false));
        }
      },
      () => setAlertVisible(false)
    );
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Workout" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.timerText, { color: theme.primary }]}>{formatTime(time)}</Text>
            <Button 
              mode="contained" 
              onPress={toggleTimer}
              style={styles.button} 
              buttonColor={theme.buttonBackground}
            >
              {isTimerRunning ? 'Pause' : 'Start'} Workout
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Exercise"
              value={newExercise}
              onChangeText={setNewExercise}
              style={styles.input}
            />
            <TextInput
              label="Sets"
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button 
              mode="contained" 
              onPress={addExercise}
              style={styles.button} 
              buttonColor={theme.buttonBackground}
            >
              Add Exercise
            </Button>
          </Card.Content>
        </Card>

        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index: exerciseIndex }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={[styles.exerciseName, { color: theme.primary }]}>{item.name}</Text>
                {item.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setContainer}>
                    <Text style={[styles.setText, { color: theme.text }]}>Set {setIndex + 1}:</Text>
                    <TextInput
                      label="Reps"
                      value={set.reps}
                      onChangeText={(reps) => updateSet(exerciseIndex, setIndex, 'reps', reps)}
                      keyboardType="numeric"
                      style={styles.setInput}
                    />
                    <TextInput
                      label="Weight"
                      value={set.weight}
                      onChangeText={(weight) => updateSet(exerciseIndex, setIndex, 'weight', weight)}
                      keyboardType="numeric"
                      style={styles.setInput}
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        />

        <Button 
          mode="contained" 
          onPress={endWorkout}
          style={[styles.button, styles.endWorkoutButton]} 
          buttonColor={theme.buttonBackground}
        >
          End Workout
        </Button>
      </ScrollView>

      <Portal>
        <Modal visible={alertVisible} onDismiss={() => setAlertVisible(false)}>
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>{alertConfig.title}</Text>
              <Text>{alertConfig.message}</Text>
              <Button onPress={() => {
                alertConfig.onConfirm();
                setAlertVisible(false);
              }}>OK</Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
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
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setText: {
    width: 50,
  },
  setInput: {
    flex: 1,
    marginLeft: 8,
  },
  endWorkoutButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default function Workout() {
  return (
    <ThemeProvider>
      <WorkoutContent />
    </ThemeProvider>
  );
}