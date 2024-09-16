import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from './ThemeContext'; // Import useTheme

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

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme } = useTheme(); // Access the theme

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
    try {
      await signOut();
      await SecureStore.deleteItemAsync('userId');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      color: theme.primary,
    },
    quote: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: theme.primary,
    },
    quote1: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: theme.primary,
    },
    timer: {
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 20,
      color: theme.secondary,
    },
    image: {
      width: 200,
      height: 200,
      marginBottom: 20,
    },
    logoutButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: theme.secondary,
      borderRadius: 5,
    },
    logoutText: {
      color: theme.text,
      fontSize: 16,
    },
    lessBold: {
      fontWeight: '400',
    },
    onePercentBetter: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.primary,
    },
    link: {
      color: theme.primary,
      marginVertical: 5,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={[styles.quote, styles.lessBold]}>Quote of the Day:</Text>
        <Text style={[styles.quote1, styles.lessBold]}>{currentQuote}</Text>
        <Text style={styles.timer}>Next quote in: {timeLeft}</Text>

        <View style={styles.content}>
          <Image 
            source={{ uri: 'https://static.thenounproject.com/png/716860-200.png' }} 
            style={styles.image} 
          />
          <Text style={styles.title}>One Percent Better!</Text>
          <Link href="/medito" style={styles.link}>Go to Medito</Link>
          <Link href="/strong" style={styles.link}>Go to Strong</Link>
          <Link href="/caloriecounter" style={styles.link}>Go to CalorieCounter</Link>
          <Link href="/profile" style={styles.link}>Edit Profile</Link>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}