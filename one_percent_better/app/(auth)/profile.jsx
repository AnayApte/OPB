import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, TextInput, Button, Card, Text, RadioButton } from 'react-native-paper';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function ProfileContent() {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null);
  const router = useRouter();
  const { theme = defaultTheme } = useTheme();

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
        return;
      }
  
      const { data, error } = await supabase
        .from('users')
        .update({ weight: weight, age: age, gender: gender })
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Profile" />
      </Appbar.Header>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: defaultTheme.primary }]}>Complete Your Profile</Text>
            <Text style={[styles.description, { color: theme.text }]}>
              Provide your information to personalize your experience and get the most out of the app.
            </Text>
            <TextInput
              style={styles.input}
              label="Weight"
              value={weight}
              onChangeText={setWeight}
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
            <Text style={[styles.label, { color: theme.text }]}>Gender:</Text>
            <RadioButton.Group onValueChange={value => setGender(value)} value={gender}>
              <View style={styles.radioContainer}>
                <RadioButton.Item label="Male" value={true} />
                <RadioButton.Item label="Female" value={false} />
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>
        <Button 
          mode="contained" 
          onPress={handleSaveProfile}
          style={styles.saveButton}
          buttonColor={theme.buttonBackground}
        >
          Save Profile
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
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default function Profile() {
  return (
    <ThemeProvider>
      <ProfileContent />
    </ThemeProvider>
  );
}