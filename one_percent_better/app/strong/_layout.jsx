// app/strong/_layout.jsx
import React from 'react';
import { Tabs } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { IconButton } from 'react-native-paper';

const StrongLayoutContent = () => {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.background },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="workoutHistory"
        options={{
          title: 'Workout History',
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="history" size={size} iconColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Strong',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="home" size={size} iconColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exerciseHistory"
        options={{
          title: 'Exercise History',
          tabBarLabel: 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="dumbbell" size={size} iconColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

const StrongLayout = () => (
  <ThemeProvider>
    <StrongLayoutContent />
  </ThemeProvider>
);

export default StrongLayout;