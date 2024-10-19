import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Card, Paragraph, Modal, Portal, Text, IconButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const supabase = createClient(SUPABASEURL, SUPABASEKEY);

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

function InteractiveCalendarContent() {
  const { theme = defaultTheme } = useTheme();
  const { userId } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState([]);

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
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return theme.secondary;
    }
  };

  const getMarkedDates = () => {
    const markedDates = {};

    todos.forEach(todo => {
      const date = todo.due_date.split('T')[0];
      if (!markedDates[date]) markedDates[date] = { dots: [] };
      markedDates[date].dots.push({ key: `todo-${todo.id}`, color: getPriorityColor(todo.task_priority) });
    });

    workouts.forEach(workout => {
      const date = workout.date.split('T')[0];
      if (!markedDates[date]) markedDates[date] = { dots: [] };
      markedDates[date].dots.push({ key: `workout-${workout.id}`, color: theme.primary });
    });

    journals.forEach(journal => {
      const date = journal.date.split('T')[0];
      if (!markedDates[date]) markedDates[date] = { dots: [] };
      markedDates[date].dots.push({ key: `journal-${journal.id}`, color: theme.primary });
    });

    return markedDates;
  };

  const handleDayPress = (day) => {
    const date = day.dateString;
    const dayItems = [
      ...todos.filter(todo => todo.due_date.startsWith(date)),
      ...workouts.filter(workout => workout.date.startsWith(date)),
      ...journals.filter(journal => journal.date.startsWith(date))
    ];
    setSelectedDate(date);
    setSelectedDayItems(dayItems);
    setDayModalVisible(true);
  };

  const renderItemDetails = (item) => {
    if ('details' in item) {
      // Todo item
      return (
        <View style={[styles.itemContainer, { borderColor: getPriorityColor(item.task_priority) }]}>
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={getPriorityColor(item.task_priority)} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={styles.itemTitle}>{item.details}</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Priority: {item.task_priority}</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Due: {format(parseISO(item.due_date), 'PP')}</Paragraph>
          </View>
        </View>
      );
    } else if ('duration' in item) {
      // Workout item
      return (
        <View style={[styles.itemContainer, { borderColor: theme.primary }]}>
          <MaterialCommunityIcons name="dumbbell" size={20} color={theme.primary} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={styles.itemTitle}>Workout</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Duration: {item.duration}</Paragraph>
          </View>
        </View>
      );
    } else if ('title' in item) {
      // Journal item
      return (
        <View style={[styles.itemContainer, { borderColor: theme.primary }]}>
          <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.primary} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={styles.itemTitle}>{item.title}</Paragraph>
            <Paragraph style={styles.itemSubtitle} numberOfLines={2}>{item.body}</Paragraph>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Interactive Calendar" />
      </Appbar.Header>
      <ScrollView style={styles.content}>
        <Card style={styles.calendarCard}>
          <Card.Content>
            <Calendar
              style={styles.calendar}
              markedDates={getMarkedDates()}
              onDayPress={handleDayPress}
              markingType={'multi-dot'}
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
          </Card.Content>
        </Card>
      </ScrollView>
      <Portal>
        <Modal 
          visible={dayModalVisible} 
          onDismiss={() => setDayModalVisible(false)} 
          contentContainerStyle={styles.modalContainer}
          style={{ margin: 0 }}
        >
          <View style={[styles.modalContent, { width: SCREEN_WIDTH * 0.9 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDate ? format(parseISO(selectedDate), 'PP') : 'Items'}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setDayModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedDayItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.itemWrapper}>
                  {renderItemDetails(item)}
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  calendarCard: {
    marginBottom: 16,
  },
  calendar: {
    height: SCREEN_WIDTH,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
    padding: 0,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  itemWrapper: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  itemTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
});

export default function InteractiveCalendar() {
  return (
    <ThemeProvider>
      <InteractiveCalendarContent />
    </ThemeProvider>
  );
}