import { Images } from "@/assets/images";
import AuthFooter from "@/components/AuthFooter";
import ExpoIcons from "@/components/ExpoIcons";
import { default as Colors } from "@/constants/colors";
import { post } from "@/services/ApiRequest";
import { useLocalSearchParams, useRouter } from "expo-router";
import { default as React, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Otpverification = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { email, phone } = useLocalSearchParams<{
    email?: string;
    phone?: string;
  }>();

  const [sening, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [verificationCode, setVerificationCode] = useState("");

  const isValidCode = verificationCode.length >= 6;

  const startResendTimer = () => {
    setResendTimer(30);
    setCanResend(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setSending(true);
    try {
      if (email) {
        const res = await post("auth/send-otp", {
          email: email,
        });
        if (res?.data?.success) {
          Alert.alert("OTP Received", res.data?.result?.toString(), [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ]);
          startResendTimer();
        }
      } else if (phone) {
        const res = await post("auth/send-otp", {
          phone: {
            number: phone,
            verifyVia: "sms",
          },
        });
        if (res?.data?.success) {
          Alert.alert("OTP Received", res.data?.result?.toString(), [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ]);
          startResendTimer();
        }
      }
    } catch (err) {
      console.log("Resend error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = () => {
    try {
      setLoading(true);
      if (verificationCode === "123456") {
        router.replace("/home");
      } else {
        Alert.alert("Invalid OTP");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error, "in verify");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={[styles.questionTitle]}>Verification</Text>
      <Text style={[styles.questionTitle1]}>Please enter the code</Text>

      <View>
        <View style={styles.codeInputContainer}>
          <TextInput
            style={[
              styles.codeInput,
              {
                fontFamily:
                  verificationCode.length > 0
                    ? "Poppins_500Medium"
                    : "Poppins_400Regular",
              },
            ]}
            placeholder="E.g. XSI456"
            placeholderTextColor={Colors.blackOpacity48}
            value={verificationCode}
            onChangeText={(text) =>
              setVerificationCode(text.toUpperCase().slice(0, 6))
            }
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {isValidCode && (
            <ExpoIcons
              family="Ionicons"
              name="checkmark-circle"
              color={Colors.primaryDark}
              size={24}
            />
          )}
        </View>

        <View style={styles.helperRow}>
          <ExpoIcons
            family="MaterialIcons"
            name="info-outline"
            color={Colors.blackOpacity64}
            size={12}
          />
          <Text style={styles.helperText}>
            {isValidCode
              ? "Valid verification code."
              : "Enter the 6-character code."}
          </Text>
        </View>
      </View>

      <View style={styles.sentToSection}>
        <Text style={styles.sentToLabel}>Verification code was sent to:</Text>
        <View style={styles.emailRow}>
          {email ? (
            <ExpoIcons
              family="Ionicons"
              name="mail"
              color={Colors.black}
              size={14}
            />
          ) : (
            <ExpoIcons
              family="MaterialIcons"
              name="phone"
              color={Colors.black}
              size={14}
            />
          )}
          <Text style={styles.emailText}>{email || phone}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <ExpoIcons
              family="MaterialIcons"
              name="mode-edit-outline"
              color={Colors.black}
              size={16}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resendSection}>
        <TouchableOpacity
          style={[
            styles.resendButton,
            !canResend && styles.resendButtonDisabled,
          ]}
          onPress={handleResendCode}
          activeOpacity={0.7}
          disabled={!canResend || sening}
        >
          {sening ? (
            <ActivityIndicator color={Colors.black} size={"small"} />
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Text style={styles.resendButtonText}>Send again</Text>
              <Image source={Images.replay} style={{ width: 14, height: 14 }} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.helperRow}>
          <ExpoIcons
            family="MaterialIcons"
            name="info-outline"
            color={Colors.blackOpacity64}
            size={12}
          />
          <Text style={styles.helperTextCenter}>
            {canResend
              ? "You can request a new code now."
              : `You can request a new code in ${resendTimer} seconds.`}
          </Text>
        </View>
      </View>

      <AuthFooter
        loading={loading}
        onPress={handleVerify}
        disabled={verificationCode?.trim() === ""}
      />
    </View>
  );
};

export default Otpverification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  codeInputContainer: {
    height: 48,
    backgroundColor: Colors.blackOpacity04,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  codeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.darkGray,
    letterSpacing: -0.48,
  },
  sentToSection: {
    gap: 2,
  },
  sentToLabel: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.36,
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
  questionTitle1: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    marginTop: 26,
    color: Colors.black,
    letterSpacing: -0.24,
    lineHeight: 24 * 1.4,
    marginBottom: 5,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.black,
  },
  resendSection: {
    alignItems: "center",
    gap: 16,
    marginTop: 28,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    height: 32,
    backgroundColor: Colors.blackOpacity04,
    borderRadius: 100,
    gap: 5,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
  },
  helperTextCenter: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.36,
    textAlign: "center",
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
  helperText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.36,
  },
});
