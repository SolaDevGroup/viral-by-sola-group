import { useEffect, useState } from 'react';
import { useRouter, Href } from 'expo-router';
import { View } from 'react-native';
import SplashScreen from './splash';

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
      // Bypass onboarding and auth - go directly to home
      router.replace('/(tabs)/home' as Href);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <View style={{ flex: 1 }} />;
}
