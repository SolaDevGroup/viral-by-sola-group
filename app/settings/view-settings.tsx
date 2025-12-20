import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import { Stack, router } from "expo-router";
import { X, Eye, TrendingUp, Target } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ViewSettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const ViewSettingItem = ({ icon, title, subtitle, value, onValueChange }: ViewSettingItemProps) => (
  <View style={styles.settingItem}>
    <View style={styles.settingItemIcon}>{icon}</View>
    <View style={styles.settingItemContent}>
      <Text style={styles.settingItemTitle}>{title}</Text>
      <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E0E0E0', true: '#014D3A' }}
      thumbColor="#fff"
    />
  </View>
);

export default function ViewSettingsScreen() {
  const insets = useSafeAreaInsets();
  
  const [showViewCount, setShowViewCount] = useState(true);
  const [liveViewCounter, setLiveViewCounter] = useState(true);
  const [viewGoals, setViewGoals] = useState(true);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>View Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <ViewSettingItem
            icon={<Eye size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Show View Count"
            subtitle="Display view count on your videos"
            value={showViewCount}
            onValueChange={setShowViewCount}
          />
          <ViewSettingItem
            icon={<TrendingUp size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Live View Counter"
            subtitle="Show real-time view updates"
            value={liveViewCounter}
            onValueChange={setLiveViewCounter}
          />
          <ViewSettingItem
            icon={<Target size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="View Goals"
            subtitle="Set and track view milestones"
            value={viewGoals}
            onValueChange={setViewGoals}
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
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18,18,18,0.04)',
  },
  settingItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
});
