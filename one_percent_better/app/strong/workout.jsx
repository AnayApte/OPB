import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { formatTime, calculateOneRepMax, formatExerciseName } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import 'react-native-get-random-values';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { ScrollView } from 'react-native-gesture-handler';

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#4CAF50',
  buttonText: '#FFFFFF',
  inputBackground: '#F0F0F0',
  inputText: '#000000',
  inputBorder: '#CCCCCC',
  modalBackground: '#333333',
  modalText: '#FFFFFF',
};

const CustomAlert = ({ visible, title, message, onConfirm, onCancel, theme }) => (
  <Modal
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}
  >
    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
        <Text style={[styles.modalTitle, { color: theme.modalText }]}>{title}</Text>
        <Text style={[styles.modalMessage, { color: theme.modalText }]}>{message}</Text>
        <View style={styles.modalButtonContainer}>
          {onCancel && (
            <TouchableOpacity style={[styles.modalButton, { borderColor: theme.buttonText }]} onPress={onCancel}>
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.modalButton, { borderColor: theme.buttonText }]} onPress={onConfirm}>
            <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const ExerciseSelectionModal = ({ visible, onClose, onSelect, theme }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '7884f1a8f6mshf52b668731d14f2p1b246ajsn455799bad1ea', // Replace with your actual RapidAPI key
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch('https://exercisedb.p.rapidapi.com/exercises', options);
      const data = await response.json();
      setExercises(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exercises');
      setLoading(false);
    }
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => onSelect(item.name.toUpperCase())}
    >
      <Text style={[styles.exerciseItemText, { color: theme.text }]}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
        <Text style={[styles.modalTitle, { color: theme.modalText }]}>Select Exercise</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.buttonBackground} />
        ) : error ? (
          <Text style={[styles.errorText, { color: theme.modalText }]}>{error}</Text>
        ) : (
          <FlatList
            data={exercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.buttonBackground }]} onPress={onClose}>
          <Text style={[styles.closeButtonText, { color: theme.buttonText }]}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const WorkoutScreen = () => {
  const router = useRouter();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');
  const { userId } = useAuth();
  const { theme = defaultTheme } = useTheme() || {};
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

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

  const selectExercise = (exerciseName) => {
    setNewExercise(exerciseName);
    setExerciseModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton destination="/home"/>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isTimerRunning ? theme.background : theme.buttonBackground, borderColor: theme.buttonText, borderWidth: 2 }]}
        onPress={toggleTimer}
      >
        <Text style={[styles.buttonText, { color: isTimerRunning ? theme.primary : theme.buttonText }]}>
          {isTimerRunning ? 'Pause' : 'Start'} Workout
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.timerText, { color: theme.text }]}>{formatTime(time)}</Text>
      
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
          onPress={() => setExerciseModalVisible(true)}
        >
          <Text style={[styles.inputText, { color: newExercise ? theme.inputText : theme.inputBorder }]}>
            {newExercise || 'Select Exercise'}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, styles.setsInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
          placeholder="Sets"
          placeholderTextColor={theme.inputText}
          value={sets}
          onChangeText={setSets}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, styles.addButton, { backgroundColor: theme.buttonBackground, borderColor: theme.buttonText, borderWidth: 2 }]}
          onPress={addExercise}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={exercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index: exerciseIndex }) => (
          <View style={[styles.exerciseContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.exerciseName, { color: theme.text }]}>{item.name}</Text>
            {item.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setContainer}>
                <Text style={[styles.setText, { color: theme.text }]}>Set {setIndex + 1}:</Text>
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                  placeholder="Reps"
                  placeholderTextColor={theme.inputText}
                  value={set.reps}
                  onChangeText={(reps) => updateSet(exerciseIndex, setIndex, 'reps', 

 reps)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                  placeholder="Weight"
                  placeholderTextColor={theme.inputText}
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
        style={[styles.button, styles.stopButton, { backgroundColor: theme.buttonBackground, borderColor: theme.buttonText, borderWidth: 2 }]}
        onPress={endWorkout}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>End Workout</Text>
      </TouchableOpacity>

      <ExerciseSelectionModal
        visible={exerciseModalVisible}
        onClose={() => setExerciseModalVisible(false)}
        onSelect={selectExercise}
        theme={theme}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  stopButton: {
    marginTop: 20,
  },
  addButton: {
    paddingHorizontal: 20,
  },
  buttonText: {
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
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  setsInput: {
    flex: 0,
    width: 50,
  },
  exerciseContainer: {
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
    borderRadius: 5,
    padding: 5,
    width: 50,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exerciseItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  exerciseItemText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkoutScreen;
