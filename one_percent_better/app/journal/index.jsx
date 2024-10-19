import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import { Appbar, Button, Card, Text, Modal, Portal } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';
import JournalEntryForm from './components/JournalEntryForm';
import JournalEntryCard from './components/JournalEntryCard';

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const defaultTheme = {
  background: '#f2e2fb',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function JournalContent() {
  const { userId } = useAuth();
  const router = useRouter();
  const { theme = defaultTheme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({ title: '', body: '' });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
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
          const formattedEntries = data.map((entry) => ({
            ...entry,
            date: formatTimestamp(entry.date),
            edited: entry.edited ? formatTimestamp(entry.edited) : null,
          }));
          setEntries(formattedEntries);
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
    <SafeAreaView style={[styles.container, { backgroundColor: defaultTheme.background }]}>
      <Appbar.Header style = { {backgroundColor: defaultTheme.background } }>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content  title="Journal" />
      </Appbar.Header>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.title, { color: defaultTheme.primary }]}>Welcome to Your Journal</Text>
              <Text style={[styles.description, { color: theme.text }]}>
                Capture your thoughts, feelings, and experiences. Journaling is a powerful tool for self-reflection and personal growth.
              </Text>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() => {
              setCurrentEntry({ title: '', body: '' });
              setModalVisible(true);
            }}
            style={styles.newEntryButton}
            buttonColor={defaultTheme.buttonBackground}
          >
            New Entry
          </Button>

          <Text style={[styles.entriesTitle, { color: defaultTheme.primary }]}>Your previous entries:</Text>
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
            ListEmptyComponent={() => <Text style={[styles.empty, { color: theme.text }]}>No entries yet</Text>}
          />

          <Portal>
            <Modal visible={isModalVisible} onDismiss={handleCancel} contentContainerStyle={styles.modalContainer}>
              <JournalEntryForm
                entry={currentEntry || { title: '', body: '' }}
                onSave={handleSaveEntry}
                onCancel={handleCancel}
              />
            </Modal>
          </Portal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  newEntryButton: {
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

export default function Journal() {
  return (
    <ThemeProvider>
      <JournalContent />
    </ThemeProvider>
  );
}