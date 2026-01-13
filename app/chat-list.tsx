import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExpoIcons from "@/components/ExpoIcons";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import { Images } from "@/assets/images";
import Blur from "@/components/Blur";
import { Href, router } from "expo-router";

type ChatTab = "all" | "unread" | "requests";

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  actionType: "shot" | "video" | "message" | "chat" | "ad" | "reply";
  actionText: string;
  timestamp: string;
  unreadCount: number;
}

const mockChats: ChatItem[] = [
  {
    id: "1",
    name: "Dani",
    avatar: "https://i.pravatar.cc/150?img=12",
    actionType: "shot",
    actionText: "New Shot and chat",
    timestamp: "45s",
    unreadCount: 12,
  },
  {
    id: "2",
    name: "Rachel",
    avatar: "https://i.pravatar.cc/150?img=13",
    actionType: "video",
    actionText: "New Video",
    timestamp: "1h",
    unreadCount: 12,
  },
  {
    id: "3",
    name: "Alex",
    avatar: "https://i.pravatar.cc/150?img=14",
    actionType: "message",
    actionText: "New Message",
    timestamp: "1d",
    unreadCount: 12,
  },
  {
    id: "4",
    name: "Dani",
    avatar: "https://i.pravatar.cc/150?img=16",
    actionType: "chat",
    actionText: "Tap to chat",
    timestamp: "2d",
    unreadCount: 12,
  },
  {
    id: "5",
    name: "Coca Cola",
    avatar: "https://i.pravatar.cc/150?img=17",
    actionType: "ad",
    actionText: "Tap to see the exclusive Ad",
    timestamp: "3d",
    unreadCount: 12,
  },
  {
    id: "6",
    name: "Rachel",
    avatar: "https://i.pravatar.cc/150?img=18",
    actionType: "reply",
    actionText: "Tap to reply",
    timestamp: "4d",
    unreadCount: 12,
  },
  {
    id: "7",
    name: "Coca Cola",
    avatar: "https://i.pravatar.cc/150?img=17",
    actionType: "ad",
    actionText: "Tap to see the exclusive Ad",
    timestamp: "3d",
    unreadCount: 12,
  },
  {
    id: "8",
    name: "Rachel",
    avatar: "https://i.pravatar.cc/150?img=18",
    actionType: "reply",
    actionText: "Tap to reply",
    timestamp: "4d",
    unreadCount: 12,
  },
];

const ChatList = () => {
  const insets = useSafeAreaInsets();
  const { accentColor } = useApp();
  const [activeTab, setActiveTab] = useState<ChatTab>("all");

  const getActionColor = (type: string) => {
    switch (type) {
      case "shot":
        return Colors.primary;
      case "video":
        return "#8B5CF6";
      case "message":
        return "#3B82F6";
      case "chat":
        return "#9CA3AF";
      case "ad":
        return "#9CA3AF";
      case "reply":
        return "#9CA3AF";
      default:
        return Colors.text;
    }
  };
  const getActionIcon = (type: string) => {
    switch (type) {
      case "shot":
      case "video":
        return "photo-camera";
      case "ad":
        return "photo-camera";
      default:
        return "chat-bubble";
    }
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        router.push("/conversation/695cb7b69d5d8c33f9364aad" as Href)
      }
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>

        <View style={styles.actionContainer}>
          <ExpoIcons
            family="MaterialIcons"
            name={getActionIcon(item.actionType)}
            size={14}
            color={getActionColor(item.actionType)}
          />
          <Text
            style={[
              styles.actionText,
              { color: getActionColor(item.actionType) },
            ]}
          >
            {item.actionText}
          </Text>
          <Text style={styles.timestamp}>• {item.timestamp}</Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
        <Image
          source={
            item.actionType === "shot" || item.actionType === "video"
              ? Images.camera
              : Images.message
          }
          style={styles.rightIcon}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <LinearGradient
        colors={[accentColor, "rgba(18,18,18,0.64)", "#fff"]}
        locations={[0, 1]}
        style={{ flex: 1, paddingTop: insets.top }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Blur blurAmount={16} borderRadius={24} />
            <Image source={Images.back} style={styles.headerIcon} />
          </TouchableOpacity>

          <View style={styles.userSection}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=1" }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>username</Text>
            <ExpoIcons
              family="Feather"
              name="chevron-down"
              size={18}
              color="rgba(255, 255, 255, 0.64)"
            />
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Blur blurAmount={16} borderRadius={24} />
            <Image source={Images.search} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {(["all", "unread", "requests"] as ChatTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity style={styles.actionCard}>
              <Image source={Images.camera} style={styles.cardIcon} />
              <View>
                <Text style={styles.cardTitle}>Post a</Text>
                <Text style={styles.cardSubtitle}>Moment</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Image source={Images.message} style={styles.cardIcon} />
              <View>
                <Text style={styles.cardTitle}>Create a</Text>
                <Text style={styles.cardSubtitle}>Chat</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* INSIGHTS */}
          <TouchableOpacity
            style={[styles.insightsContainer, { backgroundColor: accentColor }]}
          >
            <View style={styles.insightsContent}>
              <Image source={Images.bars} style={styles.insightsIcon} />
              <View>
                <Text style={styles.insightsLabel}>Show</Text>
                <Text style={styles.insightsTitle}>Insights</Text>
              </View>
            </View>
            <ExpoIcons
              family="Entypo"
              name="chevron-small-right"
              size={24}
              color="rgba(255,255,255,0.64)"
            />
          </TouchableOpacity>

          {/* CHAT LIST */}
          <FlatList
            data={mockChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  headerIcon: {
    width: 22,
    height: 22,
    tintColor: "#fff",
  },

  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginLeft: 12,
  },

  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  tabActive: {
    backgroundColor: "#fff",
  },

  tabText: {
    color: "#fff",
    fontWeight: "600",
  },

  tabTextActive: {
    color: Colors.background,
  },

  contentWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    flex: 1,
  },

  actionCardsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "rgba(18,18,18,0.04)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardIcon: {
    width: 20,
    height: 20,
    tintColor: "rgba(18,18,18,0.64)",
  },

  cardTitle: {
    fontSize: 12,
    color: "rgba(18,18,18,0.48)",
  },

  cardSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },

  insightsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  insightsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  insightsIcon: {
    width: 24,
    height: 24,
    tintColor: "rgba(255,255,255,0.64)",
  },

  insightsLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.64)",
  },

  insightsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 4,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  chatContent: { flex: 1 },

  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },

  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  actionText: {
    fontSize: 14,
  },

  timestamp: {
    fontSize: 12,
    color: "rgba(18,18,18,0.48)",
    marginLeft: 4,
  },

  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(238,16,69,1)",
    justifyContent: "center",
    alignItems: "center",
  },

  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  rightIcon: {
    width: 20,
    height: 20,
    tintColor: "rgba(18,18,18,0.64)",
  },

  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
});
