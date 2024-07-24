// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://hhaknhsygdajhabbanzu.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);

  // Fetch data from Supabase
  const fetchData = async () => {
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setRecipes(data);
    }
  };

  // Use useEffect to fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Render each recipe item
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_address }} style={styles.image} />
      <Text style={styles.title}>{item['food name']}</Text>
      <Text style={styles.text}>Ingredients: {item.ingredients}</Text>
      <Text style={styles.text}>Calories: {item.calories}</Text>
      <Text style={styles.text}>Protein: {item['protein (grams)']} grams</Text>
      <Text style={styles.text}>Directions: {item.directions}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
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
