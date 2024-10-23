import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Appbar, Card, Paragraph, Modal, Portal, Text, IconButton, Title, Surface } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const supabase = createClient(SUPABASEURL, SUPABASEKEY);

const theme = {
  background: '#3b0051',
  text: '#f2e2fb',
  button: '#f2e2fb',
  buttonText: '#3b0051',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function InteractiveCalendarContent() {
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
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#2ecc71';
      default:
        return theme.background;
    }
  };

  const getMarkedDates = () => {
    const markedDates = {};

    const addDot = (date, key, color) => {
      if (!markedDates[date]) markedDates[date] = { dots: [] };
      if (markedDates[date].dots.length < 5) {
        markedDates[date].dots.push({ key, color });
      }
    };

    todos.forEach(todo => {
      const date = todo.due_date.split('T')[0];
      addDot(date, `todo-${todo.id}`, getPriorityColor(todo.task_priority));
    });

    workouts.forEach(workout => {
      const date = workout.date.split('T')[0];
      addDot(date, `workout-${workout.id}`, theme.background);
    });

    journals.forEach(journal => {
      const date = journal.date.split('T')[0];
      addDot(date, `journal-${journal.id}`, theme.background);
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
        <View style={[styles.itemContainer, { borderColor: theme.button }]}>
          <MaterialCommunityIcons name="dumbbell" size={20} color={theme.button} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={[styles.itemTitle, { color: theme.text }]}>Workout</Paragraph>
            <Paragraph style={styles.itemSubtitle}>Duration: {item.duration}</Paragraph>
          </View>
        </View>
      );
    } else if ('title' in item) {
      return (
        <View style={[styles.itemContainer, { borderColor: theme.button }]}>
          <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.button} />
          <View style={styles.itemTextContainer}>
            <Paragraph style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Paragraph>
            <Paragraph style={styles.itemSubtitle} numberOfLines={2}>{item.body}</Paragraph>
          </View>
        </View>
      );
    }
  };

  const HeaderIcon = ({ icon, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerIconContainer,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View style={styles.headerIconBackground}>
        <MaterialCommunityIcons name={icon} size={32} color={theme.text} />
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <Appbar.Header style={styles.header}>
        <HeaderIcon
          icon="arrow-left"
          onPress={() => router.back()}
        />
        <Appbar.Content title="Interactive Calendar" titleStyle={styles.headerTitle} />
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
                backgroundColor: theme.button,
                calendarBackground: theme.button,
                textSectionTitleColor: theme.background,
                selectedDayBackgroundColor: theme.background,
                selectedDayTextColor: theme.button,
                todayTextColor: theme.background,
                dayTextColor: theme.background,
                textDisabledColor: 'rgba(59, 0, 81, 0.4)',
                dotColor: theme.background,
                selectedDotColor: theme.button,
                arrowColor: theme.background,
                monthTextColor: theme.background,
                indicatorColor: theme.background,
                textDayFontWeight: 'bold',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
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
        >
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Title style={[styles.modalTitle, { color: theme.background }]}>
                {selectedDate ? format(parseISO(selectedDate), 'PP') : 'Items'}
              </Title>
              <IconButton
                icon="close"
                color={theme.background}
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
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 24,
  },
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  headerIconBackground: {
    backgroundColor: 'rgba(242, 226, 251, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  calendarCard: {
    marginBottom: 16,
    backgroundColor: theme.button,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  calendar: {
    height: SCREEN_WIDTH,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.button,
    borderRadius: 12,
    padding: 20,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
    padding: 0,
  },
  modalScroll: {
    width: '100%',
    flex: 1,
  },
  itemWrapper: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: theme.background,
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
    color: theme.text,
  },
});

export default function InteractiveCalendar() {
  return (
    <ThemeProvider value={theme}>
      <InteractiveCalendarContent />
    </ThemeProvider>
  );
}