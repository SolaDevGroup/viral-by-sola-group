import ExpoIcons from "@/components/ExpoIcons";
import { default as Colors } from "@/constants/colors";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthFooterProps = {
  loading?: boolean;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
};

const AuthFooter: React.FC<AuthFooterProps> = ({
  loading = false,
  disabled = false,
  onPress = () => {},
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.footerContent}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color={Colors.black} size={24} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              disabled && styles.continueButtonDisabled,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={loading || disabled}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size={40} />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tosRow}>
          <ExpoIcons
            family="MaterialIcons"
            name="info-outline"
            color={Colors.blackOpacity48}
            size={12}
          />

          <Text style={styles.tosText}>
            By pressing &quot;<Text style={styles.tosBold}>Continue</Text>
            &quot; you agree with <Text style={styles.tosLink}>Viral </Text>
            <Text style={[styles.tosLink, { textDecorationLine: "underline" }]}>
              TOS
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AuthFooter;

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  footerContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: Colors.blackOpacity04,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  tosRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  tosText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity48,

    letterSpacing: -0.36,
    textAlign: "center",
  },
  tosBold: {
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",

    color: Colors.black,
  },
  tosLink: {
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
  },
});
