import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import JournalEntryForm from './components/JournalEntryForm';
import JournalEntryCard from './components/JournalEntryCard';

const App = () => {
  const [entries, setEntries] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  const handleSaveEntry = (entry) => {
    if (currentEntry) {
      const date = new Date();
      setEntries((prevEntries) =>
        prevEntries.map((item) =>
          item.id === currentEntry.id
            ? { ...item, ...entry, editedAt: `${date.toDateString()} at ${date.toLocaleTimeString()}` }
            : item
        )
      );
    } else {
      setEntries((prevEntries) => [{ id: Date.now().toString(), ...entry }, ...prevEntries]);
    }
    setModalVisible(false);
    setCurrentEntry(null);
  };

  const handleEditEntry = (entry) => {
    setCurrentEntry(entry);
    setModalVisible(true);
  };

  const handleDeleteEntry = (id) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const handleCancel = () => {
    setModalVisible(false);
    setCurrentEntry(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={() => {
            setCurrentEntry(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.newEntryButtonText}>New Entry</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={handleCancel}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <JournalEntryForm
                  entry={currentEntry}
                  onSave={handleSaveEntry}
                  onCancel={handleCancel}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Text style={styles.entriesTitle}>Here are your old entries</Text>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          )}
          ListEmptyComponent={() => <Text style={styles.empty}>No entries yet</Text>}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  newEntryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  newEntryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  empty: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
});

export default App;
 