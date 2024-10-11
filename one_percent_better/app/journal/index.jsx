import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import { format } from 'date-fns';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';

import JournalEntryForm from './components/JournalEntryForm';
import JournalEntryCard from './components/JournalEntryCard';
import BackButton from '../../utils/BackButton';

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const { userId } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({ title: '', body: '' }); // Ensure initialized

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
  
    // Manually construct the formatted date
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' }); // 'August'
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  
    // Format: 'Published on: 19 August 2024, 12:34 PM'
    return `${day} ${month} ${year} at ${formattedHours}:${minutes} ${ampm}`;
  };  

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
          // Format the timestamps immediately after fetching
          const formattedEntries = data.map((entry) => ({
            ...entry,
            date: formatTimestamp(entry.date),
            edited: entry.edited ? formatTimestamp(entry.edited) : null,
          }));
          setEntries(formattedEntries); // Set the formatted entries
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
      if (!entry || !entry.title || !entry.body) {
        console.error('Entry is missing required fields:', entry);
        return;
      }

      if (currentEntry && currentEntry.id) {
        const { error } = await supabase
          .from('journals')
          .update({
            title: entry.title,
            body: entry.body,
            edited: new Date().toISOString(),
          })
          .eq('id', currentEntry.id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating entry:', error);
          return;
        }
      } else {
        const { error } = await supabase
          .from('journals')
          .insert([{
            title: entry.title,
            body: entry.body,
            date: new Date().toISOString(),
            user_id: userId,
          }]);

        if (error) {
          console.error('Error inserting entry:', error);
          return;
        }
      }

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching entries after save:', error);
      } else {
        const formattedEntries = data.map((entry) => ({
          ...entry,
          date: formatTimestamp(entry.date),
          edited: entry.edited ? formatTimestamp(entry.edited) : null,
        }));
        setEntries(formattedEntries);
      }

    } catch (error) {
      console.error('Save entry failed:', error);
    } finally {
      setModalVisible(false);
      setCurrentEntry({ title: '', body: '' });
    }
  };

  const handleEditEntry = (entry) => {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffb5c6' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
        <Text>{'\n'}</Text>
          <BackButton destination="/home" />

          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={() => {
              setCurrentEntry({ title: '', body: '' });
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
                    entry={currentEntry || { title: '', body: '' }}
                    onSave={handleSaveEntry}
                    onCancel={handleCancel}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Text style={styles.entriesTitle}>Your previous entries:</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffb5c6',
  },
  newEntryButton: {
    backgroundColor: '#641f1f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 25,
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