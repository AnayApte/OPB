import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, TextInput, Button, Card, Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
  select:'#9b6fab'
};

function ProfileContent() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [weightGoal, setWeightGoal] = useState('maintain');
  const [weightChange, setWeightChange] = useState('');
  const [weeks, setWeeks] = useState('');
  const router = useRouter();
  const { theme = defaultTheme } = useTheme() || {};

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        
        if (!userId) {
          console.error('No user ID found. Unable to fetch profile data.');
          return;
        }
  
        const { data, error } = await supabase
          .from('users')
          .select('weight, height, age, gender, activity_level, lose_weight, gain_weight, weeks')
          .eq('userId', userId)
          .single();
  
        if (error) {
          console.error('Error fetching user profile:', error.message);
          return;
        }
  
        if (data) {
          setWeight(data.weight ? data.weight.toString() : '');
          setHeight(data.height ? data.height.toString() : '');
          setAge(data.age ? data.age.toString() : '');
          setGender(data.gender || '');
          setActivityLevel(data.activity_level || '');
          if (data.lose_weight > 0) {
            setWeightGoal('lose');
            setWeightChange(data.lose_weight.toString());
          } else if (data.gain_weight > 0) {
            setWeightGoal('gain');
            setWeightChange(data.gain_weight.toString());
          } else {
            setWeightGoal('maintain');
          }
          setWeeks(data.weeks ? data.weeks.toString() : '');
        }
      } catch (error) {
        console.error('Unexpected error fetching profile data:', error);
      }
    };
  
    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
  
      if (!userId) {
        console.error('No user ID found. Unable to update profile.');
        return;
      }
  
      const updateData = {
        weight,
        height,
        age,
        gender,
        activity_level: activityLevel,
        lose_weight: weightGoal === 'lose' ? parseFloat(weightChange) : 0,
        gain_weight: weightGoal === 'gain' ? parseFloat(weightChange) : 0,
        weeks: weightGoal !== 'maintain' ? parseInt(weeks) : 0
      };
  
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('userId', userId);
  
      if (error) {
        console.error('Error updating user profile:', error.message);
        return;
      }
  
      await SecureStore.setItemAsync('userId', userId);
  
      console.log('Profile updated successfully');
  
      router.replace('/home');
    } catch (error) {
      console.error('Unexpected error during profile update:', error);
    }
  };

  const NavButton = ({ icon, label, onPress, style }) => {
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
            size={24} 
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
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary}/>
        <Appbar.Content title="Profile" titleStyle={styles.headerTitle}/>
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: defaultTheme.background }]}>Complete Your Profile</Text>
            <Text style={[styles.description, { color: defaultTheme.background }]}>
              Provide your information to personalize your experience and get the most out of your experience.
            </Text>
            <TextInput
              style={styles.input}
              label="Weight (lbs)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              mode="outlined"
            />
            <TextInput
              style={styles.input}
              label="Height (in)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              mode="outlined"
            />
            <TextInput
              style={styles.input}
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              mode="outlined"
            />
            <Text style={[styles.label, { color: defaultTheme.background }]}>Gender:</Text>
            <SegmentedButtons
              value={gender}
              onValueChange={setGender}
              buttons={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'N/A', label: 'Prefer Not to Say' },
              ]}
              style={styles.segmentedButtons}
            />
            <Text style={[styles.label, { color: defaultTheme.background }]}>Activity Level:</Text>
            <SegmentedButtons
              value={activityLevel}
              onValueChange={setActivityLevel}
              buttons={[
                { value: 'Sedentary', label: 'Sedentary' },
                { value: 'Lightly Active', label: 'Light' },
                { value: 'Moderately Active', label: 'Moderate' },
                { value: 'Very Active', label: 'Very' },
              ]}
              style={styles.segmentedButtons}
            />
            <Text style={[styles.label, { color: defaultTheme.background}]}>Weight Goal:</Text>
            <View style={styles.weightGoalContainer}>
              <Text style={styles.weightGoalText}>I want to</Text>
              <SegmentedButtons
                value={weightGoal}
                onValueChange={setWeightGoal}
                buttons={[
                  { value: 'gain', label: 'Gain' },
                  { value: 'lose', label: 'Lose' },
                  { value: 'maintain', label: 'Maintain' },
                ]}
                style={styles.weightGoalButtons}
                
              />
            </View>
            {weightGoal !== 'maintain' && (
              <View style={styles.weightChangeContainer}>
                <TextInput
                  style={styles.weightChangeInput}
                  label="lbs"
                  value={weightChange}
                  onChangeText={setWeightChange}
                  keyboardType="numeric"
                  mode="outlined"
                  disabled={weightGoal === 'maintain'}
                />
                <Text style={styles.inText}>lbs in</Text>
                <TextInput
                  style={styles.weeksInput}
                  label="weeks"
                  value={weeks}
                  onChangeText={setWeeks}
                  keyboardType="numeric"
                  mode="outlined"
                  disabled={weightGoal === 'maintain'}
                />
                <Text style={styles.weeksText}>weeks</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
      <NavButton 
        icon="content-save" 
        label="Save Profile"
        onPress={handleSaveProfile}
        style={styles.saveButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultTheme.background,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  card: {
    marginBottom: 4,
    backgroundColor: defaultTheme.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  weightGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weightGoalText: {
    marginRight: 8,
    fontColor: defaultTheme.background,
  },
  weightGoalButtons: {
    flex: 1,
  },
  weightChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weightChangeInput: {
    flex: 1,
    marginRight: 8,
  },
  inText: {
    marginHorizontal: 8,
  },
  weeksInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  weeksText: {
    marginLeft: 4,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: defaultTheme.primary,
  },
  navButton: {
    backgroundColor: defaultTheme.buttonBackground,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  navButtonPressed: {
    backgroundColor: defaultTheme.primary,
    transform: [{ scale: 0.95 }],
  },
  navButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: defaultTheme.buttonText,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButtonTextPressed: {
    color: defaultTheme.background,
  },
  saveButton: {
    marginTop: 4,
  },
});

export default function Profile() {
  return (
    <ThemeProvider>
      <ProfileContent />
    </ThemeProvider>
  );
}