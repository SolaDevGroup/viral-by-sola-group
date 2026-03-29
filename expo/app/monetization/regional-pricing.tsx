import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, TextInput } from "react-native";
import { useState } from "react";
import { Stack, router } from "expo-router";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Region {
  id: string;
  code: string;
  name: string;
  currency: string;
  monthlyPrice: string;
  yearlyPrice: string;
  enabled: boolean;
  expanded?: boolean;
}

const initialRegions: Region[] = [
  { id: '1', code: 'US', name: 'United States', currency: 'USD', monthlyPrice: '4.99', yearlyPrice: '49.99', enabled: true, expanded: true },
  { id: '2', code: 'GB', name: 'United Kingdom', currency: 'GBP', monthlyPrice: '3.99', yearlyPrice: '39.99', enabled: true },
  { id: '3', code: 'EU', name: 'European Union', currency: 'EUR', monthlyPrice: '4.49', yearlyPrice: '44.99', enabled: true },
  { id: '4', code: 'CA', name: 'Canada', currency: 'CAD', monthlyPrice: '5.99', yearlyPrice: '59.99', enabled: true },
  { id: '5', code: 'AU', name: 'Australia', currency: 'AUD', monthlyPrice: '6.99', yearlyPrice: '69.99', enabled: true },
  { id: '6', code: 'IN', name: 'India', currency: 'INR', monthlyPrice: '99', yearlyPrice: '999', enabled: true },
  { id: '7', code: 'BR', name: 'Brazil', currency: 'BRL', monthlyPrice: '14.99', yearlyPrice: '149.99', enabled: true },
  { id: '8', code: 'JP', name: 'Japan', currency: 'JPY', monthlyPrice: '500', yearlyPrice: '5000', enabled: true },
  { id: '9', code: 'MX', name: 'Mexico', currency: 'MXN', monthlyPrice: '79', yearlyPrice: '790', enabled: true },
  { id: '10', code: 'NG', name: 'Nigeria', currency: 'NGN', monthlyPrice: '1500', yearlyPrice: '15000', enabled: false },
  { id: '11', code: 'ZA', name: 'South Africa', currency: 'ZAR', monthlyPrice: '79', yearlyPrice: '790', enabled: false },
  { id: '12', code: 'PH', name: 'Philippines', currency: 'PHP', monthlyPrice: '199', yearlyPrice: '1990', enabled: false },
];

export default function RegionalPricingScreen() {
  const insets = useSafeAreaInsets();
  const [regions, setRegions] = useState<Region[]>(initialRegions);

  const toggleRegion = (id: string) => {
    setRegions(prev => prev.map(region => 
      region.id === id ? { ...region, enabled: !region.enabled } : region
    ));
  };

  const toggleExpanded = (id: string) => {
    setRegions(prev => prev.map(region => 
      region.id === id ? { ...region, expanded: !region.expanded } : { ...region, expanded: false }
    ));
  };

  const updatePrice = (id: string, type: 'monthly' | 'yearly', value: string) => {
    setRegions(prev => prev.map(region => 
      region.id === id 
        ? { ...region, [type === 'monthly' ? 'monthlyPrice' : 'yearlyPrice']: value } 
        : region
    ));
  };

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
        <Text style={styles.headerTitle}>Regional Pricing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <Text style={styles.sectionTitle}>Regional Pricing</Text>
        <Text style={styles.sectionSubtitle}>
          Set custom prices for different countries to maximize your global reach.
        </Text>

        {regions.map((region) => (
          <View key={region.id}>
            <TouchableOpacity 
              style={styles.regionCard}
              onPress={() => toggleExpanded(region.id)}
              activeOpacity={0.7}
            >
              <View style={styles.regionCodeContainer}>
                <Text style={styles.regionCode}>{region.code}</Text>
              </View>
              <View style={styles.regionContent}>
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionPrice}>
                  {region.monthlyPrice} {region.currency}/mo
                </Text>
              </View>
              <Switch
                value={region.enabled}
                onValueChange={() => toggleRegion(region.id)}
                trackColor={{ false: '#E0E0E0', true: '#1A9D7C' }}
                thumbColor="#fff"
              />
              {region.enabled ? (
                <ChevronDown 
                  size={20} 
                  color="#999" 
                  strokeWidth={2} 
                  style={{ 
                    marginLeft: 8,
                    transform: [{ rotate: region.expanded ? '180deg' : '0deg' }]
                  }} 
                />
              ) : (
                <ChevronRight size={20} color="#999" strokeWidth={2} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            {region.expanded && region.enabled && (
              <View style={styles.expandedSection}>
                <View style={styles.priceInputRow}>
                  <Text style={styles.inputLabel}>Monthly Price ({region.currency})</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={region.monthlyPrice}
                    onChangeText={(value) => updatePrice(region.id, 'monthly', value)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.priceInputRow}>
                  <Text style={styles.inputLabel}>Yearly Price ({region.currency})</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={region.yearlyPrice}
                    onChangeText={(value) => updatePrice(region.id, 'yearly', value)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
              </View>
            )}
          </View>
        ))}
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(18, 18, 18, 0.64)',
    marginBottom: 20,
  },
  regionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  regionCodeContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  regionCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#121212',
  },
  regionContent: {
    flex: 1,
  },
  regionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 2,
  },
  regionPrice: {
    fontSize: 13,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  expandedSection: {
    backgroundColor: 'rgba(18, 18, 18, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginTop: -4,
    marginBottom: 8,
  },
  priceInputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
    marginBottom: 6,
  },
  priceInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(18, 18, 18, 0.08)',
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
