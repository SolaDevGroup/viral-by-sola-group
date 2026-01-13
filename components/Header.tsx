import { useNavigation } from "@react-navigation/native";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
} from "react-native";
import Colors from "@/constants/colors";
import CustomText from "./CustomText";
import { useApp } from "@/contexts/AppContext";
import { Images } from "@/assets/images";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  hideBackArrow?: boolean;
  onBackPress?: () => void;
  textColor?: string;
  backgroundColor?: string;
  marginTop?: number;
  marginBottom?: number;
  fontFamily?: string;
  textAlign?: TextStyle["textAlign"];
  borderWidth?: number;
  borderColor?: string;
  iconBackgroundColor?: string;
  paddingTop?: number;
  staticHeader?: false;
  iconColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  hideBackArrow = false,
  onBackPress,
  textColor,
  backgroundColor,
  marginTop,
  marginBottom,
  fontFamily,
  textAlign,
  borderWidth,
  borderColor,
  iconBackgroundColor,
  paddingTop,
  staticHeader,
  iconColor,
}) => {
  const navigation = useNavigation();
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const canGoBack = (): boolean => {
    try {
      return navigation.canGoBack();
    } catch (error) {
      console.log("canGoBack error:", error);
      return false;
    }
  };

  const handleGoBack = (): void => {
    try {
      if (canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.log("goBack error:", error);
    }
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor,
          marginTop,
          marginBottom,
          paddingTop: paddingTop ?? insets.top,
        },
      ]}
    >
      {!hideBackArrow && (
        <TouchableOpacity
          activeOpacity={0.6}
          style={[
            styles.backIcon,
            {
              backgroundColor: iconBackgroundColor || theme.cardBackground,
              borderWidth,
              borderColor,
            },
          ]}
          onPress={onBackPress ?? handleGoBack}
        >
          <Image
            source={Images.back}
            style={{
              height: 26,
              width: 26,
              tintColor: iconColor ? iconColor : theme.textSecondary,
            }}
          />
        </TouchableOpacity>
      )}

      <CustomText
        label={title}
        color={textColor ?? theme.text}
        fontFamily={fontFamily ?? "Poppins_600SemiBold"}
        textTransform="capitalize"
        textAlign={textAlign}
        fontSize={20}
        lineHeight={20 * 1.4}
      />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",

    width: "100%",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
});
