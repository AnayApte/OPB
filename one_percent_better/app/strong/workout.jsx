import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, StyleSheet, Modal, ActivityIndicator, ScrollView, AppState, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax, formatExerciseName, formatExerciseNameForDisplay } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { Appbar, Card, Title, Paragraph, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
};

const CustomAlert = ({ visible, title, message, onConfirm, onCancel, theme }) => (
  <Modal
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}
    animationType="fade"
  >
    <View style={[styles.modalOverlay, { backgroundColor: defaultTheme.background }]}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: defaultTheme.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: defaultTheme.text }]}>{message}</Text>
          <View style={styles.modalButtonContainer}>
            {onCancel && (
              <Button mode="contained" onPress={onCancel} style={styles.modalButton}>
                Cancel
              </Button>
            )}
            <Button mode="contained" onPress={onConfirm} style={styles.modalButton}>
              OK
            </Button>
          </View>
        </View>
      </View>
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
      style={[styles.exerciseItem, { borderBottomColor: defaultTheme.text }]}
      onPress={() => handleExercisePress(item)}
    >
      <Text style={[styles.exerciseItemText, { color: defaultTheme.text }]}>
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
      <Title style={[styles.exerciseDetailsTitle, { color: defaultTheme.text }]}>
        {formatExerciseNameForDisplay(selectedExercise.name)}
      </Title>
      <View style={styles.exerciseInfoContainer}>
        <Paragraph style={[styles.exerciseInfoText, { color: defaultTheme.text }]}>
          Body Part: {formatExerciseNameForDisplay(selectedExercise.bodyPart)}
        </Paragraph>
        <Paragraph style={[styles.exerciseInfoText, { color: defaultTheme.text }]}>
          Equipment: {formatExerciseNameForDisplay(selectedExercise.equipment)}
        </Paragraph>
        <Paragraph style={[styles.exerciseInfoText, { color: defaultTheme.text }]}>
          Target: {formatExerciseNameForDisplay(selectedExercise.target)}
        </Paragraph>
      </View>
      <Title style={[styles.exerciseDetailsSectionTitle, { color: defaultTheme.text }]}>Instructions:</Title>
      {selectedExercise.instructions.map((instruction, index) => (
        <Paragraph key={index} style={[styles.exerciseInstruction, { color: defaultTheme.text }]}>
          {index + 1}. {instruction}
        </Paragraph>
      ))}
      <Button mode="contained" onPress={handleSelectExercise} style={styles.selectButton}>
        Select
      </Button>
      <Button mode="outlined" onPress={() => setSelectedExercise(null)} style={styles.backButton}>
        Back to List
      </Button>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: defaultTheme.background }]}>
        <View style={[styles.modalContainer, { backgroundColor: defaultTheme.background }]}>
          {selectedExercise ? (
            renderExerciseDetails()
          ) : (
            <>
              <Title style={[styles.modalTitle, { color: defaultTheme.text }]}>Select Exercise</Title>
              <TextInput
                style={[styles.searchInput, { backgroundColor: defaultTheme.inputBackground, color: defaultTheme.text, borderColor: defaultTheme.text }]}
                placeholder="Search exercises..."
                placeholderTextColor={defaultTheme.text}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text === '') {
                    setFilteredExercises(exercises);
                  }
                }}
              />
              {loading && exercises.length === 0 ? (
                <ActivityIndicator size="large" color={defaultTheme.primary} />
              ) : error ? (
                <Text style={[styles.errorText, { color: defaultTheme.text }]}>{error}</Text>
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
                      <ActivityIndicator size="small" color={defaultTheme.primary} />
                    ) : null
                  )}
                />
              )}
              <Button mode="contained" onPress={onClose} style={styles.closeButton}>
                Close
              </Button>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const WorkoutScreen = () => {
  const router = useRouter();
  const { autoStart } = useLocalSearchParams();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [sets, setSets] = useState('');
  const { userId } = useAuth();
  const { theme } = useTheme();
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

  useEffect(() => {
    if (autoStart === 'true') {
      startWorkout();
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [autoStart]);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      setIsTimerRunning(false);
    }
  };

  const startWorkout = () => {
    setIsTimerRunning(true);
  };

  const pauseWorkout = () => {
    setIsTimerRunning(false);
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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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
      
            if (prError && prError.code !==    'PGRST116') throw prError;
      
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

  const NavButton = ({ icon, label, onPress, style, iconSize = 24 }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => {
          setIsPressed(false);
          onPress();
        }}
        style={({ pressed }) => [
          styles.navButton,
          style,
          isPressed && styles.navButtonPressed
        ]}
      >
        <View style={styles.navButtonInner}>
          <MaterialCommunityIcons 
            name={icon} 
            size={iconSize} 
            color={isPressed ? defaultTheme.background : defaultTheme.buttonText} 
          />
          <Text style={[
            styles.navButtonText,
            isPressed && styles.navButtonTextPressed
          ]}>{label}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: defaultTheme.background }]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary}/>
        <Appbar.Content title="Workout" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Card style={[styles.card, styles.timerCard]}>
          <Card.Content>
            <Title style={styles.timerText}>
              {formatTime(time)}
            </Title>
            <Button 
              mode="contained" 
              onPress={isTimerRunning ? pauseWorkout : startWorkout}
              style={styles.button}
            >
              {isTimerRunning ? 'Pause Workout' : 'Resume Workout'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Add Exercise</Title>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setExerciseModalVisible(true)}
            >
              <Text style={styles.inputText}>
                {newExercise || 'Select Exercise'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Sets"
              placeholderTextColor={defaultTheme.background}
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
            />
            <Button 
              mode="contained" 
              onPress={addExercise}
              style={styles.button}
            >
              Add
            </Button>
          </Card.Content>
        </Card>
        
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index: exerciseIndex }) => (
            <Card style={styles.exerciseCard}>
              <Card.Content>
                <Title style={styles.exerciseName}>
                  {formatExerciseNameForDisplay(item.name)}
                </Title>
                {item.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setContainer}>
                    <Text style={styles.setText}>Set {setIndex + 1}:</Text>
                    <TextInput
                      style={styles.setInput}
                      placeholder="Reps"
                      placeholderTextColor={defaultTheme.background}
                      value={set.reps}
                      onChangeText={(reps) => updateSet(exerciseIndex, setIndex, 'reps', reps)}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.setInput}
                      placeholder="Weight"
                      placeholderTextColor={defaultTheme.background}
                      value={set.weight}
                      onChangeText={(weight) => updateSet(exerciseIndex, setIndex, 'weight', weight)}
                      keyboardType="numeric"
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        />

        <View style={styles.endWorkoutButtonContainer}>
          <NavButton 
            icon="stop-circle"
            label="End Workout"
            onPress={endWorkout}
            iconSize={32}
          />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        theme={theme}
      />

      <ExerciseSelectionModal
        visible={exerciseModalVisible}
        onClose={() => setExerciseModalVisible(false)}
        onSelect={selectExercise}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: '#f2e2fb',
    fontWeight: 'bold',
    fontSize: 24,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: defaultTheme.primary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: defaultTheme.background,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingTop: 20,
    color: defaultTheme.background,
  },
  button: {
    marginTop: 8,
    backgroundColor: defaultTheme.background,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderColor: defaultTheme.background,
    color: defaultTheme.background,
  },
  inputText: {
    fontSize: 16,
    color: defaultTheme.background,
  },
  exerciseCard: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: defaultTheme.primary,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: defaultTheme.background,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  setText: {
    width: 50,
    color: defaultTheme.background,
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    width: 50,
    marginLeft: 10,
    color: defaultTheme.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    minWidth: 100,
  },
  exerciseItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  exerciseItemText: {
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  exerciseList: {
    maxHeight: 300,
  },
  closeButton: {
    marginTop: 10,
  },
  exerciseDetailsContainer: {
    padding: 20,
  },
  exerciseDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseInfoContainer: {
    marginBottom: 20,
  },
  exerciseInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  exerciseDetailsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  exerciseInstruction: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectButton: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 10,
  },
  navButton: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: defaultTheme.buttonBackground,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonPressed: {
    backgroundColor: defaultTheme.text,
    transform: [{ scale: 0.95 }],
  },
  navButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: defaultTheme.buttonText,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  navButtonTextPressed: {
    color: defaultTheme.background,
  },
  endWorkoutButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default WorkoutScreen;
