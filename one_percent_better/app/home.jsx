import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';

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
  const { user, signOut } = useAuth(); // Update this line
  const router = useRouter();

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
      nextReset.setHours(24, 0, 0, 0); // Next reset time at midnight
      if (now > nextReset) {
        nextReset.setDate(nextReset.getDate() + 1); // Move to the next day if current time is past midnight
      }
      const timeDifference = nextReset - now;
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDifference / 1000) % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Update the quote immediately when the component mounts
    updateQuote();

    // Set a timeout to update the quote at the next midnight
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0); // Next reset time at midnight
    const timeUntilMidnight = nextMidnight - now;
    const midnightTimeout = setTimeout(() => {
      updateQuote();

      // Set an interval to update the quote every 24 hours after the first midnight update
      const dailyInterval = setInterval(updateQuote, 24 * 60 * 60 * 1000); // 24 hours

      // Clean up the interval on component unmount
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    // Set up the interval to update the timer every second
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000); // 1000 milliseconds = 1 second

    // Clean up the timeout and interval when the component unmounts
    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(timerId);
    };
  }, []);



  const handleLogout = async () => {
    try {
      await signOut(); // Use the signOut function from useAuth
      await SecureStore.deleteItemAsync('userId');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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
          <Link href="/medito" style={{ color: 'blue' }}>Go to Medito</Link>
          <Link href="/strong" style={{ color: 'blue' }}>Go to Strong</Link>
          <Link href="/caloriecounter" style={{ color: 'blue' }}>Go to CalorieCounter</Link>
          <Link href="/profile" style={{ color: 'blue' }}>Edit Profile</Link>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple', // Change the background color to purple
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
    color: 'yellow',
  },
  quote: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'yellow',
  },
  quote1: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'yellow',
  },
  timer: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: 'yellow',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
  },
  lessBold: {
    fontWeight: '400', // Less bold (medium weight)
  },
  onePercentBetter: {
    fontSize: 24, // Change the font size
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'yellow', // Optional: change text color for better contrast
  },
});
