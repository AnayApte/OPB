// THIS ISN'T STORING IN DB.

import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { supabase } from '../utils/supabaseClient'; // You'll need to set up Supabase connection

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const id = randomUUID();
    await supabase.from('users').insert([{ id, email, password, created_at: new Date(), username}]);
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
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
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 32,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 16,
      paddingHorizontal: 10,
    },
    signupButton: {
      backgroundColor: 'blue',
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
