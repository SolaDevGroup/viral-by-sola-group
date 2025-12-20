import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import { Stack, router } from "expo-router";
import { X, Lock, Smartphone, FileText } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.securityItem} activeOpacity={0.7}>
            <View style={styles.securityItemIcon}>
              <Lock size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />
            </View>
            <View style={styles.securityItemContent}>
              <Text style={styles.securityItemTitle}>Change Password</Text>
              <Text style={styles.securityItemSubtitle}>Update your password</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.securityItem}>
            <View style={styles.securityItemIcon}>
              <Smartphone size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />
            </View>
            <View style={styles.securityItemContent}>
              <Text style={styles.securityItemTitle}>Two-Factor Authentication</Text>
              <Text style={styles.securityItemSubtitle}>Add extra security to your account</Text>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ false: '#E0E0E0', true: '#014D3A' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.loginActivityItem} activeOpacity={0.7}>
            <View style={styles.loginActivityLeft}>
              <View style={styles.securityItemIcon}>
                <FileText size={20} color="rgba(18,18,18,0.64)" strokeWidth={1.5} />
              </View>
              <View>
                <Text style={styles.securityItemTitle}>Login Activity</Text>
                <Text style={styles.securityItemSubtitle}>See where you&apos;re logged in</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewButton}>View</Text>
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
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18,18,18,0.04)',
  },
  securityItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityItemContent: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  securityItemSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
  loginActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  loginActivityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewButton: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#014D3A',
  },
});
