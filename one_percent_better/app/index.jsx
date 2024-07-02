import { StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

export default function App() {
  return (
    <View style = {styles.container}>
      <Text>One Percent Better!</Text>
      <StatusBar style = "auto" />
      <Link href="/strong" style={{ color: 'blue' }}>Go 
      to Strong</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
