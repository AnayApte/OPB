import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../utils/BackButton';
import { useTheme } from './ThemeContext'; // Import useTheme

const ChatGPTPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme(); // Access the theme
  const OPENAI_API_KEY = 'sk-None-n9q3aEokGPhawjfDwP5LT3BlbkFJcTBHTYIPgO6kx8bPgK5A'; // Replace with your actual API key

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
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const botMessage = {
        text: response.data.choices[0].message.content.trim(),
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
      console.error(
        'Response data:',
        error.response ? error.response.data : 'No response data'
      );
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.sender === 'bot' ? styles.botMessage : styles.userMessage,
      ]}
    >
      <Text>{item.text}</Text>
    </View>
  );

  // Move styles inside the component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background, // Use theme background color
      padding: 20,
      justifyContent: 'flex-start',
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.primary, // Use primary color for the title
      marginBottom: 20,
    },
    chatContainer: {
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.primary, // Use primary color for border
      padding: 5,
    },
    input: {
      flex: 1,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.primary, // Use primary color for input border
      borderRadius: 5,
      marginRight: 10,
    },
    message: {
      padding: 10,
      borderRadius: 5,
      marginVertical: 5,
    },
    userMessage: {
      backgroundColor: theme.secondary, // Use secondary color for user messages
      alignSelf: 'flex-end',
    },
    botMessage: {
      backgroundColor: theme.accent, // Use primary color for bot messages
      alignSelf: 'flex-start',
    },
    button: {
      backgroundColor: theme.accent, // Use primary color for button background
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: theme.text, // Use text color from the theme for button text
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <BackButton destination="/calorieCounter" />
      <Text style={styles.title}>Calorie Bot</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChatGPTPage;
