import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const JournalEntryCard = ({ entry, onEdit, onDelete }) => {

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => onDelete(entry.id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.entry}>
      <TouchableOpacity onPress={() => onEdit(entry)}>
        <Text style={styles.title}>{entry.title}</Text>
      </TouchableOpacity>
      <Text>{entry.date} at {entry.time}</Text>
      {entry.editedAt && <Text style={styles.editedAt}>Edited at: {entry.editedAt}</Text>}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => onEdit(entry)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  entry: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  editedAt: {
    color: 'gray',
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
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default JournalEntryCard;
