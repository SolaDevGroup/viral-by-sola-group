import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Eye, TrendingUp, Sparkles } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    icon: Eye,
    title: 'VIEWS ARE EVERYTHING',
    description: 'On Viral, views are the currency of success. The more eyes on your content, the bigger you grow.',
  },
  {
    icon: TrendingUp,
    title: 'GO VIRAL INSTANTLY',
    description: 'Our algorithm helps great content reach millions. Your next video the one that blows up.',
  },
  {
    icon: Sparkles,
    title: 'CREATE & CONNECT',
    description: 'Share your moments with the world. Build your audience and join a community of creators.',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentStep < onboardingData.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        router.replace('/registration' as Href);
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const current = onboardingData[currentStep];
  const IconComponent = current.icon;

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <LinearGradient
        colors={['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.64)']}
        style={styles.videoOverlay}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                index <= currentStep ? styles.progressBarActive : styles.progressBarInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.brandingContainer}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>Viral.</Text>
            <View style={styles.betaBadgeOuter}>
              <View style={styles.betaBadgeInner}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </View>
          </View>
          <View style={styles.byLineContainer}>
            <View style={styles.byRow}>
              <Text style={styles.byText}>By</Text>
              <Text style={styles.authorText}>Viktor Sola</Text>
            </View>
            <Text style={styles.signatureText}>Viktor Sola</Text>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={['rgba(55, 184, 116, 0)', '#12FFAA']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={[styles.bottomContainer, { paddingBottom: 42 }]}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={styles.iconWrapper}>
            <IconComponent color="#FFFFFF" size={28} strokeWidth={2} />
          </View>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </Animated.View>

        <TouchableOpacity style={styles.buttonOuter} onPress={handleNext}>
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Continue</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 100,
  },
  progressBarActive: {
    backgroundColor: '#FFFFFF',
  },
  progressBarInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  brandingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontSize: 40,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  betaBadgeOuter: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 100,
    padding: 2,
  },
  betaBadgeInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  betaText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#121221',
  },
  byLineContainer: {
    alignItems: 'center',
    gap: 2,
  },
  byRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  byText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  authorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  signatureText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingHorizontal: 12,
    gap: 40,
  },
  contentContainer: {
    paddingHorizontal: 12,
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 20,
  },
  buttonOuter: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 100,
    padding: 4,
    marginHorizontal: 0,
  },
  buttonInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#121212',
  },
});
