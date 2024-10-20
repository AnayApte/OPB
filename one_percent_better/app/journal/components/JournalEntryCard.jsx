import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../ThemeContext';  // Adjust the import path as needed

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#641f1f',
  buttonText: '#f2f5ea',
  border: '#D3D3D3',  // Light gray color for the border
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
    <View style={[styles.entry, { backgroundColor: theme.background,   borderColor: theme.border, borderBottomColor: theme.primary }]}>
      <TouchableOpacity onPress={() => onEdit(entry)}>
        <Text style={[styles.title, { color: theme.primary }]}>{entry.title}</Text>
      </TouchableOpacity>
      <Text style={{ color: theme.text }}>Post made at {entry.date}</Text>
      {entry.edited && <Text style={[styles.editedAt, { color: theme.text }]}>Last viewed on {entry.edited}</Text>}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={() => onEdit(entry)}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>View/Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={handleDelete}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  entry: {
    padding: 10,
    borderWidth: 3,  // Add border width
    borderRadius: 8,  // Add border radius for rounded corners
    marginBottom: 10,
    shadowColor: "#000",  // Add shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  editedAt: {
    fontStyle: 'italic',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default JournalEntryCard;