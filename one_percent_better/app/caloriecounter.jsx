import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { ThemeProvider, useTheme } from './ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, TextInput, Button, Card, Text } from 'react-native-paper';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function CalorieCounterContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const [calorieGoal, setCalorieGoal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [inputCalories, setInputCalories] = useState('');
  const [isAddingCalories, setIsAddingCalories] = useState(false);
  const [waterDrunk, setWaterDrunk] = useState(0);
  const [inputWater, setInputWater] = useState('');
  const [isAddingWater, setIsAddingWater] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const storedCalorieGoal = await AsyncStorage.getItem('calorieGoal');
      if (storedCalorieGoal !== null) {
        setCalorieGoal(storedCalorieGoal);
      }
  
      const currentDate = new Date().toISOString().split('T')[0];
      const lastResetDate = await AsyncStorage.getItem('lastResetDate');
  
      if (lastResetDate !== currentDate) {
        await AsyncStorage.setItem('lastResetDate', currentDate);
        await AsyncStorage.setItem('caloriesEaten', '0');
        await AsyncStorage.setItem('waterDrunk', '0');
        setCaloriesEaten(0);
        setWaterDrunk(0);
      } else {
        const storedCaloriesEaten = await AsyncStorage.getItem('caloriesEaten');
        const storedWaterDrunk = await AsyncStorage.getItem('waterDrunk');
        setCaloriesEaten(parseInt(storedCaloriesEaten) || 0);
        setWaterDrunk(parseInt(storedWaterDrunk) || 0);
      }
  
      const startOfToday = `${currentDate}T00:00:00.000Z`;
      const endOfToday = `${currentDate}T23:59:59.999Z`;
  
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('duration')
        .eq('userId', userId)
        .gte('date', startOfToday)
        .lte('date', endOfToday);
  
      if (error) {
        console.error('Error fetching workouts:', error);
        return;
      }
  
      const totalDurationInHours = workouts.reduce((total, workout) => {
        const [hours, minutes, seconds] = workout.duration.split(':').map(Number);
        return total + hours + minutes / 60 + seconds / 3600;
      }, 0);
  
      const caloriesBurned = Math.round(totalDurationInHours * 400);
      setCaloriesBurned(caloriesBurned);
  
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const saveCalorieGoal = async () => {
    try {
      await AsyncStorage.setItem('calorieGoal', calorieGoal);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const addCalories = async () => {
    if (!isNaN(parseInt(inputCalories))) {
      const newCaloriesEaten = caloriesEaten + parseInt(inputCalories);
      setCaloriesEaten(newCaloriesEaten);
      setInputCalories('');
      try {
        await AsyncStorage.setItem('caloriesEaten', newCaloriesEaten.toString());
        setIsAddingCalories(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const addWater = async () => {
    if (!isNaN(parseInt(inputWater))) {
      const newWaterDrunk = waterDrunk + parseInt(inputWater);
      setWaterDrunk(newWaterDrunk);
      setInputWater('');
      try {
        await AsyncStorage.setItem('waterDrunk', newWaterDrunk.toString());
        setIsAddingWater(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const isWithinGoal = () => {
    const goal = parseInt(calorieGoal);
    if (isNaN(goal)) return false;
    const lowerBound = goal * 0.9;
    const upperBound = goal * 1.1;
    return caloriesEaten >= lowerBound && caloriesEaten <= upperBound;
  };

  const isWithinWaterGoal = () => {
    const goal = 100;
    if (isNaN(goal)) return false;
    const lowerBound = goal * 0.9;
    return waterDrunk >= lowerBound;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Calorie Counter" />
      </Appbar.Header>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: theme.primary }]}>Your Calorie Goal</Text>
            {isEditing ? (
              <View>
                <TextInput
                  style={styles.input}
                  label="Enter Calorie Goal"
                  value={calorieGoal}
                  onChangeText={setCalorieGoal}
                  keyboardType="numeric"
                  mode="outlined"
                />
                <Button mode="contained" onPress={saveCalorieGoal} style={styles.button}>
                  Save
                </Button>
              </View>
            ) : (
              <View style={styles.goalContainer}>
                <Text style={[styles.goalText, { color: theme.text }]}>{calorieGoal}</Text>
                <Button mode="contained" onPress={() => setIsEditing(true)} style={styles.button}>
                  Edit
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.subtitle, { color: theme.primary }]}>Calories Eaten: {caloriesEaten}</Text>
            {isAddingCalories ? (
              <View>
                <TextInput
                  style={styles.input}
                  label="Add Calories"
                  value={inputCalories}
                  onChangeText={setInputCalories}
                  keyboardType="numeric"
                  mode="outlined"
                />
                <Button mode="contained" onPress={addCalories} style={styles.button}>
                  Add
                </Button>
              </View>
            ) : (
              <Button mode="contained" onPress={() => setIsAddingCalories(true)} style={styles.button}>
                Add Calories
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.subtitle, { color: theme.primary }]}>Calories Burned: {caloriesBurned}</Text>
            <Text style={[styles.subtitle, { color: isWithinGoal() ? 'green' : 'red' }]}>
              Total Calories for the day: {caloriesEaten - caloriesBurned}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.subtitle, { color: isWithinWaterGoal() ? 'green' : 'red' }]}>
              Water Drunk: {waterDrunk} oz
            </Text>
            {isAddingWater ? (
              <View>
                <TextInput
                  style={styles.input}
                  label="Add Water (oz)"
                  value={inputWater}
                  onChangeText={setInputWater}
                  keyboardType="numeric"
                  mode="outlined"
                />
                <Button mode="contained" onPress={addWater} style={styles.button}>
                  Add
                </Button>
              </View>
            ) : (
              <Button mode="contained" onPress={() => setIsAddingWater(true)} style={styles.button}>
                Add Water
              </Button>
            )}
            <View style={styles.waterBottle}>
              <Image
                source={require('./water-bottle.png')}
                style={styles.waterBottleImage}
              />
              <View
                style={[
                  styles.waterFill,
                  { height: `${Math.min((waterDrunk / 100) * 53, 100)}%` },
                ]}
              />
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={() => router.push('/RecipesPage')} style={styles.button}>
          Go to Recipes
        </Button>
        <Button mode="contained" onPress={() => router.push('/caloriebot')} style={styles.button}>
          Go to CalorieBot
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 18,
  },
  waterBottle: {
    position: 'relative',
    width: 100,
    height: 300,
    marginTop: 20,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  waterBottleImage: {
    position: 'absolute',
    width: '90%',
    height: '100%',
  },
  waterFill: {
    position: 'absolute',
    bottom: 80,
    width: '80%',
    backgroundColor: 'blue',
    opacity: 0.4,
  },
});

export default function CalorieCounter() {
  return (
    <ThemeProvider>
      <CalorieCounterContent />
    </ThemeProvider>
  );
}