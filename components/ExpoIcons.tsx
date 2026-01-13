import React from "react";
import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";

const ICON_FAMILIES = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} as const;

export type IconFamily = keyof typeof ICON_FAMILIES;

interface ExpoIconsProps {
  family?: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>; // ✅ added
}

export default function ExpoIcons({
  family,
  name,
  size = 24,
  color = "#000000",
  style,
}: ExpoIconsProps) {
  if (!family || !(family in ICON_FAMILIES)) {
    console.warn(`Icon family "${family}" not found`);
    return null;
  }

  const IconComponent = ICON_FAMILIES[family];

  return (
    <IconComponent
      name={name as any}
      size={size}
      color={color}
      style={style} // ✅ forwarded
    />
  );
}
