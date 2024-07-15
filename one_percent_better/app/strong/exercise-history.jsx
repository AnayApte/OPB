import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';

const ExerciseHistory = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Records');
  const { userId } = useAuth();

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
      .find(set => set.setId === currentRecord.setId);

    return (
      <TouchableOpacity onPress={() => openModal(item)} style={styles.exerciseBox}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text>Best Set: {bestSet.reps} reps @ {bestSet.weight} lbs</Text>
        <Text>Current 1RM: {currentRecord.oneRepMax} lbs</Text>
      </TouchableOpacity>
    );
  };

  const renderRecordsTab = () => {
    if (!selectedExercise) return null;

    const currentRecord = selectedExercise.personalRecords.find(record => record.isCurrent);
    const bestSet = selectedExercise.workoutExercises
      .flatMap(we => we.sets)
      .find(set => set.setId === currentRecord.setId);

    return (
      <View>
        <Text style={styles.sectionTitle}>Current One Rep Max:</Text>
        <Text>{currentRecord.oneRepMax} lbs</Text>

        <Text style={styles.sectionTitle}>Best Set:</Text>
        <Text>{bestSet.weight} lbs x {bestSet.reps} reps</Text>

        <Text style={styles.sectionTitle}>PR History:</Text>
        <FlatList
          data={selectedExercise.personalRecords.sort((a, b) => new Date(b.date) - new Date(a.date))}
          keyExtractor={(item) => item.setId.toString()}
          renderItem={({ item }) => (
            <View style={styles.prHistoryItem}>
              <Text>{new Date(item.date).toLocaleDateString()}: {item.oneRepMax} lbs</Text>
            </View>
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
          <View style={styles.workoutHistoryItem}>
            <Text style={styles.sectionTitle}>{new Date(item.workouts.date).toLocaleDateString()}</Text>
            <Text style={styles.sectionSubtitle}>Sets Performed:</Text>
            {item.sets.map((set, index) => (
              <Text key={set.setId}>
                Set {index + 1}: {set.reps} reps @ {set.weight} lbs (1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs)
              </Text>
            ))}
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exerciseId.toString()}
        renderItem={renderExerciseItem}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setActiveTab('Records')}>
              <Text style={[styles.tabText, activeTab === 'Records' && styles.activeTabText]}>Records</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('History')}>
              <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>History</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Records' ? renderRecordsTab() : renderHistoryTab()}

          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  exerciseBox: {
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
  prHistoryItem: {
    marginLeft: 16,
  },
  workoutHistoryItem: {
    marginBottom: 16,
  },
  modalContent: {
    flex: 1,
    padding: 16,
    paddingTop: 50, // Ensures content starts below the status bar
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#1E90FF',
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

export default ExerciseHistory;
