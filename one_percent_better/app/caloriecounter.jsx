import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../utils/AuthContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';
import { ThemeProvider, useTheme } from './ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, TextInput, Button, Card, Text } from 'react-native-paper';
import { Flame, UtensilsCrossed } from 'lucide-react-native';
import { Animated } from 'react-native'; // Import Animated from React Native

// Inside your component



const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
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
  const waterFillHeight = Math.min((waterDrunk / 100) * 100, 100); // Fill percentage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
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

      await calculateCalorieGoal();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const calculateCalorieGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('weight, height, age, gender, activity_level, lose_weight, gain_weight, weeks')
        .eq('userId', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      const heightCm = data.height * 2.54;
      const weightKg = data.weight * 0.453592;

      let bmr;
      if (data.gender === 'Male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
      } else if (data.gender === 'Female') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
      } else {
        const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
        const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
        bmr = (maleBmr + femaleBmr) / 2;
      }

      let tdee;
      switch (data.activity_level) {
        case 'Sedentary':
          tdee = bmr * 1.2;
          break;
        case 'Lightly Active':
          tdee = bmr * 1.375;
          break;
        case 'Moderately Active':
          tdee = bmr * 1.55;
          break;
        case 'Very Active':
          tdee = bmr * 1.725;
          break;
        default:
          tdee = bmr * 1.2;
      }

      let goal;
      if (data.lose_weight > 0) {
        const deficit = (data.lose_weight * 3500) / (data.weeks * 7);
        goal = tdee - deficit;
      } else if (data.gain_weight > 0) {
        const surplus = (data.gain_weight * 3500) / (data.weeks * 7);
        goal = tdee + surplus;
      } else {
        goal = tdee;
      }

      setCalorieGoal(Math.round(goal).toString());
      await AsyncStorage.setItem('calorieGoal', Math.round(goal).toString());
    } catch (error) {
      console.error('Error calculating calorie goal:', error);
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

  const NavButton = ({ label, onPress, icon: Icon }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.navButton}
      >
        <View style={[
          styles.navButtonInner,
          isPressed && styles.navButtonPressed
        ]}>
          <Icon size={24} color={defaultTheme.buttonText} />
          <Text style={styles.navButtonText}>{label}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary} />
        <Appbar.Content
          title="Calorie Gallery"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollViewContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: defaultTheme.background }]}>Your Calorie Goal</Text>
            <Text style={[styles.goalText, { color: defaultTheme.background }]}>{calorieGoal}</Text>
          </Card.Content>
        </Card>

        <View style={styles.rowContainer}>
          <Card style={[styles.card, styles.halfCard]}>
            <Card.Content style={styles.cardContent}>
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

          <Card style={[styles.card, styles.halfCard]}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.subtitle, { color: theme.primary }]}>Calories Burned: {caloriesBurned}</Text>
              <Text style={[styles.subtitle, { color: isWithinGoal() ? 'green' : 'red' }]}>
                Total Calories: {caloriesEaten - caloriesBurned}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.subtitle, { color: isWithinWaterGoal() ? 'green' : 'red' }]}>
              Water Drunk: {waterDrunk} out of 90 oz
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
            <View style={styles.waterBottleContainer}>
              <View style={styles.waterBottle}>
                {/* The water fill section */}
                <View
                  style={[
                    styles.waterFill,
                    { height: `${Math.min((waterDrunk / 90) * 100, 100)}%` },
                  ]}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.navContainer}>
          <NavButton
            label="Recipes"
            onPress={() => router.push('/RecipesPage')}
            icon={UtensilsCrossed}
          />
          <NavButton
            label="CalorieBot"
            onPress={() => router.push('/caloriebot')}
            icon={Flame}
          />
        </View>
      </ScrollView>

    </View  >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: defaultTheme.background,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: defaultTheme.primary,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: defaultTheme.buttonBackground,
    elevation: 0,
    shadowOpacity: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: defaultTheme.background,
    fontColor: defaultTheme.primary,
  },
  goalText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waterBottleContainer: {
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center container
    marginTop: 20,
  },

  waterBottle: {
    width: 150, // Adjust width for proper size
    height: 300, // Height for a tall water bottle
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderWidth: 5, // Bold border
    borderColor: 'black', // Color for the border (use any color that fits your theme)
    borderBottomLeftRadius: 20, // Rounded bottom-left corner
    borderBottomRightRadius: 20, // Rounded bottom-right corner
    borderTopLeftRadius: 0, // No rounding on the top-left corner
    borderTopRightRadius: 0, // No rounding on the top-right corner
    overflow: 'hidden', // Ensure the fill doesn't overflow the container
    backgroundColor: '#F3E5F5', // Optional: Add background color to make the container stand out
  },

  waterBottleImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },

  waterFill: {
    position: 'absolute',
    bottom: 0, // Start filling from the bottom
    width: '100%', // Slight padding from the bottle edges
    backgroundColor: 'rgba(0, 122, 255, 0.5)', // Light blue water fill
    borderRadius: 5, // Smooth corners for the water fill
    zIndex: 0,
  },


  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  cardContent: {
    minHeight: 120,
    justifyContent: 'space-between',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  navButton: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
  },
  navButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: defaultTheme.buttonBackground,
    borderRadius: 8,
  },
  navButtonPressed: {
    backgroundColor: defaultTheme.text,
    transform: [{ scale: 0.95 }],
  },
  navButtonText: {
    color: defaultTheme.buttonText,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
});

export default function CalorieCounter() {
  return (
    <ThemeProvider>
      <CalorieCounterContent />
    </ThemeProvider>
  );
}