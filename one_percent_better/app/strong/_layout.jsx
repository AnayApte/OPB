import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
export default function StrongLayout() {
  const { theme } = useTheme();
  
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.background,
  },
});
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        headerShown: false, // Hides the top header bar
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
}

