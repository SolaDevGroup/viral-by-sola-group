import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Crown, Check, Star } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  subscriberCount: number;
  accentColor: string;
}

type PlanType = 'monthly' | 'yearly';

export default function SubscriptionModal({
  visible,
  onClose,
  creatorName,
  creatorUsername,
  creatorAvatar,
  subscriberCount,
  accentColor,
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');

  const monthlyPrice = 4.99;
  const yearlyPrice = 49.90;
  const yearlySavings = 17;

  const benefits = [
    'Access to exclusive content',
    'Early access to new posts',
    'Subscriber-only live streams',
    'Direct messaging',
    'Subscriber badge on comments',
  ];

  const formatSubscribers = (count: number): string => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  const handleSubscribe = () => {
    console.log(`Subscribing to ${selectedPlan} plan`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Subscribe</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.creatorSection}>
              <View style={[styles.avatarContainer, { borderColor: accentColor }]}>
                <Image source={{ uri: creatorAvatar }} style={styles.avatar} />
                <View style={[styles.crownBadge, { backgroundColor: accentColor }]}>
                  <Crown size={12} color="#121212" />
                </View>
              </View>
              <View style={styles.creatorNameRow}>
                <Text style={styles.creatorName}>{creatorName}</Text>
                <View style={[styles.verifiedBadge, { backgroundColor: accentColor }]}>
                  <Check size={10} color="#121212" strokeWidth={3} />
                </View>
              </View>
              <Text style={styles.creatorUsername}>@{creatorUsername}</Text>
              <Text style={styles.subscriberCount}>
                {formatSubscribers(subscriberCount)} subscribers
              </Text>
            </View>

            <View style={styles.benefitsCard}>
              <View style={styles.benefitsHeader}>
                <Crown size={20} color={accentColor} />
                <Text style={styles.benefitsTitle}>Subscriber Benefits</Text>
              </View>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <Check size={16} color={accentColor} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && { borderColor: accentColor, borderWidth: 2 },
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={styles.planLabel}>Monthly</Text>
                <Text style={[styles.planPrice, selectedPlan === 'monthly' && { color: accentColor }]}>
                  ${monthlyPrice.toFixed(2)}
                </Text>
                <Text style={styles.planPeriod}>/month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'yearly' && { borderColor: accentColor, borderWidth: 2 },
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={[styles.saveBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.saveBadgeText}>SAVE {yearlySavings}%</Text>
                </View>
                <Text style={styles.planLabel}>Yearly</Text>
                <Text style={[styles.planPrice, selectedPlan === 'yearly' && { color: accentColor }]}>
                  ${yearlyPrice.toFixed(2)}
                </Text>
                <Text style={styles.planPeriod}>/year</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: accentColor }]}
              onPress={handleSubscribe}
            >
              <Star size={20} color="#121212" />
              <Text style={styles.subscribeButtonText}>
                Subscribe for ${selectedPlan === 'monthly' ? monthlyPrice.toFixed(2) : yearlyPrice.toFixed(2)}/{selectedPlan === 'monthly' ? 'month' : 'year'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Cancel anytime. Subscription renews automatically.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  creatorSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  crownBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#121212',
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorUsername: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    marginBottom: 4,
  },
  subscriberCount: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  benefitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#121212',
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    marginBottom: 8,
    marginTop: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    marginTop: 4,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 100,
    marginBottom: 16,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
  },
  disclaimer: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center' as const,
  },
});
