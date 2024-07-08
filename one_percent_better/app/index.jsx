// THIS IS THE STARTING PAGE!
// WE CAN FIX THIS LATER, IT WORKS FOR NOW.

import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to One Percent Better!</Text>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Link>
        <View style={styles.signupContainer}>
          <Text style={styles.orText}>Or</Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupText}>signup</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.insteadText}>instead</Text>
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: 'green',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  orText: {
    fontSize: 16,
    marginRight: 4,
  },
  signupText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
  },
  insteadText: {
    fontSize: 16,
    marginLeft: 4,
  },
});
