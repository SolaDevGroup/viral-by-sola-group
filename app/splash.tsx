import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const gradientRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(flipAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();

    Animated.loop(
      Animated.timing(gradientRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [flipAnim, gradientRotation]);

  const flipInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  });

  const scaleX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  const gradientRotate = gradientRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pillWrapper}>
          <Animated.View 
            style={[
              styles.gradientContainer,
              { transform: [{ rotate: gradientRotate }] }
            ]}
          >
            <LinearGradient
              colors={['#37B874', '#12FFAA', '#37B874']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradientBorder}
            />
          </Animated.View>
          <View style={styles.pillInner}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [
                    { perspective: 1000 },
                    { rotateY: flipInterpolate },
                    { scaleX: scaleX },
                  ],
                },
              ]}
            >
              <Globe color="#014D3A" size={56} strokeWidth={1.5} />
            </Animated.View>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.fromText}>from</Text>
          {Platform.OS === 'web' ? (
            <Text style={styles.brandTextGradient}>Sola Group</Text>
          ) : (
            <LinearGradient
              colors={['#37B874', '#12FFAA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientTextContainer}
            >
              <Text style={styles.brandTextMask}>Sola Group</Text>
            </LinearGradient>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  gradientContainer: {
    position: 'absolute',
    width: 120,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBorder: {
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
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    letterSpacing: -0.07,
  },
  brandTextGradient: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.8,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(153.43deg, #37B874 0%, #12FFAA 83.33%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      } as any,
      default: {
        color: '#37B874',
      },
    }),
  },
  gradientTextContainer: {
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  brandTextMask: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },
});
