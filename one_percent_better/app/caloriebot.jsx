import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../utils/BackButton';
import { ThemeProvider, useTheme } from './ThemeContext';

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#641f1f',
  secondary: '#f2f5ea',
};

const ChatGPTContent = () => {
  const { theme = defaultTheme } = useTheme() || {};
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const OPENAI_API_KEY = 'sk-None-n9q3aEokGPhawjfDwP5LT3BlbkFJcTBHTYIPgO6kx8bPgK5A';

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: input },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const botMessage = { text: response.data.choices[0].message.content.trim(), sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
      console.error('Response data:', error.response ? error.response.data : 'No response data');
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.message,
      item.sender === 'bot' 
        ? [styles.botMessage, { backgroundColor: theme.secondary }]
        : [styles.userMessage, { backgroundColor: theme.primary }]
    ]}>
      <Text style={{ color: item.sender === 'bot' ? theme.text : theme.secondary }}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <BackButton destination="/calorieCounter"/>
      <Text style={[styles.title, { color: theme.primary }]}>Calorie Bot</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={theme.text}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.buttonText, { color: theme.secondary }]}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const ChatGPTPage = () => {
  return (
    <ThemeProvider>
      <ChatGPTContent />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  chatContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  button: {
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default ChatGPTPage;