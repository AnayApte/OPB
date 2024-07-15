import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [calorieGoal, setCalorieGoal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [inputCalories, setInputCalories] = useState('');
  const [isAddingCalories, setIsAddingCalories] = useState(false);

  useEffect(() => {
    loadCalorieGoal();
    loadCaloriesEaten();
  }, []);

  const loadCalorieGoal = async () => {
    try {
      const storedCalorieGoal = await AsyncStorage.getItem('calorieGoal');
      if (storedCalorieGoal !== null) {
        setCalorieGoal(storedCalorieGoal);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadCaloriesEaten = async () => {
    try {
      const storedCaloriesEaten = await AsyncStorage.getItem('caloriesEaten');
      const lastResetDate = await AsyncStorage.getItem('lastResetDate');
      const currentDate = new Date().toISOString().split('T')[0];

      if (storedCaloriesEaten !== null && lastResetDate === currentDate) {
        setCaloriesEaten(parseInt(storedCaloriesEaten));
      } else {
        setCaloriesEaten(0);
        await AsyncStorage.setItem('lastResetDate', currentDate);
      }
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

  const isWithinGoal = () => {
    const goal = parseInt(calorieGoal);
    if (isNaN(goal)) return false;
    const lowerBound = goal * 0.9;
    const upperBound = goal * 1.1;
    return caloriesEaten >= lowerBound && caloriesEaten <= upperBound;
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
      <StatusBar style="auto" />
      <Text style={[styles.quote1, styles.lessBold]}>Calories Burned: input from strong </Text>
      <Text style={[styles.quote1, styles.lessBold, isWithinGoal() ? styles.greenText : styles.redText]}>
        Total Calories for the day: {caloriesEaten}
      </Text>
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
});

