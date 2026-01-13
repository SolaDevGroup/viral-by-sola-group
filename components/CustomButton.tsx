import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  DimensionValue,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import CustomText from "./CustomText";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

interface CustomButtonProps {
  onPress?: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  customText?: any;
  marginBottom?: number;
  marginTop?: number;
  backgroundColor?: string;
  color?: string;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  justifyContent?: ViewStyle["justifyContent"];
  alignItems?: ViewStyle["alignItems"];
  flexDirection?: ViewStyle["flexDirection"];
  alignSelf?: ViewStyle["alignSelf"];
  fontSize?: number;
  indicatorColor?: string;
  marginRight?: number;
  borderWidth?: number;
  borderColor?: string;
  fontFamily?: string;
  loadingSize?: number | "small" | "large";
  mainStyle?: StyleProp<ViewStyle>;
  icon?: any;
  icnWidth?: number;
  icnHeight?: number;
  size?: number;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  customStyle,
  customText,
  marginBottom,
  marginTop,
  backgroundColor,
  color = colors.white,
  width = "100%",
  height = 48,
  borderRadius = 99,
  justifyContent = "center",
  alignItems = "center",
  flexDirection = "row",
  alignSelf = "center",
  fontSize = 18,
  indicatorColor,
  marginRight,
  borderWidth,
  borderColor,
  fontFamily = "Poppins_500Medium",
  loadingSize,
  mainStyle,
  icon,

  size = 20,
}) => {
  const [animation] = useState(new Animated.Value(1));
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  const handlePressIn = () => {
    Animated.spring(animation, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animation, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle: ViewStyle = {
    transform: [{ scale: animation }],
  };

  if (
    typeof width === "number" ||
    (typeof width === "string" && width.endsWith("%"))
  ) {
    animatedStyle.width = width as DimensionValue;
  }

  if (alignSelf !== undefined) {
    animatedStyle.alignSelf = alignSelf;
  }

  return (
    <Animated.View style={[mainStyle, animatedStyle]}>
      <TouchableOpacity
        disabled={loading || disabled}
        activeOpacity={0.6}
        style={[
          {
            backgroundColor: backgroundColor || colors.primary,
            marginTop,
            marginBottom,
            width: "100%",
            height,
            borderRadius,
            flexDirection,
            alignItems,
            justifyContent,
            marginRight,
            borderWidth,
            borderColor,
          },
          disabled && styles.continueButtonDisabled,
          customStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator
            size={loadingSize || 25}
            color={indicatorColor || colors.white}
          />
        ) : (
          <>
            {icon && icon}
            <CustomText
              textStyle={customText}
              label={title}
              color={
                disabled ? colors.blackOpacity08 : color ? color : colors.white
              }
              fontFamily={fontFamily}
              fontSize={fontSize}
              textTransform="capitalize"
              lineHeight={22}
            />
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomButton;
const styles = StyleSheet.create({
  continueButtonDisabled: {
    opacity: 0.6,
  },
});
