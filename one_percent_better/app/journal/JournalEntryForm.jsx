import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#641f1f',
  buttonText: '#f2f5ea',
  inputBackground: 'white',
  inputText: 'black',
  inputBorder: 'yellow',
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}>{'\n'}</Text>
      <Text style={{ color: theme.text }}>{'\n'}</Text>
      <Text style={[styles.title, { color: theme.text }]}>New Journal Entry</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme.text}
      />
      <TextInput
        style={[styles.input, styles.multilineInput, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
        value={entryText}
        onChangeText={setEntryText}
        placeholder="Write your journal entry here..."
        placeholderTextColor={theme.text}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={handleSave}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Save Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondary }]} onPress={onCancel}>
          <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between', 
   
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  multilineInput: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default (props) => (
  <ThemeProvider>
    <JournalEntryForm {...props} />
  </ThemeProvider>
);
