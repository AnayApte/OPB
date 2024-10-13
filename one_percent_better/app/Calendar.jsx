import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from './ThemeContext';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import BackButton from '../utils/BackButton';
import { ThemeProvider } from './ThemeContext';

const supabase = createClient(SUPABASEURL, SUPABASEKEY);

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#641f1f',
  secondary: '#f2f5ea',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const InteractiveCalendarContent = () => {
  const { theme = defaultTheme } = useTheme() || {};
  const { userId } = useAuth();
  const [todos, setTodos] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [todoData, workoutData, journalData] = await Promise.all([
        supabase.from('todos').select('*').eq('user_id', userId),
        supabase.from('workouts').select('*').eq('userId', userId),
        supabase.from('journals').select('*').eq('user_id', userId)
      ]);

      setTodos(todoData.data || []);
      setWorkouts(workoutData.data || []);
      setJournals(journalData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF6347'; // Red
      case 'medium':
        return '#FFD700'; // Yellow
      case 'low':
        return '#90EE90'; // Green
      default:
        return theme.secondary;
    }
  };

  const getMarkedDates = () => {
    const markedDates = {};

    todos.forEach(todo => {
      const date = todo.due_date.split('T')[0];
      if (!markedDates[date]) markedDates[date] = { dots: [], tasks: [] };
      markedDates[date].dots.push({ key: 'todo', color: getPriorityColor(todo.task_priority) });
      markedDates[date].tasks.push({ 
        type: 'todo', 
        text: todo.details, 
        priority: todo.task_priority 
      });
    });

    workouts.forEach(workout => {
      const date = workout.date.split('T')[0];
      if (!markedDates[date]) markedDates[date] = { dots: [], tasks: [] };
      markedDates[date].dots.push({ key: 'workout', color: theme.primary });
      markedDates[date].tasks.push({ 
        type: 'workout', 
        text: 'Workout', 
        onPress: () => {
          setSelectedWorkout(workout);
          setWorkoutModalVisible(true);
        }
      });
    });

    journals.forEach(journal => {
      const date = journal.date.split('T')[0];
      if (!markedDates[date]) markedDates[date] = { dots: [], tasks: [] };
      markedDates[date].dots.push({ key: 'journal', color: theme.primary });
      markedDates[date].tasks.push({ 
        type: 'journal', 
        text: `Entry: ${journal.title}`, 
        onPress: () => {
          setSelectedJournal(journal);
          setJournalModalVisible(true);
        }
      });
    });

    return markedDates;
  };

  const renderDay = ({ date, state, marking }) => {
    const dayTasks = marking?.tasks || [];
    return (
      <View style={[styles.dayContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.dayText, { color: state === 'disabled' ? theme.secondary : theme.text }]}>
          {date.day}
        </Text>
        <ScrollView style={styles.taskScrollView}>
          {dayTasks.map((task, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.taskItem, 
                { backgroundColor: task.type === 'todo' ? getPriorityColor(task.priority) : theme.secondary }
              ]}
              onPress={task.onPress}
            >
              <Text style={[styles.taskText, { color: theme.text }]} numberOfLines={2}>
                {task.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton destination="/home"/>
      <Text style={[styles.title, { color: theme.primary }]}>Interactive Calendar</Text>
      <Calendar
        style={styles.calendar}
        markedDates={getMarkedDates()}
        dayComponent={renderDay}
        theme={{
          backgroundColor: theme.background,
          calendarBackground: theme.background,
          textSectionTitleColor: theme.text,
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: theme.secondary,
          todayTextColor: theme.primary,
          dayTextColor: theme.text,
          textDisabledColor: theme.secondary,
          dotColor: theme.primary,
          selectedDotColor: theme.secondary,
          arrowColor: theme.primary,
          monthTextColor: theme.primary,
          indicatorColor: theme.primary,
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={journalModalVisible}
        onRequestClose={() => setJournalModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>{selectedJournal?.title}</Text>
            <ScrollView>
              <Text style={[styles.modalBody, { color: theme.text }]}>{selectedJournal?.body}</Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setJournalModalVisible(false)}
            >
              <Text style={[styles.buttonText, { color: theme.secondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={workoutModalVisible}
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>Workout Details</Text>
            <Text style={[styles.modalBody, { color: theme.text }]}>Duration: {selectedWorkout?.duration}</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setWorkoutModalVisible(false)}
            >
              <Text style={[styles.buttonText, { color: theme.secondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InteractiveCalendar = () => {
  return (
    <ThemeProvider>
      <InteractiveCalendarContent />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 50,
    textAlign: 'center',
  },
  calendar: {
    height: SCREEN_WIDTH,
  },
  dayContainer: {
    width: SCREEN_WIDTH / 7 - 4,
    height: SCREEN_WIDTH / 7 * 1.5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 2,
  },
  dayText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskScrollView: {
    flex: 1,
  },
  taskItem: {
    padding: 2,
    marginTop: 2,
    borderRadius: 3,
  },
  taskText: {
    fontSize: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalBody: {
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default InteractiveCalendar;