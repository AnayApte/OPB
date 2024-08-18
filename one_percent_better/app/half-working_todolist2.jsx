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
  const [localTodos, setLocalTodos] = useState(todos);

  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

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
      const { data, error } = await supabase
        .from('todos')
        .insert([newTask]);

      if (error) {
        console.error('Failed to add todo:', error);
      } else {
        setTodos([...todos, ...data]);
        addTodo(newTodo);
        setNewTodo('');
        setLocalTodos([...localTodos, { text: newTodo, id: Date.now().toString() }]);
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

  const toggleComplete = async (id) => {
    const updatedTodos = todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed, modified_at: new Date().toISOString() } : todo));
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id) => {
    const updatedTodos = todos.filter(todo => task.id !== id);
    setTodos(updatedTodos);
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete todo:', error);
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

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
      <FlatList
        data={todos}
        renderItem={({ item }) => (
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
        )}
        keyExtractor={(item) => (item.id ? item.id.toString() : '')}      />
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
    textAlignVertical: 'top', // Ensures text starts at the top of the input
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
    backgroundColor: '#4CAF50', // Green color for the apply button
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