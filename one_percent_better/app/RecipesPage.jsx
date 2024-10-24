import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Linking, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Button, Card, Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import axios from 'axios';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import * as SecureStore from 'expo-secure-store';

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

const RECIPES_PER_PAGE = 10;

const fetchRecipes = async (type = null, calorieGoal = null, from = 0, to = RECIPES_PER_PAGE, query = '') => {
  const params = {
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    type: 'public',
    from,
    to,
  };

  if (type === 'recommended' && calorieGoal) {
    params.calories = `${Math.round(calorieGoal * 0.2)}-${Math.round(calorieGoal * 0.4)}`;
  }

  if (query) {
    params.q = query;
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
  const [recipeType, setRecipeType] = useState('recommended');
  const [error, setError] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const fetchCalorieGoal = async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync('userId');

      if (!storedUserId) {
        console.error('No user ID found. Unable to fetch profile data.');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('weight, height, age, gender, activity_level, lose_weight, gain_weight, weeks')
        .eq('userId', storedUserId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (!data) {
        console.warn('No user data found. Proceeding without calorie goal calculation.');
        return;
      }

      const heightCm = data.height * 2.54;
      const weightKg = data.weight * 0.453592;

      let bmr;
      if (data.gender === 'Male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
      } else if (data.gender === 'Female') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
      } else {
        const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
        const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
        bmr = (maleBmr + femaleBmr) / 2;
      }

      let tdee;
      switch (data.activity_level) {
        case 'Sedentary':
          tdee = bmr * 1.2;
          break;
        case 'Lightly Active':
          tdee = bmr * 1.375;
          break;
        case 'Moderately Active':
          tdee = bmr * 1.55;
          break;
        case 'Very Active':
          tdee = bmr * 1.725;
          break;
        default:
          tdee = bmr * 1.2;
      }

      let goal;
      if (data.lose_weight > 0) {
        const deficit = (data.lose_weight * 3500) / (data.weeks * 7);
        goal = tdee - deficit;
      } else if (data.gain_weight > 0) {
        const surplus = (data.gain_weight * 3500) / (data.weeks * 7);
        goal = tdee + surplus;
      } else {
        goal = tdee;
      }

      setCalorieGoal(Math.round(goal));
    } catch (error) {
      console.error('Error calculating calorie goal:', error);
    }
  };

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const from = page * RECIPES_PER_PAGE;
      const to = (page + 1) * RECIPES_PER_PAGE;
      const newRecipes = await fetchRecipes(recipeType, calorieGoal, from, to, searchQuery);
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
  }, [recipeType, calorieGoal, page, loading, hasMore, searchQuery]);

  useEffect(() => {
    fetchCalorieGoal();
  }, []);

  useEffect(() => {
    setRecipes([]);
    setPage(0);
    setHasMore(true);
    fetchData();
  }, [recipeType, calorieGoal, searchQuery]);

  const handleOpenRecipe = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card} accessible={true} accessibilityLabel={`Recipe for ${item.label}`}>
      <Card.Cover source={{ uri: item.image }} accessibilityIgnoresInvertColors={true} style={styles.cardCover} />
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    setRecipes([]);
    setPage(0);
    setHasMore(true);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary} />
        <Appbar.Content title="Recipes" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <View style={styles.content}>
        <View style={styles.toggleContainer}>
          <Button
            mode={recipeType === 'recommended' ? 'contained' : 'outlined'}
            onPress={() => {
              setRecipeType('recommended');
              setRecipes([]);
              setPage(0);
              setHasMore(true);
            }}
            style={styles.toggleButton}
            labelStyle={recipeType === 'recommended' ? styles.activeButtonLabel : styles.inactiveButtonLabel}
          >
            Recommended Recipes
          </Button>
          <Button
            mode={recipeType === 'all' ? 'contained' : 'outlined'}
            onPress={() => {
              setRecipeType('all');
              setRecipes([]);
              setPage(0);
              setHasMore(true);
            }}
            style={styles.toggleButton}
            labelStyle={recipeType === 'all' ? styles.activeButtonLabel : styles.inactiveButtonLabel}
          >
            All Recipes
          </Button>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Searchbar
            placeholder="Search recipes"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
        </TouchableWithoutFeedback>
        {recipeType === 'recommended' && calorieGoal && (
          <Text style={styles.calorieGoal}>
            Here are recipes to fit your caloric goal of: {calorieGoal} calories per day
          </Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.listContainer}
          onEndReached={fetchData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => loading && <ActivityIndicator animating={true} color={defaultTheme.primary} />}
          ListEmptyComponent={() => !loading && <Text style={styles.emptyText}>Search for recipes</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultTheme.background,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: defaultTheme.primary,
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
    borderColor: defaultTheme.primary,
  },
  activeButtonLabel: {
    color: defaultTheme.secondary,
  },
  inactiveButtonLabel: {
    color: defaultTheme.primary,
  },
  listContainer: {
    paddingBottom: 20,
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
    backgroundColor: defaultTheme.background,
    color: defaultTheme.primary,
  },
  calorieGoal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: defaultTheme.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: defaultTheme.primary,
  },
  searchBar: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default function RecipesPage() {
  return (
    <ThemeProvider>
      <RecipesContent />
    </ThemeProvider>
  );
}
