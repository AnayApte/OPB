import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { Appbar, Card, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
};

const StrongHome = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const NavButton = ({ icon, label, onPress, style, iconSize = 24 }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => {
          setIsPressed(false);
          onPress();
        }}
        style={({ pressed }) => [
          styles.navButton,
          style,
          isPressed && styles.navButtonPressed
        ]}
      >
        <View style={styles.navButtonInner}>
          <MaterialCommunityIcons 
            name={icon} 
            size={iconSize} 
            color={isPressed ? defaultTheme.background : defaultTheme.buttonText} 
          />
          <Text style={[
            styles.navButtonText,
            isPressed && styles.navButtonTextPressed
          ]}>{label}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: defaultTheme.background }]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.text}/>
        <Appbar.Content title="Power Hour" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Welcome to Power Hour</Title>
            <Paragraph style={styles.cardText}>Track your workouts and achieve your fitness goals.</Paragraph>
          </Card.Content>
        </Card>
        <NavButton
          icon="dumbbell"
          label="Start New Workout"
          onPress={() => router.push('/strong/workout?autoStart=true')}
          style={styles.startWorkoutButton}
          iconSize={32}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: defaultTheme.text
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: defaultTheme.primary,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: defaultTheme.background
  },
  cardText: {
    fontSize: 16,
    textAlign: 'center',
    color: defaultTheme.background
  },
  navButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: defaultTheme.buttonBackground,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonPressed: {
    backgroundColor: defaultTheme.text,
    transform: [{ scale: 0.95 }],
  },
  navButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: defaultTheme.buttonText,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  navButtonTextPressed: {
    color: defaultTheme.background,
  },
  startWorkoutButton: {
    width: '100%',
  },
});

export default StrongHome;