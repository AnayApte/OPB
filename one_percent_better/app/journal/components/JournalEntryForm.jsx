import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';

const JournalEntryForm = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [entryText, setEntryText] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setEntryText(entry.text);
    }
  }, [entry]);

  const handleSave = () => {
    if (title.trim() && entryText.trim()) {
      const date = new Date();
      onSave({ title, text: entryText, date: date.toDateString(), time: date.toLocaleTimeString() });
      setTitle('');
      setEntryText('');
    } else {
      alert('Please fill out all fields.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={[styles.input, styles.titleInput]}
          value={title}
          onChangeText={setTitle}
          placeholder="Entry Title"
          placeholderTextColor="#A9A9A9"
        />
        <TextInput
          style={[styles.input, styles.entryInput]}
          value={entryText}
          onChangeText={setEntryText}
          placeholder="Jot your thoughts here!"
          placeholderTextColor="#A9A9A9"
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  titleInput: {
    height: 40,
  },
  entryInput: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#d3d3d3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default JournalEntryForm;
