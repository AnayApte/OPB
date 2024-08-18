import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext'; // Ensure this path is correct

const supabaseUrl = 'https://hhaknhsygdajhabbanzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYWtuaHN5Z2RhamhhYmJhbnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwMjQ3MjEsImV4cCI6MjAzNTYwMDcyMX0.kK8viaMqxFPqylFTr0RvC0V6BL6CtB2jLgZdn-AhGc4'; // Ensure this key is correct
const supabase = createClient(supabaseUrl, supabaseKey);

const TodoList = () => {
  const { userId } = useAuth(); // Get userId from useAuth hook
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
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

  const saveTodos = async (updatedTodos) => {
    try {
      const { error } = await supabase
        .from('todos')
        .upsert(updatedTodos);

      if (error) {
        console.error('Failed to save todos:', error);
      }
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const newTask = {
        details: newTodo,
        completed: false,
        user_id: userId,
      };
      try {
        const { data, error } = await supabase
          .from('todos')
          .insert([newTask])
          .select(); // Ensure the inserted data is returned
  
        if (error) {
          console.error('Failed to add todo:', error);
        } else {
          // Add the new todo to the local state
          setTodos([...todos, ...data]);
          setNewTodo('');
        }
      } catch (error) {
        console.error('Failed to add todo:', error);
      }
    }
  };

  const editTodo = (todo) => {
    setIsEditing(true);
    setCurrentTodo(todo);
  };

  const applyEdit = async () => {
    if (currentTodo) {
      await updateTodo(currentTodo.id, currentTodo.details);
    }
  };

  const updateTodo = async (id, details) => {
    const updatedTodos = todos.map(todo => (todo.id === id ? { ...todo, details, modified_at: new Date().toISOString() } : todo));
    setTodos(updatedTodos);
    setIsEditing(false);
    setCurrentTodo(null);
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id) => {
    try {
      // Delete the todo from the database
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
  
      if (error) {
        console.error('Failed to delete todo:', error);
      } else {
        // Update the local state to remove the deleted todo
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const toggleComplete = async (id) => {
    const updatedTodos = todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add a new todo"
        value={newTodo}
        onChangeText={setNewTodo}
      />
      <TouchableOpacity onPress={addTodo} style={styles.button}>
        <Text style={styles.buttonText}>Add Todo</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Incomplete Items</Text>
      <FlatList
        data={todos.filter(todo => !todo.completed)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTodoItem}
      />
      <Text style={styles.sectionTitle}>Completed Items</Text>
      <FlatList
        data={todos.filter(todo => todo.completed)}
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
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  todoTextInput: {
    fontSize: 16,
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    textAlignVertical: 'top',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkmarkText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
});

export default TodoList;