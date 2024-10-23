import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
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

// Updated theme based on the homepage theme
const defaultTheme = {
  background: '#3b0051',     // Purple background
  text: '#f2e2fb',           // Light text
  primary: '#f2e2fb',        // Light color for primary elements
  secondary: '#3b0051',      // Darker color for secondary elements
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
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
        return '#e74c3c'; // Red for high priority
      case 'medium':
        return '#f39c12'; // Orange for medium priority
      case 'low':
        return '#2ecc71'; // Green for low priority
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
      return (
        <View style={[styles.itemContainer, { borderColor: getPriorityColor(item.task_priority) }]}>
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={getPriorityColor(item.task_priority)} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={[styles.itemTitle, { color: theme.text }]}>{item.details}</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Priority: {item.task_priority}</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Due: {format(parseISO(item.due_date), 'PP')}</Paragraph>
          </View>
        </View>
      );
    } else if ('duration' in item) {
      return (
        <View style={[styles.itemContainer, { borderColor: theme.primary }]}>
          <MaterialCommunityIcons name="dumbbell" size={20} color={theme.primary} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={[styles.itemTitle, { color: theme.text }]}>Workout</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Duration: {item.duration}</Paragraph>
          </View>
        </View>
      );
    } else if ('title' in item) {
      return (
        <View style={[styles.itemContainer, { borderColor: theme.primary }]}>
          <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.primary} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Paragraph>
            <Paragraph style={styles.itemSubtitle} numberOfLines={2}>{item.body}</Paragraph>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#3b0051' }]}>
      {/* Transparent header and updating text and icon color */}
      <Appbar.Header style={styles.transparentHeader}>
        <Appbar.BackAction onPress={() => router.back()} color={'#f2e2fb'} />
        <Appbar.Content title="Interactive Calendar" titleStyle={{ color: '#f2e2fb' }} />
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
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedDate ? format(parseISO(selectedDate), 'PP') : 'Items'}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setDayModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedDayItems.map((item, index) => {
                const itemKey = `item-${item.id || index}-${index}`;
                return (
                  <View key={itemKey} style={styles.itemWrapper}>
                    {renderItemDetails(item)}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transparentHeader: {
    backgroundColor: 'transparent', // Make header background transparent
    elevation: 0, // Remove shadow
  },
  content: {
    padding: 16,
  },
  calendarCard: {
    marginBottom: 16,
    backgroundColor: '#3b0051',
    borderRadius: 40, // Rounded edges for the card
    overflow: 'hidden', // Ensure content inside respects rounded corners
    elevation: 0, // Remove shadow to emphasize the border radius
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
