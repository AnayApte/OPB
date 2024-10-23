import { Redirect } from 'expo-router';
import { LogBox } from 'react-native';

// Hide specific warnings (if you want to ignore all, just use ignoreAllLogs)
LogBox.ignoreLogs();

// Or you can hide all logs (warnings, errors, etc.):
// LogBox.ignoreAllLogs(); // Uncomment this to hide all warnings and errors

export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
