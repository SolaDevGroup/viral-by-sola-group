import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Switch } from "react-native";
import React from "react";
import { Stack, router } from "expo-router";
import { 
  X, 
  User, 
  Users, 
  Lock, 
  Shield, 
  Bell, 
  Eye, 
  Palette, 
  Moon, 
  Users2, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Crown
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const SettingsItem = ({ icon, label, onPress, showArrow = true, rightElement }: SettingsItemProps) => (
  <TouchableOpacity 
    style={styles.settingsItem} 
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress && !rightElement}
  >
    <View style={styles.settingsItemLeft}>
      <View style={styles.settingsItemIcon}>{icon}</View>
      <Text style={styles.settingsItemLabel}>{label}</Text>
    </View>
    {rightElement || (showArrow && <ChevronRight size={20} color="rgba(255, 255, 255, 0.48)" strokeWidth={2} />)}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isDarkMode, toggleDarkMode, accentColor } = useApp();

  const handleLogout = () => {
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.userPreview}>
          <Text style={styles.usernameHeader}>@{user?.username || 'your.username'}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <X size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=400&fit=crop' }}
            style={[styles.avatar, { borderColor: accentColor }]}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.titleRow}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            icon={<Crown size={20} color="#FFD700" strokeWidth={1.5} />}
            label="Pro Subscription"
            onPress={() => router.push('/settings/pro-subscription')}
          />
          <SettingsItem
            icon={<User size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Account Info"
            onPress={() => router.push('/settings/account-info')}
          />
          <SettingsItem
            icon={<Users size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Switch Account"
            onPress={() => router.push('/settings/switch-account')}
          />
          <SettingsItem
            icon={<Lock size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Privacy"
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsItem
            icon={<Shield size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Security"
            onPress={() => router.push('/settings/security')}
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            icon={<Bell size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Notifications"
            onPress={() => router.push('/settings/notifications-settings')}
          />
          <SettingsItem
            icon={<Eye size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="View Settings"
            onPress={() => router.push('/settings/view-settings' as any)}
          />
          <SettingsItem
            icon={<Palette size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Appearance"
            onPress={() => {}}
          />
          <SettingsItem
            icon={<Moon size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Dark Mode"
            showArrow={false}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: 'rgba(255,255,255,0.16)', true: accentColor }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Family</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            icon={<Users2 size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Parental Controls"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingsItem
            icon={<HelpCircle size={20} color="rgba(255,255,255,0.64)" strokeWidth={1.5} />}
            label="Help Center"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EE1045" strokeWidth={2} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerVersion}>ViewSnap v1.0.0</Text>
          <Text style={styles.footerTagline}>Views are everything 👁️</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: '#121212',
  },
  userPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usernameHeader: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.64)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.48)',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemIcon: {
    width: 24,
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(238,16,69,0.08)',
    paddingVertical: 16,
    borderRadius: 100,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EE1045',
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 20,
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.48)',
  },
  footerTagline: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.48)',
  },
});
