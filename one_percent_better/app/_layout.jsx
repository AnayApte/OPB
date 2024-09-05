import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../utils/AuthContext';
import { ThemeProvider } from './ThemeContext';  // Import ThemeProvider

const RootLayout = () => {
  return (
    <ThemeProvider>  
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="home" />
          <Stack.Screen name="strong" />
          <Stack.Screen name="medito" />
          <Stack.Screen name="journal" />
          <Stack.Screen name="calorieCounter" />
          <Stack.Screen name="calorieBot" />
          <Stack.Screen name="recipesPage" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
