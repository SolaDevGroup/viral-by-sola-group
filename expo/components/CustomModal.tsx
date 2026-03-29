import React, { ReactNode, useEffect } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  // TouchableOpacity removed as it intercepted gestures
  View,
  ViewStyle,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import type { SupportedAnimation } from "react-native-modal";
import { BlurView } from "expo-blur";
import { useApp } from "@/contexts/AppContext";
import colors from "@/constants/colors";
interface CustomModalProps {
  isVisible?: boolean;

  onDisable?: () => void;
  children: ReactNode;

  transparent?: boolean;
  backdropOpacity?: number;

  mainMargin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginVertical?: number;
  marginHorizontal?: number;

  borderRadius?: number;
  overflow?: ViewStyle["overflow"];

  isChange?: boolean;
  isTop?: boolean;

  paddingBottom?: number;

  animationIn?: SupportedAnimation;
  animationOut?: SupportedAnimation;
  animationInTiming?: number;
  animationOutTiming?: number;

  swipeDirection?:
    | "up"
    | "down"
    | "left"
    | "right"
    | Array<"up" | "down" | "left" | "right">;

  isBlur?: boolean;
  blurType?: "light" | "dark" | "default";
  blurAmount?: number;
  blurColor?: string;

  hasBackdrop?: boolean;
  backdropColor?: string;

  useNativeDriver?: boolean;
  propagateSwipe?: boolean;
}

const CustomModal = ({
  isVisible,
  transparent = true,
  onDisable,
  backdropOpacity = 0.76,
  mainMargin,
  marginTop,
  marginBottom,
  marginVertical,
  marginHorizontal,
  borderRadius,
  overflow,
  children,
  isChange,
  paddingBottom,
  animationIn,
  animationOut,
  swipeDirection,
  animationInTiming,
  animationOutTiming,
  isTop,
  isBlur = false,
  blurType = "dark",
  blurAmount = 4,
  hasBackdrop = true,
  useNativeDriver = true,
  propagateSwipe = false,
  blurColor,
  backdropColor,
}: CustomModalProps) => {
  useEffect(() => {
    let backHandler: { remove: () => void } | undefined;

    if (isVisible) {
      backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (onDisable) {
          onDisable();
          return true;
        }
        return false;
      });
    }

    return () => {
      backHandler?.remove();
    };
  }, [isVisible, onDisable]);

  const getDefaultAnimations = () => {
    if (isChange) {
      return {
        animationIn: "slideInUp" as SupportedAnimation,
        animationOut: "slideOutDown" as SupportedAnimation,
        timing: 400,
      };
    }

    if (isTop) {
      return {
        animationIn: "slideInDown" as SupportedAnimation,
        animationOut: "slideOutUp" as SupportedAnimation,
        timing: 300,
      };
    }

    return {
      animationIn: "fadeIn" as SupportedAnimation,
      animationOut: "fadeOut" as SupportedAnimation,
      timing: 250,
    };
  };

  const defaultAnimations = getDefaultAnimations();
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  return (
    <ReactNativeModal
      isVisible={isVisible}
      animationIn={animationIn ?? defaultAnimations.animationIn}
      animationOut={animationOut ?? defaultAnimations.animationOut}
      swipeDirection={swipeDirection}
      // transparent={transparent}
      onBackdropPress={onDisable}
      onBackButtonPress={onDisable}
      animationInTiming={animationInTiming ?? defaultAnimations.timing}
      animationOutTiming={animationOutTiming ?? defaultAnimations.timing}
      onDismiss={onDisable}
      backdropOpacity={isBlur ? 0 : backdropOpacity}
      backdropColor={backdropColor}
      hasBackdrop={hasBackdrop}
      useNativeDriver={useNativeDriver}
      propagateSwipe={propagateSwipe}
      style={[
        styles.modalStyle,
        {
          margin: mainMargin,
          marginTop,
          marginBottom,
          marginVertical,
          marginHorizontal,
          borderRadius,
          overflow,
        },
      ]}
    >
      {isBlur && (
        <BlurView
          style={StyleSheet.absoluteFill}
          tint={blurType}
          intensity={blurAmount}
        />
      )}

      {/* Changed outer TouchableOpacity to View to stop gesture interception */}
      <View
        style={
          isChange
            ? [
                styles.mainContainer1,
                {
                  paddingBottom:
                    paddingBottom ?? (Platform.OS === "android" ? 0 : 15),
                  backgroundColor: theme.background,
                },
              ]
            : isTop
            ? styles.mainContainer2
            : styles.mainContainer
        }
        // Removed onPress={onDisable} and activeOpacity={1}
      >
        {/* Changed inner TouchableOpacity to View */}
        <View
          style={styles.container}
          // Removed onPress handler and activeOpacity={1}
        >
          {children}
        </View>
      </View>
    </ReactNativeModal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  modalStyle: {
    margin: 0,
  },
  mainContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer1: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "red",
  },
  mainContainer2: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  container: {
    width: "100%",
  },
});
