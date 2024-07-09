// home.jsx
// STRONG IS V. BROKEN RN, WE CAN FIX THIS AFTER CREATING AUTH AND LOGIN.

import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>One Percent Better!</Text>
        <Link href="/strong" style={styles.link}>
          Go to Strong
        </Link>
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
  });
