import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { Appbar, Card, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Title, Paragraph } from 'react-native-paper';

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
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
    
    await SecureStore.deleteItemAsync('userId');
    setUserId(null);
    router.replace('/(auth)/login');
  };

  const HeaderIcon = ({ icon, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerIconContainer,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View style={styles.headerIconBackground}>
        <MaterialCommunityIcons name={icon} size={32} color={theme.text} />
      </View>
    </Pressable>
  );

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
            color={isPressed ? theme.background : theme.buttonText} 
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
    <ThemeProvider value={theme}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style="light" />
        <Appbar.Header style={styles.header}>
          <HeaderIcon
            icon="account"
            onPress={() => router.push('/profile')}
          />
          <Appbar.Content title="One Percent Better" titleStyle={styles.headerTitle} />
          <HeaderIcon
            icon="logout"
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
            <NavButton 
              icon="calendar" 
              label="Calendar" 
              onPress={() => router.push('/Calendar')} 
              style={styles.calendarButton}
            />
            <NavButton icon="meditation" label="Meditation Station" onPress={() => router.push('/medito')} />
            <NavButton icon="dumbbell" label="Strong" onPress={() => router.push('/strong')} />
            <NavButton icon="food-apple" label="Calorie Counter" onPress={() => router.push('/caloriecounter')} />
            <NavButton icon="food" label="Food Analyzer" onPress={() => router.push('/foodanalyzer')} />
            <NavButton icon="format-list-checks" label="Todo List" onPress={() => router.push('/todolist0')} />
            <NavButton icon="book-open-page-variant" label="Journal" onPress={() => router.push('/journal')} />
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 24,
  },
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  headerIconBackground: {
    backgroundColor: 'rgba(242, 226, 251, 0.2)',
    borderRadius: 20,
    padding: 8,
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
    backgroundColor: theme.text,
    transform: [{ scale: 0.95 }], 
  },
  navButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: theme.buttonText,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold', 
  },
  navButtonTextPressed: {
    color: theme.background,
  },
  calendarButton: {
    width: '100%',
    marginBottom: 12,
  },
});