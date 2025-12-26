import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Shuffle, BadgeCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SuggestedProfile {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  coverImage: string;
  isVerified: boolean;
  totalViews: number;
  isFollowing?: boolean;
}

interface SuggestedProfilesCardProps {
  profiles: SuggestedProfile[];
  height: number;
  onShuffle?: () => void;
}

export default function SuggestedProfilesCard({
  profiles,
  height,
  onShuffle,
}: SuggestedProfilesCardProps) {
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const formatViews = (views: number): string => {
    if (views >= 1000000000) {
      return (views / 1000000000).toFixed(1) + 'B';
    }
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'k';
    }
    return views.toString();
  };

  const handleFollow = (profileId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setFollowingStates(prev => ({
      ...prev,
      [profileId]: !prev[profileId],
    }));
  };

  const handleProfilePress = (profileId: string) => {
    router.push({
      pathname: '/profile/[userId]' as any,
      params: { userId: profileId },
    });
  };

  const handleShuffle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onShuffle?.();
  };

  const renderProfileCard = (profile: SuggestedProfile, index: number) => {
    const isFollowing = followingStates[profile.id] || profile.isFollowing;

    return (
      <TouchableOpacity
        key={profile.id}
        style={[
          styles.profileCard,
          index % 2 === 1 && styles.profileCardRight,
        ]}
        onPress={() => handleProfilePress(profile.id)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: profile.coverImage }}
          style={styles.profileCardBg}
        />
        <LinearGradient
          colors={['rgba(18, 18, 18, 0.64)', 'rgba(18, 18, 18, 0.64)']}
          style={styles.profileCardOverlay}
        />
        
        <View style={styles.profileCardContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatar}
              />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName} numberOfLines={1}>
                {profile.displayName}
              </Text>
              {profile.isVerified && (
                <BadgeCheck size={14} color="#007BFF" fill="#007BFF" />
              )}
            </View>
            <Text style={styles.username} numberOfLines={1}>
              {profile.username}
            </Text>
            <View style={styles.viewsRow}>
              <Eye size={12} color="#FFFFFF" />
              <Text style={styles.viewsText}>
                {formatViews(profile.totalViews)} views
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={(e) => {
              e.stopPropagation();
              handleFollow(profile.id);
            }}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={['#121212', '#262626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Suggested For You</Text>

        <View style={styles.profilesGrid}>
          {profiles.slice(0, 4).map((profile, index) => renderProfileCard(profile, index))}
        </View>

        <TouchableOpacity
          style={styles.shuffleBtn}
          onPress={handleShuffle}
          activeOpacity={0.7}
        >
          <Shuffle size={18} color="#FFFFFF" />
          <Text style={styles.shuffleBtnText}>Shuffle Suggestions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - 24 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    position: 'relative' as const,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
    color: '#FFFFFF',
  },
  profilesGrid: {
    flex: 1,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: CARD_GAP,
  },
  profileCard: {
    width: CARD_WIDTH,
    height: 245,
    borderRadius: 12,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  profileCardRight: {},
  profileCardBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  profileCardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  profileCardContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 16,
    gap: 16,
  },
  avatarContainer: {
    alignItems: 'center' as const,
  },
  avatarBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 5,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  profileInfo: {
    alignItems: 'center' as const,
    gap: 10,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 2,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    textTransform: 'capitalize' as const,
    maxWidth: CARD_WIDTH - 60,
  },
  username: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
  },
  viewsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  followBtn: {
    paddingHorizontal: 10,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minWidth: 104,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#121212',
  },
  followingBtnText: {
    color: '#FFFFFF',
  },
  shuffleBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 100,
    gap: 8,
  },
  shuffleBtnText: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
});
