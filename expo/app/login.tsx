import AuthFooter from "@/components/AuthFooter";
import CustomPhoneInput from "@/components/CustomPhoneInput";
import ExpoIcons from "@/components/ExpoIcons";
import { default as Colors } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Login = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { email: paramEmail, phone } = useLocalSearchParams<{
    email?: string;
    phone?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(paramEmail || "");
  const [phoneNumber, setPhoneNumber] = useState(phone || "");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">(
    phone ? "phone" : "email"
  );

  const canContinue = () => {
    switch (contactMethod) {
      case "email":
        return email?.trim()?.length;
      case "phone":
        return phoneNumber?.trim()?.length;

      default:
        return false;
    }
  };

  const handleLogin = () => {
    try {
      if (contactMethod === "email") {
        router.push({
          pathname: "/otpverification",
          params: { email },
        });
      } else {
        router.push({
          pathname: "/otpverification",
          params: { phone: phoneNumber },
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.headerTitle}>Login</Text>

      <View style={styles.contactToggle}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            contactMethod === "email" && styles.toggleOptionActive,
          ]}
          onPress={() => setContactMethod("email")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleOptionText,
              contactMethod === "email" && styles.toggleOptionTextActive,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            contactMethod === "phone" && styles.toggleOptionActive,
          ]}
          onPress={() => setContactMethod("phone")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleOptionText,
              contactMethod === "phone" && styles.toggleOptionTextActive,
            ]}
          >
            Phone Number
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.questionTitle, { marginTop: 0, marginBottom: 8 }]}>
        What is your {contactMethod === "email" ? "email" : "phone number"}?
      </Text>

      {contactMethod === "email" ? (
        <View style={styles.textInputContainer}>
          <TextInput
            style={[
              styles.textInput,
              {
                fontFamily:
                  email.length > 0 ? "Poppins_500Medium" : "Poppins_400Regular",
              },
            ]}
            placeholder="E.g. abc@email.com"
            placeholderTextColor={Colors.blackOpacity48}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : (
        <CustomPhoneInput
          style={[
            {
              fontFamily:
                phoneNumber.length > 0
                  ? "Poppins_500Medium"
                  : "Poppins_400Regular",
            },
          ]}
          placeholder="XXX XXX XX"
          value={phoneNumber}
          setValue={setPhoneNumber}
          marginBottom={5}
        />
      )}

      <View style={styles.helperRow}>
        <ExpoIcons
          family="MaterialIcons"
          name="info-outline"
          color={Colors.blackOpacity64}
          size={12}
        />
        <Text style={styles.helperTextLight}>
          Please enter a valid{" "}
          {contactMethod === "email" ? "email address" : "phone number"}.
        </Text>
      </View>

      <View style={styles.helperRow}>
        <ExpoIcons
          family="MaterialIcons"
          name="info-outline"
          color={Colors.blackOpacity64}
          size={12}
        />
        <Text style={styles.helperTextLight}>
          We will later use this{" "}
          {contactMethod === "email" ? "email" : "phone number"} to verify your
          account.
        </Text>
      </View>

      <AuthFooter
        loading={loading}
        onPress={handleLogin}
        disabled={!canContinue()}
      />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.darkGray,
    letterSpacing: -0.3,
    marginTop: 20,
  },

  contactToggle: {
    flexDirection: "row",
    borderRadius: 100,
    padding: 4,
    gap: 4,
    marginTop: 10,
    marginBottom: 10,
  },
  toggleOption: {
    flex: 1,
    height: 32,
    borderRadius: 100,
    backgroundColor: Colors.blackOpacity04,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleOptionActive: {
    backgroundColor: Colors.black,
  },

  toggleOptionText: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.07,
  },
  toggleOptionTextActive: {
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  toggleOptionTextDisabled: {
    color: Colors.blackOpacity16,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    marginTop: 26,
    color: Colors.black,
    letterSpacing: -0.24,
    lineHeight: 24 * 1.4,
  },
  textInputContainer: {
    height: 48,
    backgroundColor: Colors.blackOpacity04,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginBottom: 6,
  },
  textInput: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.darkGray,
    letterSpacing: -0.48,
  },
  helperTextLight: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.36,
    flex: 1,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
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
