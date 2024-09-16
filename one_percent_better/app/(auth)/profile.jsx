import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../ThemeContext';

export default function ProfileCompletion() {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null); // null means no selection yet
  const router = useRouter();
  const { theme } = useTheme(); 

  useEffect(() => {
    // Fetch existing profile data if any
    const fetchProfileData = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        
        if (!userId) {
          console.error('No user ID found. Unable to fetch profile data.');
          // You might want to redirect to login here
          return;
        }
  
        const { data, error } = await supabase
          .from('users')
          .select('weight, age, gender')
          .eq('userId', userId)
          .single();
  
        if (error) {
          console.error('Error fetching user profile:', error.message);
          return;
        }
  
        if (data) {
          setWeight(data.weight ? data.weight.toString() : '');
          setAge(data.age ? data.age.toString() : '');
          setGender(data.gender);
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
        // You might want to redirect to login here
        return;
      }
  
      // Update the user's profile with the additional data
      const { data, error } = await supabase
        .from('users')
        .update({ weight: weight, age: age, gender: gender })
        .eq('userId', userId);
  
      if (error) {
        console.error('Error updating user profile:', error.message);
        return;
      }
  
      // After successfully updating the profile, set the userId in SecureStore again
      await SecureStore.setItemAsync('userId', userId);
  
      console.log('Profile updated successfully');
  
      // After saving profile, redirect to the home page
      router.replace('/home');
    } catch (error) {
      console.error('Unexpected error during profile update:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 32,
      color: theme.primary,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 16,
      paddingHorizontal: 10,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text,
    },
    radioContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 5,
      marginHorizontal: 10,
    },
    radioButtonSelected: {
      backgroundColor: theme.primary,
    },
    radioText: {
      fontSize: 16,
      marginLeft: 8,
      color: theme.text,
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="Weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Gender:</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={[styles.radioButton, gender === true && styles.radioButtonSelected]}
            onPress={() => setGender(true)}
          >
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, gender === false && styles.radioButtonSelected]}
            onPress={() => setGender(false)}
          >
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


