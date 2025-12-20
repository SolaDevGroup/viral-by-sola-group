import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { router, Href } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Share2, AtSign } from 'lucide-react-native';
import { MOCK_NOTIFICATIONS, MOCK_SHORTS } from '@/constants/mockData';
import type { Notification } from '@/types';

type TabType = 'all' | 'like' | 'comment' | 'share' | 'mention';

export default function NotificationsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('all');

  const filteredNotifications = useMemo(() => {
    if (selectedTab === 'all') return MOCK_NOTIFICATIONS;
    
    const typeMapping: Record<TabType, string[]> = {
      all: [],
      like: ['like'],
      comment: ['comment', 'reply'],
      share: ['share'],
      mention: ['mention'],
    };
    
    const types = typeMapping[selectedTab];
    return MOCK_NOTIFICATIONS.filter(notif => types.includes(notif.type));
  }, [selectedTab]);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  const getNotificationIcon = (type: string) => {
    const iconSize = 16;
    const iconColor = '#1A9D7C';

    switch (type) {
      case 'like':
        return <Heart size={iconSize} color="#EE1045" fill="#EE1045" />;
      case 'comment':
      case 'reply':
        return <MessageCircle size={iconSize} color={iconColor} />;
      case 'share':
        return <Share2 size={iconSize} color={iconColor} />;
      case 'mention':
        return <AtSign size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.shortId) {
      const shortIndex = MOCK_SHORTS.findIndex(
        (s) => s.id === notification.shortId
      );
      
      if (shortIndex !== -1) {
        router.push(`/video-feed?index=${shortIndex}` as Href);
      }
    }
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as Href);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={() => handleUserPress(item.user.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={() => handleUserPress(item.user.id)}>
            <Text style={styles.username}>
              {item.user.username}
              {item.user.isVerified && (
                <Text style={styles.verifiedBadge}> ✓</Text>
              )}
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionText}> {item.text}</Text>
          <Text style={styles.timestamp}> {formatTimeAgo(item.createdAt)}</Text>
        </View>

        {item.commentText && (
          <Text style={styles.commentPreview} numberOfLines={2}>
            {item.commentText}
          </Text>
        )}
      </View>

      {item.thumbnailUrl && (
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
          <View style={styles.iconBadge}>{getNotificationIcon(item.type)}</View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        {selectedTab === 'all'
          ? 'When people interact with your content, you\'ll see it here'
          : `No ${selectedTab} notifications`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'like' && styles.activeTab]}
          onPress={() => setSelectedTab('like')}
          activeOpacity={0.7}
        >
          <Heart
            size={16}
            color={selectedTab === 'like' ? '#FFFFFF' : '#666666'}
            fill={selectedTab === 'like' ? '#FFFFFF' : 'transparent'}
          />
          <Text style={[styles.tabText, selectedTab === 'like' && styles.activeTabText]}>
            Shorts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'comment' && styles.activeTab]}
          onPress={() => setSelectedTab('comment')}
          activeOpacity={0.7}
        >
          <MessageCircle
            size={16}
            color={selectedTab === 'comment' ? '#FFFFFF' : '#666666'}
          />
          <Text style={[styles.tabText, selectedTab === 'comment' && styles.activeTabText]}>
            Comments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'share' && styles.activeTab]}
          onPress={() => setSelectedTab('share')}
          activeOpacity={0.7}
        >
          <Share2
            size={16}
            color={selectedTab === 'share' ? '#FFFFFF' : '#666666'}
          />
          <Text style={[styles.tabText, selectedTab === 'share' && styles.activeTabText]}>
            Shares
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'mention' && styles.activeTab]}
          onPress={() => setSelectedTab('mention')}
          activeOpacity={0.7}
        >
          <AtSign
            size={16}
            color={selectedTab === 'mention' ? '#FFFFFF' : '#666666'}
          />
          <Text style={[styles.tabText, selectedTab === 'mention' && styles.activeTabText]}>
            Mentions
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  activeTab: {
    backgroundColor: '#1A9D7C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  unreadItem: {
    backgroundColor: 'rgba(26, 157, 124, 0.08)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333333',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#1A9D7C',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#CCCCCC',
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  commentPreview: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    marginTop: 4,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#333333',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#121212',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
