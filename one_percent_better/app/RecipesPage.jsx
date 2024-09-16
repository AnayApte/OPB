import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import BackButton from '../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext'; // Import useTheme

const supabaseUrl = 'https://hhaknhsygdajhabbanzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYWtuaHN5Z2RhamhhYmJhbnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwMjQ3MjEsImV4cCI6MjAzNTYwMDcyMX0.kK8viaMqxFPqylFTr0RvC0V6BL6CtB2jLgZdn-AhGc4';
const supabase = createClient(supabaseUrl, supabaseKey);

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipeType, setRecipeType] = useState('cutting');
  const { theme } = useTheme(); // Access the theme

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.primary,
      marginBottom: 20,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    toggleButton: {
      padding: 10,
      marginHorizontal: 10,
      backgroundColor: theme.secondary,
      borderRadius: 5,
    },
    activeButton: {
      backgroundColor: theme.primary,
    },
    buttonText: {
      color: theme.text,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 10,
    },
    recipeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.accent,
      marginVertical: 10,
    },
    text: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 5,
    },
    loadingText: {
      color: theme.primary,
      fontSize: 18,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <BackButton destination="/caloriecounter"/>
      <Text style={styles.title}>Recipes</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, recipeType === 'cutting' && styles.activeButton]}
          onPress={() => setRecipeType('cutting')}
        >
          <Text style={styles.buttonText}>Cutting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, recipeType === 'bulking' && styles.activeButton]}
          onPress={() => setRecipeType('bulking')}
        >
          <Text style={styles.buttonText}>Bulking</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      {!loading && filteredRecipes.length === 0 && <Text style={styles.loadingText}>No recipes found</Text>}

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_address }} style={styles.image} />
            <Text style={styles.recipeTitle}>{item['food name']}</Text>
            <Text style={styles.text}>Ingredients:{'\n'}{item.ingredients}</Text>
            <Text style={styles.text}>Calories: {item.calories}</Text>
            <Text style={styles.text}>Protein: {item['protein (grams)']} grams</Text>
            <Text style={styles.text}>Directions:{'\n'}{item.directions}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

export default RecipesPage;