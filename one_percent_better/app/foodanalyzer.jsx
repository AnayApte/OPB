import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Appbar, Card, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GEMINI_API_KEY }from '@env';


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const defaultTheme = {
  background: '#3b0051',
  text: '#f2e2fb',
  primary: '#f2e2fb',
  secondary: '#3b0051',
  buttonBackground: '#f2e2fb',
  buttonText: '#3b0051',
};

function FoodAnalyzerContent() {
  const { theme = defaultTheme } = useTheme();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImageFromGallery = async () => {
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

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return false;
    }
    return true;
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
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

  const NavButton = ({ icon, label, onPress, style, iconSize = 24 }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => {
          setIsPressed(false);
          onPress();
        }}
        style={({ pressed }) => [
          styles.navButton,
          style,
          isPressed && styles.navButtonPressed
        ]}
      >
        <View style={styles.navButtonInner}>
          <MaterialCommunityIcons 
            name={icon} 
            size={iconSize} 
            color={isPressed ? defaultTheme.background : defaultTheme.buttonText} 
          />
          <Text style={[styles.navButtonText, isPressed && styles.navButtonTextPressed]}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Appbar.Header style={{ backgroundColor: defaultTheme.background }}>
        <Appbar.BackAction onPress={() => router.back()} color={defaultTheme.primary}/>
        <Appbar.Content title="Bite Insight" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: defaultTheme.background }]}>Welcome to Bite Insight</Text>
            <Text style={[styles.description, { color: defaultTheme.background}]}>
              Unlock the nutritional secrets of your meals with our AI-powered food analyzer. Simply upload a photo of your food, and we'll provide you with detailed nutritional information, including calories, protein, and fat content.
            </Text>
          </Card.Content>
        </Card>

        <NavButton
          icon="image" 
          label="Pick Image from Camera Roll"
          onPress={pickImageFromGallery}
          style={styles.pickImageButton}
        />

        <NavButton
          icon="camera"  
          label="Take a Picture"
          onPress={takePhotoWithCamera}
          style={styles.takePictureButton}
        />

        <ScrollView style={styles.scrollContent}>
          {loading && <ActivityIndicator animating={true} style={styles.loader} color={defaultTheme.primary} />}
          {image && (
            <Card style={styles.card}>
              <Card.Content>
                <Image source={{ uri: image }} style={styles.image} />
                <Text style={[styles.analysisTitle, { color: theme.primary }]}>Analysis Results:</Text>
                <Text style={[styles.analysisText, { color: theme.text }]}>{analysis}</Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: defaultTheme.background,
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
  scrollContent: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    backgroundColor: defaultTheme.primary,
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
  pickImageButton: {
    marginBottom: 16,
    width: '100%',
  },
  takePictureButton: {
    marginBottom: 16,
    width: '100%',
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
  navButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: defaultTheme.buttonBackground,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonPressed: {
    backgroundColor: defaultTheme.text,
    transform: [{ scale: 0.95 }],
  },
  navButtonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: defaultTheme.buttonText,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  navButtonTextPressed: {
    color: defaultTheme.background,
  },
});

export default function FoodAnalyzer() {
  return (
    <ThemeProvider>
      <FoodAnalyzerContent />
    </ThemeProvider>
  );
}
