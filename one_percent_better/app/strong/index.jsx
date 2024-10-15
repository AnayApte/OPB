// app/strong/index.jsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#4CAF50',
  buttonText: '#FFFFFF',
};

const StrongHome = () => {
  const router = useRouter();
  const { theme = defaultTheme } = useTheme() || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton destination="/home"/>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonBackground }]}
        onPress={() => router.push('/strong/workout')}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Start New Workout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StrongHome;