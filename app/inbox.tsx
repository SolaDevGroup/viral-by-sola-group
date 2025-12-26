import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { 
  ChevronLeft, 
  ChevronDown,
  ChevronRight,
  MoreHorizontal, 
  Camera,
  Heart,
  Play,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Plus,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ConversationType = 'shot' | 'video' | 'message' | 'chat' | 'ad' | 'reply';

interface Conversation {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: ConversationType;
  statusText: string;
  timestamp: string;
  unreadCount: number;
  hasStory: boolean;
  isVerified: boolean;
  isAd?: boolean;
}

interface QuickAddUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  hasNewVideo: boolean;
  timestamp: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Dani',
    username: 'dani_creates',
    avatar: 'https://i.pravatar.cc/150?img=1',
    type: 'shot',
    statusText: 'New Shot and chat',
    timestamp: '45s',
    unreadCount: 12,
    hasStory: false,
    isVerified: false,
  },
  {
    id: '2',
    name: 'Rachel',
    username: 'rachel_v',
    avatar: 'https://i.pravatar.cc/150?img=5',
    type: 'video',
    statusText: 'New Video',
    timestamp: '1h',
    unreadCount: 12,
    hasStory: true,
    isVerified: false,
  },
  {
    id: '3',
    name: 'Alex',
    username: 'alex_vibes',
    avatar: 'https://i.pravatar.cc/150?img=12',
    type: 'message',
    statusText: 'New Message',
    timestamp: '1d',
    unreadCount: 12,
    hasStory: false,
    isVerified: false,
  },
  {
    id: '4',
    name: 'Dani',
    username: 'dani_art',
    avatar: 'https://i.pravatar.cc/150?img=9',
    type: 'chat',
    statusText: 'Tap to chat',
    timestamp: '',
    unreadCount: 12,
    hasStory: false,
    isVerified: false,
  },
  {
    id: '5',
    name: 'Coca Cola',
    username: 'cocacola',
    avatar: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=150',
    type: 'ad',
    statusText: 'Tap to see the exclusive Ad',
    timestamp: '',
    unreadCount: 12,
    hasStory: false,
    isVerified: true,
    isAd: true,
  },
  {
    id: '6',
    name: 'Rachel',
    username: 'rachel_style',
    avatar: 'https://i.pravatar.cc/150?img=20',
    type: 'reply',
    statusText: 'Tap to reply',
    timestamp: '',
    unreadCount: 12,
    hasStory: false,
    isVerified: false,
  },
  {
    id: '7',
    name: 'Alex',
    username: 'alex_m',
    avatar: 'https://i.pravatar.cc/150?img=33',
    type: 'chat',
    statusText: 'Tap to chat',
    timestamp: '',
    unreadCount: 12,
    hasStory: false,
    isVerified: false,
  },
];

const QUICK_ADD_USERS: QuickAddUser[] = [
  {
    id: 'q1',
    name: 'Display Name',
    username: 'username',
    avatar: 'https://i.pravatar.cc/150?img=25',
    hasNewVideo: false,
    timestamp: '45s',
  },
  {
    id: 'q2',
    name: 'Rachel',
    username: 'rachel_new',
    avatar: 'https://i.pravatar.cc/150?img=26',
    hasNewVideo: true,
    timestamp: '1h',
  },
  {
    id: 'q3',
    name: 'Alex',
    username: 'alex_new',
    avatar: 'https://i.pravatar.cc/150?img=27',
    hasNewVideo: false,
    timestamp: '1d',
  },
  {
    id: 'q4',
    name: 'Dani',
    username: 'dani_new',
    avatar: 'https://i.pravatar.cc/150?img=28',
    hasNewVideo: false,
    timestamp: '',
  },
  {
    id: 'q5',
    name: 'Rachel',
    username: 'rachel_2',
    avatar: 'https://i.pravatar.cc/150?img=29',
    hasNewVideo: false,
    timestamp: '',
  },
  {
    id: 'q6',
    name: 'Alex',
    username: 'alex_2',
    avatar: 'https://i.pravatar.cc/150?img=30',
    hasNewVideo: false,
    timestamp: '',
  },
];

const getTypeColor = (type: ConversationType): string => {
  switch (type) {
    case 'shot':
      return '#EE1045';
    case 'video':
      return '#8E1DFE';
    case 'message':
      return '#007BFF';
    case 'ad':
      return '#EE1045';
    default:
      return 'rgba(18, 18, 18, 0.48)';
  }
};

const getTypeIcon = (type: ConversationType) => {
  const color = getTypeColor(type);
  switch (type) {
    case 'shot':
      return <Heart size={18} color={color} fill={color} />;
    case 'video':
      return <Play size={18} color={color} fill={color} />;
    case 'message':
      return <MessageSquare size={18} color={color} fill={color} />;
    case 'ad':
      return <Heart size={18} color={color} fill={color} />;
    default:
      return <Heart size={18} color={color} />;
  }
};

export default function InboxScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'requests'>('all');

  const currentUser = {
    avatar: 'https://i.pravatar.cc/150?img=50',
    username: 'username',
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/conversation/${item.id}` as Href)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarContainer, item.hasStory && styles.avatarWithStory]}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      </View>

      <View style={styles.conversationContent}>
        <Text style={styles.conversationName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.statusRow}>
          {getTypeIcon(item.type)}
          <Text style={[styles.statusText, { color: getTypeColor(item.type) }]}>
            {item.statusText}
          </Text>
          {item.timestamp ? (
            <>
              <View style={styles.dotSeparator} />
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.conversationActions}>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={24} color="rgba(18, 18, 18, 0.64)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAddUser = ({ item }: { item: QuickAddUser }) => (
    <TouchableOpacity
      style={styles.quickAddItem}
      onPress={() => router.push(`/conversation/${item.id}` as Href)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickAddAvatarContainer, item.hasNewVideo && styles.avatarWithStory]}>
        <Image source={{ uri: item.avatar }} style={styles.quickAddAvatar} />
      </View>

      <View style={styles.quickAddContent}>
        <Text style={styles.quickAddName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.quickAddInfo}>
          <Text style={styles.quickAddUsername}>{item.username}</Text>
          {item.timestamp ? (
            <>
              <View style={styles.dotSeparator} />
              <Text style={styles.quickAddTimestamp}>{item.timestamp}</Text>
            </>
          ) : null}
        </View>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Plus size={16} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dismissButton}>
        <X size={24} color="rgba(18, 18, 18, 0.64)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ListHeaderComponent = () => (
    <>
      <View style={styles.actionCardsRow}>
        <TouchableOpacity style={styles.actionCard}>
          <Camera size={24} color="rgba(18, 18, 18, 0.64)" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardLabel}>Post a</Text>
            <Text style={styles.actionCardTitle}>Moment</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <MessageCircle size={24} color="rgba(18, 18, 18, 0.64)" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardLabel}>Create a</Text>
            <Text style={styles.actionCardTitle}>Chat</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.insightsRow}
        onPress={() => router.push('/chat-insights' as Href)}
      >
        <BarChart3 size={24} color="rgba(255, 255, 255, 0.64)" />
        <View style={styles.insightsText}>
          <Text style={styles.insightsLabel}>Show</Text>
          <Text style={styles.insightsTitle}>Insights</Text>
        </View>
        <ChevronRight size={24} color="rgba(255, 255, 255, 0.64)" />
      </TouchableOpacity>
    </>
  );

  const ListFooterComponent = () => (
    <>
      <View style={styles.quickAddHeader}>
        <Text style={styles.quickAddHeaderText}>Quick Add</Text>
      </View>
      {QUICK_ADD_USERS.map((user) => (
        <View key={user.id}>
          {renderQuickAddUser({ item: user })}
        </View>
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(18, 18, 18, 0.64)', 'rgba(18, 18, 18, 0.64)']}
        style={styles.headerGradient}
      >
        <View style={styles.headerBackground}>
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.userSelector}>
                <Image source={{ uri: currentUser.avatar }} style={styles.headerAvatar} />
                <Text style={styles.headerUsername}>{currentUser.username}</Text>
                <ChevronDown size={20} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.headerButton}>
                <MoreHorizontal size={20} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterTabs}>
              <TouchableOpacity
                style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, activeFilter === 'unread' && styles.filterTabActive]}
                onPress={() => setActiveFilter('unread')}
              >
                <Text style={[styles.filterTabText, activeFilter === 'unread' && styles.filterTabTextActive]}>
                  Unread
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, activeFilter === 'requests' && styles.filterTabActive]}
                onPress={() => setActiveFilter('requests')}
              >
                <Text style={[styles.filterTabText, activeFilter === 'requests' && styles.filterTabTextActive]}>
                  Requests
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </LinearGradient>

      <View style={styles.contentCard}>
        <FlatList
          data={MOCK_CONVERSATIONS}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerBackground: {
    backgroundColor: '#014D3A',
  },
  safeHeader: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.005,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.005,
    textTransform: 'capitalize',
  },
  filterTabTextActive: {
    color: '#121212',
  },
  contentCard: {
    flex: 1,
    marginTop: 156,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  actionCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
  },
  actionCardText: {
    gap: 4,
  },
  actionCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.02,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121212',
    letterSpacing: -0.02,
  },
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#014D3A',
    gap: 10,
  },
  insightsText: {
    flex: 1,
    gap: 4,
  },
  insightsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    letterSpacing: -0.02,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.02,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 4,
  },
  avatarWithStory: {
    borderWidth: 2,
    borderColor: 'rgba(18, 18, 18, 0.64)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  conversationContent: {
    flex: 1,
    gap: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(18, 18, 18, 0.16)',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.02,
  },
  conversationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EE1045',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cameraButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddHeader: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  quickAddHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  quickAddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  quickAddAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 4,
  },
  quickAddAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  quickAddContent: {
    flex: 1,
    gap: 4,
  },
  quickAddName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#121212',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  quickAddInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickAddUsername: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.02,
  },
  quickAddTimestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.02,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    gap: 2,
    backgroundColor: '#014D3A',
    borderRadius: 100,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  dismissButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
