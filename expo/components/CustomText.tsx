import React, { ReactNode } from "react";
import { Text, StyleProp, TextStyle, ViewStyle } from "react-native";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

interface CustomTextProps {
  label?: string;
  children?: ReactNode;

  numberOfLines?: number;

  textStyle?: StyleProp<TextStyle>;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: TextStyle["fontStyle"];
  fontWeight?: TextStyle["fontWeight"];
  textTransform?: TextStyle["textTransform"];
  textAlign?: TextStyle["textAlign"];
  textDecorationLine?: TextStyle["textDecorationLine"];
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;

  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  paddingBottom?: number;

  // Positioning
  bottom?: number;
  left?: number;
  right?: number;
  width?: number;
  alignSelf?: ViewStyle["alignSelf"];

  // Borders
  borderColor?: string;
  borderBottomWidth?: number;

  // Container
  containerStyle?: StyleProp<ViewStyle>;
}

const CustomText: React.FC<CustomTextProps> = ({
  textStyle,
  fontSize = 14,
  marginTop = 0,
  marginBottom = 0,
  marginRight = 0,
  marginLeft = 0,
  alignSelf,
  fontFamily = "Poppins_400Regular",
  fontStyle,
  textTransform = "none",
  textAlign,
  label,
  color,
  fontWeight,
  bottom,
  width,
  borderColor,
  borderBottomWidth,

  marginVertical,
  paddingBottom,

  textDecorationLine = "none",

  right,
  left,
  numberOfLines,
  children,

  letterSpacing,
  lineHeight,
  marginHorizontal,
}) => {
  const { isDarkMode } = useApp();
  const theme = Colors.dark;

  const computedLineHeight = lineHeight ?? fontSize * 1.4;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontSize,
          color: color || theme.text,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          fontFamily,
          fontStyle,
          lineHeight: computedLineHeight,
          textAlign,
          textTransform,
          fontWeight,
          bottom,
          borderBottomWidth,
          borderColor,
          width,
          marginVertical,
          marginHorizontal,
          paddingBottom,
          right,
          left,
          letterSpacing,
          textDecorationLine,
          alignSelf,
        },
        textStyle,
      ]}
    >
      {label}
      {children}
    </Text>
  );
};

export default CustomText;
