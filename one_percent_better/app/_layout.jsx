// app/_layout.jsx

import { Stack } from 'expo-router';
import { AuthProvider } from '../utils/AuthContext';

const RootLayout = () => {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="home" />
        <Stack.Screen name="strong" />
        <Stack.Screen name="medito" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="todolist0"/>
        <Stack.Screen name="calorieCounter" />
        <Stack.Screen name="calorieBot" />
        <Stack.Screen name="recipesPage" />
        <Stack.Screen name="foodanalyzer" />
      </Stack>
    </AuthProvider>
  );
};

export default RootLayout;
