import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { ChevronLeft, Search, MoreHorizontal, Check, CheckCheck } from 'lucide-react-native';

interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isVerified: boolean;
  isRead: boolean;
  isGroup?: boolean;
  groupMembers?: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Emma Creates',
    username: 'emma_creates',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Hey! Did you see my new video?',
    timestamp: '2m',
    unreadCount: 3,
    isOnline: true,
    isVerified: true,
    isRead: false,
  },
  {
    id: '2',
    name: 'Alex Vibes',
    username: 'alex_vibes',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastMessage: 'The collab was amazing! 🔥',
    timestamp: '15m',
    unreadCount: 0,
    isOnline: true,
    isVerified: false,
    isRead: true,
  },
  {
    id: '3',
    name: 'Content Creators Hub',
    username: '',
    avatar: 'https://i.pravatar.cc/150?img=20',
    lastMessage: 'Sarah: Who\'s joining the live tonight?',
    timestamp: '1h',
    unreadCount: 12,
    isOnline: false,
    isVerified: false,
    isRead: false,
    isGroup: true,
    groupMembers: 24,
  },
  {
    id: '4',
    name: 'Marcus Chen',
    username: 'marcus.chen',
    avatar: 'https://i.pravatar.cc/150?img=33',
    lastMessage: 'Thanks for the follow back!',
    timestamp: '3h',
    unreadCount: 0,
    isOnline: false,
    isVerified: true,
    isRead: true,
  },
  {
    id: '5',
    name: 'Sophie Taylor',
    username: 'sophiet',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Sent a voice message',
    timestamp: '5h',
    unreadCount: 1,
    isOnline: true,
    isVerified: false,
    isRead: false,
  },
  {
    id: '6',
    name: 'Jake Wilson',
    username: 'jake_w',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Let me know when you\'re free',
    timestamp: '1d',
    unreadCount: 0,
    isOnline: false,
    isVerified: false,
    isRead: true,
  },
  {
    id: '7',
    name: 'Mia Rodriguez',
    username: 'mia.rod',
    avatar: 'https://i.pravatar.cc/150?img=9',
    lastMessage: 'That trend is so viral right now 😂',
    timestamp: '1d',
    unreadCount: 0,
    isOnline: false,
    isVerified: true,
    isRead: true,
  },
  {
    id: '8',
    name: 'Dance Squad',
    username: '',
    avatar: 'https://i.pravatar.cc/150?img=15',
    lastMessage: 'Mike: Practice at 6pm?',
    timestamp: '2d',
    unreadCount: 0,
    isOnline: false,
    isVerified: false,
    isRead: true,
    isGroup: true,
    groupMembers: 8,
  },
];

export default function InboxScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary');

  const filteredConversations = MOCK_CONVERSATIONS.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/conversation/${item.id}` as Href)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Check size={8} color="#007BFF" strokeWidth={3} />
              </View>
            )}
            {item.isGroup && (
              <Text style={styles.groupBadge}>{item.groupMembers}</Text>
            )}
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <View style={styles.messageRow}>
          <View style={styles.messageContent}>
            {item.isRead && !item.isGroup && (
              <CheckCheck size={14} color="rgba(255, 255, 255, 0.32)" style={styles.readIcon} />
            )}
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          </View>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="rgba(255, 255, 255, 0.48)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'primary' && styles.activeTab]}
          onPress={() => setActiveTab('primary')}
        >
          <Text style={[styles.tabText, activeTab === 'primary' && styles.activeTabText]}>
            Primary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
          <View style={styles.requestsBadge}>
            <Text style={styles.requestsCount}>5</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a conversation with your followers
            </Text>
          </View>
        }
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
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.64)',
  },
  activeTabText: {
    color: '#121212',
  },
  requestsBadge: {
    backgroundColor: '#EE1045',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  requestsCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00D26A',
    borderWidth: 2,
    borderColor: '#121212',
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.48)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  readIcon: {
    marginRight: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
    flex: 1,
  },
  unreadMessage: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center',
  },
});
