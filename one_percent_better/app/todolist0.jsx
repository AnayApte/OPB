import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Card, Paragraph, IconButton, Menu, Title, Appbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../utils/supabaseClient';
import { format } from 'date-fns';
import { useAuth } from '../utils/AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../utils/BackButton';
import { useRouter } from 'expo-router';

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#3b0051',
  buttonText: '#f2e2fb',
};


function TodoList() {
  const { theme } = useTheme();
  const { userId } = useAuth();
  const navigation = useNavigation();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (userId) {
      loadTodos();
      const intervalId = setInterval(loadTodos, 5000);
      return () => clearInterval(intervalId);
    }
  }, [userId]);

  const loadTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to load todos:', error);
      } else {
        setTodos(data);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim() === '') return;

    const newTodoItem = {
      details: newTodo,
      task_priority: newPriority,
      due_date: newDueDate.toISOString(),
      completed: false,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([newTodoItem]);

    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setTodos([data[0], ...todos]);
      resetInputs();
    }
  };

  const resetInputs = () => {
    setNewTodo('');
    setNewPriority('medium');
    setNewDueDate(new Date());
  };

  const toggleComplete = async (id) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    const { data, error } = await supabase
      .from('todos')
      .update({ completed: !todoToUpdate.completed })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const editTodo = (todo) => {
    setCurrentTodo(todo);
    setNewTodo(todo.details);
    setNewPriority(todo.task_priority);
    setNewDueDate(new Date(todo.due_date));
    setIsEditing(true);
  };

  const updateTodo = async () => {
    const { data, error } = await supabase
      .from('todos')
      .update({
        details: newTodo,
        task_priority: newPriority,
        due_date: newDueDate.toISOString(),
      })
      .eq('id', currentTodo.id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      setTodos(todos.map(todo => todo.id === currentTodo.id ? { ...todo, details: newTodo, task_priority: newPriority, due_date: newDueDate.toISOString() } : todo));
      resetInputs();
      setIsEditing(false);
      setCurrentTodo(null);
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
        return 'gray';
    }
  };

  const PrioritySymbol = ({ priority }) => (
    <View style={[styles.prioritySymbol, { backgroundColor: getPriorityColor(priority) }]} />
  );

  const sortedTodos = useMemo(() => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...todos].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      if (a.completed && b.completed) return 0;
      return priorityOrder[a.task_priority] - priorityOrder[b.task_priority];
    });
  }, [todos]);

  return (
    <View style={styles.safeArea}>
      

      <Appbar.Header style={{backgroundColor: 'transparent'}}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary} />
        <Appbar.Content title="Meditation Station" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="New Todo"
              value={newTodo}
              onChangeText={setNewTodo}
              style={styles.input}
              theme={{ colors: {
                primary: defaultTheme.secondary,
                background: defaultTheme.secondary,
                text: defaultTheme.text,
                placeholder: defaultTheme.text,
              }, }}
            />
            <View style={styles.row}>
              <Menu
                visible={showPriorityMenu}
                onDismiss={() => setShowPriorityMenu(false)}
                anchor={
                  <Button 
                    onPress={() => setShowPriorityMenu(true)} 
                    mode="outlined" 
                    style={[styles.menuButton, { borderColor: '#3b0051' }]}
                    labelStyle={{ color: '#3b0051' }}
                  >
                    <PrioritySymbol priority={newPriority} />
                    <Paragraph style={styles.priorityText}>{newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}</Paragraph>
                  </Button>
                }
              >
                <Menu.Item onPress={() => { setNewPriority('low'); setShowPriorityMenu(false); }} title="Low" leadingIcon={() => <PrioritySymbol priority="low" />} />
                <Menu.Item onPress={() => { setNewPriority('medium'); setShowPriorityMenu(false); }} title="Medium" leadingIcon={() => <PrioritySymbol priority="medium" />} />
                <Menu.Item onPress={() => { setNewPriority('high'); setShowPriorityMenu(false); }} title="High" leadingIcon={() => <PrioritySymbol priority="high" />} />
              </Menu>
              <Button 
                onPress={() => setShowDatePicker(true)} 
                mode="outlined" 
                style={[styles.menuButton, { borderColor: '#3b0051' }]}
                labelStyle={{ color: '#3b0051' }}
              >
                {format(newDueDate, 'PP')}
              </Button>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={newDueDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewDueDate(selectedDate);
                  }
                }}
              />
            )}
            <Button 
              mode="contained" 
              onPress={isEditing ? updateTodo : addTodo} 
              style={[styles.addButton, { backgroundColor: '#3b0051' }]}
            >
              {isEditing ? 'Update Todo' : 'Add Todo'}
            </Button>
          </Card.Content>
        </Card>
        </TouchableWithoutFeedback>
        <ScrollView style={styles.todoList}>
          {sortedTodos.map((todo) => (
            <Card key={todo.id} style={[styles.todoItem, todo.completed && styles.completedTodoItem]}>
              <Card.Content style={styles.todoContent}>
                <View style={styles.todoHeader}>
                  <View style={styles.prioritySymbolContainer}>
                    <PrioritySymbol priority={todo.task_priority} />
                  </View>
                  <Paragraph style={[styles.todoTitle, todo.completed && styles.completedTodo]} numberOfLines={1}>
                    {todo.details}
                  </Paragraph>
                  <IconButton
                    icon={todo.completed ? 'check-circle' : 'circle-outline'}
                    onPress={() => toggleComplete(todo.id)}
                    color="#3b0051"
                    size={20}
                    style={styles.completeButton}
                  />
                </View>
                <View style={styles.todoFooter}>
                  <Paragraph style={styles.todoDueDate} numberOfLines={1}>
                    {format(new Date(todo.due_date), 'PP')}
                  </Paragraph>
                  <View style={styles.todoActions}>
                    <Button onPress={() => editTodo(todo)} mode="contained" color="#3b0051" compact style={styles.actionButton}>
                      Edit
                    </Button>
                    <Button onPress={() => deleteTodo(todo.id)} mode="contained" color="#3b0051" compact style={styles.actionButton}>
                      Delete
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: defaultTheme.background,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: defaultTheme.primary,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    marginTop: 16,
    backgroundColor: defaultTheme.primary,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuButton: {
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    marginBottom: 4,
    padding: 4,
    backgroundColor: defaultTheme.primary,
  },
  completedTodoItem: {
    opacity: 0.6,
  },
  todoContent: {
    padding: 0,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prioritySymbolContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  prioritySymbol: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  todoDueDate: {
    fontSize: 14,
  },
  todoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#3c0452',
  },
  completeButton: {
    margin: 0,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});

export default function TodoListWrapper() {
  return (
    <ThemeProvider>
      <TodoList />
    </ThemeProvider>
  );
}