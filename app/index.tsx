import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe } from 'lucide-react-native';

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[Index] Mounting, showing splash for 2s');
    const timeout = setTimeout(() => {
      console.log('[Index] Ready to navigate');
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (isReady) {
    console.log('[Index] Redirecting to discover');
    return <Redirect href="/(tabs)/discover" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pillWrapper}>
          <LinearGradient
            colors={['#37B874', '#12FFAA', '#37B874']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradientBorder}
          />
          <View style={styles.pillInner}>
            <Globe color="#014D3A" size={56} strokeWidth={1.5} />
          </View>
        </View>

        <ActivityIndicator size="small" color="#37B874" style={styles.loader} />

        <View style={styles.footerContainer}>
          <Text style={styles.fromText}>from</Text>
          <Text style={styles.brandText}>Sola Group</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillWrapper: {
    width: 88,
    height: 138,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradientBorder: {
    position: 'absolute',
    width: 88,
    height: 138,
    borderRadius: 44,
  },
  pillInner: {
    width: 80,
    height: 130,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 30,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    gap: 4,
  },
  fromText: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.48)',
    fontWeight: '400' as const,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#37B874',
  },
});

