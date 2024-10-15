// app/journal/index1.jsx

import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import JournalEntryForm from './JournalEntryForm.jsx';
 // Adjust path if needed

const JournalApp = () => {
  const [entries, setEntries] = useState([]);

  const handleSaveEntry = (entry) => {
    setEntries([...entries, { id: Date.now().toString(), ...entry }]);
  };

  return (
    <View style={styles.container}>
      <JournalEntryForm onSave={handleSaveEntry} />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.text}</Text>
            <Text>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  entry: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
  },
});

export default JournalApp;