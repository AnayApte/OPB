import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext'; // Import useTheme
const StrongHome = () => {
  const router = useRouter();
  const { theme } = useTheme(); 
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.background,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 5,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <BackButton destination="/home"/>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/strong/workout')}
      >
        <Text style={styles.buttonText}>Start New Workout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};



export default StrongHome;
