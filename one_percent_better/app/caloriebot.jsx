import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Linking, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const EDAMAM_APP_ID = '4499d167';
const EDAMAM_APP_KEY = '24cbb2c75a14cc21b95de2f02a7ee4aa';

const RECIPES_PER_PAGE = 10;

const fetchRecipes = async (query, from = 0, to = RECIPES_PER_PAGE) => {
  const params = {
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    type: 'public',
    q: query,
    from,
    to,
  };

  // Extract calorie information if present
  const calorieMatch = query.match(/(\d+)\s*calories?/i);
  if (calorieMatch) {
    const calories = parseInt(calorieMatch[1]);
    params.calories = `${Math.max(0, calories - 100)}-${calories + 100}`;
  }

  try {
    const response = await axios.get('https://api.edamam.com/api/recipes/v2', { params });
    return response.data.hits.map(hit => hit.recipe);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

function RecipesContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const from = page * RECIPES_PER_PAGE;
      const to = (page + 1) * RECIPES_PER_PAGE;
      const newRecipes = await fetchRecipes(input, from, to);
      if (newRecipes.length === 0) {
        setHasMore(false);
      } else {
        setRecipes(prevRecipes => {
          const uniqueNewRecipes = newRecipes.filter(
            newRecipe => !prevRecipes.some(prevRecipe => prevRecipe.uri === newRecipe.uri)
          );
          return [...prevRecipes, ...uniqueNewRecipes];
        });
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch recipes. Please try again later.');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [input, page, loading, hasMore]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setRecipes([]);
    setPage(0);
    setHasMore(true);
    await fetchData();
    setInput('');
  };

  const handleOpenRecipe = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card} accessible={true} accessibilityLabel={`Recipe for ${item.label}`}>
      <Card.Cover source={{ uri: item.image }} accessibilityIgnoresInvertColors={true} />
      <Card.Content>
        <Text style={styles.title}>{item.label}</Text>
        <Text style={styles.subtitle}>Ingredients:</Text>
        {item.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.text}>
            • {ingredient.text} ({Math.round(ingredient.weight)}g)
          </Text>
        ))}
        <Text style={styles.text}>
          Calories: {Math.round(item.calories / item.yield)} per serving
        </Text>
        <Text style={styles.text}>
          Protein: {Math.round(item.totalNutrients.PROCNT.quantity / item.yield)}g per serving
        </Text>
        <Button mode="contained" onPress={() => handleOpenRecipe(item.url)} style={styles.button}>
          View Full Recipe
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Recipe Bot" />
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.listContainer}
          onEndReached={fetchData}
          onEndReachedThreshold={0.1}
          ListHeaderComponent={() => (
            <Text style={[styles.instructions, { color: theme.text }]}>
              Ask for recipes based on multiple criteria, like ingredients and calorie goals.
            </Text>
          )}
          ListFooterComponent={() => loading && <ActivityIndicator animating={true} color={theme.primary} />}
          ListEmptyComponent={() => !loading && <Text style={styles.emptyText}>No recipes found</Text>}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.primary }]}
            value={input}
            onChangeText={setInput}
            placeholder="E.g., '600 calories and tomatoes'"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    marginBottom: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
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
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default function RecipesPage() {
  return (
    <ThemeProvider>
      <RecipesContent />
    </ThemeProvider>
  );
}
