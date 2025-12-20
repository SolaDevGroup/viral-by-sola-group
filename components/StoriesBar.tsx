import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { Plus, Timer } from 'lucide-react-native';
import { Story } from '@/types';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

interface StoriesBarProps {
  stories: Story[];
  onStoryPress: (story: Story) => void;
  onAddStory: () => void;
}

const isExpiringSoon = (expiresAt: string): boolean => {
  const expiresTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const oneHourInMs = 60 * 60 * 1000;
  return expiresTime - now <= oneHourInMs && expiresTime > now;
};

export default function StoriesBar({ stories, onStoryPress, onAddStory }: StoriesBarProps) {
  const { accentColor } = useApp();
  const lightAccentColor = lightenColor(accentColor, 60);
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity style={styles.addStory} onPress={onAddStory}>
        <View style={[styles.addStoryCircle, { backgroundColor: accentColor }]}>
          <Plus color={lightAccentColor} size={32} strokeWidth={2.5} />
        </View>
        <Text style={styles.storyUsername}>Add</Text>
      </TouchableOpacity>

      {stories.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={styles.story}
          onPress={() => onStoryPress(story)}
        >
          <View style={styles.storyWrapper}>
            <View
              style={[
                styles.storyBorder,
                {
                  borderColor: story.dominantColor || Colors.primary,
                  opacity: story.isViewed ? 0.5 : 1,
                  borderStyle: story.isLive ? 'dashed' : 'solid',
                }
              ]}
            >
              <View style={styles.storyImageContainer}>
                {story.user.avatar ? (
                  <Image
                    source={{ uri: story.user.avatar }}
                    style={styles.storyImage}
                  />
                ) : (
                  <View style={[styles.storyImage, styles.storyImagePlaceholder]} />
                )}
              </View>
            </View>
            {story.postCount && story.postCount > 0 && (
              <View 
                style={[
                  styles.postCountBadge,
                  { backgroundColor: story.dominantColor || Colors.primary }
                ]}
              >
                <Text style={styles.postCountText}>{story.postCount}</Text>
              </View>
            )}
            {story.isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            {!story.isLive && isExpiringSoon(story.expiresAt) && (
              <View 
                style={[
                  styles.expiringBadge,
                  { backgroundColor: story.dominantColor || Colors.primary }
                ]}
              >
                <Timer color={Colors.white} size={14} strokeWidth={2.5} />
              </View>
            )}
          </View>
          <Text style={styles.storyUsername} numberOfLines={1}>
            {story.user.username}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  addStory: {
    alignItems: 'center',
    gap: 6,
  },
  addStoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  story: {
    alignItems: 'center',
    gap: 6,
  },
  storyWrapper: {
    position: 'relative',
  },
  storyBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  storyImageContainer: {
    position: 'relative',
  },
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  storyImagePlaceholder: {
    backgroundColor: '#333',
  },
  postCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 10,
  },
  postCountText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  liveBadge: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: [{ translateX: -20 }],
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  expiringBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 10,
  },
  storyUsername: {
    fontSize: 12,
    color: Colors.text,
    maxWidth: 70,
  },
});
