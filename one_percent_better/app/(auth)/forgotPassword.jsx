import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemeProvider, useTheme } from '../ThemeContext';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#641f1f',
  buttonText: '#f2f5ea',
  link: '#1e90ff',
};

const ForgotPasswordContent = () => {
  const { theme = defaultTheme } = useTheme() || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>
        <Text style={{ color: theme.text }}>This page is currently blank.</Text>
        <View style={styles.bottomLink}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: theme.link }]}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const ForgotPassword = () => (
  <ThemeProvider>
    <ForgotPasswordContent />
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  bottomLink: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
  },
});

export default ForgotPassword;