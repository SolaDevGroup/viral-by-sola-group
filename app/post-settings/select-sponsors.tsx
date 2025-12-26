import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ChevronLeft, Search, X, Check, Building2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Sponsor = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  category?: string;
};

const SUGGESTED_SPONSORS: Sponsor[] = [
  { id: '1', name: 'Adidas', username: '@adidas', avatar: 'https://images.unsplash.com/photo-1518911710364-17ec553bde5d?w=100&h=100&fit=crop', verified: true, category: 'Sports & Apparel' },
  { id: '2', name: 'Nike', username: '@nike', avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', verified: true, category: 'Sports & Apparel' },
  { id: '3', name: 'Coca-Cola', username: '@cocacola', avatar: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=100&h=100&fit=crop', verified: true, category: 'Beverages' },
  { id: '4', name: 'Apple', username: '@apple', avatar: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop', verified: true, category: 'Technology' },
  { id: '5', name: 'Samsung', username: '@samsung', avatar: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&h=100&fit=crop', verified: true, category: 'Technology' },
];

const RECENT_SPONSORS: Sponsor[] = [
  { id: '6', name: 'Red Bull', username: '@redbull', avatar: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=100&h=100&fit=crop', verified: true, category: 'Energy Drinks' },
  { id: '7', name: 'Pepsi', username: '@pepsi', avatar: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=100&h=100&fit=crop', verified: true, category: 'Beverages' },
];

export default function SelectSponsorsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currentSponsors?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSponsors, setSelectedSponsors] = useState<Sponsor[]>(
    params.currentSponsors ? JSON.parse(params.currentSponsors) : []
  );

  const allSponsors = [...SUGGESTED_SPONSORS, ...RECENT_SPONSORS];
  const filteredSponsors = searchQuery
    ? allSponsors.filter(sponsor =>
        sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sponsor.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleToggleSponsor = (sponsor: Sponsor) => {
    setSelectedSponsors(prev => {
      const isSelected = prev.some(s => s.id === sponsor.id);
      if (isSelected) {
        return prev.filter(s => s.id !== sponsor.id);
      }
      return [...prev, sponsor];
    });
  };

  const handleDone = () => {
    router.back();
    router.setParams({ selectedSponsors: JSON.stringify(selectedSponsors) });
  };

  const renderSponsorItem = (sponsor: Sponsor) => {
    const isSelected = selectedSponsors.some(s => s.id === sponsor.id);
    return (
      <TouchableOpacity
        key={sponsor.id}
        style={[styles.sponsorItem, isSelected && styles.sponsorItemSelected]}
        onPress={() => handleToggleSponsor(sponsor)}
      >
        <Image source={{ uri: sponsor.avatar }} style={styles.sponsorAvatar} />
        <View style={styles.sponsorInfo}>
          <View style={styles.sponsorNameRow}>
            <Text style={styles.sponsorName}>{sponsor.name}</Text>
            {sponsor.verified && (
              <View style={styles.verifiedBadge}>
                <Check size={8} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </View>
          <Text style={styles.sponsorCategory}>{sponsor.category}</Text>
        </View>
        {isSelected ? (
          <View style={styles.selectedCheck}>
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          </View>
        ) : (
          <View style={styles.addButton}>
            <Building2 size={16} color="#37B874" />
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
          <Text style={styles.headerTitle}>Add Sponsors</Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedSponsors.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedRow}>
              {selectedSponsors.map((sponsor) => (
                <TouchableOpacity
                  key={sponsor.id}
                  style={styles.selectedChip}
                  onPress={() => handleToggleSponsor(sponsor)}
                >
                  <Image source={{ uri: sponsor.avatar }} style={styles.selectedAvatar} />
                  <Text style={styles.selectedName}>{sponsor.name}</Text>
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
            placeholder="Search brands & sponsors..."
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

      <View style={styles.infoBox}>
        <Building2 size={16} color="rgba(255, 255, 255, 0.64)" />
        <Text style={styles.infoText}>
          Add sponsors or brands that are financially supporting or providing resources for this content.
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            {RECENT_SPONSORS.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>RECENT SPONSORS</Text>
                {RECENT_SPONSORS.map(renderSponsorItem)}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUGGESTED BRANDS</Text>
              {SUGGESTED_SPONSORS.map(renderSponsorItem)}
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {filteredSponsors.length > 0 ? (
              filteredSponsors.map(renderSponsorItem)
            ) : (
              <Text style={styles.noResultsText}>No sponsors found</Text>
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
    backgroundColor: '#37B874',
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
    backgroundColor: 'rgba(55, 184, 116, 0.2)',
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
    paddingTop: 12,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(55, 184, 116, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
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
  sponsorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  sponsorItemSelected: {
    backgroundColor: 'rgba(55, 184, 116, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  sponsorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sponsorInfo: {
    flex: 1,
    gap: 2,
  },
  sponsorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sponsorName: {
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
  sponsorCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(55, 184, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#37B874',
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
