import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { ThemeProvider, useTheme } from './ThemeContext';
import { format } from 'date-fns';
import { TextInput, Button, Card, Title, Paragraph, List, IconButton, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const supabase = createClient(SUPABASEURL, SUPABASEKEY);

function TodoList() {
  const { theme } = useTheme();
  const { userId } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState('low');
  const [newDueDate, setNewDueDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

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
      setTodos([...todos, data[0]]);
      setNewTodo('');
      setNewPriority('low');
      setNewDueDate(new Date());
    }
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
    setIsEditing(true);
    setCurrentTodo(todo);
    setNewTodo(todo.details);
    setNewPriority(todo.task_priority);
    setNewDueDate(new Date(todo.due_date));
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
      setIsEditing(false);
      setCurrentTodo(null);
      setNewTodo('');
      setNewPriority('low');
      setNewDueDate(new Date());
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: theme.text }}>Todo List</Title>
          <TextInput
            label="New Todo"
            value={newTodo}
            onChangeText={setNewTodo}
            style={styles.input}
            theme={{ colors: { primary: theme.primary } }}
          />
          <View style={styles.row}>
            <Menu
              visible={showPriorityMenu}
              onDismiss={() => setShowPriorityMenu(false)}
              anchor={
                <Button onPress={() => setShowPriorityMenu(true)} mode="outlined" style={styles.menuButton}>
                  {newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setNewPriority('low'); setShowPriorityMenu(false); }} title="Low" />
              <Menu.Item onPress={() => { setNewPriority('medium'); setShowPriorityMenu(false); }} title="Medium" />
              <Menu.Item onPress={() => { setNewPriority('high'); setShowPriorityMenu(false); }} title="High" />
            </Menu>
            <Button onPress={() => setShowDatePicker(true)} mode="outlined" style={styles.menuButton}>
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
          <Button mode="contained" onPress={isEditing ? updateTodo : addTodo} style={styles.addButton}>
            {isEditing ? 'Update Todo' : 'Add Todo'}
          </Button>
        </Card.Content>
      </Card>
      <ScrollView style={styles.todoList}>
        {todos.map((todo) => (
          <Card key={todo.id} style={styles.todoItem}>
            <Card.Content>
              <View style={styles.todoHeader}>
                <Paragraph style={[styles.todoTitle, todo.completed && styles.completedTodo]}>
                  {todo.details}
                </Paragraph>
                <IconButton
                  icon={todo.completed ? 'check-circle' : 'circle-outline'}
                  onPress={() => toggleComplete(todo.id)}
                  color={theme.primary}
                />
              </View>
              <Paragraph style={styles.todoPriority}>
                Priority: {todo.task_priority.charAt(0).toUpperCase() + todo.task_priority.slice(1)}
              </Paragraph>
              <Paragraph style={styles.todoDueDate}>
                Due: {format(new Date(todo.due_date), 'PP')}
              </Paragraph>
              <View style={styles.todoActions}>
                <Button onPress={() => editTodo(todo)} mode="text">
                  Edit
                </Button>
                <Button onPress={() => deleteTodo(todo.id)} mode="text" color="red">
                  Delete
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
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
  },
  addButton: {
    marginTop: 8,
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    marginBottom: 8,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
  },
  todoPriority: {
    fontSize: 14,
  },
  todoDueDate: {
    fontSize: 14,
  },
  todoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default function TodoListWrapper() {
  return (
    <ThemeProvider>
      <TodoList />
    </ThemeProvider>
  );
}