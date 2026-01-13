import React from "react";
import { StyleSheet, View } from "react-native";
import CustomSwitch from "@/components/CustomSwitch";
import CustomText from "@/components/CustomText";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import InfoComponent from "@/components/InfoComponent";

interface SwitchOptionProps {
  value: boolean;
  setValue: (value: boolean) => void;

  label?: string;
  error?: string;
  errorMarginBottom?: number;
}

const SwitchOption: React.FC<SwitchOptionProps> = ({
  value,
  setValue,
  label = "DISABLE FRIENDLY?",
  error,
  errorMarginBottom,
}) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.cardBackground }]}
      >
        <View style={{ flex: 1 }}>
          <CustomText
            label={label}
            fontFamily="Poppins_500Medium"
            fontSize={12}
            textTransform="uppercase"
            lineHeight={12 * 1.4}
            color={theme.textSecondary}
          />
          <CustomText
            label={value ? "Yes" : "No"}
            color={theme.text}
            fontFamily="Poppins_500Medium"
            fontSize={16}
            lineHeight={16 * 1.4}
          />
        </View>

        <View style={{ alignSelf: "center" }}>
          <CustomSwitch value={value} setValue={setValue} />
        </View>
      </View>

      {error && <InfoComponent text={error} marginBottom={errorMarginBottom} />}
    </>
  );
};

export default SwitchOption;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 8,
    height: 56,
  },
});
