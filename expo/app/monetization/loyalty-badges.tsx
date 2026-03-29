import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Image } from "react-native";
import { useState } from "react";
import { Stack, router } from "expo-router";
import { ChevronLeft, Star, Award, Trophy } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Badge {
  id: string;
  name: string;
  duration: string;
  enabled: boolean;
  color: string;
  bgColor: string;
  icon: 'star' | 'medal-bronze' | 'medal-silver' | 'medal-gold' | 'diamond' | 'crown';
}

const initialBadges: Badge[] = [
  { id: '1', name: 'New Supporter', duration: '1 month subscribed', enabled: true, color: '#FFD700', bgColor: '#FFF9E6', icon: 'star' },
  { id: '2', name: 'Bronze Fan', duration: '3 months subscribed', enabled: true, color: '#CD7F32', bgColor: '#FDF5ED', icon: 'medal-bronze' },
  { id: '3', name: 'Silver Fan', duration: '6 months subscribed', enabled: true, color: '#C0C0C0', bgColor: '#F5F5F5', icon: 'medal-silver' },
  { id: '4', name: 'Gold Fan', duration: '12 months subscribed', enabled: true, color: '#FFD700', bgColor: '#FFF9E6', icon: 'medal-gold' },
  { id: '5', name: 'Platinum Fan', duration: '24 months subscribed', enabled: true, color: '#E5E4E2', bgColor: '#F8F8F8', icon: 'diamond' },
  { id: '6', name: 'Diamond Fan', duration: '36 months subscribed', enabled: true, color: '#FFD700', bgColor: '#FFF9E6', icon: 'crown' },
];

const BadgeIcon = ({ type, size = 24 }: { type: Badge['icon'], size?: number }) => {
  switch (type) {
    case 'star':
      return <Star size={size} color="#FFD700" fill="#FFD700" />;
    case 'medal-bronze':
      return (
        <View style={[styles.medalIcon, { backgroundColor: '#CD7F32' }]}>
          <Text style={styles.medalNumber}>3</Text>
        </View>
      );
    case 'medal-silver':
      return (
        <View style={[styles.medalIcon, { backgroundColor: '#C0C0C0' }]}>
          <Text style={styles.medalNumber}>2</Text>
        </View>
      );
    case 'medal-gold':
      return (
        <View style={[styles.medalIcon, { backgroundColor: '#FFD700' }]}>
          <Text style={styles.medalNumber}>1</Text>
        </View>
      );
    case 'diamond':
      return <Trophy size={size} color="#00CED1" fill="#E0FFFF" />;
    case 'crown':
      return <Award size={size} color="#FFD700" fill="#FFD700" />;
    default:
      return <Star size={size} color="#FFD700" />;
  }
};

export default function LoyaltyBadgesScreen() {
  const insets = useSafeAreaInsets();
  const [badges, setBadges] = useState<Badge[]>(initialBadges);

  const toggleBadge = (id: string) => {
    setBadges(prev => prev.map(badge => 
      badge.id === id ? { ...badge, enabled: !badge.enabled } : badge
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
        <Text style={styles.headerTitle}>Loyalty Badges</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <Text style={styles.sectionTitle}>Loyalty Badges</Text>
        <Text style={styles.sectionSubtitle}>
          Reward your long-term subscribers with special badges that appear next to their name in comments and chats.
        </Text>

        {badges.map((badge) => (
          <View 
            key={badge.id} 
            style={[
              styles.badgeCard,
              { backgroundColor: badge.bgColor }
            ]}
          >
            <View style={styles.badgeIconContainer}>
              <BadgeIcon type={badge.icon} size={28} />
            </View>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDuration}>{badge.duration}</Text>
            </View>
            <Switch
              value={badge.enabled}
              onValueChange={() => toggleBadge(badge.id)}
              trackColor={{ false: '#E0E0E0', true: '#1A9D7C' }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={styles.previewSection}>
          <View style={styles.previewItem}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }}
              style={styles.previewAvatar}
            />
            <Text style={styles.previewUsername}>username</Text>
            <View style={styles.previewBadge}>
              <Trophy size={12} color="#CD7F32" />
              <Text style={styles.previewBadgeText}>Bronze Fan</Text>
            </View>
          </View>
          <View style={styles.previewItem}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }}
              style={styles.previewAvatar}
            />
            <Text style={styles.previewUsername}>username</Text>
            <View style={[styles.previewBadge, { backgroundColor: '#F5F5F5' }]}>
              <Trophy size={12} color="#C0C0C0" />
              <Text style={[styles.previewBadgeText, { color: '#999' }]}>Silver Fan</Text>
            </View>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(18, 18, 18, 0.64)',
    marginBottom: 20,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeContent: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
    marginBottom: 2,
  },
  badgeDuration: {
    fontSize: 13,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  medalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  previewSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(18, 18, 18, 0.08)',
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  previewUsername: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.64)',
    marginRight: 8,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF5ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#CD7F32',
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
