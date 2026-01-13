import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { BlurView } from "expo-blur";

interface SimpleTextAlertProps {
  visible: boolean;
  title: string;
  headerHeight?: number;
  duration?: number; // default 2000ms
  onHide?: () => void;
}

export default function SimpleTextAlert({
  visible,
  title,
  headerHeight = 136,
  duration = 2000,
  onHide,
}: SimpleTextAlertProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.spring(translateY, {
      toValue: headerHeight + 16,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.wrapper}>
        {Platform.OS !== "web" ? (
          <BlurView
            intensity={8}
            tint="dark"
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(255, 255, 255, 0.16)",
            }}
          />
        ) : (
          <View style={styles.webFallback} />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: "center",
  },
  wrapper: {
    // width: 100,
    borderRadius: 100,
    padding: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(18,18,18,0.16)",
  },
  content: {
    backgroundColor: "#121212",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  webFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
});
