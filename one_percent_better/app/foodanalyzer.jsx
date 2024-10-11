import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';

// WARNING: Storing API keys in the client is not secure for production use
const API_KEY = 'AIzaSyAY4p4uud0f5iSXH8SEBFm-UfhusLo5HwU';
const genAI = new GoogleGenerativeAI(API_KEY);

const FoodNutritionAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const selectImage = async () => {
    try {
      console.log('Launching image library...');
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);
      console.log('Image library response:', result);
      if (!result.canceled) {
        console.log('Selected image URI:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image: ', error);
      Alert.alert('Error', 'An error occurred while selecting the image. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert on nutrition, you will receive an image and you must analyze the different food/s present in the image and output the following information: Food Name X AMOUNT, Calories, Grams of Protein, Grams of Fat THEN A NEW LINE. IT MUST BE OUTPUTTED IN THIS FORMAT: Food Name X AMOUNT, Calories: X, Protein: Xg, Fat: Xg. \n\nIF THERE ARE MULTIPLE FOODS IN THE IMAGE, OUTPUT EACH FOOD IN A NEW LINE. \n\nIF THERE ARE NO FOODS IN THE IMAGE, OUTPUT THIS MESSAGE ONLY AND NOTHING ELSE: No food was detected in the image. Please try again or take another picture of the food. \n\n

DON'T OUTPUT ANYTHING BUT THE SPECIFIED FORMAT. I DON'T WANT AN EXPLANATION OR ANYTHING.

AFTER THIS, OUTPUT A TOTAL AMOUNT OF CALORIES, PROTEIN, & FAT IN THE IMAGE (THE TOTAL AMOUNTS MUST EQUAL THE INDIVIDUAL AMOUNTS ADDED UP).

IF A PICTURE OF A DOG/CAT IS PUT IN, MAKE SURE TO OUPUT IT LIKE IF SOMEONE ATE THE DOG/CAT (AS A JOKE)

IF THE TOTAL CALORIES IS OVER 900, CALL THE USER A FATTY WHO NEEDS TO HIT THE GYM (AS A JOKE).

`;

      // Read the image file as base64
      const base64ImageData = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64ImageData,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      setNutritionData(text);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
      setNutritionData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Nutrition Analyzer</Text>
      <Button title="Select Food Image" onPress={selectImage} />
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
      <Button 
        title="Analyze Nutrition" 
        onPress={analyzeImage} 
        disabled={!image || loading} 
      />
      {loading && <Text style={styles.loadingText}>Analyzing...</Text>}
      {nutritionData && (
        <View style={styles.nutritionContainer}>
          <Text style={styles.nutritionTitle}>Nutritional Information:</Text>
          <Text style={styles.nutritionText}>{nutritionData}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  nutritionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  nutritionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});

export default FoodNutritionAnalyzer;