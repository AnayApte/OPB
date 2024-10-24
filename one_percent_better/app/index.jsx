import { Redirect } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
