// app/home.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from './ThemeContext';

const quotesArray = [
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

const HomeContent = () => {
  const { userId, setUserId } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [currentQuote, setCurrentQuote] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotesArray.length);
      setCurrentQuote(quotesArray[randomIndex]);
    };

    const calculateTimeLeft = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0);
      if (now > nextReset) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      const timeDifference = nextReset - now;
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDifference / 1000) % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    updateQuote();

    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = nextMidnight - now;
    const midnightTimeout = setTimeout(() => {
      updateQuote();
      const dailyInterval = setInterval(updateQuote, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(timerId);
    };
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userId');
    setUserId(null);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={[styles.quote, styles.lessBold, { color: theme.text }]}>Quote of the Day:</Text>
        <Text style={[styles.quote1, styles.lessBold, { color: theme.text }]}>{currentQuote}</Text>
        <Text style={[styles.timer, { color: theme.text }]}>Next quote in: {timeLeft}</Text>

        <View style={styles.content}>
          <Image 
            source={{ uri: 'https://static.thenounproject.com/png/716860-200.png' }} 
            style={styles.image} 
          />
          <Text style={[styles.title, { color: theme.primary }]}>One Percent Better!</Text>
          <Link href="/medito" style={{ color: theme.primary }}>Go to Medito</Link>
          <Link href="/strong" style={{ color: theme.primary }}>Go to Strong</Link>
          <Link href="/caloriecounter" style={{ color: theme.primary }}>Go to CalorieCounter</Link>
          <Link href="/journal" style={{ color: theme.primary }}>Go to Journal</Link>
          <Link href="/todolist0" style={{ color: theme.primary }}>Go to TodoList</Link>
          <Link href="/Calendar" style={{ color: theme.primary }}>Go to Calendar</Link>
          <Link href="/foodanalyzer" style={{color: theme.primary}}>Analyze your food</Link>
          <Link href="/profile" style={{color: theme.primary}}>Edit Profile</Link>
          
          <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.logoutText, { color: theme.secondary }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quote: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  quote1: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 16,
  },
  lessBold: {
    fontWeight: '400',
  },
  onePercentBetter: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});