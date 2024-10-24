import { Redirect } from 'expo-router';
import { LogBox } from 'react-native';


LogBox.ignoreAllLogs(); //uncomment this if u want to show all errors once again



export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
