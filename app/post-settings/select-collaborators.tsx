import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ChevronLeft, Search, X, Check, UserPlus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers?: string;
};

const SUGGESTED_USERS: User[] = [
  { id: '1', name: 'David Beckham', username: '@davidbeckham', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', verified: true, followers: '85.2M' },
  { id: '2', name: 'Jude Bellingham', username: '@judebellingham', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop', verified: true, followers: '32.1M' },
  { id: '3', name: 'Cristiano Ronaldo', username: '@cristiano', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', verified: true, followers: '620M' },
  { id: '4', name: 'Lionel Messi', username: '@leomessi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', verified: true, followers: '498M' },
  { id: '5', name: 'Kylian Mbappé', username: '@k.mbappe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', verified: true, followers: '112M' },
];

const RECENT_COLLABORATORS: User[] = [
  { id: '6', name: 'Emma Watson', username: '@emmawatson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', verified: true, followers: '72.5M' },
  { id: '7', name: 'Tom Holland', username: '@tomholland', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop', verified: true, followers: '68.3M' },
];

export default function SelectCollaboratorsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currentCollaborators?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    params.currentCollaborators ? JSON.parse(params.currentCollaborators) : []
  );

  const allUsers = [...SUGGESTED_USERS, ...RECENT_COLLABORATORS];
  const filteredUsers = searchQuery
    ? allUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleToggleUser = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleDone = () => {
    router.back();
    router.setParams({ selectedCollaborators: JSON.stringify(selectedUsers) });
  };

  const renderUserItem = (user: User) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    return (
      <TouchableOpacity
        key={user.id}
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => handleToggleUser(user)}
      >
        <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <Check size={8} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </View>
          <Text style={styles.userUsername}>{user.username}</Text>
        </View>
        {isSelected ? (
          <View style={styles.selectedCheck}>
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          </View>
        ) : (
          <View style={styles.addButton}>
            <UserPlus size={16} color="#007BFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="rgba(255, 255, 255, 0.64)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Collaborators</Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedRow}>
              {selectedUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.selectedChip}
                  onPress={() => handleToggleUser(user)}
                >
                  <Image source={{ uri: user.avatar }} style={styles.selectedAvatar} />
                  <Text style={styles.selectedName}>{user.name.split(' ')[0]}</Text>
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="rgba(255, 255, 255, 0.48)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="rgba(255, 255, 255, 0.48)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            {RECENT_COLLABORATORS.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>RECENT COLLABORATORS</Text>
                {RECENT_COLLABORATORS.map(renderUserItem)}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUGGESTED</Text>
              {SUGGESTED_USERS.map(renderUserItem)}
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(renderUserItem)
            ) : (
              <Text style={styles.noResultsText}>No users found</Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
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
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007BFF',
    borderRadius: 20,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  selectedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    borderRadius: 20,
    paddingRight: 12,
    paddingVertical: 4,
    paddingLeft: 4,
    gap: 8,
  },
  selectedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  userItemSelected: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userUsername: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center',
    marginTop: 20,
  },
});
