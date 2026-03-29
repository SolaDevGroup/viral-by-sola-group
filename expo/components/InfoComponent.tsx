import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ExpoIcons from "./ExpoIcons";
import CustomText from "./CustomText";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

interface InfoComponentProps {
  text?: string;
  marginBottom?: number;
}
const InfoComponent = ({ text, marginBottom }: InfoComponentProps) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  return (
    <View style={{ flexDirection: "row", gap: 6, marginBottom }}>
      <ExpoIcons
        family="MaterialIcons"
        name="info-outline"
        color={theme.textSecondary}
        size={12}
        style={{ marginTop: 2.4 }}
      />
      <CustomText label={text} fontSize={12} color={theme.textSecondary} />
    </View>
  );
};

export default InfoComponent;

const styles = StyleSheet.create({});
