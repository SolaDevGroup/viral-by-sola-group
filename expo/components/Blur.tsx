import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";

interface BlurProps {
  blurType?: "light" | "dark" | "default";
  blurAmount?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number ;
}

const Blur: React.FC<BlurProps> = ({
  blurType = "light",
  blurAmount = 16,
  style,
  borderRadius = 12,
}) => {
  return (
    <BlurView
      tint={blurType}
      intensity={blurAmount}
      // blurReductionFactor={4}
      style={[
        styles.default,
        style,
        {
          borderRadius,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
});

export default Blur;
