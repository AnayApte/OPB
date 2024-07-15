import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';

// Utility function to format interval durations
const formatTime = (interval) => {
  if (!interval) return 'N/A';

  const [hours, minutes, seconds] = interval.split(':').map(Number);

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchWorkouts();
    }
  }, [userId]);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workoutExercises (
          exerciseId,
          exercises (name),
          sets (*)
        )
      `)
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
    } else {
      console.log('Fetched workouts:', data);
      // Fetch personal records for each exercise
      const workoutsWithPRs = await Promise.all(data.map(async (workout) => {
        const workoutExercisesWithPRs = await Promise.all(workout.workoutExercises.map(async (workoutExercise) => {
          const { data: pr } = await supabase
            .from('personalRecords')
            .select('*')
            .eq('userId', userId)
            .eq('exerciseId', workoutExercise.exerciseId)
            .eq('isCurrent', true)
            .single();

          return { ...workoutExercise, personalRecord: pr };
        }));

        return { ...workout, workoutExercises: workoutExercisesWithPRs };
      }));

      setWorkouts(workoutsWithPRs);
    }
  };

  const openModal = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const renderWorkoutItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => openModal(item)} style={styles.workoutBox}>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text>Duration: {formatTime(item.duration)}</Text>
        <Text style={styles.sectionTitle}>Exercises:</Text>
        {item.workoutExercises.map((workoutExercise) => {
          const bestSet = workoutExercise.personalRecord ? 
            workoutExercise.sets.find(set => set.setId === workoutExercise.personalRecord.setId) :
            workoutExercise.sets.reduce((best, current) => 
              calculateOneRepMax(current.weight, current.reps) > calculateOneRepMax(best.weight, best.reps) ? current : best,
              workoutExercise.sets[0]
            );

          const bestSetInfo = bestSet ? `${bestSet.weight}x${bestSet.reps}` : 'N/A';

          return (
            <View key={workoutExercise.exerciseId} style={styles.exerciseRow}>
              <Text>{workoutExercise.sets.length}x {workoutExercise.exercises.name}</Text>
              <Text>Best Set: {bestSetInfo}</Text>
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  const renderModalContent = () => {
    if (!selectedWorkout) return null;

    return (
      <View style={styles.modalContent}>
        <Text style={styles.dateText}>{new Date(selectedWorkout.date).toLocaleDateString()}</Text>
        <Text>Duration: {formatTime(selectedWorkout.duration)}</Text>
        <FlatList
          data={selectedWorkout.workoutExercises}
          keyExtractor={(item) => item.exerciseId.toString()}
          renderItem={({ item: workoutExercise }) => (
            <View style={styles.exerciseDetails}>
              <Text style={styles.sectionTitle}>{workoutExercise.exercises.name}</Text>
              {workoutExercise.sets.map((set, index) => (
                <View key={set.setId} style={styles.setRow}>
                  <Text>Set {index + 1}: {set.weight}x{set.reps}</Text>
                  <Text>1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs</Text>
                </View>
              ))}
            </View>
          )}
        />
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.workoutId.toString()}
        renderItem={renderWorkoutItem}
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {renderModalContent()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  workoutBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContent: {
    flex: 1,
    padding: 16,
    paddingTop: 50, // Ensures content starts below the status bar
  },
  exerciseDetails: {
    marginTop: 16,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default WorkoutHistory;
