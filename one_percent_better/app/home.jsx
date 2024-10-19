import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import { ThemeProvider } from './ThemeContext';
import { Appbar, Card, Title, Paragraph, Button, Surface, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const quotes = [
  "'The only limit to our realization of tomorrow is our doubts of today.' - Franklin D. Roosevelt",
  "'Success is not final, failure is not fatal: It is the courage to continue that counts.' - Winston Churchill",
  "'Do not wait to strike till the iron is hot, but make it hot by striking.' - William Butler Yeats",
  "'Perfection is not attainable, but if we chase perfection we can catch excellence. ' - Vince Lombardi",
  "'When you have a dream, you have got to grab it and never let go' - Carol Burnett",
  "'Either you run the day or the day runs you' - Jim Rohn",
  "'I do not like to gamble, but if there is one thing I am willing to bet on it is myself' - Beyonce",
  "'It is not whether you get knocked down, it is whether you get up' - Vince Lombardi",
  "'You miss 100% of the shots you do not take.' - Wayne Gretzky",
  "'It is hard to beat a person who never gives up' - Babe Ruth",
];

const theme = {
  background: '#3b0051',
  text: '#f2e2fb',
  button: '#f2e2fb',
  buttonText: '#3b0051',
};

export default function Home() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const NavButton = ({ icon, label, onPress }) => (
    <Button
      mode="contained"
      onPress={onPress}
      style={styles.navButton}
      contentStyle={styles.navButtonContent}
      labelStyle={styles.navButtonLabel}
    >
      <View style={styles.navButtonInner}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.buttonText} />
        <Text style={styles.navButtonText}>{label}</Text>
      </View>
    </Button>
  );

  return (
    <ThemeProvider value={theme}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style="light" />
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="One Percent Better" titleStyle={styles.headerTitle} />
          <IconButton
            icon="logout"
            color={theme.text}
            size={24}
            onPress={handleSignOut}
          />
        </Appbar.Header>
        <ScrollView style={styles.content}>
          <Card style={styles.welcomeCard}>
            <Card.Content>
              <Title style={styles.welcomeTitle}>Welcome to One Percent Better!</Title>
              <Paragraph style={styles.welcomeText}>Your mental and physical health companion.</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.quoteCard}>
            <Card.Content>
              <Title style={styles.quoteTitle}>Quote of the Day</Title>
              <Paragraph style={styles.quoteText}>{quote}</Paragraph>
            </Card.Content>
          </Card>
          <Surface style={styles.navContainer}>
            <NavButton icon="account" label="Profile" onPress={() => router.push('/profile')} />
            <NavButton icon="meditation" label="Medito" onPress={() => router.push('/medito')} />
            <NavButton icon="format-list-checks" label="Todo List" onPress={() => router.push('/todolist0')} />
            <NavButton icon="dumbbell" label="Strong" onPress={() => router.push('/strong')} />
            <NavButton icon="food-apple" label="Calorie Counter" onPress={() => router.push('/caloriecounter')} />
          </Surface>
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: theme.button,
    marginBottom: 16,
    borderRadius: 12,
  },
  welcomeTitle: {
    color: theme.buttonText,
    fontSize: 22,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: theme.buttonText,
    fontSize: 16,
  },
  quoteCard: {
    backgroundColor: theme.button,
    marginBottom: 16,
    borderRadius: 12,
  },
  quoteTitle: {
    color: theme.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quoteText: {
    color: theme.buttonText,
    fontSize: 14,
    fontStyle: 'italic',
  },
  navContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    elevation: 0,
  },
  navButton: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: theme.button,
  },
  navButtonContent: {
    height: 80,
  },
  navButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLabel: {
    color: theme.buttonText,
  },
  navButtonText: {
    color: theme.buttonText,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});