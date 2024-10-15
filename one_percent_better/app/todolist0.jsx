// app/todolist0.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { format } from 'date-fns';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import BackButton from '../utils/BackButton';
import { ThemeProvider, useTheme } from './ThemeContext';

const defaultTheme = {
  background: 'purple',
  text: 'yellow',
  primary: 'yellow',
  secondary: '#f2f5ea',
  buttonBackground: '#884513',
  buttonText: 'purple',
  inputBackground: 'white',
  inputText: 'black',
  inputBorder: 'yellow',
  todoBackground: '#4B0082',
};

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TodoList = () => {
  const { theme = defaultTheme } = useTheme() || {};
  const { userId } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState('low');
  const [newDueDate, setNewDueDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  

  const handleConfirmDate = async (date) => {
    const selectedDate = moment(date).format('YYYY-MM-DD');
    if (moment(selectedDate).isAfter(moment())) {
      const adjustedDate = moment(selectedDate).startOf('day').toDate();

      setNewDueDate(adjustedDate);
      setDatePickerVisibility(false);
      // Push the due date to the database
      const { data, error } = await supabase
        .from('todos')
        .update({ due_date: selectedDate })
        .eq('id', currentTodo.id);
      if (error) {
        console.error('Error updating due date:', error);
      } else {
        console.log('Due date updated:', data);
      }
    } else {
      alert('Please select a date after today.');
    }
  };

  useEffect(() => {
    if (userId) {
      loadTodos();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const intervalId = setInterval(loadTodos, 5000); // Fetch todos every 5 seconds

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
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

    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };


    const newTodoItem = {
      details: newTodo,
      task_priority: newPriority,
      due_date: newDueDate ? formatDate(newDueDate) : null, // Ensure newDueDate is formatted
      completed: false,
    };

    setTodos([...todos, newTodoItem]);
    setNewTodo('');
    setNewDueDate('');

    // Push the new todo to the database
    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...newTodoItem, user_id: userId }]);
    if (error) {
      console.error('Error adding todo:', error);
    } else {
      console.log('Todo added:', data);
    }
  };

  const updateTodo = async (id, details) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ details })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      console.log('Todo updated:', data);
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
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }
  };

  const editTodo = (todo) => {
    setIsEditing(true);
    setCurrentTodo(todo);
  };

  const applyEdit = async () => {
    if (currentTodo) {
      console.log('Applying edit for todo:', currentTodo);
      await updateTodo(currentTodo.id, currentTodo.details);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === currentTodo.id ? { ...todo, details: currentTodo.details } : todo
        )
      );
      setIsEditing(false);
      setCurrentTodo(null);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((todo) => todo.id === id);
    const newCompletedStatus = !todo.completed;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: newCompletedStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating todo:', error);
      } else {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id ? { ...todo, completed: newCompletedStatus } : todo
          )
        );
      }
    } catch (error) {
      console.error('Error toggling complete status:', error);
    }
  };

  const getPriorityValue = (priority) => {
    switch (priority) {
      case 'high':
        return 1;
      case 'medium':
        return 2;
      case 'low':
        return 3;
      default:
        return 4;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF6347'; // Bright red
      case 'medium':
        return '#FFA500'; // Orange
      case 'low':
        return '#1E90FF'; // Blue
      default:
        return '#000'; // Default to black
    }
  };

  const renderTodoItem = ({ item }) => {
    const formattedDueDate = item.due_date ? moment(item.due_date).startOf('day').format("MMMM Do, YYYY") : 'No due date';
    return (
      <View style={[styles.todoItem, { backgroundColor: theme.todoBackground }]}>
        <TouchableOpacity onPress={() => toggleComplete(item.id)} style={[styles.checkmark, { borderColor: theme.primary }]}>
          <Text style={[styles.checkmarkText, { color: theme.primary }]}>{item.completed ? '✓' : ''}</Text>
        </TouchableOpacity>
        {isEditing && currentTodo?.id === item.id ? (
          <TextInput
            style={[styles.todoTextInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
            value={currentTodo.details}
            onChangeText={(text) => setCurrentTodo({ ...currentTodo, details: text })}
            onBlur={applyEdit}
            autoFocus
            selectTextOnFocus
            multiline
            numberOfLines={4}
          />
        ) : (
          <View>
            <Text style={[styles.todoText, item.completed && styles.completedText, { color: theme.text }]}>{item.details}</Text>
            <Text style={[styles.dueDateText, { color: theme.text }]}>Due: {formattedDueDate}</Text> 
          </View>
        )}
        {isEditing && currentTodo?.id === item.id ? (
          <TouchableOpacity onPress={applyEdit} style={[styles.applyButton, { backgroundColor: theme.buttonBackground }]}>
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Apply</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => editTodo(item)} style={[styles.editButton, { backgroundColor: theme.buttonBackground }]}>
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => deleteTodo(item.id)} style={[styles.deleteButton, { backgroundColor: theme.buttonBackground }]}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton destination="/home" />
      <Text style={[styles.title, { color: theme.text }]}>Todo List</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
        placeholder="Add new todo"
        placeholderTextColor={theme.text}
        value={newTodo}
        onChangeText={setNewTodo}
      />
      {newDueDate && (
        <Text style={[styles.selectedDateText, { color: theme.primary }]}>
          Selected Date: {format(new Date(newDueDate), "MMMM do, yyyy")}
        </Text>
      )}
      <Text style={[styles.priorityTitle, { color: theme.text }]}>Priority:</Text>
      <View style={styles.priorityButtonsContainer}>
        {['low', 'medium', 'high'].map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityButton,
              { backgroundColor: newPriority === priority ? theme.primary : theme.buttonBackground }
            ]}
            onPress={() => setNewPriority(priority)}
          >
            <Text style={{ color: newPriority === priority ? theme.buttonText : theme.text }}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={() => setDatePickerVisibility(true)}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Select Due Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.buttonBackground }]} onPress={addTodo}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Add Todo</Text>
        </TouchableOpacity>
        
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          textColor={theme.text}
        />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTodoItem}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  priorityButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  applyButton: {
    padding: 10,
    borderRadius: 25,
    marginRight: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  checkmark: {
    marginRight: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 18,
  },
  todoTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  editButton: {
    padding: 10,
    borderRadius: 25,
    marginRight: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  addButton: {
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  selectedDateText: {
    marginTop: 5,
    fontSize: 11,
  },
  buttonText: {
    fontSize: 16,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  dueDateText: {
    fontSize: 14,
  },
});

export default () => (
  <ThemeProvider>
    <TodoList />
  </ThemeProvider>
);