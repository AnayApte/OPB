import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import BackButton from '../utils/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SUPABASEURL, SUPABASEKEY } from '@env';

const supabaseUrl = SUPABASEURL;
const supabaseKey = SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey)

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipeType, setRecipeType] = useState('cutting'); // Default to cutting recipes

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('recipes').select('*');
      setLoading(false);

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched data:', data); // Logging the fetched data
        setRecipes(data);
        filterRecipes(data, recipeType); // Filter recipes based on initial recipeType
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterRecipes = (data, type) => {
    console.log('Filtering recipes for type:', type); // Debug log
    const filtered = data.filter(recipe => recipe.highorlowcalories === (type === 'bulking'));
    console.log('Filtered recipes:', filtered); // Debug log
    setFilteredRecipes(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRecipes(recipes, recipeType);
  }, [recipeType, recipes]);

  return (
    <SafeAreaView style={styles.container}>
      <BackButton destination="/calorieCounter"/>
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
      {loading && <Text>Loading...</Text>}
      {!loading && filteredRecipes.length === 0 && <Text>No recipes found</Text>}

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_address }} style={styles.image} />
            <Text style={styles.title}>{item['food name']}</Text>
            <Text style={styles.text}>Ingredients:
            <Text>{'\n'}</Text>{/* Adds a line break */}{item.ingredients}</Text>
            <Text style={styles.text}>Calories: {item.calories}</Text>
            <Text style={styles.text}>Protein: {item['protein (grams)']} grams</Text>
            <Text style={styles.text}>Directions: 
            <Text>{'\n'}</Text>{/* Adds a line break */}{item.directions}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple',
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
    backgroundColor: 'yellow',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: 'orange',
  },
  buttonText: {
    color: 'purple',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'yellow',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'purple',
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
});

export default RecipesPage;
