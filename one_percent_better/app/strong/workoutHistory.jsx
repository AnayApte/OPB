import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Appbar, Button, Card, Text, Modal, Portal } from 'react-native-paper';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const formatTime = (interval) => {
  if (!interval) return 'N/A';
  const [hours, minutes, seconds] = interval.split(':').map(Number);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

function WorkoutHistoryContent() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { userId } = useAuth();
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();

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

  const renderWorkoutItem = ({ item }) => (
    <Card style={styles.card} onPress={() => openModal(item)}>
      <Card.Content>
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
      </Card.Content>
    </Card>
  );

  const renderModalContent = () => {
    if (!selectedWorkout) return null;

    return (
      <ScrollView>
        <Text style={styles.dateText}>{new Date(selectedWorkout.date).toLocaleDateString()}</Text>
        <Text>Duration: {formatTime(selectedWorkout.duration)}</Text>
        {selectedWorkout.workoutExercises.map((workoutExercise) => (
          <Card key={workoutExercise.exerciseId} style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>{workoutExercise.exercises.name}</Text>
              {workoutExercise.sets.map((set, index) => (
                <View key={set.setId} style={styles.setRow}>
                  <Text>Set {index + 1}: {set.weight}x{set.reps}</Text>
                  <Text>1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}
        <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
          Close
        </Button>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Workout History" />
      </Appbar.Header>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.workoutId.toString()}
        renderItem={renderWorkoutItem}
      />
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
          {renderModalContent()}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
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
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    marginTop: 16,
  },
});

export default function WorkoutHistory() {
  return (
    <ThemeProvider>
      <WorkoutHistoryContent />
    </ThemeProvider>
  );
}