import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const StrongHome = () => {
  const router = useRouter();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StrongHome;
