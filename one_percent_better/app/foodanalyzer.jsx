import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Button, Card, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// WARNING: Storing API keys in the client is not secure for production use
const API_KEY = 'AIzaSyAY4p4uud0f5iSXH8SEBFm-UfhusLo5HwU';
const genAI = new GoogleGenerativeAI(API_KEY);

const defaultTheme = {
  background: '#f2e2fb',
  text: '#641f1f',
  primary: '#3b0051',
  secondary: '#f2f5ea',
  buttonBackground: '#3b0051',
  buttonText: '#f2f5ea',
};

function FoodAnalyzerContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri) => {
    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert on nutrition, you will receive an image and you must analyze the different food/s present in the image and output the following information: Food Name X AMOUNT, Calories, Grams of Protein, Grams of Fat THEN A NEW LINE. IT MUST BE OUTPUTTED IN THIS FORMAT: Food Name X AMOUNT, Calories: X, Protein: Xg, Fat: Xg. \n\nIF THERE ARE MULTIPLE FOODS IN THE IMAGE, OUTPUT EACH FOOD IN A NEW LINE. \n\nIF THERE ARE NO FOODS IN THE IMAGE, OUTPUT THIS MESSAGE ONLY AND NOTHING ELSE: No food was detected in the image. Please try again or take another picture of the food. \n\n

DON'T OUTPUT ANYTHING BUT THE SPECIFIED FORMAT. I DON'T WANT AN EXPLANATION OR ANYTHING.

AFTER THIS, OUTPUT A TOTAL AMOUNT OF CALORIES, PROTEIN, & FAT IN THE IMAGE (THE TOTAL AMOUNTS MUST EQUAL THE INDIVIDUAL AMOUNTS ADDED UP).

If there are multiple of the same food item in the picture, output them all on one line, adding up the nutritional content so as to declutter up the results.
When multiple of the same food are on the same line, the nutriontal content of the line should be singular, ex:
Tacos x 3, calories for 1 taco, protein for 1 taco, fat for 1 taco
However the total should still be all of them added up, so calories for 3 tacos, protein for 3 tacos, fat for 3 tacos

NEVER OUTPUT ABOUT THE INGREDIENTS OF THE FOOD, ONLY THE FOOD ITSELF, ex:
output tacos, not beef, lettuce, cheese, tortilla, etc. \n\n

This also means that the nutritional information must be accurate to the food item, not the ingredients. \n\n

`;
      const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: "image/jpeg" } }]);

      setAnalysis(result.response.text());
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysis("Error analyzing image. Please try again.");
    }
    setLoading(false);
  };

  return (
<View style={[styles.container, { backgroundColor: theme.background }]}>
        <Appbar.Header style = { {backgroundColor: defaultTheme.background } }>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content  title="Food Analyzer" />
      </Appbar.Header>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: defaultTheme.buttonBackground }]}>Welcome to Food Analyzer</Text>
            <Text style={[styles.description, { color: theme.text }]}>
              Unlock the nutritional secrets of your meals with our advanced AI-powered Food Analyzer. Simply upload a photo of your food, and we'll provide you with detailed nutritional information, including calories, protein, and fat content.
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              icon="camera" 
              mode="contained" 
              onPress={pickImage} 
              style={styles.button}
              buttonColor={defaultTheme.buttonBackground}
            >
              Pick an image from camera roll
            </Button>
            {loading && <ActivityIndicator animating={true} style={styles.loader} />}
            {image && (
              <View>
                <Image source={{ uri: image }} style={styles.image} />
                <Text style={[styles.analysisTitle, { color: theme.primary }]}>Analysis Results:</Text>
                <Text style={[styles.analysisText, { color: theme.text }]}>{analysis}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
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
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 16,
  },
});

export default function FoodAnalyzer() {
  return (
    <ThemeProvider>
      <FoodAnalyzerContent />
    </ThemeProvider>
  );
}