import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { SUPABASEURL, SUPABASEKEY } from '@env';

const defaultTheme = {
  background: '#FFb5c6',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function RecipesContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipeType, setRecipeType] = useState('cutting');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('recipes').select('*');
      setLoading(false);

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched data:', data);
        setRecipes(data);
        filterRecipes(data, recipeType);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterRecipes = (data, type) => {
    console.log('Filtering recipes for type:', type);
    const filtered = data.filter(recipe => recipe.highorlowcalories === (type === 'bulking'));
    console.log('Filtered recipes:', filtered);
    setFilteredRecipes(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRecipes(recipes, recipeType);
  }, [recipeType, recipes]);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.image_address }} />
      <Card.Content>
        <Text style={styles.title}>{item['food name']}</Text>
        <Text style={styles.text}>Ingredients:{'\n'}{item.ingredients}</Text>
        <Text style={styles.text}>Calories: {item.calories}</Text>
        <Text style={styles.text}>Protein: {item['protein (grams)']} grams</Text>
        <Text style={styles.text}>Directions:{'\n'}{item.directions}</Text>
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
            onPress={() => setRecipeType('cutting')}
            style={styles.toggleButton}
          >
            Cutting
          </Button>
          <Button
            mode={recipeType === 'bulking' ? 'contained' : 'outlined'}
            onPress={() => setRecipeType('bulking')}
            style={styles.toggleButton}
          >
            Bulking
          </Button>
        </View>
        {loading && <Text>Loading...</Text>}
        {!loading && filteredRecipes.length === 0 && <Text>No recipes found</Text>}
        <FlatList
          data={filteredRecipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  text: {
    marginBottom: 8,
  },
});

export default function RecipesPage() {
  return (
    <ThemeProvider>
      <RecipesContent />
    </ThemeProvider>
  );
}