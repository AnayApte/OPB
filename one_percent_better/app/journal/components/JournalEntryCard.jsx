// app/journal/components/JournalEntryCard.jsx

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { useTheme } from '../../ThemeContext';  // Adjust the import path as needed

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const JournalEntryCard = ({ entry, onEdit, onDelete }) => {
  const { theme = defaultTheme } = useTheme() || {};

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(entry.id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.background }]}>
      <Card.Content>
        <Text style={[styles.title, { color: defaultTheme.buttonBackground }]}>{entry.title}</Text>
        <Text style={[styles.date, { color: theme.text }]}>Created: {entry.date}</Text>
        {entry.edited && (
          <Text style={[styles.editedAt, { color: theme.text }]}>Last edited: {entry.edited}</Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => onEdit(entry)}
          style={styles.button}
          buttonColor={theme.buttonBackground}
          textColor={theme.buttonText}
        >
          View/Edit
        </Button>
        <IconButton
          icon="delete"
          iconColor={theme.primary}
          size={20}
          onPress={handleDelete}
        />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  editedAt: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  button: {
    marginRight: 8,
  },
});

export default JournalEntryCard;