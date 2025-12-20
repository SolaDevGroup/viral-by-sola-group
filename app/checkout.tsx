import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Check, MapPin, Phone, Mail, User, Package } from "lucide-react-native";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { MOCK_PRO_USERS } from "@/constants/mockData";
import { Product, ProUser } from "@/types";

const COMMUNITY_FEE_PERCENT = 5.5;
const SELLER_FEE_PERCENT = 12.5;

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId, sellerId } = useLocalSearchParams<{ productId: string; sellerId: string }>();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  const { product, seller } = useMemo(() => {
    let foundProduct: Product | undefined;
    let foundSeller: ProUser | undefined;

    for (const user of MOCK_PRO_USERS) {
      const prod = user.products.find(p => p.id === productId);
      if (prod) {
        foundProduct = prod;
        foundSeller = user;
        break;
      }
    }

    if (sellerId) {
      const specificSeller = MOCK_PRO_USERS.find(u => u.id === sellerId);
      if (specificSeller) {
        foundSeller = specificSeller;
      }
    }

    return { product: foundProduct, seller: foundSeller };
  }, [productId, sellerId]);

  const priceBreakdown = useMemo(() => {
    if (!product) return { productPrice: 0, communityFee: 0, total: 0, sellerEarnings: 0, sellerFee: 0 };
    
    const productPrice = product.price;
    const communityFee = parseFloat((productPrice * (COMMUNITY_FEE_PERCENT / 100)).toFixed(2));
    const total = parseFloat((productPrice + communityFee).toFixed(2));
    const sellerFee = parseFloat((productPrice * (SELLER_FEE_PERCENT / 100)).toFixed(2));
    const sellerEarnings = parseFloat((productPrice - sellerFee).toFixed(2));

    return { productPrice, communityFee, total, sellerEarnings, sellerFee };
  }, [product]);

  const isFormValid = useMemo(() => {
    return (
      form.fullName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.email.includes('@') &&
      form.phone.trim().length > 0 &&
      form.address.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.zipCode.trim().length > 0 &&
      form.country.trim().length > 0
    );
  }, [form]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const updateForm = useCallback((field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const sendConfirmationEmails = useCallback(() => {
    console.log('=== SENDING CONFIRMATION EMAILS ===');
    console.log('--- Buyer Email ---');
    console.log(`To: ${form.email}`);
    console.log(`Subject: Order Confirmation - ${product?.name}`);
    console.log(`
Dear ${form.fullName},

Thank you for your purchase!

Order Details:
- Product: ${product?.name}
- Brand: ${product?.brand}
- Price: $${priceBreakdown.productPrice}
- Community Fee (5.5%): $${priceBreakdown.communityFee}
- Total Paid: $${priceBreakdown.total}

Shipping Address:
${form.address}
${form.city}, ${form.zipCode}
${form.country}

Contact: ${form.phone}

Seller: ${seller?.displayName} (${seller?.username})

Your order is being processed and will be shipped soon.

Thank you for shopping with us!
    `);
    
    console.log('--- Seller Email ---');
    console.log(`To: ${seller?.username}@example.com`);
    console.log(`Subject: New Order - ${product?.name}`);
    console.log(`
Dear ${seller?.displayName},

You have a new order!

Order Details:
- Product: ${product?.name}
- Sale Price: $${priceBreakdown.productPrice}
- Platform Fee (12.5%): -$${priceBreakdown.sellerFee}
- Your Earnings: $${priceBreakdown.sellerEarnings}

Buyer Information:
- Name: ${form.fullName}
- Email: ${form.email}
- Phone: ${form.phone}

Shipping Address:
${form.address}
${form.city}, ${form.zipCode}
${form.country}

Please ship the item within 2-3 business days.

Thank you for selling with us!
    `);
    console.log('=== EMAILS SENT SUCCESSFULLY ===');
  }, [form, product, seller, priceBreakdown]);

  const handleGetItNow = useCallback(() => {
    if (!isFormValid) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      sendConfirmationEmails();
      setIsProcessing(false);
      setShowConfirmation(true);
    }, 1500);
  }, [isFormValid, sendConfirmationEmails]);

  useEffect(() => {
    if (showConfirmation) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showConfirmation, fadeAnim, checkScaleAnim]);

  const handleDone = useCallback(() => {
    router.replace('/(tabs)/shop');
  }, [router]);

  if (!product || !seller) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#121212" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Product not found</Text>
        </View>
      </View>
    );
  }

  if (showConfirmation) {
    return (
      <Animated.View style={[styles.confirmationContainer, { opacity: fadeAnim }]}>
        <View style={[styles.confirmationContent, { paddingTop: insets.top + 60 }]}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScaleAnim }] }]}>
            <Check size={48} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
          <Text style={styles.confirmationTitle}>Order Confirmed!</Text>
          <Text style={styles.confirmationSubtitle}>
            Your order has been placed successfully
          </Text>
          
          <View style={styles.confirmationDetails}>
            <View style={styles.confirmationRow}>
              <Package size={20} color="#014D3A" strokeWidth={2} />
              <Text style={styles.confirmationText}>{product.name}</Text>
            </View>
            <View style={styles.confirmationRow}>
              <Mail size={20} color="#014D3A" strokeWidth={2} />
              <Text style={styles.confirmationText}>Confirmation sent to {form.email}</Text>
            </View>
            <View style={styles.confirmationRow}>
              <MapPin size={20} color="#014D3A" strokeWidth={2} />
              <Text style={styles.confirmationText}>{form.city}, {form.country}</Text>
            </View>
          </View>

          <View style={styles.confirmationSummary}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryAmount}>${priceBreakdown.total}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.doneButton, { marginBottom: insets.bottom + 20 }]} 
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.productSummary}>
          <View style={styles.productIcon}>
            <Package size={24} color="#014D3A" strokeWidth={2} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand} • Sold by {seller.displayName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={18} color="rgba(18, 18, 18, 0.48)" strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="rgba(18, 18, 18, 0.48)"
              value={form.fullName}
              onChangeText={(v) => updateForm('fullName', v)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Mail size={18} color="rgba(18, 18, 18, 0.48)" strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="rgba(18, 18, 18, 0.48)"
              value={form.email}
              onChangeText={(v) => updateForm('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone size={18} color="rgba(18, 18, 18, 0.48)" strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="rgba(18, 18, 18, 0.48)"
              value={form.phone}
              onChangeText={(v) => updateForm('phone', v)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin size={18} color="rgba(18, 18, 18, 0.48)" strokeWidth={2} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor="rgba(18, 18, 18, 0.48)"
              value={form.address}
              onChangeText={(v) => updateForm('address', v)}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <TextInput
                style={styles.inputSmall}
                placeholder="City"
                placeholderTextColor="rgba(18, 18, 18, 0.48)"
                value={form.city}
                onChangeText={(v) => updateForm('city', v)}
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <TextInput
                style={styles.inputSmall}
                placeholder="ZIP Code"
                placeholderTextColor="rgba(18, 18, 18, 0.48)"
                value={form.zipCode}
                onChangeText={(v) => updateForm('zipCode', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.inputSmall}
              placeholder="Country"
              placeholderTextColor="rgba(18, 18, 18, 0.48)"
              value={form.country}
              onChangeText={(v) => updateForm('country', v)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Product Price</Text>
            <Text style={styles.priceValue}>${priceBreakdown.productPrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.feeLabelRow}>
              <Text style={styles.priceLabel}>Community Fee</Text>
              <View style={styles.feeBadge}>
                <Text style={styles.feeBadgeText}>{COMMUNITY_FEE_PERCENT}%</Text>
              </View>
            </View>
            <Text style={styles.priceValue}>${priceBreakdown.communityFee.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${priceBreakdown.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Seller receives ${priceBreakdown.sellerEarnings.toFixed(2)} after {SELLER_FEE_PERCENT}% platform fee
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={[styles.getItButton, !isFormValid && styles.getItButtonDisabled]} 
          onPress={handleGetItNow}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Text style={styles.getItButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.getItButtonText}>Get it now - ${priceBreakdown.total.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 18, 18, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  productSummary: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(1, 77, 58, 0.04)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(1, 77, 58, 0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
    letterSpacing: -0.3,
  },
  productBrand: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.64)',
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  inputGroup: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#121212',
    letterSpacing: -0.01,
  },
  inputRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#121212',
    letterSpacing: -0.01,
  },
  priceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  feeLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.72)',
  },
  priceValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#121212',
  },
  feeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(1, 77, 58, 0.08)',
    borderRadius: 4,
  },
  feeBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#014D3A',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.08)',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#014D3A',
    letterSpacing: -0.5,
  },
  infoBox: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.64)',
    textAlign: 'center' as const,
  },
  bottomBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(18, 18, 18, 0.06)',
  },
  getItButton: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#014D3A',
    paddingVertical: 16,
    borderRadius: 100,
  },
  getItButtonDisabled: {
    backgroundColor: 'rgba(1, 77, 58, 0.4)',
  },
  getItButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: -0.02,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(18, 18, 18, 0.64)',
  },
  confirmationContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  confirmationContent: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#014D3A',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#121212',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.64)',
    marginBottom: 32,
  },
  confirmationDetails: {
    width: '100%',
    backgroundColor: 'rgba(1, 77, 58, 0.04)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  confirmationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  confirmationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#121212',
  },
  confirmationSummary: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.64)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 36,
    fontFamily: 'Poppins_700Bold',
    color: '#014D3A',
    letterSpacing: -1,
  },
  doneButton: {
    width: '100%',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#014D3A',
    paddingVertical: 16,
    borderRadius: 100,
    marginTop: 'auto' as const,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: -0.02,
  },
});
