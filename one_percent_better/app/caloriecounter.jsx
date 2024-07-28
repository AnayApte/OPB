import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

export default function App() {
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
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateListener.remove(); // Cleanup app state listener on unmount
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      loadInitialData();
    }
  };

  const loadInitialData = async () => {
    try {
      const storedCalorieGoal = await AsyncStorage.getItem('calorieGoal');
      if (storedCalorieGoal !== null) {
        setCalorieGoal(storedCalorieGoal);
      }

      const storedCaloriesEaten = await AsyncStorage.getItem('caloriesEaten');
      const storedWaterDrunk = await AsyncStorage.getItem('waterDrunk');
      const lastResetDate = await AsyncStorage.getItem('lastResetDate');
      const currentDate = new Date().toISOString().split('T')[0];

      if (storedCaloriesEaten !== null && lastResetDate === currentDate) {
        setCaloriesEaten(parseInt(storedCaloriesEaten));
      } else {
        setCaloriesEaten(0);
        await AsyncStorage.setItem('caloriesEaten', '0');
        
      }

      if (storedWaterDrunk !== null && lastResetDate === currentDate) {
        setWaterDrunk(parseInt(storedWaterDrunk));
      } else {
        setWaterDrunk(0);
        await AsyncStorage.setItem('waterDrunk', '0');
      }

      await AsyncStorage.setItem('lastResetDate', currentDate);
    } catch (error) {
      console.error(error);
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

  const resetWaterDrunk = async () => {
    setWaterDrunk(0);
    try {
      await AsyncStorage.setItem('waterDrunk', '0');
    } catch (error) {
      console.error(error);
    }
  };

  const isWithinGoal = () => {
    const goal = parseInt(calorieGoal);
    if (isNaN(goal)) return false;
    const lowerBound = goal * 0.9;
    const upperBound = goal * 1.1;
    return caloriesEaten >= lowerBound && caloriesEaten <= upperBound;
  };

  const isWithinGoal1 = () => {
    const goal = 100;
    if (isNaN(goal)) return false;
    const lowerBound = goal * 0.9;
    return waterDrunk >= lowerBound;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calorie Counter</Text>
      <View style={styles.contentContainer}>
        <Text style={[styles.quote, styles.lessBold]}>Your Calorie Goal: </Text>
        {isEditing ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Calorie Goal"
              keyboardType="numeric"
              value={calorieGoal}
              onChangeText={setCalorieGoal}
            />
            <TouchableOpacity onPress={saveCalorieGoal} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalContainer}>
            <Text style={styles.goalText}>{calorieGoal}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.button}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.calorieTrackContainer}>
        <Text style={[styles.quote, styles.lessBold]}>Calories Eaten: {caloriesEaten} </Text>
        {isAddingCalories ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add Cals"
              keyboardType="numeric"
              value={inputCalories}
              onChangeText={setInputCalories}
            />
            <TouchableOpacity onPress={addCalories} style={styles.button}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsAddingCalories(true)} style={styles.button}>
            <Text style={styles.buttonText}>Add Cals</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.quote1, styles.lessBold]}>Calories Burned: input from strong </Text>
      <Text style={[styles.quote1, styles.lessBold, isWithinGoal() ? styles.greenText : styles.redText]}>
        Total Calories for the day: {caloriesEaten}
      </Text>
      <View style={styles.waterTrackContainer1}>
        <View style={styles.waterTrackContainer}>
          <Text style={[styles.quote2, styles.lessBold, isWithinGoal1() ? styles.greenText : styles.redText]}>
            Water Drunk: {waterDrunk} oz
          </Text>
          {isAddingWater ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add Water (oz)"
                keyboardType="numeric"
                value={inputWater}
                onChangeText={setInputWater}
              />
              <TouchableOpacity onPress={addWater} style={styles.button}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsAddingWater(true)} style={styles.button1}>
              <Text style={styles.buttonText}>Add Water</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.waterBottle}>
          <Image
            source={require('./assets/water-bottle.png')} // Update this path to your water bottle image
            style={styles.waterBottleImage}
          />
          <View
            style={[
              styles.waterFill,
              { height: `${Math.min((waterDrunk / 100) * 53, 100)}%` }, // Calculate height percentage
            ]}
          />
        </View>
        <Link href="/RecipesPage" style={{ color: 'blue' }}>
        Go to Recipes
      </Link>
        <Link href="/caloriebot" style={{ color: 'blue' }}>
          Go to CalorieBot
        </Link>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple',
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'yellow',
    marginBottom: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  waterTrackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    flexDirection: 'row',
  },
  waterTrackContainer1: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  quote: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'yellow',
    textAlign: 'center',
  },
  quote1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'yellow',
    textAlign: 'center',
    marginTop: 20,
  },
  quote2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'yellow',
    textAlign: 'center',
  },
  greenText: {
    color: 'green',
  },
  redText: {
    color: 'red',
  },
  lessBold: {
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    width: 80,
    textAlign: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    marginRight: 10,
  },
  button: {
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  button1: {
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: 'purple',
    fontWeight: 'bold',
    fontSize: 10,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 18,
    color: 'yellow',
    marginRight: 10,
  },
  waterBottle: {
    position: 'relative',
    width: 100,
    height: 300,
    marginTop: 20,
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
