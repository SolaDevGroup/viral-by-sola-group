import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import { Stack, router } from "expo-router";
import { X, Lock, MessageCircle, Users, Download, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PrivacyItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  rightElement?: React.ReactNode;
}

const PrivacyItem = ({ icon, title, subtitle, value, onValueChange, rightElement }: PrivacyItemProps) => (
  <View style={styles.privacyItem}>
    <View style={styles.privacyItemIcon}>{icon}</View>
    <View style={styles.privacyItemContent}>
      <Text style={styles.privacyItemTitle}>{title}</Text>
      <Text style={styles.privacyItemSubtitle}>{subtitle}</Text>
    </View>
    {rightElement || (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#014D3A' }}
        thumbColor="#fff"
      />
    )}
  </View>
);

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuets, setAllowDuets] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <PrivacyItem
            icon={<Lock size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Private Account"
            subtitle="Only approved followers can see your content"
            value={privateAccount}
            onValueChange={setPrivateAccount}
          />
          <PrivacyItem
            icon={<MessageCircle size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Allow Comments"
            subtitle="Let others comment on your videos"
            value={allowComments}
            onValueChange={setAllowComments}
          />
          <PrivacyItem
            icon={<Users size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Allow Duets"
            subtitle="Let others create duets with your videos"
            value={allowDuets}
            onValueChange={setAllowDuets}
          />
          <PrivacyItem
            icon={<Download size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />}
            title="Allow Downloads"
            subtitle="Let others download your videos"
            value={allowDownloads}
            onValueChange={setAllowDownloads}
          />
        </View>

        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.blockedItem} activeOpacity={0.7}>
            <View style={styles.blockedItemLeft}>
              <View style={styles.blockedItemIcon}>
                <EyeOff size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />
              </View>
              <View>
                <Text style={styles.blockedItemTitle}>Blocked Accounts</Text>
                <Text style={styles.blockedItemSubtitle}>0 accounts blocked</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.manageButton}>Manage</Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18,18,18,0.04)',
  },
  privacyItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyItemContent: {
    flex: 1,
  },
  privacyItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  privacyItemSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
  blockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  blockedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blockedItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  blockedItemSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
  manageButton: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#014D3A',
  },
});
