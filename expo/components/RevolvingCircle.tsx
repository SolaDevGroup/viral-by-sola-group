import { useApp } from "@/contexts/AppContext";
import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";

const RevolvingCircle = ({
  size = 150,
  borderWidth = 4,
  borderColor = "#ff5722",
  children,
  spinning = true,
}: any | null) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { accentColor } = useApp();
  useEffect(() => {
    if (spinning) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [spinning]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Children in the center */}
      <View
        style={{
          width: size - borderWidth * 4,
          height: size - borderWidth * 4,
          borderRadius: (size - borderWidth * 4) / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </View>

      {spinning ? (
        <Animated.View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderWidth: borderWidth,
            borderRadius: size / 2,
            borderColor: "transparent",
            borderTopColor: accentColor,
            transform: [{ rotate }],
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderWidth: borderWidth,
            borderRadius: size / 2,
            borderColor: borderColor,
          }}
        />
      )}
    </View>
  );
};

export default RevolvingCircle;
