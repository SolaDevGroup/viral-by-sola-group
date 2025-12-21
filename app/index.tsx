import { useEffect, useState } from 'react';
import { useRouter, Href } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import SplashScreen from './splash';

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('[Index] Mounting, will show splash for 2s');
    const timeout = setTimeout(() => {
      console.log('[Index] Navigating to discover...');
      setShowSplash(false);
      try {
        router.replace('/(tabs)/discover' as Href);
        console.log('[Index] Navigation initiated');
      } catch (error) {
        console.error('[Index] Navigation error:', error);
      }
    }, 2000);

    return () => {
      console.log('[Index] Unmounting');
      clearTimeout(timeout);
    };
  }, [router]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#37B874" />
    </View>
  );
}
