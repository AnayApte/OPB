import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax, formatExerciseNameForDisplay } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { Appbar, Card, Title, Paragraph, Button, Text } from 'react-native-paper';

const formatTime = (interval) => {
  if (!interval) return 'N/A';
  const [hours, minutes, seconds] = interval.split(':').map(Number);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { userId } = useAuth();
  const { theme } = useTheme();
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
    <Card style={styles.workoutCard} onPress={() => openModal(item)}>
      <Card.Content>
        <Title style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Title>
        <Paragraph>Duration: {formatTime(item.duration)}</Paragraph>
        <Title style={styles.sectionTitle}>Exercises:</Title>
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
              <Paragraph>{workoutExercise.sets.length}x {formatExerciseNameForDisplay(workoutExercise.exercises.name)}</Paragraph>
              <Paragraph>Best Set: {bestSetInfo}</Paragraph>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );

  const renderModalContent = () => {
    if (!selectedWorkout) return null;

    return (
      <ScrollView style={styles.modalContent}>
        <Title style={styles.dateText}>{new Date(selectedWorkout.date).toLocaleDateString()}</Title>
        <Paragraph>Duration: {formatTime(selectedWorkout.duration)}</Paragraph>
        {selectedWorkout.workoutExercises.map((workoutExercise) => (
          <Card key={workoutExercise.exerciseId} style={styles.exerciseCard}>
            <Card.Content>
              <Title>{formatExerciseNameForDisplay(workoutExercise.exercises.name)}</Title>
              {workoutExercise.sets.map((set, index) => (
                <View key={set.setId} style={styles.setRow}>
                  <Paragraph>Set {index + 1}: {set.weight}x{set.reps}</Paragraph>
                  <Paragraph>1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs</Paragraph>
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Workout History" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.workoutId.toString()}
        renderItem={renderWorkoutItem}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    padding: 16,
  },
  workoutCard: {
    marginBottom: 16,
    borderRadius: 12,
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
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    marginTop: 16,
    borderRadius: 12,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default WorkoutHistory;
