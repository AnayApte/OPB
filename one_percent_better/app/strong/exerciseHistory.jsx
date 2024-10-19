import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Appbar, Button, Card, Text, Modal, Portal, SegmentedButtons } from 'react-native-paper';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function ExerciseHistoryContent() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Records');
  const { userId } = useAuth();
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetchExercises();
    }
  }, [userId]);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        personalRecords!inner(userId, oneRepMax, date, setId, isCurrent),
        workoutExercises!inner(
          workoutId,
          workouts!inner(date),
          sets(*)
        )
      `)
      .eq('personalRecords.userId', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
    } else {
      setExercises(data);
    }
  };

  const openModal = (exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const renderExerciseItem = ({ item }) => {
    const currentRecord = item.personalRecords.find(record => record.isCurrent);
    const bestSet = item.workoutExercises
      .flatMap(we => we.sets)
      .find(set => set && currentRecord && set.setId === currentRecord.setId);

    if (!currentRecord || !bestSet) {
      return null;
    }

    return (
      <Card style={styles.card} onPress={() => openModal(item)}>
        <Card.Content>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text>Best Set: {bestSet.reps} reps @ {bestSet.weight} lbs</Text>
          <Text>Current 1RM: {currentRecord.oneRepMax} lbs</Text>
        </Card.Content>
      </Card>
    );
  };

  const renderRecordsTab = () => {
    if (!selectedExercise) return null;

    const currentRecord = selectedExercise.personalRecords.find(record => record.isCurrent);
    const bestSet = selectedExercise.workoutExercises
      .flatMap(we => we.sets)
      .find(set => set && currentRecord && set.setId === currentRecord.setId);

    if (!currentRecord || !bestSet) {
      return <Text>No records available</Text>;
    }

    return (
      <ScrollView>
        <Text style={styles.sectionTitle}>Current One Rep Max:</Text>
        <Text>{currentRecord.oneRepMax} lbs</Text>

        <Text style={styles.sectionTitle}>Best Set:</Text>
        <Text>{bestSet.weight} lbs x {bestSet.reps} reps</Text>

        <Text style={styles.sectionTitle}>PR History:</Text>
        <FlatList
          data={selectedExercise.personalRecords.sort((a, b) => new Date(b.date) - new Date(a.date))}
          keyExtractor={(item) => item.setId.toString()}
          renderItem={({ item }) => (
            <Text>{new Date(item.date).toLocaleDateString()}: {item.oneRepMax} lbs</Text>
          )}
        />
      </ScrollView>
    );
  };

  const renderHistoryTab = () => {
    if (!selectedExercise) return null;

    return (
      <FlatList
        data={selectedExercise.workoutExercises.sort((a, b) => new Date(b.workouts.date) - new Date(a.workouts.date))}
        keyExtractor={(item) => item.workoutId.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>{new Date(item.workouts.date).toLocaleDateString()}</Text>
              <Text style={styles.sectionSubtitle}>Sets Performed:</Text>
              {item.sets.map((set, index) => (
                <Text key={set.setId}>
                  Set {index + 1}: {set.reps} reps @ {set.weight} lbs (1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs)
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Exercise History" />
      </Appbar.Header>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exerciseId.toString()}
        renderItem={renderExerciseItem}
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'Records', label: 'Records' },
              { value: 'History', label: 'History' },
            ]}
          />
          {activeTab === 'Records' ? renderRecordsTab() : renderHistoryTab()}
          <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
            Close
          </Button>
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
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionSubtitle: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 16,
  },
});



export default function ExerciseHistory() {
  return (
    <ThemeProvider>
      <ExerciseHistoryContent />
    </ThemeProvider>
  );
}