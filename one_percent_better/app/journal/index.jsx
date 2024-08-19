import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../utils/AuthContext'; // Ensure this path is correct
import { SUPABASEURL, SUPABASEKEY } from '@env';

import JournalEntryForm from './components/JournalEntryForm';
import JournalEntryCard from './components/JournalEntryCard';
import BackButton from '../../utils/BackButton'; // Adjust the import path as needed

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY; // Ensure this key is correct
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const { userId } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({ title: '', body: '' }); // Ensure initialized

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching entries:', error);
        } else {
          setEntries(data || []); // Ensure `data` is not null
        }
      } catch (error) {
        console.error('Fetch entries failed:', error);
      }
    };

    if (userId) {
      fetchEntries();
    }
  }, [userId]);

  const handleSaveEntry = async (entry) => {
    try {
      console.log('Saving entry:', entry);
      if (!entry || !entry.title || !entry.text) {
        console.error('Entry is missing required fields:', entry);
        return;
      }

      if (currentEntry && currentEntry.id) {
        // Updating an existing entry
        const { data, error } = await supabase
          .from('journals')
          .update({
            title: entry.title,
            body: entry.text,
            edited: new Date().toISOString(),
          })
          .eq('id', currentEntry.id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating entry:', error);
        } else {
          setEntries((prevEntries) =>
            prevEntries.map((item) => (item.id === currentEntry.id ? data[0] : item))
          );
        }
      } else {
        // Inserting a new entry
        const { data, error } = await supabase
          .from('journals')
          .insert([{
            title: entry.title,
            body: entry.text,
            date: new Date().toISOString(),
            user_id: userId,
          }]);

        if (error) {
          console.error('Error inserting entry:', error);
        } else {
          setEntries((prevEntries) => [data[0], ...prevEntries]);
        }
      }
    } catch (error) {
      console.error('Save entry failed:', error);
    } finally {
      setModalVisible(false);
      setCurrentEntry({ title: '', body: '' });
    }
  };

  const handleEditEntry = (entry) => {
    console.log('Editing entry:', entry);
    setCurrentEntry(entry || { title: '', body: '' });
    setModalVisible(true);
  };

  const handleDeleteEntry = async (id) => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting entry:', error);
      } else {
        setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      }
    } catch (error) {
      console.error('Delete entry failed:', error);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setCurrentEntry({ title: '', body: '' });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <BackButton destination="/home" />

        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={() => {
            setCurrentEntry({ title: '', body: '' }); // Ensure initialized
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
                  entry={currentEntry || { title: '', body: '' }} // Ensure entry is not null
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
          keyExtractor={(item) => item.id.toString()}
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
