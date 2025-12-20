import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, SafeAreaView } from "react-native";
import { Search, Camera, MessageSquare, BarChart3, ChevronDown, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { useRouter, Href } from "expo-router";
import { MOCK_CHAT_CONVERSATIONS } from "@/constants/mockData";
import { ChatConversation, ChatMessageType } from "@/types";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

const PINK_ACCENT = '#E91E63';
const BLUE_ACCENT = '#2196F3';

export default function ChatScreen() {
  const router = useRouter();
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'requests'>('all');

  const renderMessageIcon = (type: ChatMessageType) => {
    if (type === 'shot' || type === 'ad' || type === 'video') {
      return (
        <View style={styles.iconWrapper}>
          <Camera size={14} color={PINK_ACCENT} strokeWidth={2.5} />
        </View>
      );
    } else {
      return (
        <View style={styles.iconWrapper}>
          <MessageSquare size={14} color={BLUE_ACCENT} strokeWidth={2.5} fill={BLUE_ACCENT} />
        </View>
      );
    }
  };

  const renderConversation = ({ item }: { item: ChatConversation }) => {
    const isMessage = item.lastMessage.type === 'message';
    const messageColor = isMessage ? BLUE_ACCENT : PINK_ACCENT;

    return (
      <TouchableOpacity 
        style={[styles.conversationItem, { backgroundColor: theme.surfaceElevated }]} 
        activeOpacity={0.7}
        onPress={() => router.push(`/conversation/${item.id}` as Href)}
      >
        <View style={styles.avatarContainer}>
          {item.hasStory && <View style={styles.storyRing} />}
          <Image source={{ uri: item.user.avatar }} style={[styles.avatar, { borderColor: theme.surfaceElevated }]} />
        </View>

        <View style={styles.conversationContent}>
          <Text style={[styles.userName, { color: theme.text }]}>{item.user.name}</Text>
          <View style={styles.messageRow}>
            {renderMessageIcon(item.lastMessage.type)}
            <Text style={[styles.messageText, { color: messageColor }]} numberOfLines={1}>
              {item.lastMessage.text}
            </Text>
            {item.lastMessage.timestamp && (
              <>
                <Text style={styles.messageDot}>·</Text>
                <Text style={styles.timestamp}>{item.lastMessage.timestamp}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.conversationRight}>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
          {isMessage ? (
            <MessageSquare size={24} color={theme.textSecondary} strokeWidth={1.5} />
          ) : (
            <Camera size={24} color={theme.textSecondary} strokeWidth={1.5} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity style={styles.headerCenter} activeOpacity={0.7}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=50' }} 
              style={styles.headerAvatar} 
            />
            <Text style={[styles.headerUsername, { color: theme.text }]}>username</Text>
            <ChevronDown size={18} color={theme.text} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: theme.background }]}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, { color: theme.textTertiary }, selectedTab === 'all' && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'unread' && styles.tabActive]}
            onPress={() => setSelectedTab('unread')}
          >
            <Text style={[styles.tabText, { color: theme.textTertiary }, selectedTab === 'unread' && styles.tabTextActive]}>
              Unread
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'requests' && styles.tabActive]}
            onPress={() => setSelectedTab('requests')}
          >
            <Text style={[styles.tabText, { color: theme.textTertiary }, selectedTab === 'requests' && styles.tabTextActive]}>
              Requests
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.content, { backgroundColor: theme.surfaceElevated }]}>
        <View style={[styles.actionsContainer, { backgroundColor: theme.surfaceElevated }]}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.cardBackground }]} activeOpacity={0.7}>
            <Camera size={28} color={theme.textSecondary} strokeWidth={2} />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionMainText, { color: theme.textTertiary }]}>Post a</Text>
              <Text style={[styles.actionSubText, { color: theme.text }]}>Moment</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.cardBackground }]} activeOpacity={0.7}>
            <MessageSquare size={28} color={theme.textSecondary} strokeWidth={2} />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionMainText, { color: theme.textTertiary }]}>Create a</Text>
              <Text style={[styles.actionSubText, { color: theme.text }]}>Chat</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.insightsButton, { backgroundColor: accentColor }]} activeOpacity={0.8} onPress={() => router.push('/chat-insights' as Href)}>
          <BarChart3 size={24} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
          <View style={styles.insightsTextContainer}>
            <Text style={styles.insightsLabel}>Show</Text>
            <Text style={styles.insightsValue}>Insights</Text>
          </View>
          <ChevronRight size={20} color="rgba(255,255,255,0.8)" strokeWidth={2} />
        </TouchableOpacity>

        <FlatList
          data={MOCK_CHAT_CONVERSATIONS}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { backgroundColor: theme.surfaceElevated }]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeArea: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#121212',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: '#121212',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.48)',
  },
  tabTextActive: {
    color: '#121212',
  },
  content: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden' as const,
  },
  actionsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#1E1E1E',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionMainText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.48)',
    fontWeight: '400' as const,
  },
  actionSubText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginTop: 1,
  },
  insightsButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.64)',
    fontWeight: '400' as const,
  },
  insightsValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginTop: 1,
  },
  listContent: {
    backgroundColor: '#1E1E1E',
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#1E1E1E',
  },
  avatarContainer: {
    position: 'relative' as const,
  },
  storyRing: {
    position: 'absolute' as const,
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  conversationContent: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  messageRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  iconWrapper: {
    width: 16,
    height: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '500' as const,
    maxWidth: '55%',
  },
  messageDot: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.48)',
    marginHorizontal: 2,
  },
  timestamp: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.48)',
    fontWeight: '400' as const,
  },
  conversationRight: {
    alignItems: 'flex-end' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: PINK_ACCENT,
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 7,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
});
