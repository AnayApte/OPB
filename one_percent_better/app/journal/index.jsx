import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableWithoutFeedback, Keyboard, SafeAreaView, Platform, StatusBar, Pressable } from 'react-native';
import { Appbar, Card, Text, Modal, Portal } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';
import JournalEntryForm from './components/JournalEntryForm';
import JournalEntryCard from './components/JournalEntryCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
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
    Keyboard.dismiss();
    setModalVisible(false);
    setCurrentEntry({ title: '', body: '' });
  };

  const NavButton = ({ icon, label, onPress, style, iconSize = 24 }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => {
          setIsPressed(false);
          onPress();
        }}
        style={({ pressed }) => [
          styles.navButton,
          style,
          isPressed && styles.navButtonPressed
        ]}
      >
        <View style={styles.navButtonInner}>
          <MaterialCommunityIcons 
            name={icon} 
            size={iconSize} 
            color={isPressed ? defaultTheme.background : defaultTheme.buttonText} 
          />
          <Text style={[
            styles.navButtonText,
            isPressed && styles.navButtonTextPressed
          ]}>{label}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: defaultTheme.background }]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary} />
        <Appbar.Content 
          title="Journey Jotter" 
          titleStyle={styles.headerTitle}
          color={defaultTheme.primary}
        />
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={[styles.card, {backgroundColor: defaultTheme.primary}]}>
          <Card.Content>
            <Text style={[styles.title, { color: defaultTheme.background }]}>Welcome to your Journey Jotter</Text>
            <Text style={[styles.description, { color: defaultTheme.background }]}>
              Capture your thoughts, feelings, and experiences. Journaling is a powerful tool for self-reflection and personal growth!
            </Text>
          </Card.Content>
        </Card>

        <NavButton
          icon="plus"
          label="New Entry"
          onPress={() => {
            setCurrentEntry({ title: '', body: '' });
            setModalVisible(true);
          }}
          style={styles.newEntryButton}
        />

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
          ListEmptyComponent={() => <Text style={[styles.empty, { color: defaultTheme.text }]}>No entries yet</Text>}
          contentContainerStyle={styles.entriesContent}
        />
      </View>

      <Portal>
        <Modal 
          visible={isModalVisible} 
          onDismiss={handleCancel} 
          contentContainerStyle={styles.modalContainer}
        >
          <JournalEntryForm
            entry={currentEntry || { title: '', body: '' }}
            onSave={handleSaveEntry}
            onCancel={handleCancel}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    height: 56,
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: -16,
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
    width: '100%',
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entriesContent: {
    flexGrow: 1,
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
  navButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: defaultTheme.buttonBackground,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonPressed: {
    backgroundColor: defaultTheme.text,
    transform: [{ scale: 0.95 }], 
  },
  navButtonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: defaultTheme.buttonText,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold', 
  },
  navButtonTextPressed: {
    color: defaultTheme.background,
  },
});

export default function Journal() {
  return (
    <ThemeProvider>
      <JournalContent />
    </ThemeProvider>
  );
}