import { Redirect } from 'expo-router';

export default function Index() {
  // Root redirect to auth flow
  return <Redirect href="/(auth)/login" />;
}
