import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function StrongLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: styles.tabBar }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Strong',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="workout-history"
        options={{
          title: 'Workout History',
          tabBarLabel: 'Workouts',
        }}
      />
      <Tabs.Screen
        name="exercise-history"
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f0f0f0',
  },
});
