import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax, formatExerciseNameForDisplay } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  cardBackground: '#FFFFFF',
  buttonBackground: '#1E90FF',
  buttonText: '#FFFFFF',
};

const ExerciseHistory = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Records');
  const { userId } = useAuth();
  const { theme = defaultTheme } = useTheme() || {};

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
      <TouchableOpacity onPress={() => openModal(item)} style={[styles.exerciseBox, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.exerciseName, { color: theme.text }]}>{formatExerciseNameForDisplay(item.name)}</Text>
        <Text style={{ color: theme.text }}>Best Set: {bestSet.reps} reps @ {bestSet.weight} lbs</Text>
        <Text style={{ color: theme.text }}>Current 1RM: {currentRecord.oneRepMax} lbs</Text>
      </TouchableOpacity>
    );
  };

  const renderRecordsTab = () => {
    if (!selectedExercise) return null;

    const currentRecord = selectedExercise.personalRecords.find(record => record.isCurrent);
    const bestSet = selectedExercise.workoutExercises
      .flatMap(we => we.sets)
      .find(set => set && currentRecord && set.setId === currentRecord.setId);

    if (!currentRecord || !bestSet) {
      return <Text style={{ color: theme.text }}>No records available</Text>;
    }

    return (
      <View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Current One Rep Max:</Text>
        <Text style={{ color: theme.text }}>{currentRecord.oneRepMax} lbs</Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Best Set:</Text>
        <Text style={{ color: theme.text }}>{bestSet.weight} lbs x {bestSet.reps} reps</Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>PR History:</Text>
        <FlatList
          data={selectedExercise.personalRecords.sort((a, b) => new Date(b.date) - new Date(a.date))}
          keyExtractor={(item) => item.setId.toString()}
          renderItem={({ item }) => (
            <View style={styles.prHistoryItem}>
              <Text style={{ color: theme.text }}>{new Date(item.date).toLocaleDateString()}: {item.oneRepMax} lbs</Text>
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{new Date(item.workouts.date).toLocaleDateString()}</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.text }]}>Sets Performed:</Text>
            {item.sets.map((set, index) => (
              <Text key={set.setId} style={{ color: theme.text }}>
                Set {index + 1}: {set.reps} reps @ {set.weight} lbs (1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs)
              </Text>
            ))}
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton destination="/home"/>
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
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setActiveTab('Records')}>
              <Text style={[styles.tabText, activeTab === 'Records' && styles.activeTabText, { color: theme.text }]}>Records</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('History')}>
              <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText, { color: theme.text }]}>History</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Records' ? renderRecordsTab() : renderHistoryTab()}

          <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeButton, { backgroundColor: theme.buttonBackground }]}>
            <Text style={[styles.closeButtonText, { color: theme.buttonText }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  exerciseBox: {
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
    paddingTop: 50,
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
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ExerciseHistory;
