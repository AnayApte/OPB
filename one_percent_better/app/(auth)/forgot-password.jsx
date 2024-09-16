import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseClient';
import { useTheme } from '../ThemeContext'; // Import useTheme

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme(); // Access the theme

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://yourdomain.com/reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Password reset email sent. Please check your inbox.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      marginBottom: 10,
      color: theme.primary,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      width: '100%',
      height: 50,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 20,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: theme.inputBackground,
      color: theme.text,
    },
    button: {
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: theme.disabled,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
    linkButton: {
      marginTop: 20,
    },
    linkButtonText: {
      color: theme.link,
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={theme.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCompleteType="email"
        />
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.linkButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}