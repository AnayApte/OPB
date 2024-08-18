import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext'; // Ensure this path is correct
import { SUPABASEURL, SUPABASEKEY } from '@env';

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY; // Ensure this key is correct
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
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      marginTop: 100,
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
    button: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 10,
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
    todoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: 'white',
      borderRadius: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    todoText: {
      fontSize: 16,
      flex: 1,
      color: '#333',
    },
    todoTextInput: {
      fontSize: 16,
      flex: 1,
      borderBottomWidth: 1,
      borderColor: '#ccc',
      padding: 5,
      textAlignVertical: 'top',
      backgroundColor: '#fff',
      borderRadius: 5,
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
      backgroundColor: '#fff',
    },
    checkmarkText: {
      fontSize: 16,
      color: '#4CAF50',
    },
    editButton: {
      backgroundColor: '#FFC107',
      padding: 10,
      borderRadius: 25,
      marginRight: 5,
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
  });

export default TodoList;