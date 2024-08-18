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

  const toggleComplete = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add a new todo"
        value={newTodo}
        onChangeText={setNewTodo}
      />
      <Picker
        selectedValue={newPriority}
        style={styles.picker}
        onValueChange={(itemValue) => setNewPriority(itemValue)}
      >
        <Picker.Item label="Low Priority" value="low" />
        <Picker.Item label="Mid Priority" value="medium" />
        <Picker.Item label="High Priority" value="high" />
      </Picker>
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
    marginBottom: 0,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  picker: {
    height: 40,
    width: '100%',
    marginBottom: 10,
    paddingBottom: 200,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
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
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  todoText: {
    fontSize: 14,
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