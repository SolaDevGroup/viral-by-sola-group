import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  GestureResponderEvent,
  ScrollView,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import CustomText from "@/components/CustomText";
import ExpoIcons, { IconFamily } from "@/components/ExpoIcons";
import { Image } from "expo-image";
import { Images } from "@/assets/images";

interface OptionSelectorProps {
  arrow?: "down" | "right";
  error?: boolean;
  showSuccessColor?: boolean;

  placeHolder?: string;
  label?: string;
  value?: string;
  textTransform?: string | any;
  onPress?: (event: GestureResponderEvent) => void;
}

const OptionSelector = ({
  arrow = "right",
  error,
  showSuccessColor,
  placeHolder,
  label,
  onPress,
  value,
  textTransform,
}: OptionSelectorProps) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const iconFamily: IconFamily = "Entypo";

  const iconName = arrow === "down" ? "chevron-down" : "chevron-right";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        {label && (
          <CustomText
            label={label}
            color={theme.textSecondary}
            fontFamily="Poppins_500Medium"
            fontSize={12}
            textTransform="uppercase"
            lineHeight={12 * 1.4}
          />
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {label == "Location" && (
            <Image
              source={Images.location}
              style={{ height: 16, width: 16 }}
              tintColor={value ? Colors.iosBlue : theme.textTertiary}
            />
          )}
          <View style={{ flex: 1 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              <CustomText
                label={value || placeHolder}
                color={value ? theme.text : theme.textTertiary}
                fontFamily={value ? "Poppins_500Medium" : "Poppins_400Regular"}
                fontSize={16}
                lineHeight={16 * 1.4}
                marginTop={1}
                numberOfLines={1}
                textTransform={textTransform}
              />
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={{ alignSelf: "center" }}>
        <ExpoIcons
          family={iconFamily}
          name={iconName}
          size={20}
          color={theme.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default OptionSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
  },
});
