import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";

interface BorderProps {
  height?: number;
  bgColor?: string;
  marginTop?: number;
  marginBottom?: number;
  marginVertical?: number;
}

const Border: React.FC<BorderProps> = ({
  height = 1,
  bgColor,
  marginTop,
  marginBottom,
  marginVertical,
}) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.border,
        {
          backgroundColor: bgColor ?? theme.borderLight,
          height,
          marginTop,
          marginBottom,
          marginVertical,
        },
      ]}
    />
  );
};

export default Border;

const styles = StyleSheet.create({
  border: {
    width: "100%",
  },
});
