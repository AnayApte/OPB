import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../utils/AuthContext';
import { ThemeProvider } from './ThemeContext';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="home" />
              <Stack.Screen name="strong" />
              <Stack.Screen name="medito" />
              <Stack.Screen name="journal" />
              <Stack.Screen name="todolist0"/>
              <Stack.Screen name="caloriecounter" />
              <Stack.Screen name="calorieBot" />
              <Stack.Screen name="recipesPage" />
              <Stack.Screen name="foodanalyzer" />
              <Stack.Screen name="Calendar" />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
