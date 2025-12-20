import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { Info, ChevronLeft, CircleCheck, Circle, Mail, Pencil, RotateCcw, CheckCircle2, Phone, MessageSquare, Eye, EyeOff, Sparkles, Shield, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const TOTAL_STEPS = 9;
const MIN_AGE = 13;
const MAX_DISPLAY_NAME_LENGTH = 32;

export default function RegistrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [wantsNewsletter, setWantsNewsletter] = useState(true);
  const [wantsPersonalization, setWantsPersonalization] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+31');
  const [phoneVerificationMethod, setPhoneVerificationMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [password, setPassword] = useState('');
  const [allowPersonalizedAds, setAllowPersonalizedAds] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!dateOfBirth) {
        setShowDatePicker(true);
        return;
      }
      
      const age = calculateAge(dateOfBirth);
      if (age < MIN_AGE) {
        console.log('User is too young:', age);
        return;
      }
      
      console.log('Date of birth selected:', dateOfBirth, 'Age:', age);
      animateTransition(() => setCurrentStep(2));
    } else if (currentStep === 2) {
      if (!displayName.trim()) {
        console.log('Display name is required');
        return;
      }
      
      console.log('Display name selected:', displayName);
      animateTransition(() => setCurrentStep(3));
    } else if (currentStep === 3) {
      if (contactMethod === 'email' && !isValidEmail(email)) {
        console.log('Invalid email');
        return;
      }
      
      console.log('Email:', email, 'Newsletter:', wantsNewsletter, 'Personalization:', wantsPersonalization);
      startResendTimer();
      animateTransition(() => setCurrentStep(4));
    } else if (currentStep === 4) {
      if (verificationCode.length < 6) {
        console.log('Invalid verification code');
        return;
      }
      
      console.log('Verification code:', verificationCode);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      animateTransition(() => setCurrentStep(5));
    } else if (currentStep === 5) {
      if (!isValidPhoneNumber(phoneNumber)) {
        console.log('Invalid phone number');
        return;
      }
      
      console.log('Phone:', countryCode, phoneNumber, 'Method:', phoneVerificationMethod);
      startResendTimer();
      animateTransition(() => setCurrentStep(6));
    } else if (currentStep === 6) {
      if (phoneVerificationCode.length < 6) {
        console.log('Invalid phone verification code');
        return;
      }
      
      console.log('Phone verification code:', phoneVerificationCode);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      animateTransition(() => setCurrentStep(7));
    } else if (currentStep === 7) {
      if (!isValidPassword(password)) {
        console.log('Invalid password');
        return;
      }
      
      console.log('Password created');
      animateTransition(() => setCurrentStep(8));
    } else if (currentStep === 8) {
      console.log('Push notifications accepted');
      animateTransition(() => setCurrentStep(9));
    } else if (currentStep === 9) {
      console.log('Ad preferences set:', allowPersonalizedAds);
      console.log('Registration completed! Redirecting to home...');
      router.replace('/' as Href);
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
    const cleanPhone = phone.replace(/\s/g, '');
    return cleanPhone.length >= 8 && cleanPhone.length <= 15;
  };

  const isValidPassword = (pwd: string): boolean => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let generatedPwd = '';
    generatedPwd += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    generatedPwd += '23456789'[Math.floor(Math.random() * 8)];
    for (let i = 0; i < 10; i++) {
      generatedPwd += chars[Math.floor(Math.random() * chars.length)];
    }
    generatedPwd = generatedPwd.split('').sort(() => Math.random() - 0.5).join('');
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

  const handleResendCode = () => {
    if (canResend) {
      console.log('Resending verification code to:', email);
      startResendTimer();
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Date of Birth';
      case 2:
        return 'Display Name';
      case 3:
        return 'Email';
      case 4:
        return 'Verifying your email';
      case 5:
        return 'Phone Number';
      case 6:
        return 'Verifying your phone';
      case 7:
        return 'Creating a strong password';
      case 8:
        return 'Push Notifications';
      case 9:
        return 'Ad Preferences';
      default:
        return '';
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return dateOfBirth && isValidAge;
      case 2:
        return displayName.trim().length > 0;
      case 3:
        return contactMethod === 'email' ? isValidEmail(email) : true;
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
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Registration</Text>
                <Text style={styles.stepCounter}>{currentStep}/{TOTAL_STEPS}</Text>
              </View>
              <Text style={styles.headerSubtitle}>{getStepSubtitle()}</Text>
            </View>
            <TouchableOpacity style={styles.infoButton}>
              <Info color="#262626" size={24} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />
            <View style={[styles.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]} />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, paddingTop: 136 }]}>
        {currentStep === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.questionTitle}>What&apos;s your date of birth?</Text>
            
            <View style={styles.inputSection}>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dateInputText,
                  dateOfBirth ? styles.dateInputTextFilled : styles.dateInputTextPlaceholder
                ]}>
                  {dateOfBirth ? formatDate(dateOfBirth) : 'E.g. April 10, 2007'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.helperRow}>
                <Info color="#828282" size={12} strokeWidth={2} />
                <Text style={[
                  styles.helperText,
                  !isValidAge && styles.helperTextError
                ]}>
                  You must be at least {MIN_AGE} years old to use <Text style={styles.helperTextBold}>move</Text>.
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
                  style={styles.textInput}
                  placeholder="E.g. James Aiden"
                  placeholderTextColor="rgba(18, 18, 18, 0.48)"
                  value={displayName}
                  onChangeText={(text) => setDisplayName(text.slice(0, MAX_DISPLAY_NAME_LENGTH))}
                  maxLength={MAX_DISPLAY_NAME_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.helperRowSpaced}>
                <View style={styles.helperRow}>
                  <Info color="rgba(18, 18, 18, 0.64)" size={12} strokeWidth={2} />
                  <Text style={styles.helperText}>This will appear on your profile.</Text>
                </View>
                <Text style={styles.characterCount}>{displayName.length}/{MAX_DISPLAY_NAME_LENGTH}</Text>
              </View>
              
              <View style={styles.helperRow}>
                <Info color="#828282" size={12} strokeWidth={2} />
                <Text style={styles.helperText}>Inappropriate names are forbidden.</Text>
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
                  contactMethod === 'email' && styles.toggleOptionActive
                ]}
                onPress={() => setContactMethod('email')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.toggleOptionText,
                  contactMethod === 'email' && styles.toggleOptionTextActive
                ]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  contactMethod === 'phone' && styles.toggleOptionActive
                ]}
                onPress={() => setContactMethod('phone')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.toggleOptionText,
                  contactMethod === 'phone' && styles.toggleOptionTextActive
                ]}>Phone Number</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.emailFormSection}>
              <Text style={styles.greetingText}>Hello {displayName || 'there'}</Text>
              <Text style={styles.questionTitle}>What is your email?</Text>
              
              <View style={styles.inputSection}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="E.g. abc@email.com"
                    placeholderTextColor="rgba(18, 18, 18, 0.48)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                
                <View style={styles.helperRow}>
                  <Info color="rgba(18, 18, 18, 0.48)" size={12} strokeWidth={2} />
                  <Text style={styles.helperTextLight}>Please enter a valid email address.</Text>
                </View>
                
                <View style={styles.helperRow}>
                  <Info color="rgba(18, 18, 18, 0.48)" size={12} strokeWidth={2} />
                  <Text style={styles.helperTextLight}>We will later use this email to verify your account.</Text>
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
                  <Text style={styles.consentDescription}>receive the latest news about move, and promotional offers.</Text>
                </View>
                {wantsNewsletter ? (
                  <CircleCheck color="#014D3A" size={24} fill="#014D3A" strokeWidth={0} />
                ) : (
                  <Circle color="rgba(18, 18, 18, 0.48)" size={24} strokeWidth={1.5} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.consentCard}
                onPress={() => setWantsPersonalization(!wantsPersonalization)}
                activeOpacity={0.7}
              >
                <View style={styles.consentContent}>
                  <Text style={styles.consentTitle}>I Am Okay To</Text>
                  <Text style={styles.consentDescription}>have a more tailor-made experience while keeping my data anonymous to content providers.</Text>
                </View>
                {wantsPersonalization ? (
                  <CircleCheck color="#014D3A" size={24} fill="#014D3A" strokeWidth={0} />
                ) : (
                  <Circle color="rgba(18, 18, 18, 0.48)" size={24} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.formSection}>
            <Text style={styles.questionTitle}>Please enter the code</Text>
            
            <View style={styles.inputSection}>
              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="E.g. XSI456"
                  placeholderTextColor="rgba(18, 18, 18, 0.48)"
                  value={verificationCode}
                  onChangeText={(text) => setVerificationCode(text.toUpperCase().slice(0, 6))}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                {isValidCode && (
                  <CheckCircle2 color="#014D3A" size={24} fill="#014D3A" strokeWidth={0} />
                )}
              </View>
              
              <View style={styles.helperRow}>
                <Info color="rgba(18, 18, 18, 0.64)" size={12} strokeWidth={2} />
                <Text style={styles.helperText}>
                  {isValidCode ? 'Valid verification code.' : 'Enter the 6-character code.'}
                </Text>
              </View>
            </View>

            <View style={styles.sentToSection}>
              <Text style={styles.sentToLabel}>Verification code was sent to:</Text>
              <View style={styles.emailRow}>
                <Mail color="#121212" size={14} strokeWidth={2} />
                <Text style={styles.emailText}>{email}</Text>
                <TouchableOpacity onPress={() => animateTransition(() => setCurrentStep(3))}>
                  <Pencil color="#121212" size={14} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resendSection}>
              <TouchableOpacity
                style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
                onPress={handleResendCode}
                activeOpacity={0.7}
                disabled={!canResend}
              >
                <Text style={styles.resendButtonText}>Send again</Text>
                <RotateCcw color="#121212" size={14} strokeWidth={2} />
              </TouchableOpacity>
              
              <View style={styles.helperRow}>
                <Info color="rgba(18, 18, 18, 0.64)" size={12} strokeWidth={2} />
                <Text style={styles.helperTextCenter}>
                  {canResend 
                    ? 'You can request a new code now.' 
                    : `You can request a new code in ${resendTimer} seconds.`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.formSection}>
            <View style={styles.contactToggle}>
              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => animateTransition(() => setCurrentStep(3))}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleOptionText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, styles.toggleOptionActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleOptionText, styles.toggleOptionTextActive]}>Phone Number</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.phoneFormSection}>
              <Text style={styles.greetingText}>Hi {displayName || 'there'}</Text>
              <Text style={styles.questionTitle}>What is your phone number?</Text>
              
              <View style={styles.inputSection}>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.phoneInputContent}>
                    <Text style={styles.phoneLabel}>PHONE NUMBER</Text>
                    <View style={styles.phoneInputRow}>
                      <View style={styles.countryFlag} />
                      <Text style={styles.countryCodeText}>{countryCode}</Text>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="XXX XXX XX"
                        placeholderTextColor="rgba(18, 18, 18, 0.64)"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                  <View style={styles.phoneIconButton}>
                    <Phone color="#014D3A" size={16} strokeWidth={2} />
                  </View>
                </View>
                
                <View style={styles.helperRow}>
                  <Info color="rgba(18, 18, 18, 0.48)" size={12} strokeWidth={2} />
                  <Text style={styles.helperTextLight}>Please enter a valid phone number</Text>
                </View>
                
                <View style={styles.helperRow}>
                  <Info color="rgba(18, 18, 18, 0.48)" size={12} strokeWidth={2} />
                  <Text style={styles.helperTextLight}>We will later use this phone number to verify your account.</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.verificationMethodSection}>
              <TouchableOpacity
                style={[
                  styles.verificationMethodCard,
                  phoneVerificationMethod === 'sms' && styles.verificationMethodCardActive
                ]}
                onPress={() => setPhoneVerificationMethod('sms')}
                activeOpacity={0.7}
              >
                <View style={styles.verificationMethodContent}>
                  <View style={styles.verificationMethodHeader}>
                    <MessageSquare color="rgba(18, 18, 18, 0.64)" size={14} strokeWidth={2} />
                    <Text style={styles.verificationMethodTitle}>Verify Using SMS</Text>
                  </View>
                  <Text style={styles.verificationMethodDescription}>Receive a verification code on your phone using the SMS method.</Text>
                </View>
                {phoneVerificationMethod === 'sms' ? (
                  <CircleCheck color="#014D3A" size={24} fill="#014D3A" strokeWidth={0} />
                ) : (
                  <Circle color="rgba(18, 18, 18, 0.48)" size={24} strokeWidth={1.5} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.verificationMethodCard,
                  phoneVerificationMethod === 'whatsapp' && styles.verificationMethodCardActive
                ]}
                onPress={() => setPhoneVerificationMethod('whatsapp')}
                activeOpacity={0.7}
              >
                <View style={styles.verificationMethodContent}>
                  <View style={styles.verificationMethodHeader}>
                    <MessageSquare color="rgba(18, 18, 18, 0.64)" size={14} strokeWidth={2} />
                    <Text style={styles.verificationMethodTitle}>Verify Using Whatsapp</Text>
                  </View>
                  <Text style={styles.verificationMethodDescription}>Receive a verification code on your Whatsapp using data method.</Text>
                </View>
                {phoneVerificationMethod === 'whatsapp' ? (
                  <CircleCheck color="#014D3A" size={24} fill="#014D3A" strokeWidth={0} />
                ) : (
                  <Circle color="rgba(18, 18, 18, 0.48)" size={24} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 6 && (
          <View style={styles.formSection}>
            <Text style={styles.questionTitle}>Please enter the code</Text>
            
            <View style={styles.inputSection}>
              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="E.g. XSI456"
                  placeholderTextColor="rgba(18, 18, 18, 0.48)"
                  value={phoneVerificationCode}
                  onChangeText={(text) => setPhoneVerificationCode(text.toUpperCase().slice(0, 6))}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                {isValidPhoneCode && (
                  <CheckCircle2 color="#014D3A" size={24} fill="#014D3A" strokeWidth={0} />
                )}
              </View>
              
              <View style={styles.helperRow}>
                <Info color="rgba(18, 18, 18, 0.64)" size={12} strokeWidth={2} />
                <Text style={styles.helperText}>
                  {isValidPhoneCode ? 'Valid verification code.' : 'Enter the 6-character code.'}
                </Text>
              </View>
            </View>

            <View style={styles.sentToSection}>
              <Text style={styles.sentToLabel}>Verification code was sent to:</Text>
              <View style={styles.emailRow}>
                <Phone color="#121212" size={14} strokeWidth={2} />
                <Text style={styles.emailText}>{countryCode} {phoneNumber}</Text>
                <TouchableOpacity onPress={() => animateTransition(() => setCurrentStep(5))}>
                  <Pencil color="#121212" size={14} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resendSection}>
              <TouchableOpacity
                style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
                onPress={handleResendCode}
                activeOpacity={0.7}
                disabled={!canResend}
              >
                <Text style={styles.resendButtonText}>Send again</Text>
                <RotateCcw color="#121212" size={14} strokeWidth={2} />
              </TouchableOpacity>
              
              <View style={styles.helperRow}>
                <Info color="rgba(18, 18, 18, 0.64)" size={12} strokeWidth={2} />
                <Text style={styles.helperTextCenter}>
                  {canResend 
                    ? 'You can request a new code now.' 
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
                style={styles.passwordInput}
                placeholder="********"
                placeholderTextColor="rgba(18, 18, 18, 0.48)"
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
                  <EyeOff color="rgba(18, 18, 18, 0.48)" size={24} strokeWidth={1.5} />
                ) : (
                  <Eye color="rgba(18, 18, 18, 0.48)" size={24} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.generatePasswordRow}
              onPress={generatePassword}
              activeOpacity={0.7}
            >
              <Text style={styles.generatePasswordText}>Generate a password for me</Text>
              <Sparkles color="#014D3A" size={12} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.passwordDivider} />

            <View style={styles.passwordRequirements}>
              <View style={styles.requirementRow}>
                <Circle 
                  color={hasMinLength ? '#014D3A' : 'rgba(18, 18, 18, 0.64)'} 
                  size={12} 
                  strokeWidth={2}
                  fill={hasMinLength ? '#014D3A' : 'transparent'}
                />
                <Text style={[
                  styles.requirementText,
                  hasMinLength && styles.requirementTextMet
                ]}>Minimum 8 characters.</Text>
              </View>
              
              <View style={styles.requirementRow}>
                <Circle 
                  color={hasUppercase ? '#014D3A' : 'rgba(18, 18, 18, 0.64)'} 
                  size={12} 
                  strokeWidth={2}
                  fill={hasUppercase ? '#014D3A' : 'transparent'}
                />
                <Text style={[
                  styles.requirementText,
                  hasUppercase && styles.requirementTextMet
                ]}>Minimum 1 uppercase</Text>
              </View>
              
              <View style={styles.requirementRow}>
                <Circle 
                  color={hasDigit ? '#014D3A' : 'rgba(18, 18, 18, 0.64)'} 
                  size={12} 
                  strokeWidth={2}
                  fill={hasDigit ? '#014D3A' : 'transparent'}
                />
                <Text style={[
                  styles.requirementText,
                  hasDigit && styles.requirementTextMet
                ]}>Minimum 1 digit</Text>
              </View>
            </View>

            <View style={styles.securityRow}>
              <Shield color="rgba(18, 18, 18, 0.64)" size={12} strokeWidth={2} />
              <Text style={styles.securityText}>
                Your password on <Text style={styles.securityTextBold}>Viral</Text> is encrypted & secured.
              </Text>
            </View>
          </View>
        )}

        {currentStep === 8 && (
          <View style={styles.notificationsContainer}>
            <View style={styles.decorativeLineTop}>
              <LinearGradient
                colors={['#12FFAA', '#014D3A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientLine}
              />
            </View>
            <View style={styles.decorativeLineBottom}>
              <LinearGradient
                colors={['#12FFAA', '#014D3A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientLine}
              />
            </View>
            
            <View style={styles.notificationsContent}>
              <View style={styles.bellIconContainer}>
                <Bell color="#014D3A" size={48} strokeWidth={1.5} />
              </View>
              
              <View style={styles.notificationsTextSection}>
                <Text style={styles.notificationsTitle}>Instant notifications</Text>
                <Text style={styles.notificationsDescription}>
                  Receive notifications directly on your phone whenever a new event occurs.
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
              <LinearGradient
                colors={['#12FFAA', '#014D3A', '#12FFAA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientLine}
              />
            </View>
            <View style={styles.decorativeLineBottom}>
              <LinearGradient
                colors={['#12FFAA', '#014D3A', '#12FFAA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientLine}
              />
            </View>
            
            <View style={styles.adsContent}>
              <TouchableOpacity
                style={styles.adToggleContainer}
                onPress={() => setAllowPersonalizedAds(!allowPersonalizedAds)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.adToggleTrack,
                  allowPersonalizedAds && styles.adToggleTrackActive
                ]}>
                  <View style={[
                    styles.adToggleKnob,
                    allowPersonalizedAds && styles.adToggleKnobActive
                  ]} />
                </View>
              </TouchableOpacity>
              
              <View style={styles.adsTextSection}>
                <Text style={styles.adsTitle}>Allowed{"\n"}personalized ads</Text>
                <Text style={styles.adsDescription}>
                  We care about your privacy and want to maximize your chances of coming across products or services that appeal to you.
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateOfBirth || maxDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <View style={styles.datePickerModalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleDatePickerDone}
          >
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} pointerEvents="none" />
          </TouchableOpacity>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <View style={styles.datePickerHeaderSpacer} />
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.datePickerDoneButton}
                onPress={handleDatePickerDone}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={dateOfBirth || maxDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              style={styles.datePicker}
              themeVariant="light"
              textColor="#121212"
            />
          </View>
        </View>
      )}

      {(currentStep === 8 || currentStep === 9) ? (
        <View style={[styles.notificationsFooter, { paddingBottom: insets.bottom + 12 }]}>
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
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
                  console.log('Registration completed! Redirecting to home...');
                  router.replace('/' as Href);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationsLaterText}>{currentStep === 9 ? 'Maybe Later' : 'Later'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.footerContent}>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ChevronLeft color="#121212" size={24} strokeWidth={2} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.continueButton,
                  !canContinue() && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!canContinue()}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tosRow}>
              <Info color="rgba(18, 18, 18, 0.48)" size={12} strokeWidth={2} />
              <Text style={styles.tosText}>
                By pressing &quot;<Text style={styles.tosBold}>Continue</Text>&quot; you agree with <Text style={styles.tosLink}>Viral TOS</Text>.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
    letterSpacing: -0.3,
  },
  stepCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 4,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.08)',
    borderRadius: 1,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#262626',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  formSection: {
    gap: 12,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#262626',
    letterSpacing: -0.24,
    lineHeight: 36,
  },
  inputSection: {
    gap: 8,
  },
  dateInput: {
    height: 48,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    letterSpacing: -0.48,
  },
  dateInputTextPlaceholder: {
    color: 'rgba(18, 18, 18, 0.48)',
    fontWeight: '400',
  },
  dateInputTextFilled: {
    color: '#262626',
    fontWeight: '500',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.36,
    flex: 1,
  },
  helperTextBold: {
    fontWeight: '600',
  },
  helperTextError: {
    color: '#E53935',
  },
  helperRowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.36,
  },
  textInputContainer: {
    height: 48,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    fontWeight: '400',
    color: '#262626',
    letterSpacing: -0.48,
  },
  datePickerModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 18, 18, 0.08)',
  },
  datePickerHeaderSpacer: {
    width: 60,
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#121212',
  },
  datePickerDoneButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  datePickerDoneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#014D3A',
  },
  datePicker: {
    height: 216,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  footerContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tosText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.36,
    textAlign: 'center',
  },
  tosBold: {
    fontWeight: '600',
  },
  tosLink: {
    fontWeight: '500',
    color: '#262626',
  },
  contactToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 100,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    height: 32,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#121212',
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.07,
  },
  toggleOptionTextActive: {
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emailFormSection: {
    gap: 12,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.48,
  },
  helperTextLight: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.36,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
  },
  consentSection: {
    gap: 8,
  },
  consentCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
  },
  consentContent: {
    flex: 1,
    gap: 8,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
    letterSpacing: -0.5,
  },
  consentDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.07,
    lineHeight: 18,
  },
  codeInputContainer: {
    height: 48,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#262626',
    letterSpacing: -0.48,
  },
  sentToSection: {
    gap: 8,
  },
  sentToLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.36,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121212',
  },
  resendSection: {
    alignItems: 'center',
    gap: 16,
    marginTop: 28,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    height: 32,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 100,
    gap: 5,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121212',
  },
  helperTextCenter: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.36,
    textAlign: 'center',
  },
  phoneFormSection: {
    gap: 12,
  },
  phoneInputContainer: {
    height: 56,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneInputContent: {
    flex: 1,
    gap: 4,
  },
  phoneLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryFlag: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
    padding: 0,
  },
  phoneIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(1, 77, 58, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationMethodSection: {
    gap: 8,
  },
  verificationMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
  },
  verificationMethodCardActive: {
    backgroundColor: '#FFFFFF',
  },
  verificationMethodContent: {
    flex: 1,
    gap: 8,
  },
  verificationMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verificationMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
    letterSpacing: -0.5,
  },
  verificationMethodDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.07,
    lineHeight: 18,
  },
  passwordInputContainer: {
    height: 48,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#121212',
    letterSpacing: -0.48,
  },
  generatePasswordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  generatePasswordText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#014D3A',
    letterSpacing: -0.36,
  },
  passwordDivider: {
    height: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.16)',
  },
  passwordRequirements: {
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.36,
    flex: 1,
  },
  requirementTextMet: {
    color: '#014D3A',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.36,
    flex: 1,
  },
  securityTextBold: {
    fontWeight: '600',
    color: '#014D3A',
  },
  notificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    position: 'relative',
    marginTop: -136,
  },
  decorativeLineTop: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 400,
    height: 24,
    transform: [{ rotate: '-45deg' }],
    opacity: 0.6,
  },
  decorativeLineBottom: {
    position: 'absolute',
    bottom: 60,
    left: -150,
    width: 400,
    height: 24,
    transform: [{ rotate: '-45deg' }],
    opacity: 0.6,
  },
  gradientLine: {
    flex: 1,
    borderRadius: 12,
  },
  notificationsContent: {
    alignItems: 'center',
    gap: 40,
  },
  bellIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsTextSection: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  notificationsTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#121212',
    letterSpacing: -0.64,
    textAlign: 'center',
  },
  notificationsDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.28,
    lineHeight: 21,
    textAlign: 'center',
  },
  notificationsHelper: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.24,
    textAlign: 'center',
  },
  notificationsFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  notificationsFooterContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  notificationsContinueButton: {
    height: 48,
    borderRadius: 100,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsContinueText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  notificationsLaterButton: {
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.64)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsLaterText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  adsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    marginTop: -136,
  },
  adsContent: {
    alignItems: 'center',
    gap: 40,
  },
  adToggleContainer: {
    padding: 4,
  },
  adToggleTrack: {
    width: 79,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(18, 18, 18, 0.16)',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  adToggleTrackActive: {
    backgroundColor: '#014D3A',
  },
  adToggleKnob: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  adToggleKnobActive: {
    alignSelf: 'flex-end',
  },
  adsTextSection: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 0,
  },
  adsTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#121212',
    letterSpacing: -0.64,
    textAlign: 'center',
    lineHeight: 38,
  },
  adsDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.28,
    lineHeight: 21,
    textAlign: 'center',
  },
});
