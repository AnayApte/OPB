import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';

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

const fetchRecipes = async (type = null) => {
  const params = {
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    type: 'public',
    from: 0,
    to: 100, // Fetch 100 recipes for all cases
  };

  if (type === 'cutting') {
    params.diet = 'low-carb';
    params.calories = '100-500';
  } else if (type === 'bulking') {
    params.diet = 'high-protein';
    params.calories = '500-800';
  }

  try {
    const response = await axios.get('https://api.edamam.com/api/recipes/v2', { params });
    return response.data.hits.map(hit => hit.recipe);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    if (error.response && error.response.status === 401) {
      throw new Error('Authentication failed. Please check your API credentials.');
    }
    throw error;
  }
};

function RecipesContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipeType, setRecipeType] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes(type);
      const sortedData = data.sort((a, b) => a.label.localeCompare(b.label));
      setRecipes(sortedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch recipes. Please try again later.');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(recipeType);
  }, [recipeType]);

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
        <Appbar.Content title="Recipes" />
      </Appbar.Header>
      <View style={styles.content}>
        <View style={styles.toggleContainer}>
          <Button
            mode={recipeType === 'cutting' ? 'contained' : 'outlined'}
            onPress={() => setRecipeType(recipeType === 'cutting' ? null : 'cutting')}
            style={styles.toggleButton}
          >
            Cutting
          </Button>
          <Button
            mode={recipeType === 'bulking' ? 'contained' : 'outlined'}
            onPress={() => setRecipeType(recipeType === 'bulking' ? null : 'bulking')}
            style={styles.toggleButton}
          >
            Bulking
          </Button>
        </View>
        {loading && <ActivityIndicator animating={true} color={theme.primary} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && recipes.length === 0 && <Text>No recipes found</Text>}
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    marginHorizontal: 5,
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
  },
});

export default function RecipesPage() {
  return (
    <ThemeProvider>
      <RecipesContent />
    </ThemeProvider>
  );
}
