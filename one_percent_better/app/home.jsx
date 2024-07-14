// home.jsx
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function Home() {
  const { userId, setUserId } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userId');
    setUserId(null);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>One Percent Better!</Text>
        <Link href="/strong" style={styles.link}>
          Go to Strong
        </Link>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
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
    link: {
      color: 'blue',
      fontSize: 18,
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
  });
