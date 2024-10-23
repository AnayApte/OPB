import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Linking, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
};

const EDAMAM_APP_ID = '4499d167';
const EDAMAM_APP_KEY = '24cbb2c75a14cc21b95de2f02a7ee4aa';
const NUTRITION_APP_ID = 'YOUR_NUTRITION_APP_ID';
const NUTRITION_APP_KEY = 'YOUR_NUTRITION_APP_KEY';

const RECIPES_PER_PAGE = 10;

const fetchNutrition = async (query) => {
  try {
    const response = await axios.get('https://api.edamam.com/api/nutrition-data', {
      params: {
        app_id: NUTRITION_APP_ID,
        app_key: NUTRITION_APP_KEY,
        ingr: query,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    throw error;
  }
};

const fetchRecipes = async (query, from = 0, to = RECIPES_PER_PAGE) => {
  const params = {
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    type: 'public',
    q: query,
    from,
    to,
  };

  try {
    const response = await axios.get('https://api.edamam.com/api/recipes/v2', { params });
    return response.data.hits.map(hit => hit.recipe);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

function CalorieBotContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [queryType, setQueryType] = useState('');

  const handleSend = useCallback(async () => {
    if (input.trim() === '') return;
    setLoading(true);
    try {
      if (input.toLowerCase().includes('calories in') || input.toLowerCase().includes('nutrition')) {
        // Fetch nutrition information
        const nutritionData = await fetchNutrition(input.replace(/calories in|nutrition/i, '').trim());
        setResults([nutritionData]);
        setQueryType('nutrition');
      } else {
        // Fetch recipes
        const recipes = await fetchRecipes(input);
        setResults(recipes);
        setQueryType('recipes');
      }
      setPage(1);
      setHasMore(results.length === RECIPES_PER_PAGE);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  }, [input]);

  const fetchMoreRecipes = useCallback(async () => {
    if (!hasMore || loading || queryType !== 'recipes') return;
    setLoading(true);
    try {
      const newRecipes = await fetchRecipes(input, page * RECIPES_PER_PAGE, (page + 1) * RECIPES_PER_PAGE);
      setResults(prevRecipes => [...prevRecipes, ...newRecipes]);
      setPage(prevPage => prevPage + 1);
      setHasMore(newRecipes.length === RECIPES_PER_PAGE);
    } catch (error) {
      console.error('Error fetching more recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, input, page, queryType]);

  const handleOpenRecipe = useCallback((url) => {
    Linking.openURL(url);
  }, []);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (e) => setKeyboardOffset(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => setKeyboardOffset(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const renderNutritionItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Nutrition Information</Text>
        <Text style={styles.text}>Calories: {Math.round(item.calories)}</Text>
        <Text style={styles.text}>Protein: {Math.round(item.totalNutrients.PROCNT.quantity)}g</Text>
        <Text style={styles.text}>Fat: {Math.round(item.totalNutrients.FAT.quantity)}g</Text>
        <Text style={styles.text}>Carbs: {Math.round(item.totalNutrients.CHOCDF.quantity)}g</Text>
      </Card.Content>
    </Card>
  );

  const renderRecipeItem = ({ item }) => (
    <Card style={styles.card} accessible={true} accessibilityLabel={`Recipe for ${item.label}`}>
      <Card.Cover source={{ uri: item.image }} accessibilityIgnoresInvertColors={true} style={styles.cardCover}/>
      <Card.Content>
        <Text style={styles.title}>{item.label}</Text>
        <Text style={styles.subtitle}>Ingredients:</Text>
        {item.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.text}>
            • {ingredient.text}
          </Text>
        ))}
        <Text style={styles.text}>
          Calories: {Math.round(item.calories / item.yield)} per serving
        </Text>
        <Button mode="contained" onPress={() => handleOpenRecipe(item.url)} style={styles.button}>
          View Full Recipe
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: defaultTheme.background }]} edges={['bottom']}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary}/>
        <Appbar.Content title="CalorieBot" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={results}
          renderItem={queryType === 'nutrition' ? renderNutritionItem : renderRecipeItem}
          keyExtractor={(item, index) => item.uri || index.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={fetchMoreRecipes}
          onEndReachedThreshold={0.1}
          ListHeaderComponent={() => (
            <Text style={[styles.instructions, { color: defaultTheme.primary }]}>
              Ask for nutrition info (e.g., "calories in an onion") or search for recipes (e.g., "chicken pasta recipes").
            </Text>
          )}
          ListFooterComponent={() => loading && <ActivityIndicator animating={true} color={defaultTheme.primary} />}
          ListEmptyComponent={() => !loading && <Text style={styles.emptyText}>No results found</Text>}
        />
        <View style={[styles.inputContainer, { bottom: keyboardOffset }]}>
          <TextInput
            style={[styles.input, { color: defaultTheme.text, borderColor: defaultTheme.primary }]}
            value={input}
            onChangeText={setInput}
            placeholder="E.g., 'calories in an onion' or 'chicken recipes'"
            placeholderTextColor={defaultTheme.text}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            style={[styles.button, { backgroundColor: defaultTheme.primary }]}
          >
            <Text style={[styles.buttonText, { color: defaultTheme.background }]}>Send</Text>
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
  header: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: defaultTheme.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, 
  },
  card: {
    marginBottom: 16,
    backgroundColor: defaultTheme.primary,
  },
  cardCover: {
    height: 200,
    padding: 16,
    backgroundColor: defaultTheme.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: defaultTheme.background,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: defaultTheme.background,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: defaultTheme.background,
  },
  button: {
    marginTop: 8,
    backgroundColor: defaultTheme.buttonBackground,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: defaultTheme.text,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
    color: defaultTheme.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: defaultTheme.background,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    color: defaultTheme.text,
    borderColor: defaultTheme.primary,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: defaultTheme.background,
  },
  buttonText: {
    fontWeight: 'bold',
    color: defaultTheme.buttonText,
  },
});

export default function CalorieBot() {
  return (
    <ThemeProvider>
      <CalorieBotContent />
    </ThemeProvider>
  );
}
