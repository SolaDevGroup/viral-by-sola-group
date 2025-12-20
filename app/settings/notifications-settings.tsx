import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import { Stack, router } from "expo-router";
import { X, Bell, Heart, MessageCircle, UserPlus, TrendingUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const NotificationItem = ({ icon, title, subtitle, value, onValueChange }: NotificationItemProps) => (
  <View style={styles.notificationItem}>
    <View style={styles.notificationItemIcon}>{icon}</View>
    <View style={styles.notificationItemContent}>
      <Text style={styles.notificationItemTitle}>{title}</Text>
      <Text style={styles.notificationItemSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E0E0E0', true: '#014D3A' }}
      thumbColor="#fff"
    />
  </View>
);

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [viewMilestones, setViewMilestones] = useState(true);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <NotificationItem
            icon={<Bell size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
        </View>

        <Text style={styles.sectionTitle}>Notification Types</Text>
        <View style={styles.sectionCard}>
          <NotificationItem
            icon={<Heart size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Likes"
            subtitle="When someone likes your video"
            value={likes}
            onValueChange={setLikes}
          />
          <NotificationItem
            icon={<MessageCircle size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Comments"
            subtitle="When someone comments on your video"
            value={comments}
            onValueChange={setComments}
          />
          <NotificationItem
            icon={<UserPlus size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="New Followers"
            subtitle="When someone follows you"
            value={newFollowers}
            onValueChange={setNewFollowers}
          />
          <NotificationItem
            icon={<TrendingUp size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="View Milestones"
            subtitle="When your video reaches view milestones"
            value={viewMilestones}
            onValueChange={setViewMilestones}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#121212',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(18,18,18,0.48)',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18,18,18,0.04)',
  },
  notificationItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationItemContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  notificationItemSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
});
