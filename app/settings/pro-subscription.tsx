import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { Stack, router } from "expo-router";
import { X, Check, Crown, Link2, Users, Type, Video, Pin, Clock, BarChart3 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import { LinearGradient } from "expo-linear-gradient";

const PRO_FEATURES = [
  {
    icon: Crown,
    title: "Pro Badge",
    description: "Stand out with an exclusive Pro badge on your profile"
  },
  {
    icon: Link2,
    title: "Add Links to Shorts",
    description: "Direct your audience with clickable links in your content"
  },
  {
    icon: Users,
    title: "Collaborations",
    description: "Tag collaborators and co-create content together"
  },
  {
    icon: Type,
    title: "Extended Captions",
    description: "Write up to 2000 characters in your captions"
  },
  {
    icon: Video,
    title: "4K Video Quality",
    description: "Upload and share videos in stunning 4K resolution"
  },
  {
    icon: Pin,
    title: "Pin Reels",
    description: "Highlight your best content at the top of your profile"
  },
  {
    icon: Clock,
    title: "Permanent Reels",
    description: "Keep your pinned reels forever, they won't disappear"
  },
  {
    icon: BarChart3,
    title: "Profile Insights",
    description: "Access detailed analytics and performance metrics"
  }
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    savings: null
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 79.99,
    period: 'year',
    savings: 'Save 33%'
  }
];

export default function ProSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');

  const handleSubscribe = () => {
    console.log('Subscribe to Pro:', selectedPlan);
    updateUser({ isPro: true });
    router.back();
  };

  const handleManageSubscription = () => {
    console.log('Manage subscription');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pro Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {user?.isPro ? (
          <View style={styles.activeProContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeProGradient}
            >
              <Crown size={48} color="#121212" fill="#121212" />
              <Text style={styles.activeProTitle}>You&apos;re a Pro Member!</Text>
              <Text style={styles.activeProDescription}>
                Enjoy all the exclusive features
              </Text>
            </LinearGradient>
            
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.heroSection}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 165, 0, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <Crown size={64} color="#FFD700" />
                <Text style={styles.heroTitle}>Upgrade to Pro</Text>
                <Text style={styles.heroSubtitle}>
                  Unlock premium features and take your content to the next level
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.plansSection}>
              <Text style={styles.sectionTitle}>Choose Your Plan</Text>
              <View style={styles.plansContainer}>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && styles.planCardSelected
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {selectedPlan === plan.id && (
                        <View style={styles.checkmark}>
                          <Check size={16} color="#121212" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>${plan.price}</Text>
                      <Text style={styles.planPeriod}>/{plan.period}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What&apos;s Included</Text>
          <View style={styles.featuresContainer}>
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color="#FFD700" strokeWidth={2} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {!user?.isPro && (
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={handleSubscribe}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subscribeGradient}
            >
              <Crown size={20} color="#121212" fill="#121212" />
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cancel anytime. Terms and conditions apply.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#121212',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  activeProContainer: {
    gap: 16,
    marginBottom: 24,
  },
  activeProGradient: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  activeProTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#121212',
  },
  activeProDescription: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    textAlign: 'center' as const,
  },
  manageButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  heroSection: {
    marginBottom: 32,
  },
  heroGradient: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.64)',
    textAlign: 'center' as const,
    maxWidth: 280,
  },
  plansSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  planCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  savingsBadge: {
    position: 'absolute' as const,
    top: -8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#121212',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.64)',
    marginLeft: 4,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.64)',
    lineHeight: 20,
  },
  subscribeButton: {
    marginBottom: 16,
    borderRadius: 100,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#121212',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.48)',
    textAlign: 'center' as const,
  },
});
