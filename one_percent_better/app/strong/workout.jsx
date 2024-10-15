// app/strong/workout.jsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { formatTime, calculateOneRepMax, formatExerciseName } from '../../utils/helpers';
import { useAuth } from '../../utils/AuthContext';
import 'react-native-get-random-values';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Appbar, TextInput, Button, Card, Title, Paragraph, Dialog, Portal } from 'react-native-paper';

export default function Workout() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.log('error', error);
    else setExercises(data);
  };

  const addExercise = async () => {
    if (newExercise) {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{ name: newExercise, user_id: user.id }])
        .select();

      if (error) console.log('error', error);
      else {
        setExercises([...exercises, data[0]]);
        setNewExercise('');
      }
    }
  };

  const addSet = async () => {
    if (selectedExercise && weight && reps) {
      const { data, error } = await supabase
        .from('sets')
        .insert([
          {
            exercise_id: selectedExercise.id,
            weight: parseFloat(weight),
            reps: parseInt(reps),
            user_id: user.id,
          },
        ]);

      if (error) console.log('error', error);
      else {
        setDialogVisible(false);
        setWeight('');
        setReps('');
      }
    }
  };

  const renderExerciseItem = ({ item }) => (
    <Card style={styles.exerciseCard} onPress={() => {
      setSelectedExercise(item);
      setDialogVisible(true);
    }}>
      <Card.Content>
        <Title>{formatExerciseName(item.name)}</Title>
        <Paragraph>Tap to add a set</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <ThemeProvider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Workout" />
        </Appbar.Header>
        <View style={styles.content}>
          <TextInput
            label="New Exercise"
            value={newExercise}
            onChangeText={setNewExercise}
            style={styles.input}
          />
          <Button mode="contained" onPress={addExercise} style={styles.button}>
            Add Exercise
          </Button>
          <FlatList
            data={exercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
          />
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => 
            setDialogVisible(false)}>
            <Dialog.Title>Add Set</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label="Reps"
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
              <Button onPress={addSet}>Add</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ThemeProvider>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  exerciseCard: {
    marginBottom: 8,
  },
});