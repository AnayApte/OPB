import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, Image } from 'react-native';
import {Link} from 'expo-router';


export default function App() {

  return (
    <View style={styles.container}>
      <Text style={[styles.quote, styles.lessBold]}>Calorie Counter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple', // Change the background color to purple
    padding: 20,
  },
  quote: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'yellow',
  },
  lessBold: {
    fontWeight: '400', // Less bold (medium weight)
  },
  
});
