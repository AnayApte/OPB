import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
};

const StrongLayoutContent = () => {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.navigate(route.name);
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const iconName = 
              route.name === 'workoutHistory' ? 'history' :
              route.name === 'index' ? 'home' :
              route.name === 'exerciseHistory' ? 'dumbbell' :
              'square';
            return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            return options.tabBarLabel || options.title || route.name;
          }}
          style={[styles.bottomNavigation, { backgroundColor: defaultTheme.primary }]}
          activeColor={theme.text}
          inactiveColor={theme.text + '80'}
        />
      )}
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
    </Tabs>
  );
};

const StrongLayout = () => (
  <ThemeProvider value={defaultTheme}>
    <StrongLayoutContent />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  bottomNavigation: {
    elevation: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default StrongLayout;
