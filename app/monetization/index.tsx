import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useState } from "react";
import { Stack, router } from "expo-router";
import { ChevronLeft, ChevronRight, DollarSign, Award, Globe, Calculator, Info } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

export default function MonetizationScreen() {
  const insets = useSafeAreaInsets();
  const { accentColor } = useApp();
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
  const [monthlyPrice] = useState(4.99);
  const [yearlyDiscount] = useState(17);

  const yearlyPrice = (monthlyPrice * 12 * (1 - yearlyDiscount / 100)).toFixed(2);

  const menuItems = [
    {
      icon: DollarSign,
      title: "Subscription Pricing",
      subtitle: "Set your monthly & yearly prices",
      route: "/monetization/subscription-pricing",
    },
    {
      icon: Award,
      title: "Loyalty Badges",
      subtitle: "Reward long-term subscribers",
      route: "/monetization/loyalty-badges",
    },
    {
      icon: Globe,
      title: "Regional Pricing",
      subtitle: "Set prices per country",
      route: "/monetization/regional-pricing",
    },
    {
      icon: Calculator,
      title: "Earnings Calculator",
      subtitle: "Estimate your potential earnings",
      route: "/monetization/earnings-calculator",
    },
  ];

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
        <Text style={styles.headerTitle}>Monetization</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={[styles.subscriptionCard, { backgroundColor: accentColor }]}>
          <View style={styles.subscriptionIconContainer}>
            <DollarSign size={24} color="#fff" strokeWidth={2.5} />
          </View>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTitle}>Subscriptions</Text>
            <Text style={styles.subscriptionSubtitle}>Earn from your fans</Text>
          </View>
          <Switch
            value={subscriptionsEnabled}
            onValueChange={setSubscriptionsEnabled}
            trackColor={{ false: '#E0E0E0', true: accentColor }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Monthly Price</Text>
            <Text style={styles.priceValue}>${monthlyPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Yearly Price</Text>
            <Text style={styles.priceValue}>${yearlyPrice}</Text>
            <Text style={[styles.savingsText, { color: accentColor }]}>Save {yearlyDiscount}%</Text>
          </View>
        </View>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${accentColor}20` }]}>
              <item.icon size={20} color={accentColor} strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={20} color="#999" strokeWidth={2} />
          </TouchableOpacity>
        ))}

        <View style={styles.platformFeesCard}>
          <View style={styles.platformFeesHeader}>
            <Info size={20} color="#666" strokeWidth={2} />
            <Text style={styles.platformFeesTitle}>Platform Fees</Text>
          </View>
          <Text style={styles.platformFeesText}>
            Viral takes a 20% platform fee + 2.9% payment processing. You keep 77.1% of all subscription revenue.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: accentColor }]} activeOpacity={0.8}>
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
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  subscriptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    padding: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#121212',
  },
  savingsText: {
    fontSize: 12,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  platformFeesCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  platformFeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  platformFeesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121212',
  },
  platformFeesText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(18, 18, 18, 0.64)',
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
