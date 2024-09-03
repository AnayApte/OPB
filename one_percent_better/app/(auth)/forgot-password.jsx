import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('securityQuestion')
        .eq('email', email)
        .single();

      if (error) {
        Alert.alert('Error', 'Error fetching security question: ' + error.message);
        return;
      }

      if (data) {
        setSecurityQuestion(data.securityQuestion);
        setStep(2);
      } else {
        Alert.alert('Error', 'No user found with this email');
      }
    } catch (error) {
      Alert.alert('Error', 'Unexpected error: ' + error.message);
    }
  };

  const handleSecurityAnswerSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('securityAnswer')
        .eq('email', email)
        .single();

      if (error) {
        Alert.alert('Error', 'Error verifying security answer: ' + error.message);
        return;
      }

      if (data && data.securityAnswer === securityAnswer) {
        setStep(3);
      } else {
        Alert.alert('Error', 'Incorrect security answer');
      }
    } catch (error) {
      Alert.alert('Error', 'Unexpected error: ' + error.message);
    }
  };

  
  const handlePasswordReset = async () => {
    try {
      // Step 1: Sign in with OTP (this creates an auth session)
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
      });
  
      if (signInError) {
        Alert.alert('Error', 'Error creating auth session: ' + signInError.message);
        return;
      }
  
      // Step 2: Wait for a short time to ensure the session is established
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Step 3: Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
  
      if (updateError) {
        Alert.alert('Error', 'Error resetting password: ' + updateError.message);
        return;
      }
  
      Alert.alert(
        'Success', 
        'Password has been reset successfully.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Unexpected error: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        {step === 1 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleEmailSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.question}>{securityQuestion}</Text>
            <TextInput
              style={styles.input}
              placeholder="Security Answer"
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
            />
            <TouchableOpacity style={styles.button} onPress={handleSecurityAnswerSubmit}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 3 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
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
  button: {
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
  question: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});