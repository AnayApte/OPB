import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';

const JournalEntryForm = ({ onSave }) => {
  const [entryText, setEntryText] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toDateString()); // Default to today's date

  const handleSave = () => {
    if (title.trim() && entryText.trim()) {
      onSave({ title, text: entryText, date });
      setTitle('');
      setEntryText('');
      setDate(new Date().toDateString()); // Reset to today's date after saving
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Journal Entry</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={styles.input}
        value={entryText}
        onChangeText={setEntryText}
        placeholder="Write your journal entry here..."
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <TextInput
        style={styles.dateInput}
        value={date}
        onChangeText={setDate}
        placeholder="Date (YYYY-MM-DD)"
      />
      <Button title="Save Entry" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  dateInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
});

export default JournalEntryForm;
