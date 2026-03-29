import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, ViewStyle } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface AnimatedCircleProps {
  size?: number;
  strokeWidth?: number;
  gap?: number;
  duration?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
  backgroundColor?: string;
}

const AnimatedCircle: React.FC<AnimatedCircleProps> = ({
  size = 200,
  strokeWidth = 3,
  gap = 0,
  duration = 2000,
  style,
  children,
  backgroundColor = "transparent",
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [duration]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const innerSize = size - strokeWidth * 2 - gap * 2;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <View style={[styles.container, style]}>
      {/* SVG Animated gradient ring - truly transparent center */}
      <AnimatedSvg
        width={size}
        height={size}
        style={{
          position: "absolute",
          transform: [{ rotate }],
        }}
      >
        <Defs>
          <SvgLinearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#37B874" />
            <Stop offset="1" stopColor="#12FFAA" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
        />
      </AnimatedSvg>

      {/* Inner content - smaller to create visible gap */}
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            overflow: "hidden",
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export default AnimatedCircle;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  outer: {
    position: "absolute",
    overflow: "hidden",
  },
  inner: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
