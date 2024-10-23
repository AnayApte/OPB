import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { Appbar, Button, Card, Title, Paragraph } from 'react-native-paper';
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

  return (
    <View style={[styles.container, { backgroundColor: defaultTheme.background }]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()}  color={defaultTheme.text}/>
        <Appbar.Content title="Power Hour" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Welcome to Power Hour</Title>
            <Paragraph style={styles.cardText}>Track your workouts and achieve your fitness goals.</Paragraph>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          onPress={() => router.push('/strong/workout?autoStart=true')}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          <MaterialCommunityIcons name="dumbbell" size={24} color={theme.buttonText} />
          <Title style={styles.buttonText}>Start New Workout</Title>
        </Button>
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
  button: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 18,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StrongHome;
