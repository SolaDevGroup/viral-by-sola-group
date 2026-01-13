import React, { useEffect, useState, Ref } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
} from "react-native";
import { BlurView } from "expo-blur";

import CustomText from "./CustomText";
import ExpoIcon from "./ExpoIcons";
import InfoComponent from "./InfoComponent";
import Colors from "../constants/colors";
import { useApp } from "@/contexts/AppContext";
import { Image } from "expo-image";
import { Images } from "@/assets/images";

interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;

  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoFocus?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"] | any;
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  onEndEditing?: TextInputProps["onEndEditing"];

  placeholderTextColor?: string;
  textAlignVertical?: "auto" | "top" | "bottom" | "center";

  height?: number;
  width?: number | string | any;
  borderRadius?: number;
  borderColor?: string;

  marginBottom?: number;
  marginTop?: number;
  paddingVertical?: number;
  paddingBottom?: number;

  error?: string | boolean;
  cardInfo?: string;

  withLabel?: string;
  labelColor?: string;

  isFocus?: () => void;
  isBlur?: () => void;

  search?: boolean;
  isSwitch?: boolean;

  isClear?: boolean;

  Blur?: boolean;
  blurRadius?: number;
  backgroundColor?: string;
  ref?: Ref<TextInput>;
  color?: string;
  placeholderColor?: string;
}

const CustomInput = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  editable,
  textAlignVertical,
  marginBottom,
  height = 56,
  autoCapitalize,
  error,
  isFocus,
  isBlur,
  width,
  onEndEditing,
  autoFocus,
  ref,
  borderRadius,
  marginTop,
  withLabel,
  labelColor,
  borderColor,
  search,
  cardInfo,
  isClear,
  paddingVertical,
  paddingBottom = 0,
  returnKeyType,
  onSubmitEditing,
  Blur,
  blurRadius,
  backgroundColor,
  color,
  placeholderColor,
}: CustomInputProps) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  console.log(isDarkMode);
  const [isFocused, setIsFocused] = useState(false);
  const [hidePass, setHidePass] = useState(true);
  const [showSuccessColor, setShowSuccessColor] = useState(false);
  const [prevError, setPrevError] = useState(error);

  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  useEffect(() => {
    if (prevError && !error) {
      setShowSuccessColor(true);
      const timer = setTimeout(() => {
        setShowSuccessColor(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevError(error);
  }, [error, prevError]);

  return (
    <View style={{ width: width ?? "100%" }}>
      <View
        style={{
          marginBottom: marginBottom || 8,
          paddingBottom: withLabel ? 6 : paddingBottom,
          marginTop,
          height: height ? height : multiline ? 180 : 70,
          width: "100%",
          borderRadius: borderRadius || 12,
          paddingLeft: 12,
          justifyContent: withLabel ? "flex-start" : "center",
          backgroundColor: error
            ? "#EE10450A"
            : showSuccessColor
            ? "#64CD750A"
            : backgroundColor
            ? backgroundColor
            : theme.cardBackground,
          borderColor: error
            ? "#EE1045"
            : showSuccessColor
            ? "#64CD75"
            : borderColor,
          borderWidth: error ? 1 : 0,
          overflow: blurRadius ? "hidden" : "visible",
        }}
      >
        {Blur && (
          <BlurView
            tint="light"
            intensity={32}
            style={StyleSheet.absoluteFill}
          />
        )}

        {withLabel && (
          <CustomText
            label={withLabel}
            color={
              labelColor ||
              (error
                ? "#EE1045"
                : showSuccessColor
                ? "#64CD75"
                : theme.textSecondary)
            }
            fontFamily="Poppins_500Medium"
            fontSize={12}
            textTransform="uppercase"
            marginTop={8}
          />
        )}

        <View style={styles.mainContainer}>
          {search && (
            <ExpoIcon
              family="MaterialIcons"
              name="search"
              size={24}
              color={color ? placeholderColor : theme.textSecondary}
            />
          )}

          <TextInput
            ref={ref}
            cursorColor="#A19375"
            placeholder={placeholder}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            style={[
              styles.input,
              {
                paddingVertical,
                paddingLeft: search ? 8 : 0,
                color: error
                  ? "#EE1045"
                  : showSuccessColor
                  ? "#64CD75"
                  : color
                  ? color
                  : theme.text,
              },
            ]}
            secureTextEntry={secureTextEntry ? hidePass : false}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value ?? ""}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            multiline={multiline}
            onEndEditing={onEndEditing}
            maxLength={maxLength}
            placeholderTextColor={
              placeholderColor ? placeholderColor : theme.textSecondary
            }
            editable={editable ?? true}
            textAlignVertical={multiline ? "top" : textAlignVertical}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
          />

          {isClear && value?.length ? (
            <TouchableOpacity
              onPress={() => {
                onChangeText?.("");
              }}
            >
              <Image
                source={Images.cross}
                style={{ height: 22, width: 22, marginRight: 12 }}
                tintColor={color ? color : theme.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidePass(!hidePass)}>
            <ExpoIcon
              family="Feather"
              name={hidePass ? "eye" : "eye-off"}
              size={16}
              color={theme.textSecondary}
              style={{
                position: "absolute",
                right: 17,
                top: 21,
              }}
            />
          </TouchableOpacity>
        )}
      </View>

      {cardInfo && <InfoComponent text={cardInfo} />}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  input: {
    height: "100%",
    padding: 0,
    margin: 0,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    flex: 1,
  },
});
