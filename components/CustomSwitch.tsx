import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";

interface CustomSwitchProps {
  value: boolean;
  setValue: (value: boolean) => void;

  marginRight?: number;
  marginLeft?: number;
  marginBottom?: number;

  bgColor?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  setValue,
  marginRight,
  marginLeft,
  marginBottom,
  bgColor,
}) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.switchContainer,
        {
          marginLeft,
          marginRight,
          marginBottom,
        } as ViewStyle,
      ]}
    >
      <ToggleSwitch
        isOn={value}
        onToggle={setValue}
        size="medium"
        onColor="#000"
        offColor="#000"
        thumbOnStyle={styles.thumb}
        thumbOffStyle={styles.thumb}
        trackOnStyle={[
          styles.track,
          { backgroundColor: bgColor || accentColor },
        ]}
        trackOffStyle={[
          styles.track,
          { backgroundColor: theme.cardBackground },
        ]}
      />
    </View>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  switchContainer: {},

  thumb: {
    backgroundColor: "#fff",
    height: 27,
    width: 27,
    borderRadius: 100,
    marginLeft: 2,
  },

  track: {
    height: 31,
    width: 51,
    borderRadius: 100,
  },
});
