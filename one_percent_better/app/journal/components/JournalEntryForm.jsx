import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useTheme } from '../../ThemeContext';  // Adjust the import path as needed

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#641f1f',
  buttonText: '#F2f5ea',
  inputBackground: '#F2f5ea',
  inputText: '#641f1f',
  inputBorder: '#2c363f',
};

const JournalEntryForm = ({ entry, onSave, onCancel }) => {
  const { theme = defaultTheme } = useTheme() || {};
  const [title, setTitle] = useState('');
  const [entryText, setEntryText] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setEntryText(entry.body || '');
    }
  }, [entry]);

  const handleSave = () => {
    if (title.trim() === '' || entryText.trim() === '') {
      Alert.alert(
        'Empty Fields',
        'Both the title and entry text must be filled out before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    const date = new Date();
    onSave({ title, body: entryText, date: date.toDateString() });
    setTitle('');
    setEntryText('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TextInput
          style={[styles.input, styles.titleInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Entry Title"
          placeholderTextColor={theme.text}
        />
        <TextInput
          style={[styles.input, styles.entryInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
          value={entryText}
          onChangeText={setEntryText}
          placeholder="Jot your thoughts here!"
          placeholderTextColor={theme.text}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: theme.buttonBackground }]} onPress={handleSave}>
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Save Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: theme.secondary }]} onPress={onCancel}>
            <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    // backgroundColor is set dynamically
  },
  cancelButton: {
    // backgroundColor is set dynamically
  },
  buttonText: {
    fontSize: 16,
  },
});

export default JournalEntryForm;