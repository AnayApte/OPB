import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASEURL, SUPABASEKEY } from '@env';

// Initialize Supabase client
const supabaseUrl = SUPABASEURL; // Replace with your Supabase project URL
const supabaseAnonKey = SUPABASEKEY; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://password-reset' // Your app’s deep link for password reset
      });

      if (error) throw error;
      
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title={loading ? 'Sending...' : 'Reset Password'} onPress={handleForgotPassword} disabled={loading} />
      {message ? <Text style={{ marginTop: 10, color: 'green' }}>{message}</Text> : null}
    </View>
  );
};

export default ForgotPasswordScreen;
// import React from 'react';
// import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
// import { Link } from 'expo-router';
// import { ThemeProvider, useTheme } from '../ThemeContext';

// const defaultTheme = {
//   background: '#FFb5c6',
//   text: '#641f1f',
//   primary: '#641f1f',
//   secondary: '#f2f5ea',
//   buttonBackground: '#641f1f',
//   buttonText: '#f2f5ea',
//   link: '#1e90ff',
// };

// const ForgotPasswordContent = () => {
//   const { theme = defaultTheme } = useTheme() || {};

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
//       <View style={styles.content}>
//         <Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>
//         <Text style={{ color: theme.text }}>This page is currently blank.</Text>
//         <View style={styles.bottomLink}>
//           <Link href="/(auth)/login" asChild>
//             <TouchableOpacity>
//               <Text style={[styles.linkText, { color: theme.link }]}>Already have an account? Sign in</Text>
//             </TouchableOpacity>
//           </Link>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const ForgotPassword = () => (
//   <ThemeProvider>
//     <ForgotPasswordContent />
//   </ThemeProvider>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 32,
//   },
//   bottomLink: {
//     marginTop: 20,
//   },
//   linkText: {
//     fontSize: 16,
//   },
// });

// export default ForgotPassword;
