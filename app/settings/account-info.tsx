import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useState } from "react";
import { Stack, router } from "expo-router";
import { X, Mail, Phone, Calendar } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

export default function AccountInfoScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  
  const [email, setEmail] = useState('user@email.com');
  const [phone, setPhone] = useState('+1 234 567 8900');
  const [birthday, setBirthday] = useState('15.06.1995');

  const handleSave = () => {
    console.log('Saving account info...');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Info</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="rgba(18,18,18,0.48)" strokeWidth={1.5} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="rgba(18,18,18,0.32)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="rgba(18,18,18,0.48)" strokeWidth={1.5} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="rgba(18,18,18,0.32)"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Birthday</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="rgba(18,18,18,0.48)" strokeWidth={1.5} />
              <TextInput
                style={styles.input}
                value={birthday}
                onChangeText={setBirthday}
                placeholder="DD.MM.YYYY"
                placeholderTextColor="rgba(18,18,18,0.32)"
              />
              <TouchableOpacity>
                <Calendar size={20} color="rgba(18,18,18,0.48)" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.usernameCard}>
          <View style={styles.usernameRow}>
            <View style={styles.usernameInfo}>
              <View style={styles.usernameIconWrap}>
                <View style={styles.usernameIcon}>
                  <View style={styles.personHead} />
                  <View style={styles.personBody} />
                </View>
              </View>
              <View>
                <Text style={styles.usernameTitle}>Username</Text>
                <Text style={styles.usernameValue}>@{user?.username || 'your.username'}</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
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
  saveButton: {
    backgroundColor: '#014D3A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
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
    padding: 16,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(18,18,18,0.48)',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,18,18,0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#121212',
  },
  usernameCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usernameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  usernameIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18,18,18,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
  },
  personHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(18,18,18,0.64)',
    marginBottom: 2,
  },
  personBody: {
    width: 14,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(18,18,18,0.64)',
  },
  usernameTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 2,
  },
  usernameValue: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(18,18,18,0.48)',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#014D3A',
  },
});
