import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#FFB5C6',
  secondary: '#f2f5ea',
  tabBar: '#f0f0f0',
};

const StrongLayoutContent = () => {
  const { theme = defaultTheme } = useTheme() || {};

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.background }],
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="workoutHistory"
        options={{
          title: 'Workout History',
          tabBarLabel: 'Workouts',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Strong',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="exerciseHistory"
        options={{
          title: 'Exercise History',
          tabBarLabel: 'Exercises',
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

const styles = StyleSheet.create({
  tabBar: {
    // Add any additional styles here
  },
});

export default StrongLayout;