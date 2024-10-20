import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax, formatExerciseNameForDisplay } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { Appbar, Card, Title, Paragraph, Button, Text, Surface } from 'react-native-paper';

const ExerciseHistory = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Records');
  const { userId } = useAuth();
  const { theme } = useTheme();
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
      <Card style={styles.exerciseCard} onPress={() => openModal(item)}>
        <Card.Content>
          <Title>{formatExerciseNameForDisplay(item.name)}</Title>
          <Paragraph>Best Set: {bestSet.reps} reps @ {bestSet.weight} lbs</Paragraph>
          <Paragraph>Current 1RM: {currentRecord.oneRepMax} lbs</Paragraph>
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
      return <Paragraph>No records available</Paragraph>;
    }

    return (
      <View>
        <Title>Current One Rep Max:</Title>
        <Paragraph>{currentRecord.oneRepMax} lbs</Paragraph>

        <Title>Best Set:</Title>
        <Paragraph>{bestSet.weight} lbs x {bestSet.reps} reps</Paragraph>

        <Title>PR History:</Title>
        <FlatList
          data={selectedExercise.personalRecords.sort((a, b) => new Date(b.date) - new Date(a.date))}
          keyExtractor={(item) => item.setId.toString()}
          renderItem={({ item }) => (
            <Paragraph>{new Date(item.date).toLocaleDateString()}: {item.oneRepMax} lbs</Paragraph>
          )}
        />
      </View>
    );
  };

  const renderHistoryTab = () => {
    if (!selectedExercise) return null;

    return (
      <FlatList
        data={selectedExercise.workoutExercises.sort((a, b) => new Date(b.workouts.date) - new Date(a.workouts.date))}
        keyExtractor={(item) => item.workoutId.toString()}
        renderItem={({ item }) => (
          <Card style={styles.workoutHistoryCard}>
            <Card.Content>
              <Title>{new Date(item.workouts.date).toLocaleDateString()}</Title>
              <Paragraph>Sets Performed:</Paragraph>
              {item.sets.map((set, index) => (
                <Paragraph key={set.setId}>
                  Set {index + 1}: {set.reps} reps @ {set.weight} lbs (1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs)
                </Paragraph>
              ))}
            </Card.Content>
          </Card>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Exercise History" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exerciseId.toString()}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Appbar.Header style={styles.header}>
            <Appbar.Content title={selectedExercise ? formatExerciseNameForDisplay(selectedExercise.name) : ''} titleStyle={styles.headerTitle} />
            <Appbar.Action icon="close" onPress={() => setModalVisible(false)} />
          </Appbar.Header>
          <Surface style={styles.tabContainer}>
            <Button mode={activeTab === 'Records' ? 'contained' : 'outlined'} onPress={() => setActiveTab('Records')}>
              Records
            </Button>
            <Button mode={activeTab === 'History' ? 'contained' : 'outlined'} onPress={() => setActiveTab('History')}>
              History
            </Button>
          </Surface>
          <ScrollView style={styles.tabContent}>
            {activeTab === 'Records' ? renderRecordsTab() : renderHistoryTab()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  exerciseCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  modalContent: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    elevation: 0,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  workoutHistoryCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
});

export default ExerciseHistory;
