import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { format } from 'date-fns';


import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext'; // Ensure this path is correct
import { SUPABASEURL, SUPABASEKEY } from '@env';

import BackButton from '../utils/BackButton'; // Adjust the import path as needed

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY; // Ensure this key is correct
const supabase = createClient(supabaseUrl, supabaseKey);

const TodoList = () => {
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
      setNewDueDate(selectedDate);
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
    const formattedDueDate = item.due_date ? format(new Date(item.due_date), "MMMM do, yyyy") : 'No due date';

    return (
    <View style={[styles.todoItem, { borderLeftColor: getPriorityColor(item.task_priority), borderLeftWidth: 5 }]}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.checkmark}>
        <Text style={styles.checkmarkText}>{item.completed ? '✓' : ''}</Text>
      </TouchableOpacity>
      {isEditing && currentTodo?.id === item.id ? (
        <TextInput
          style={styles.todoTextInput}
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
          <Text style={[styles.todoText, item.completed && styles.completedText]}>{item.details}</Text>
          <Text style={styles.dueDateText}>Due: {formattedDueDate || 'No due date'}</Text> 
          </View>
      )}
      {isEditing && currentTodo?.id === item.id ? (
        <TouchableOpacity onPress={applyEdit} style={styles.applyButton}>
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => editTodo(item)} style={styles.editButton}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
    </View>
  );
};

  const completedTodos = todos.filter(todo => todo.completed);
  const incompleteTodos = todos.filter(todo => !todo.completed);

  return (
    <View style={styles.container}>
      <BackButton destination="/home" />
      <Text style={styles.title}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add new todo"
        value={newTodo}
        onChangeText={setNewTodo}
      />
      {newDueDate && (
        <Text style={styles.selectedDateText}>
          Selected Date: {format(new Date(newDueDate), "MMMM do, yyyy")}
        </Text>
      )}
      <Text style={styles.priorityTitle}>Priority:</Text>
      <View style={styles.priorityButtonsContainer}>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: newPriority === 'low' ? getPriorityColor('low') : '#ccc' }]}
          onPress={() => setNewPriority('low')}
        >
          <Text>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: newPriority === 'medium' ? getPriorityColor('medium') : '#ccc' }]}
          onPress={() => setNewPriority('medium')}
        >
          <Text>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: newPriority === 'high' ? getPriorityColor('high') : '#ccc' }]}
          onPress={() => setNewPriority('high')}
        >
          <Text>High</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
      <TouchableOpacity style={[styles.button]} onPress={() => setDatePickerVisibility(true)}>
          <Text style={styles.buttonText}>Select Due Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addButton]} onPress={addTodo}>
          <Text style={styles.buttonText}>Add Todo</Text>
        </TouchableOpacity>
        
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          textColor="#000" // Ensure text color is set
        />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
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
  button1: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: '#C8A2C8',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#f44336',
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
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  checkmark: {
    marginRight: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    color: '#333'
  },
  todoTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
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
    backgroundColor: '#FFA500',
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
    backgroundColor: '#4CAF50',
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
    color: '#6a6a6a',
  },
  dateButton: {
    backgroundColor: '#28A745',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  datePicker: {
    flex: 0.5,
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TodoList;