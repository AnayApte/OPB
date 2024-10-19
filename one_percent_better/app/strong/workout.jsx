import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { formatTime, calculateOneRepMax, formatExerciseName } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import 'react-native-get-random-values';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const formatExerciseNameForDisplay = (name) => {
  return name
    .split(/[_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
    animationType="fade"
  >
    <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: theme.text }]}>{message}</Text>
          <View style={styles.modalButtonContainer}>
            {onCancel && (
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.buttonBackground }]} onPress={onCancel}>
                <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.buttonBackground }]} onPress={onConfirm}>
              <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  </Modal>
);

const ExerciseSelectionModal = ({ visible, onClose, onSelect, theme }) => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (visible) {
      fetchExercises();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

  const fetchExercises = async () => {
    if (!hasMore) return;

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '7884f1a8f6mshf52b668731d14f2p1b246ajsn455799bad1ea',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises?limit=${ITEMS_PER_PAGE}&offset=${page * ITEMS_PER_PAGE}`, options);
      const newData = await response.json();

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        const updatedExercises = [...exercises, ...newData];
        setExercises(updatedExercises);
        setFilteredExercises(updatedExercises);
        setPage(prevPage => prevPage + 1);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exercises');
      setLoading(false);
    }
  };

  const handleExercisePress = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleSelectExercise = () => {
    onSelect(formatExerciseNameForDisplay(selectedExercise.name));
    setSelectedExercise(null);
    onClose();
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.exerciseItem, { borderBottomColor: theme.inputBorder }]}
      onPress={() => handleExercisePress(item)}
    >
      <Text style={[styles.exerciseItemText, { color: theme.text }]}>
        {formatExerciseNameForDisplay(item.name)}
      </Text>
    </TouchableOpacity>
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchExercises();
    }
  };

  const renderExerciseDetails = () => (
    <ScrollView contentContainerStyle={styles.exerciseDetailsContainer}>
      <Text style={[styles.exerciseDetailsTitle, { color: theme.text }]}>
        {formatExerciseNameForDisplay(selectedExercise.name)}
      </Text>
      <View style={styles.exerciseInfoContainer}>
        <Text style={[styles.exerciseInfoText, { color: theme.text }]}>
          Body Part: {formatExerciseNameForDisplay(selectedExercise.bodyPart)}
        </Text>
        <Text style={[styles.exerciseInfoText, { color: theme.text }]}>
          Equipment: {formatExerciseNameForDisplay(selectedExercise.equipment)}
        </Text>
        <Text style={[styles.exerciseInfoText, { color: theme.text }]}>
          Target: {formatExerciseNameForDisplay(selectedExercise.target)}
        </Text>
      </View>
      <Text style={[styles.exerciseDetailsSectionTitle, { color: theme.text }]}>Instructions:</Text>
      {selectedExercise.instructions.map((instruction, index) => (
        <Text key={index} style={[styles.exerciseInstruction, { color: theme.text }]}>
          {index + 1}. {instruction}
        </Text>
      ))}
      <TouchableOpacity
        style={[styles.selectButton, { backgroundColor: theme.buttonBackground }]}
        onPress={handleSelectExercise}
      >
        <Text style={[styles.selectButtonText, { color: theme.buttonText }]}>Select</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.buttonBackground }]}
        onPress={() => setSelectedExercise(null)}
      >
        <Text style={[styles.backButtonText, { color: theme.buttonText }]}>Back to List</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {selectedExercise ? (
            renderExerciseDetails()
          ) : (
            <>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Exercise</Text>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                placeholder="Search exercises..."
                placeholderTextColor={theme.inputBorder}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text === '') {
                    setFilteredExercises(exercises);
                  }
                }}
              />
              {loading && exercises.length === 0 ? (
                <ActivityIndicator size="large" color={theme.buttonBackground} />
              ) : error ? (
                <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
              ) : (
                <FlatList
                  data={filteredExercises}
                  renderItem={renderExerciseItem}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  style={styles.exerciseList}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={() => (
                    loading && exercises.length > 0 ? (
                      <ActivityIndicator size="small" color={theme.buttonBackground} />
                    ) : null
                  )}
                />
              )}
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: theme.buttonBackground }]} 
                onPress={onClose}
              >
                <Text style={[styles.closeButtonText, { color: theme.buttonText }]}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </SafeAreaView>
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
      
            if (prError && prError.code !==   'PGRST116') throw prError;
      
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
          placeholderTextColor={theme.inputBorder}
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
            <Text style={[styles.exerciseName, { color: theme.text }]}>
              {formatExerciseNameForDisplay(item.name)}
            </Text>
            {item.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setContainer}>
                <Text style={[styles.setText, { color: theme.text }]}>Set {setIndex + 1}:</Text>
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                  placeholder="Reps"
                  placeholderTextColor={theme.inputBorder}
                  value={set.reps}
                  onChangeText={(reps) => updateSet(exerciseIndex, setIndex, 'reps', reps)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                  placeholder="Weight"
                  placeholderTextColor={theme.inputBorder}
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
  inputText: {
    fontSize: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  exerciseItemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  exerciseDetailsContainer: {
    padding: 20,
  },
  exerciseDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  exerciseInfoContainer: {
    marginBottom: 20,
  },
  exerciseInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  exerciseDetailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseInstruction: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectButton: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutScreen;
