import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { Href, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Images } from "@/assets/images";
import CustomPhoneInput from "@/components/CustomPhoneInput";
import ExpoIcons from "@/components/ExpoIcons";
import SimpleTextAlert from "@/components/TextAlert";
import { default as Colors, default as colors } from "@/constants/colors";
import { post } from "@/services/ApiRequest";
import { setShowError } from "@/store/slices/AuthConfig";
import { COUNTRIES } from "@/utils/COUNTRIES";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

const TOTAL_STEPS = 9;
const MIN_AGE = 16;
const MAX_DISPLAY_NAME_LENGTH = 32;

export default function RegistrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - MIN_AGE,
    today.getMonth(),
    today.getDate()
  );
  const minDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate()
  );

  const [showAlert, setShowAlert] = useState(false);
  const { showError, errorMessage } = useSelector(
    (state: any) => state.authConfigs
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [wantsNewsletter, setWantsNewsletter] = useState(true);
  const [wantsPersonalization, setWantsPersonalization] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+31");
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.dialCode === "+31") || COUNTRIES[0]
  );
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [phoneVerificationMethod, setPhoneVerificationMethod] = useState<
    "sms" | "whatsapp"
  >("sms");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [password, setPassword] = useState("");
  const [allowPersonalizedAds, setAllowPersonalizedAds] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [sening, setSending] = useState(false);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleDatePickerDone = () => {
    if (dateOfBirth) {
      setShowDatePicker(false);
    } else {
      setDateOfBirth(maxDate);
      setShowDatePicker(false);
    }
  };
  const formatDateOnly = (date: string | Date | any): string => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };
  const handleContinue = async () => {
    if (currentStep === 1) {
      if (!dateOfBirth) {
        setShowDatePicker(true);
        setDatePickerKey((prev) => prev + 1);
        return;
      }

      const age = calculateAge(dateOfBirth);
      if (age < MIN_AGE) {
        console.log("User is too young:", age);
        return;
      }

      console.log("Date of birth selected:", dateOfBirth, "Age:", age);
      animateTransition(() => setCurrentStep(2));
    } else if (currentStep === 2) {
      if (!displayName.trim()) {
        console.log("Display name is required");
        return;
      }

      console.log("Display name selected:", displayName);
      animateTransition(() => setCurrentStep(3));
    } else if (currentStep === 3) {
      if (contactMethod === "email" && !isValidEmail(email)) {
        console.log("Invalid email");
        return;
      }
      setLoading(true);
      try {
        const res = await post("auth/send-otp", {
          email: email,
        });
        if (res?.data?.success) {
          console.log(res?.data);
          console.log(
            "Email:",
            email,
            "Newsletter:",
            wantsNewsletter,
            "Personalization:",
            wantsPersonalization
          );
          Alert.alert("OTP Received", res.data?.result?.toString(), [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ]);
          console.log("hereb");
          startResendTimer();
          animateTransition(() => setCurrentStep(4));
        }
      } catch (err: any) {
        console.log(err, "err in send otp");
        if (err?.status === 409) {
          setTimeout(() => {
            router.push({
              pathname: "/login",
              params: { email },
            });
          }, 800);
        }
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 4) {
      if (verificationCode.length < 6) {
        console.log("Invalid verification code");
        return;
      }
      setLoading(true);
      try {
        const res = await post("auth/verify-otp", {
          email: email,
          code: verificationCode,
        });
        if (res?.data?.success) {
          console.log("Verification code:", res?.data);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          animateTransition(() => setCurrentStep(5));
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 5) {
      if (!isValidPhoneNumber(phoneNumber)) {
        console.log("Invalid phone number");
        return;
      }
      console.log(countryCode + phoneNumber);
      setLoading(true);
      try {
        const res = await post("auth/send-otp", {
          phone: {
            number: countryCode + phoneNumber,

            verifyVia: phoneVerificationMethod,
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
          animateTransition(() => setCurrentStep(6));
        }
      } catch (err: any) {
        console.log(err, "err in send otp phone");
        if (err?.status === 409) {
          setTimeout(() => {
            router.push({
              pathname: "/login",
              params: { phone: phoneNumber },
            });
          }, 800);
        }
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 6) {
      if (phoneVerificationCode.length < 6) {
        console.log("Invalid phone verification code");
        return;
      }

      setLoading(true);
      try {
        const res = await post("auth/verify-otp", {
          phone: countryCode + phoneNumber,
          code: phoneVerificationCode,
        });
        if (res?.data?.success) {
          console.log("Verification code:", res?.data);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          animateTransition(() => setCurrentStep(7));
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 7) {
      if (!isValidPassword(password)) {
        console.log("Invalid password");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          dob: formatDateOnly(dateOfBirth),
          name: displayName,
          gender: "OTHER",
          email: email,
          password: password,
          phone: phoneNumber,
        };
        console.log(payload);
        const res = await post("auth/register", payload);
        if (res?.data?.success) {
          setShowAlert(true);
          // ToastMessage(res?.data?.message, "success");
          AsyncStorage.setItem("token", res?.data?.tokens?.accessToken);
          AsyncStorage.setItem("refreshToken", res?.data?.tokens?.refreshToken);
          console.log("Password created");
          animateTransition(() => setCurrentStep(8));
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 8) {
      console.log("Push notifications accepted");
      animateTransition(() => setCurrentStep(9));
    } else if (currentStep === 9) {
      console.log("Ad preferences set:", allowPersonalizedAds);
      console.log("Registration completed! Redirecting to home...");
      router.replace("/" as Href);
    }
  };

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    } else {
      router.back();
    }
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const isValidAge = dateOfBirth ? calculateAge(dateOfBirth) >= MIN_AGE : true;

  const isValidEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, "");
    return cleanPhone.length >= 8 && cleanPhone.length <= 15;
  };

  const isValidPassword = (pwd: string): boolean => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleSelectCountry = (country: any) => {
    setSelectedCountry(country);
    setCountryCode(country.dialCode);
    setShowCountryModal(false);
    setCountrySearchQuery("");
  };

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
      country.dialCode.includes(countrySearchQuery) ||
      country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const generatePassword = () => {
    const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    const specialChars = "!@#$%";
    const allChars = uppercaseChars + lowercaseChars + digits + specialChars;

    let generatedPwd = "";
    generatedPwd +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    generatedPwd += digits[Math.floor(Math.random() * digits.length)];
    generatedPwd +=
      specialChars[Math.floor(Math.random() * specialChars.length)];
    for (let i = 3; i < 12; i++) {
      generatedPwd += allChars[Math.floor(Math.random() * allChars.length)];
    }
    generatedPwd = generatedPwd
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setPassword(generatedPwd);
    setShowPassword(true);
  };

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
      if (currentStep === 4) {
        // Resend email OTP
        const res = await post("auth/send-otp", {
          email: email,
        });
        if (res?.data?.success) {
          // ToastMessage("OTP sent to your email", "success");
          Alert.alert("OTP Received", res.data?.result?.toString(), [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ]);
          startResendTimer();
        } else {
          // ToastMessage("Failed to send OTP", "error");
        }
      } else if (currentStep === 6) {
        const res = await post("auth/send-otp", {
          phone: {
            number: `${countryCode}${phoneNumber}`,
            verifyVia: phoneVerificationMethod,
          },
        });
        if (res?.data?.success) {
          // ToastMessage(
          //   `OTP sent via ${phoneVerificationMethod.toUpperCase()}`,
          //   "success"
          // );
          Alert.alert("OTP Received", res.data?.result?.toString(), [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ]);
          startResendTimer();
        } else {
          // ToastMessage("Failed to send OTP", "error");
        }
      }
    } catch (err) {
      console.log("Resend error:", err);
      // ToastMessage("Error sending OTP. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Date of Birth";
      case 2:
        return "Display Name";
      case 3:
        return "Email";
      case 4:
        return "Verifying your email";
      case 5:
        return "Phone Number";
      case 6:
        return "Verifying your phone";
      case 7:
        return "Creating a strong password";
      case 8:
        return "Push Notifications";
      case 9:
        return "Ad Preferences";
      default:
        return "";
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return dateOfBirth && isValidAge;
      case 2:
        return displayName.trim().length > 0;
      case 3:
        return contactMethod === "email" ? isValidEmail(email) : true;
      case 4:
        return verificationCode.length >= 6;
      case 5:
        return isValidPhoneNumber(phoneNumber);
      case 6:
        return phoneVerificationCode.length >= 6;
      case 7:
        return isValidPassword(password);
      case 8:
        return true;
      case 9:
        return true;
      default:
        return false;
    }
  };

  const isValidCode = verificationCode.length >= 6;
  const isValidPhoneCode = phoneVerificationCode.length >= 6;

  return (
    <View style={styles.container}>
      {currentStep < 8 && (
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.titleRow}>
                  <Text style={styles.headerTitle}>Registration</Text>
                  <Text style={styles.stepCounter}>
                    {currentStep}/{TOTAL_STEPS - 2}
                  </Text>
                </View>
                <Text style={styles.headerSubtitle}>{getStepSubtitle()}</Text>
              </View>
              <TouchableOpacity style={styles.infoButton}>
                <ExpoIcons
                  family="MaterialIcons"
                  name="info-outline"
                  color={Colors.darkGray}
                  size={24}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBackground} />
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 7) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      <Animated.View
        style={[styles.content, { opacity: fadeAnim, paddingTop: 136 }]}
      >
        {currentStep === 1 && (
          <View style={styles.formSection}>
            <Text style={[styles.questionTitle]}>
              What&apos;s your date of birth?
            </Text>

            <View style={styles.inputSection}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateInputText,
                    dateOfBirth
                      ? styles.dateInputTextFilled
                      : styles.dateInputTextPlaceholder,
                  ]}
                >
                  {dateOfBirth
                    ? formatDate(dateOfBirth)
                    : "E.g. April 10, 2007"}
                </Text>
              </TouchableOpacity>

              <View style={styles.helperRow}>
                <ExpoIcons
                  family="MaterialIcons"
                  name="info-outline"
                  color={Colors.blackOpacity64}
                  size={12}
                />
                <Text
                  style={[
                    styles.helperText,
                    !isValidAge && styles.helperTextError,
                  ]}
                >
                  You must be at least {MIN_AGE} years old to use{" "}
                  <Text style={styles.helperTextBold}>Viral</Text>.
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.questionTitle}>Choose a display name</Text>

            <View style={styles.inputSection}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      fontFamily:
                        displayName.length > 0
                          ? "Poppins_500Medium"
                          : "Poppins_400Regular",
                    },
                  ]}
                  placeholder="E.g. James Aiden"
                  placeholderTextColor={Colors.blackOpacity48}
                  value={displayName}
                  onChangeText={(text) =>
                    setDisplayName(text.slice(0, MAX_DISPLAY_NAME_LENGTH))
                  }
                  maxLength={MAX_DISPLAY_NAME_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.helperRowSpaced]}>
                <View style={styles.helperRow}>
                  <ExpoIcons
                    family="MaterialIcons"
                    name="info-outline"
                    color={Colors.blackOpacity64}
                    size={12}
                  />
                  <Text style={styles.helperText}>
                    This will appear on your profile.
                  </Text>
                </View>
                <Text style={styles.characterCount}>
                  {displayName.length}/{MAX_DISPLAY_NAME_LENGTH}
                </Text>
              </View>

              <View style={styles.helperRow}>
                <ExpoIcons
                  family="MaterialIcons"
                  name="info-outline"
                  color={Colors.blackOpacity64}
                  size={12}
                />
                <Text style={styles.helperText}>
                  Inappropriate names are forbidden.
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.formSection}>
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
                  // contactMethod === "phone" && styles.toggleOptionActive,
                  contactMethod === "email" && styles.toggleOptionDisabled,
                ]}
                onPress={() => setContactMethod("phone")}
                activeOpacity={0.7}
                disabled={contactMethod === "email"}
              >
                <Text
                  style={[
                    styles.toggleOptionText,
                    // contactMethod === "phone" && styles.toggleOptionTextActive,
                    // contactMethod === "email" &&
                    //   styles.toggleOptionTextDisabled,
                  ]}
                >
                  Phone Number
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.emailFormSection}>
              <Text style={styles.greetingText}>
                Hello {displayName || "there"}
              </Text>
              <Text
                style={[
                  styles.questionTitle,
                  { marginTop: 0, marginBottom: 8 },
                ]}
              >
                What is your email?
              </Text>

              <View style={styles.inputSection}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        // If displayName has text, use SemiBold; otherwise, use Regular
                        fontFamily:
                          email.length > 0
                            ? "Poppins_500Medium"
                            : "Poppins_400Regular",
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

                <View style={styles.helperRow}>
                  <ExpoIcons
                    family="MaterialIcons"
                    name="info-outline"
                    color={Colors.blackOpacity64}
                    size={12}
                  />
                  <Text style={styles.helperTextLight}>
                    Please enter a valid email address.
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
                    We will later use this email to verify your account.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.consentSection}>
              <TouchableOpacity
                style={styles.consentCard}
                onPress={() => setWantsNewsletter(!wantsNewsletter)}
                activeOpacity={0.7}
              >
                <View style={styles.consentContent}>
                  <Text style={styles.consentTitle}>I Want To</Text>
                  <Text style={styles.consentDescription}>
                    receive the latest news about viral, and promotional offers.
                  </Text>
                </View>
                {wantsNewsletter ? (
                  <ExpoIcons
                    family="Ionicons"
                    name="checkmark-circle"
                    color={Colors.primaryDark}
                    size={24}
                  />
                ) : (
                  <ExpoIcons
                    family="Feather"
                    name="circle"
                    color={Colors.blackOpacity48}
                    size={24}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.consentCard}
                onPress={() => setWantsPersonalization(!wantsPersonalization)}
                activeOpacity={0.7}
              >
                <View style={styles.consentContent}>
                  <Text style={styles.consentTitle}>I Am Okay To</Text>
                  <Text style={styles.consentDescription}>
                    have a more tailor-made experience while keeping my data
                    anonymous to content providers.
                  </Text>
                </View>
                {wantsPersonalization ? (
                  <ExpoIcons
                    family="Ionicons"
                    name="checkmark-circle"
                    color={Colors.primaryDark}
                    size={24}
                  />
                ) : (
                  <ExpoIcons
                    family="Feather"
                    name="circle"
                    color={Colors.blackOpacity48}
                    size={24}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={[styles.formSection, { gap: 0 }]}>
            <Text style={[styles.questionTitle, { marginBottom: 8 }]}>
              Please enter the code
            </Text>

            <View style={styles.inputSection}>
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
              <Text style={styles.sentToLabel}>
                Verification code was sent to:
              </Text>
              <View style={styles.emailRow}>
                <ExpoIcons
                  family="Ionicons"
                  name="mail"
                  color={Colors.black}
                  size={14}
                />
                <Text style={styles.emailText}>{email}</Text>
                <TouchableOpacity
                  onPress={() => animateTransition(() => setCurrentStep(3))}
                >
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
                    <Image
                      source={Images.replay}
                      style={{ width: 14, height: 14 }}
                    />
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
          </View>
        )}

        {currentStep === 5 && (
          <ScrollView style={styles.formSection}>
            <View style={styles.contactToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  phoneNumber.length > 0 && styles.toggleOptionDisabled,
                ]}
                onPress={() => animateTransition(() => setCurrentStep(3))}
                activeOpacity={0.7}
                disabled={phoneNumber.length > 0}
              >
                <Text
                  style={[
                    styles.toggleOptionText,
                    phoneNumber.length > 0 && styles.toggleOptionTextDisabled,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, styles.toggleOptionActive]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.toggleOptionText,
                    styles.toggleOptionTextActive,
                  ]}
                >
                  Phone Number
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.phoneFormSection}>
              <Text style={styles.greetingText}>
                Hi {displayName || "there"}
              </Text>
              <Text
                style={[
                  styles.questionTitle,
                  { marginTop: 0, marginBottom: 0 },
                ]}
              >
                What is your phone number?
              </Text>

              <View style={styles.inputSection}>
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
                />
                {/* <View style={styles.phoneInputContainer}>
                  <View style={styles.phoneInputContent}>
                    <Text style={styles.phoneLabel}>PHONE NUMBER</Text>
                    <View style={styles.phoneInputRow}>
                      <TouchableOpacity
                        style={styles.countryCodePicker}
                        onPress={() => setShowCountryModal(true)}
                      >
                        <View
                          style={{
                            height: 20,
                            width: 20,
                            borderRadius: 40,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Image
                            style={{
                              height: 20,
                              width: 20,
                              borderRadius: 40,
                              resizeMode: "cover",
                            }}
                            source={{
                              uri: `https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`,
                            }}
                          />
                        </View>

                        <Text style={styles.countryCodeText}>
                          {countryCode}
                        </Text>
                        <ExpoIcons
                          family="MaterialIcons"
                          name="arrow-drop-down"
                          size={20}
                          color={Colors.blackOpacity64}
                        />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="XXX XXX XX"
                        placeholderTextColor={Colors.blackOpacity64}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                  <View style={styles.phoneIconButton}>
                    <ExpoIcons
                      family="MaterialIcons"
                      name="phone"
                      color={Colors.primaryDark}
                      size={16}
                    />
                  </View>
                </View> */}

                <View style={styles.helperRow}>
                  <ExpoIcons
                    family="MaterialIcons"
                    name="info-outline"
                    color={Colors.blackOpacity64}
                    size={12}
                  />
                  <Text style={styles.helperTextLight}>
                    Please enter a valid phone number
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
                    We will later use this phone number to verify your account.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.verificationMethodSection}>
              <TouchableOpacity
                style={[
                  styles.verificationMethodCard,
                  phoneVerificationMethod === "sms" &&
                    styles.verificationMethodCardActive,
                ]}
                onPress={() => setPhoneVerificationMethod("sms")}
                activeOpacity={0.7}
              >
                <View style={styles.verificationMethodContent}>
                  <View style={styles.verificationMethodHeader}>
                    <ExpoIcons
                      family="MaterialIcons"
                      name="sms"
                      color={Colors.blackOpacity64}
                      size={14}
                    />
                    <Text style={styles.verificationMethodTitle}>
                      Verify Using SMS
                    </Text>
                  </View>
                  <Text style={styles.verificationMethodDescription}>
                    Receive a verification code on your phone using the SMS
                    method.
                  </Text>
                </View>
                {phoneVerificationMethod === "sms" ? (
                  <ExpoIcons
                    family="Ionicons"
                    name="checkmark-circle"
                    color={Colors.primaryDark}
                    size={26}
                  />
                ) : (
                  <ExpoIcons
                    family="Feather"
                    name="circle"
                    color={Colors.blackOpacity48}
                    size={24}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.verificationMethodCard,
                  phoneVerificationMethod === "whatsapp" &&
                    styles.verificationMethodCardActive,
                ]}
                onPress={() => setPhoneVerificationMethod("whatsapp")}
                activeOpacity={0.7}
              >
                <View style={styles.verificationMethodContent}>
                  <View style={styles.verificationMethodHeader}>
                    <ExpoIcons
                      family="FontAwesome"
                      name="whatsapp"
                      color={Colors.black}
                      size={16}
                    />
                    <Text style={styles.verificationMethodTitle}>
                      Verify Using Whatsapp
                    </Text>
                  </View>
                  <Text style={styles.verificationMethodDescription}>
                    Receive a verification code on your Whatsapp using data
                    method.
                  </Text>
                </View>
                {phoneVerificationMethod === "whatsapp" ? (
                  <ExpoIcons
                    family="Ionicons"
                    name="checkmark-circle"
                    color={Colors.primaryDark}
                    size={24}
                  />
                ) : (
                  <ExpoIcons
                    family="Feather"
                    name="circle"
                    color={Colors.blackOpacity48}
                    size={24}
                  />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {currentStep === 6 && (
          <View style={styles.formSection}>
            <Text style={styles.questionTitle}>Please enter the code</Text>

            <View style={styles.inputSection}>
              <View style={styles.codeInputContainer}>
                <TextInput
                  style={[
                    styles.codeInput,
                    {
                      fontFamily:
                        phoneVerificationCode.length > 0
                          ? "Poppins_500Medium"
                          : "Poppins_400Regular",
                    },
                  ]}
                  placeholder="E.g. XSI456"
                  placeholderTextColor={Colors.blackOpacity48}
                  value={phoneVerificationCode}
                  onChangeText={(text) =>
                    setPhoneVerificationCode(text.toUpperCase().slice(0, 6))
                  }
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                {isValidPhoneCode && (
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
                  {isValidPhoneCode
                    ? "Valid verification code."
                    : "Enter the 6-character code."}
                </Text>
              </View>
            </View>

            <View style={styles.sentToSection}>
              <Text style={styles.sentToLabel}>
                Verification code was sent to:
              </Text>
              <View style={styles.emailRow}>
                <ExpoIcons
                  family="MaterialIcons"
                  name="phone"
                  color={Colors.black}
                  size={14}
                />
                <Text style={styles.emailText}>{phoneNumber}</Text>
                <TouchableOpacity
                  onPress={() => animateTransition(() => setCurrentStep(5))}
                >
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
                    <Image
                      source={Images.replay}
                      style={{ width: 14, height: 14 }}
                    />
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
          </View>
        )}

        {currentStep === 7 && (
          <View style={styles.formSection}>
            <Text style={styles.questionTitle}>Create a password</Text>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    fontFamily:
                      password.length > 0
                        ? "Poppins_500Medium"
                        : "Poppins_400Regular",
                  },
                ]}
                placeholder="********"
                placeholderTextColor={Colors.blackOpacity48}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <ExpoIcons
                    family="MaterialCommunityIcons"
                    color={Colors.blackOpacity48}
                    size={24}
                    name="eye-off"
                  />
                ) : (
                  <ExpoIcons
                    family="MaterialCommunityIcons"
                    color={Colors.blackOpacity48}
                    size={24}
                    name="eye"
                  />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.generatePasswordRow}
              onPress={generatePassword}
              activeOpacity={0.7}
            >
              <Text style={styles.generatePasswordText}>
                Generate a password for me
              </Text>
              <Image
                source={Images.arrow_up_right}
                style={{ width: 14, height: 14 }}
              />
            </TouchableOpacity>

            <View style={styles.passwordDivider} />

            <View style={styles.passwordRequirements}>
              <View style={styles.requirementRow}>
                <ExpoIcons
                  color={
                    hasMinLength ? Colors.primaryDark : Colors.blackOpacity64
                  }
                  size={12}
                  family={hasMinLength ? "Ionicons" : "MaterialIcons"}
                  name={hasMinLength ? "checkmark-circle" : "info-outline"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasMinLength && styles.requirementTextMet,
                  ]}
                >
                  Minimum 8 characters.
                </Text>
              </View>

              <View style={styles.requirementRow}>
                <ExpoIcons
                  color={
                    hasUppercase ? Colors.primaryDark : Colors.blackOpacity64
                  }
                  size={12}
                  family={hasUppercase ? "Ionicons" : "MaterialIcons"}
                  name={hasUppercase ? "checkmark-circle" : "info-outline"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasUppercase && styles.requirementTextMet,
                  ]}
                >
                  Minimum 1 uppercase
                </Text>
              </View>

              <View style={styles.requirementRow}>
                <ExpoIcons
                  color={hasDigit ? Colors.primaryDark : Colors.blackOpacity64}
                  size={12}
                  family={hasDigit ? "Ionicons" : "MaterialIcons"}
                  name={hasDigit ? "checkmark-circle" : "info-outline"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasDigit && styles.requirementTextMet,
                  ]}
                >
                  Minimum 1 digit
                </Text>
              </View>
            </View>

            <View style={styles.securityRow}>
              <ExpoIcons
                family="MaterialCommunityIcons"
                name="shield-check"
                color={Colors.blackOpacity64}
                size={12}
              />
              <Text style={styles.securityText}>
                Your password on{" "}
                <Text style={styles.securityTextBold}>Viral</Text> is encrypted
                & secured.
              </Text>
            </View>
          </View>
        )}

        {currentStep === 8 && (
          <View style={styles.notificationsContainer}>
            <View style={styles.decorativeLineTop}>
              <Image
                source={Images.top_right_wave}
                style={{
                  height: 200,
                  width: 200,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View style={styles.decorativeLineBottom}>
              <Image
                source={Images.bottom_left_wave}
                style={{
                  height: 280,
                  width: 280,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View style={styles.notificationsContent}>
              <View style={styles.bellIconContainer}>
                <Image source={Images.bell} style={{ width: 80, height: 80 }} />
              </View>

              <View style={styles.notificationsTextSection}>
                <Text style={styles.notificationsTitle}>
                  Instant notifications
                </Text>
                <Text style={styles.notificationsDescription}>
                  Receive notifications directly on your phone whenever a new
                  event occurs.
                </Text>
                <Text style={styles.notificationsHelper}>
                  Manage your notification in Settings anytime.
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentStep === 9 && (
          <View style={styles.adsContainer}>
            <View style={styles.decorativeLineTop}>
              <Image
                source={Images.add_top_wave}
                style={{
                  height: 200,
                  width: 200,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View style={[styles.decorativeLineBottom, { bottom: -60 }]}>
              <Image
                source={Images.add_bottom_wave}
                style={{
                  height: 370,
                  width: 370,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View style={styles.adsContent}>
              <TouchableOpacity
                style={styles.adToggleContainer}
                onPress={() => setAllowPersonalizedAds(!allowPersonalizedAds)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.adToggleTrack,
                    allowPersonalizedAds && styles.adToggleTrackActive,
                  ]}
                >
                  <View
                    style={[
                      styles.adToggleKnob,
                      allowPersonalizedAds && styles.adToggleKnobActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.adsTextSection}>
                <Text style={styles.adsTitle}>
                  Allowed{"\n"}personalized ads
                </Text>
                <Text style={styles.adsDescription}>
                  We care about your privacy and want to maximize your chances
                  of coming across products or services that appeal to you.
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          key={`android-${datePickerKey}`}
          value={dateOfBirth || maxDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}

      {showDatePicker && Platform.OS === "ios" && (
        <View style={styles.datePickerModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleDatePickerDone}
          >
            <BlurView
              intensity={40}
              tint="light"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </TouchableOpacity>
          <View style={styles.datePickerModal}>
            <View style={styles.headerModal}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
            </View>
            <DateTimePicker
              key={`ios-${datePickerKey}`}
              value={dateOfBirth || maxDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              style={styles.datePicker}
              themeVariant="light"
              textColor={Colors.black}
            />
            <View style={styles.datePickerHeader}>
              <TouchableOpacity
                style={[
                  styles.datePickerDoneButton,
                  { backgroundColor: Colors.blackOpacity48, borderRadius: 100 },
                ]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={[styles.datePickerDoneText, { color: "#fff" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.datePickerDoneButton,
                  { backgroundColor: colors.primary, borderRadius: 100 },
                ]}
                onPress={handleDatePickerDone}
              >
                <Text style={[styles.datePickerDoneText, { color: "#fff" }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {currentStep === 8 || currentStep === 9 ? (
        <View
          style={[
            styles.notificationsFooter,
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          <BlurView
            intensity={7}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.notificationsFooterContent}>
            <TouchableOpacity
              style={styles.notificationsContinueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationsContinueText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationsLaterButton}
              onPress={() => {
                if (currentStep === 8) {
                  animateTransition(() => setCurrentStep(9));
                } else {
                  console.log("Registration completed! Redirecting to home...");
                  router.replace("/" as Href);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationsLaterText}>
                {currentStep === 9 ? "Maybe Later" : "Later"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.footerContent}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ChevronLeft color={Colors.black} size={24} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !canContinue() && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!canContinue() || loading}
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
                <Text
                  style={[styles.tosLink, { textDecorationLine: "underline" }]}
                >
                  TOS
                </Text>
                .
              </Text>
            </View>
          </View>
        </View>
      )}
      {showAlert && (
        <SimpleTextAlert
          visible={showAlert}
          title="Success"
          onHide={() => setShowAlert(false)}
        />
      )}

      <SimpleTextAlert
        visible={showError}
        title={errorMessage}
        headerHeight={100}
        onHide={() => dispatch(setShowError(false))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",

    color: Colors.darkGray,
    letterSpacing: -0.3,
  },
  stepCounter: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",

    color: Colors.darkGray,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: Colors.blackOpacity08,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    height: 4,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.blackOpacity08,
    borderRadius: 99,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.darkGray,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  formSection: {
    gap: 8,
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
  inputSection: {
    // gap: 8,
  },
  dateInput: {
    height: 48,
    backgroundColor: Colors.blackOpacity04,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginBottom: 6,
  },
  dateInputText: {
    fontSize: 16,
    letterSpacing: -0.48,
  },
  dateInputTextPlaceholder: {
    color: Colors.blackOpacity48,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
  },
  dateInputTextFilled: {
    color: Colors.darkGray,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
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
  helperTextBold: {
    fontFamily: "Poppins_500Medium",

    color: Colors.black,
    fontSize: 12,
  },
  helperTextError: {
    color: Colors.errorRed,
  },
  helperRowSpaced: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  characterCount: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
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
  datePickerModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 24,
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blackOpacity08,
  },
  datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerModal: {
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blackOpacity08,
  },
  datePickerHeaderSpacer: {
    width: 60,
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
  },
  datePickerDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  datePickerDoneText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.primaryDark,
  },
  datePicker: {
    height: 216,
    backgroundColor: Colors.white,
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
  contactToggle: {
    flexDirection: "row",

    borderRadius: 100,
    padding: 4,
    gap: 4,
    marginTop: 24,
    marginBottom: 15,
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
  toggleOptionDisabled: {
    // opacity: 0.5,
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
  emailFormSection: {},
  greetingText: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",

    color: Colors.blackOpacity48,
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
  divider: {
    height: 1,
    backgroundColor: Colors.blackOpacity04,
  },
  consentSection: {
    gap: 8,
  },
  consentCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.blackOpacity04,
    borderRadius: 12,
  },
  consentContent: {
    flex: 1,
    gap: 2,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",

    color: Colors.black,
    letterSpacing: -0.5,
  },
  consentDescription: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.blackOpacity48,

    letterSpacing: -0.07,
    lineHeight: 18,
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
  phoneFormSection: {
    gap: 4,
  },
  phoneInputContainer: {
    height: 56,
    backgroundColor: Colors.blackOpacity04,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  phoneInputContent: {
    flex: 1,
    gap: 4,
  },
  phoneLabel: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.blackOpacity64,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryFlag: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.greenBg,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.black,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.black,
    padding: 0,
  },
  phoneIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDarkOpacity16,
    justifyContent: "center",
    alignItems: "center",
  },
  verificationMethodSection: {
    gap: 8,
  },
  verificationMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.blackOpacity04,
    borderRadius: 12,
  },
  verificationMethodCardActive: {
    backgroundColor: Colors.white,
  },
  verificationMethodContent: {
    flex: 1,
    gap: 2,
  },
  verificationMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationMethodTitle: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.black,
    letterSpacing: -0.5,
  },
  verificationMethodDescription: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.blackOpacity48,

    letterSpacing: -0.07,
    lineHeight: 18,
  },
  passwordInputContainer: {
    height: 48,
    backgroundColor: Colors.blackOpacity04,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.black,
    letterSpacing: -0.48,
  },
  generatePasswordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  generatePasswordText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.primaryDark,
    letterSpacing: -0.36,
  },
  passwordDivider: {
    height: 1,
    backgroundColor: Colors.blackOpacity16,
  },
  passwordRequirements: {
    gap: 2,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.36,
    flex: 1,
  },
  requirementTextMet: {
    color: Colors.primaryDark,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.36,
    flex: 1,
  },
  securityTextBold: {
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
  },
  notificationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    position: "relative",
    marginTop: -150,
  },
  decorativeLineTop: {
    position: "absolute",
    top: 0,
    right: -12,
  },
  decorativeLineBottom: {
    position: "absolute",
    bottom: 0,
    left: -15,
  },
  gradientLine: {
    flex: 1,
    borderRadius: 12,
  },
  notificationsContent: {
    alignItems: "center",
    gap: 25,
  },
  bellIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsTextSection: {
    alignItems: "center",
  },
  notificationsTitle: {
    fontSize: 32,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
    letterSpacing: -0.64,
    textAlign: "center",
  },
  notificationsDescription: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.28,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 4,
  },
  notificationsHelper: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.24,
    textAlign: "center",
    marginTop: 12,
  },
  notificationsFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  notificationsFooterContent: {
    paddingHorizontal: 12,
  },
  notificationsContinueButton: {
    height: 48,
    borderRadius: 100,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationsContinueText: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  notificationsLaterButton: {
    height: 48,
    borderRadius: 100,
    backgroundColor: Colors.blackOpacity64,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsLaterText: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  adsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    position: "relative",
    marginTop: -150,
  },
  adsContent: {
    alignItems: "center",
    gap: 25,
  },
  adToggleContainer: {
    padding: 4,
  },
  adToggleTrack: {
    width: 79,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blackOpacity16,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  adToggleTrackActive: {
    backgroundColor: Colors.primaryDark,
  },
  adToggleKnob: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  adToggleKnobActive: {
    alignSelf: "flex-end",
  },
  adsTextSection: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 0,
  },
  adsTitle: {
    fontSize: 32,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
    letterSpacing: -0.64,
    textAlign: "center",
    lineHeight: 38,
  },
  adsDescription: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
    letterSpacing: -0.28,
    lineHeight: 21,
    textAlign: "center",
  },
  countryCodePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countryFlagEmoji: {
    fontSize: 18,
  },
  countryModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  countryModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countryModalCloseButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  countryModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
  },
  countrySearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,

    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 100,
    backgroundColor: Colors.blackOpacity08,
    gap: 8,
  },
  countrySearchInput: {
    height: "100%",
    padding: 0,
    margin: 0,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    flex: 1,
  },
  countryListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    borderBottomColor: Colors.blackOpacity04,
    gap: 12,
  },
  countryItemEmoji: {
    fontSize: 24,
  },
  countryItemContent: {
    flex: 1,
    gap: 2,
  },
  countryItemName: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.black,
  },
  countryItemCode: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.blackOpacity64,
  },
});
