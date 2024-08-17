import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const editTodo = (todo) => {
    setIsEditing(true);
    setCurrentTodo(todo);
  };

  const applyEdit = () => {
    if (currentTodo) {
      updateTodo(currentTodo.id, currentTodo.text);
    }
  };

  const updateTodo = (id, text) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, text } : todo)));
    setIsEditing(false);
    setCurrentTodo(null);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.checkmark}>
        <Text style={styles.checkmarkText}>{item.completed ? '✓' : ''}</Text>
      </TouchableOpacity>
      {isEditing && currentTodo?.id === item.id ? (
        <TextInput
          style={styles.todoTextInput}
          value={currentTodo.text}
          onChangeText={(text) => setCurrentTodo({ ...currentTodo, text })}
          onBlur={applyEdit}
          autoFocus // This will make the keyboard pop up
          selectTextOnFocus // This will select the text when focused
          multiline // This will allow the text to flow to the next line
          numberOfLines={4} // This sets the initial number of lines
        />
      ) : (
        <Text style={[styles.todoText, item.completed && styles.completedText]}>{item.text}</Text>
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