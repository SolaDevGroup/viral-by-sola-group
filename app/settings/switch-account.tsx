import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import { X, Check, LogIn, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

interface AccountItemProps {
  name: string;
  username: string;
  avatar: string;
  isActive?: boolean;
  onPress?: () => void;
}

const AccountItem = ({ name, username, avatar, isActive, onPress }: AccountItemProps) => (
  <TouchableOpacity 
    style={[styles.accountItem, isActive && styles.accountItemActive]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image source={{ uri: avatar }} style={styles.accountAvatar} />
    <View style={styles.accountInfo}>
      <Text style={styles.accountName}>{name}</Text>
      <Text style={styles.accountUsername}>@{username}</Text>
    </View>
    {isActive ? (
      <View style={styles.checkCircle}>
        <Check size={14} color="#fff" strokeWidth={3} />
      </View>
    ) : (
      <LogIn size={20} color="#EE1045" strokeWidth={1.5} />
    )}
  </TouchableOpacity>
);

export default function SwitchAccountScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Switch Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Current Account</Text>
        <View style={styles.sectionCard}>
          <AccountItem
            name="Your Name"
            username={user?.username || 'your.username'}
            avatar={user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=400&fit=crop'}
            isActive={true}
          />
        </View>

        <Text style={styles.sectionTitle}>Other Accounts</Text>
        <View style={styles.sectionCard}>
          <AccountItem
            name="Business Account"
            username="business.account"
            avatar="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop"
            onPress={() => console.log('Switch to business account')}
          />
        </View>

        <View style={styles.addAccountCard}>
          <TouchableOpacity style={styles.addAccountItem} activeOpacity={0.7}>
            <View style={styles.addIconWrap}>
              <Plus size={20} color="#014D3A" strokeWidth={2} />
            </View>
            <View style={styles.addAccountInfo}>
              <Text style={styles.addAccountTitle}>Add Account</Text>
              <Text style={styles.addAccountSubtitle}>Log in to another account</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
          You can add up to 5 accounts and switch between them without logging out
        </Text>
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
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  accountItemActive: {
    backgroundColor: 'rgba(1,77,58,0.04)',
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  accountUsername: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#014D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAccountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  addAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  addIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(1,77,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAccountInfo: {
    flex: 1,
  },
  addAccountTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  addAccountSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
  helperText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#014D3A',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
