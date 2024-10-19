import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useTheme } from '../../ThemeContext';

const theme = {
  background: '#f2e2fb',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const JournalEntryForm = ({ entry, onSave, onCancel }) => {
  
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
      alert('Both the title and entry text must be filled out before saving.');
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
        <Text style={[styles.title, { color: theme.primary }]}>New Journal Entry</Text>
        <TextInput
          style={styles.input}
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          outlineColor={theme.primary}
          activeOutlineColor={theme.primary}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          label="Write your journal entry here..."
          value={entryText}
          onChangeText={setEntryText}
          multiline
          numberOfLines={6}
          mode="outlined"
          outlineColor={theme.primary}
          activeOutlineColor={theme.primary}
        />
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            buttonColor={theme.buttonBackground}
            textColor={theme.buttonText}
          >
            Save Entry
          </Button>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.button}
            buttonColor={theme.secondary}
            textColor={theme.primary}
          >
            Cancel
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  multilineInput: {
    height: 150,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default JournalEntryForm;