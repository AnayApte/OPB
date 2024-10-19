// app/RecipesPage.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import BackButton from '../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './ThemeContext';
import { SUPABASEURL, SUPABASEKEY } from '@env';

const defaultTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#641f1f',
  secondary: '#f2f5ea',
  buttonBackground: '#4CAF50',
  buttonText: '#FFFFFF',
  cardBackground: '#F5F5F5',
  cardBorder: '#CCCCCC',
};

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const RecipesContent = () => {
  const { theme = defaultTheme } = useTheme() || {};
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton destination="/caloriecounter"/>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, recipeType === 'cutting' && styles.activeButton, { backgroundColor: theme.primary }]}
          onPress={() => setRecipeType('cutting')}
        >
          <Text style={[styles.buttonText, { color: theme.secondary }]}>Cutting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, recipeType === 'bulking' && styles.activeButton, { backgroundColor: theme.primary }]}
          onPress={() => setRecipeType('bulking')}
        >
          <Text style={[styles.buttonText, { color: theme.secondary }]}>Bulking</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={{ color: theme.text }}>Loading...</Text>}
      {!loading && filteredRecipes.length === 0 && <Text style={{ color: theme.text }}>No recipes found</Text>}

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <View style={[
            styles.card, 
            { 
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
            }
          ]}>
            <Image source={{ uri: item.image_address }} style={styles.image} />
            <Text style={[styles.title, { color: theme.primary }]}>{item['food name']}</Text>
            <Text style={[styles.text, { color: theme.text }]}>Ingredients:
            <Text>{'\n'}</Text>{item.ingredients}</Text>
            <Text style={[styles.text, { color: theme.text }]}>Calories: {item.calories}</Text>
            <Text style={[styles.text, { color: theme.text }]}>Protein: {item['protein (grams)']} grams</Text>
            <Text style={[styles.text, { color: theme.text }]}>Directions: 
            <Text>{'\n'}</Text>{item.directions}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const RecipesPage = () => {
  return (
    <ThemeProvider>
      <RecipesContent />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  activeButton: {
    opacity: 0.8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,  // Add border width
    shadowColor: "#000",  // Add shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
  },
});

export default RecipesPage;