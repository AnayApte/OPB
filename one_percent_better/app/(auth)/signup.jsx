// auth/signup.jsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { hashPassword } from '../../utils/passwordGenerator';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const hashedPassword = hashPassword(password);
    const{error} = await supabase.from('users').insert([{ username: username, email: email, hashedPassword: hashedPassword,}]).select();
    if (error) {
        console.error('Error signing up:', error.message); // FIGURE OUT THE ERROR HERE LATER
    } 
    else {
        console.log('Signup successful');
        router.replace('/home');
    }
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
        <View style={styles.bottomLink}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Have an account? Sign in</Text>
            </TouchableOpacity>
          </Link>
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
  bottomLink: {
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    fontSize: 16,
  },
});
