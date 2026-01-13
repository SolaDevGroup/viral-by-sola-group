import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { Stack, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

export default function SubscriptionPricingScreen() {
  const insets = useSafeAreaInsets();
  const [monthlyPrice, setMonthlyPrice] = useState("4.99");
  const [yearlyDiscount, setYearlyDiscount] = useState(17);

  const monthlyValue = parseFloat(monthlyPrice) || 0;
  const yearlyPrice = (monthlyValue * 12 * (1 - yearlyDiscount / 100)).toFixed(2);
  const yearlySavings = (monthlyValue * 12 - parseFloat(yearlyPrice)).toFixed(2);

  const handlePriceChange = useCallback((text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setMonthlyPrice(cleanText);
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Pricing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <Text style={styles.sectionTitle}>Subscription Pricing</Text>
        
        <Text style={styles.inputLabel}>Monthly Price (USD)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            value={monthlyPrice}
            onChangeText={handlePriceChange}
            keyboardType="decimal-pad"
            placeholder="4.99"
            placeholderTextColor="rgba(18, 18, 18, 0.32)"
          />
        </View>
        <Text style={styles.suggestedText}>Suggested: $2.99 - $9.99/month</Text>

        <View style={styles.discountSection}>
          <View style={styles.discountHeader}>
            <Text style={styles.discountLabel}>Yearly Discount</Text>
            <Text style={styles.discountValue}>{yearlyDiscount}% off</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={50}
            step={1}
            value={yearlyDiscount}
            onValueChange={setYearlyDiscount}
            minimumTrackTintColor="#1A9D7C"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1A9D7C"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0%</Text>
            <Text style={styles.sliderLabelText}>50%</Text>
          </View>
        </View>

        <View style={styles.yearlyPreviewCard}>
          <View style={styles.yearlyPreviewRow}>
            <Text style={styles.yearlyPreviewLabel}>Yearly Price</Text>
            <Text style={styles.vsText}>vs. Monthly</Text>
          </View>
          <View style={styles.yearlyPreviewRow}>
            <Text style={styles.yearlyPreviewPrice}>${yearlyPrice}</Text>
            <Text style={styles.savingsAmount}>Save ${yearlySavings}</Text>
          </View>
        </View>

        <Text style={styles.previewTitle}>Preview</Text>

        <View style={styles.previewCard}>
          <View style={styles.previewItem}>
            <View>
              <Text style={styles.previewItemTitle}>Monthly</Text>
              <Text style={styles.previewItemSubtitle}>Cancel anytime</Text>
            </View>
            <Text style={styles.previewItemPrice}>${monthlyValue.toFixed(2)}/mo</Text>
          </View>
        </View>

        <View style={[styles.previewCard, styles.bestValueCard]}>
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <View style={styles.previewItem}>
            <View>
              <Text style={styles.previewItemTitle}>Yearly</Text>
              <Text style={styles.savingsSubtitle}>Save {yearlyDiscount}% (${yearlySavings})</Text>
            </View>
            <Text style={styles.previewItemPrice}>${yearlyPrice}/yr</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121212',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121212',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 16,
    color: 'rgba(18, 18, 18, 0.48)',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#121212',
  },
  suggestedText: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
    marginTop: 8,
    marginBottom: 24,
  },
  discountSection: {
    marginBottom: 24,
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121212',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A9D7C',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  yearlyPreviewCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  yearlyPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearlyPreviewLabel: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  vsText: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  yearlyPreviewPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#121212',
    marginTop: 4,
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A9D7C',
    marginTop: 4,
  },
  previewTitle: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.48)',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(18, 18, 18, 0.08)',
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 2,
  },
  previewItemSubtitle: {
    fontSize: 13,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  previewItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121212',
  },
  bestValueCard: {
    borderColor: '#1A9D7C',
    borderWidth: 2,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#1A9D7C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  savingsSubtitle: {
    fontSize: 13,
    color: '#1A9D7C',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#1A9D7C',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
