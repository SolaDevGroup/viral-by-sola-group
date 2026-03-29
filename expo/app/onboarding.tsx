import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Href } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import ExpoIcons from "@/components/ExpoIcons";
import { Images } from "@/assets/images";
import colors from "@/constants/colors";
import Blur from "@/components/Blur";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "hasSeenOnboarding";

const onboardingData = [
  {
    icon: "eye",
    family: "MaterialCommunityIcons",
    title: "VIEWS\nARE EVERYTHING",
    description:
      "On Viral, views are the currency of success. The more eyes on your content, the bigger you grow.",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    icon: "trending-up",
    family: "MaterialCommunityIcons",
    title: "GO VIRAL INSTANTLY",
    description:
      "Our algorithm helps great content reach millions. Your next video the one that blows up.",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    icon: "sparkles",
    family: "Ionicons",
    title: "CREATE & CONNECT",
    description:
      "Share your moments with the world. Build your audience and join a community of creators.",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
] as const;

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const videoFinishedRef = useRef(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const advancingRef = useRef(false);
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/registration" as Href);
    } catch (e) {
      console.error("Failed to save onboarding state", e);
    }
  };

  const advanceStep = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentStep < onboardingData.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        completeOnboarding();
        return;
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    completeOnboarding();
  };
  useEffect(() => {
    progressAnim.setValue(0);

    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000, // ⏱ 2 seconds
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished && !advancingRef.current) {
        advancingRef.current = true;
        advanceStep();
        setTimeout(() => {
          advancingRef.current = false;
        }, 300);
      }
    });

    return () => animation.stop();
  }, [currentStep]);

  const current = onboardingData[currentStep];

  return (
    <View style={styles.container}>
      <Video
        key={currentStep}
        source={{ uri: current.video }}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted
      />
      <LinearGradient
        colors={[Colors.blackOpacity0, Colors.blackOpacity64]}
        style={styles.videoOverlay}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <View key={index} style={styles.progressBar}>
              {index < currentStep && (
                <View style={[styles.progressFill, { width: "100%" }]} />
              )}

              {index === currentStep && (
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.brandingContainer}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>
              Viral
              <Text style={{ color: colors.primaryGradient }}>.</Text>
            </Text>

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
        <TouchableOpacity
          style={{
            backgroundColor: "#FFFFFF29",
            paddingVertical: 4,
            paddingHorizontal: 12,
            alignSelf: "flex-end",
            borderRadius: 100,
          }}
          activeOpacity={0.8}
          onPress={completeOnboarding}
        >
          <Blur borderRadius={100} blurType="dark" />
          <Text
            style={[
              styles.authorText,
              {
                fontSize: 14,
                fontFamily: "Poppins_600SemiBold",
              },
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["rgba(55, 184, 116, 0)", Colors.primaryGradient]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={[styles.bottomContainer, { paddingBottom: 42 }]}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={styles.iconWrapper}>
            {current?.icon == "sparkles" ? (
              <Image
                source={Images.spark}
                style={{ height: 48, width: 48, marginBottom: 20 }}
              />
            ) : (
              <ExpoIcons
                family={current.family}
                name={current.icon}
                color={Colors.white}
                size={38}
              />
            )}
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
    backgroundColor: Colors.black,
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 100,
    backgroundColor: Colors.whiteOpacity16,
  },
  progressBarActive: {
    backgroundColor: Colors.white,
  },
  progressBarInactive: {
    backgroundColor: Colors.whiteOpacity16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.white,
    borderRadius: 100,
  },
  brandingContainer: {
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  brandText: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold_Italic",
    color: Colors.white,
    letterSpacing: -0.8,
  },
  betaBadgeOuter: {
    backgroundColor: Colors.whiteOpacity16,
    borderWidth: 1,
    borderColor: Colors.whiteOpacity16,
    borderRadius: 100,
    padding: 2,
  },
  betaBadgeInner: {
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  betaText: {
    fontSize: 8,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: "#121221",
  },
  byLineContainer: {
    alignItems: "center",
    gap: 2,
    marginTop: -6,
  },
  byRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  byText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.8)",
  },
  authorText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  signatureText: {
    fontSize: 16,
    fontFamily: "Holligate",
    color: Colors.white,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingHorizontal: 12,
    gap: 40,
  },
  contentContainer: {
    paddingHorizontal: 12,
    gap: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "ClashDisplay",
    fontSize: 48,
    fontWeight: "700",
    color: Colors.white,
    lineHeight: 48 * 0.98,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.whiteOpacity64,
    lineHeight: 20,
  },
  buttonOuter: {
    borderWidth: 1,
    borderColor: Colors.whiteOpacity48,
    borderRadius: 100,
    padding: 4,
    marginHorizontal: 0,
  },
  buttonInner: {
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.black,
  },
});
