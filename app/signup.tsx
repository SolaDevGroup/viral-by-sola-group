import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

type SignupStep = 'email' | 'phone' | 'verify';

export default function SignupScreen() {
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+1');
  const [country] = useState('US  United States');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(57);
  const router = useRouter();
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (step === 'verify' && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1);
    }
    
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    if (step === 'email') {
      console.log('Email submitted:', email);
      router.replace('/onboarding');
    } else if (step === 'phone') {
      console.log('Phone submitted:', countryCode + phoneNumber);
      setStep('verify');
      setResendTimer(57);
    } else if (step === 'verify') {
      console.log('Verification code:', verificationCode.join(''));
      router.replace('/onboarding');
    }
  };

  const handleBack = () => {
    if (step === 'phone') {
      setStep('email');
    } else if (step === 'verify') {
      setStep('phone');
    } else {
      router.back();
    }
  };

  const handleSwitchToPhone = () => {
    setStep('phone');
  };



  const handleSkip = () => {
    router.replace('/onboarding');
  };

  const handleResendCode = () => {
    if (resendTimer === 0) {
      setResendTimer(57);
      console.log('Resending code...');
    }
  };

  const canContinue = () => {
    if (step === 'email') return email.length > 0 && email.includes('@');
    if (step === 'phone') return phoneNumber.length >= 10;
    if (step === 'verify') return verificationCode.every(digit => digit !== '');
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{step === 'verify' ? 'Confirm your number' : 'Create account'}</Text>
          {step !== 'verify' && <Text style={styles.headerStep}>Step 5 of 5</Text>}
        </View>
        {step === 'phone' && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'email' && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <TouchableOpacity style={styles.switchButton} onPress={handleSwitchToPhone}>
              <Text style={styles.switchButtonText}>Use phone number instead</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'phone' && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Country</Text>
            <TouchableOpacity style={styles.countrySelector}>
              <Text style={styles.countryText}>{country}</Text>
              <ChevronDown color={Colors.textSecondary} size={20} />
            </TouchableOpacity>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor={Colors.textTertiary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            <Text style={styles.disclaimer}>
              We&apos;ll send you a verification code. By entering your number, you agree to receive transactional messaging by SMS or other message channel about your account.{' '}
              <Text style={styles.disclaimerLink}>Learn more</Text> about how Viral uses your phone number.
            </Text>
          </View>
        )}

        {step === 'verify' && (
          <View style={styles.verifyContainer}>
            <Text style={styles.verifySubtitle}>
              Enter the code sent to {countryCode} {phoneNumber}
            </Text>

            <View style={styles.codeInputContainer}>
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    codeInputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity onPress={handleResendCode} disabled={resendTimer > 0}>
              <Text style={[styles.resendText, resendTimer === 0 && styles.resendTextActive]}>
                {resendTimer > 0 ? `Re-send code in ${resendTimer}` : 'Re-send code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue()}
        >
          <Text style={styles.continueButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  headerStep: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  stepContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.text,
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  countrySelector: {
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  countryText: {
    fontSize: 16,
    color: Colors.text,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCodeBox: {
    width: 60,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.text,
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  disclaimerLink: {
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  verifyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  verifySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  codeInput: {
    width: 50,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  resendText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resendTextActive: {
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
