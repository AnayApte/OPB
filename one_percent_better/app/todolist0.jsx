import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
//import { SUPABASEURL, SUPABASEKEY } from '@env'

const supabaseUrl = 'https://hhaknhsygdajhabbanzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYWtuaHN5Z2RhamhhYmJhbnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwMjQ3MjEsImV4cCI6MjAzNTYwMDcyMX0.kK8viaMqxFPqylFTr0RvC0V6BL6CtB2jLgZdn-AhGc4'; // Ensure this key is correct
const supabase = createClient(supabaseUrl, supabaseKey);

const TodoList = () => {
  const { userId } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState('low');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

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
    if (newTodo.trim()) {
      const newTask = {
        details: newTodo,
        completed: false,
        user_id: userId,
        task_priority: newPriority,
      };
      try {
        const { data, error } = await supabase
          .from('todos')
          .insert([newTask])
          .select();

        if (error) {
          console.error('Failed to add todo:', error);
        } else {
          setTodos([...todos, ...data]);
          setNewTodo('');
          setNewPriority('low');
        }
      } catch (error) {
        console.error('Failed to add todo:', error);
      }
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

  const renderTodoItem = ({ item }) => (
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
        <Text style={[styles.todoText, item.completed && styles.completedText]}>{item.details}</Text>
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

  const completedTodos = todos.filter(todo => todo.completed);
  const incompleteTodos = todos.filter(todo => !todo.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add new todo"
        value={newTodo}
        onChangeText={setNewTodo}
      />
      <Text style={styles.priorityTitle}>Priority:</Text>
      <View style={styles.priorityButtonsContainer}>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: newPriority === 'low' ? getPriorityColor('low') : '#ccc' }]}
          onPress={() => setNewPriority('low')}
        >
          <Text style={styles.buttonText}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: newPriority === 'medium' ? getPriorityColor('medium') : '#ccc' }]}
          onPress={() => setNewPriority('medium')}
        >
          <Text style={styles.buttonText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: newPriority === 'high' ? getPriorityColor('high') : '#ccc' }]}
          onPress={() => setNewPriority('high')}
        >
          <Text style={styles.buttonText}>High</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={addTodo}>
        <Text style={styles.buttonText}>Add Todo</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Incomplete Todos</Text>
      <FlatList
        data={incompleteTodos.sort((a, b) => getPriorityValue(a.task_priority) - getPriorityValue(b.task_priority))}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id.toString()}
      />

      <Text style={styles.sectionTitle}>Completed Todos</Text>
      <FlatList
        data={completedTodos.sort((a, b) => getPriorityValue(a.task_priority) - getPriorityValue(b.task_priority))}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id.toString()}
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
  button: {
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default TodoList;