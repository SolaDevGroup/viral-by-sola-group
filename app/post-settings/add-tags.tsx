import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ChevronLeft, Search, X, Hash, TrendingUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tag = {
  id: string;
  name: string;
  posts?: string;
};

const TRENDING_TAGS: Tag[] = [
  { id: '1', name: 'Football', posts: '2.5M posts' },
  { id: '2', name: 'DavidBeckham', posts: '1.2M posts' },
  { id: '3', name: 'Adidas', posts: '890K posts' },
  { id: '4', name: 'Champions', posts: '750K posts' },
  { id: '5', name: 'Sports', posts: '5.2M posts' },
];

const SUGGESTED_TAGS: Tag[] = [
  { id: '6', name: 'Soccer', posts: '3.1M posts' },
  { id: '7', name: 'Goals', posts: '1.8M posts' },
  { id: '8', name: 'Training', posts: '920K posts' },
  { id: '9', name: 'Athlete', posts: '2.1M posts' },
  { id: '10', name: 'Fitness', posts: '4.5M posts' },
  { id: '11', name: 'Motivation', posts: '3.8M posts' },
  { id: '12', name: 'Lifestyle', posts: '2.9M posts' },
];

export default function AddTagsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currentTags?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    params.currentTags ? params.currentTags.split(',').map(t => t.trim().replace('#', '')) : []
  );

  const allTags = [...TRENDING_TAGS, ...SUGGESTED_TAGS];
  const filteredTags = searchQuery
    ? allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddCustomTag = () => {
    if (searchQuery.trim() && !selectedTags.includes(searchQuery.trim())) {
      setSelectedTags(prev => [...prev, searchQuery.trim()]);
      setSearchQuery('');
    }
  };

  const handleDone = () => {
    const tagsString = selectedTags.map(t => `#${t}`).join(', ');
    router.back();
    router.setParams({ selectedTags: tagsString });
  };

  const renderTagItem = (tag: Tag, showTrending = false) => {
    const isSelected = selectedTags.includes(tag.name);
    return (
      <TouchableOpacity
        key={tag.id}
        style={[styles.tagItem, isSelected && styles.tagItemSelected]}
        onPress={() => handleToggleTag(tag.name)}
      >
        <View style={styles.tagLeft}>
          {showTrending ? (
            <View style={styles.trendingIcon}>
              <TrendingUp size={16} color="#EE1045" />
            </View>
          ) : (
            <View style={styles.hashIcon}>
              <Hash size={16} color="rgba(255, 255, 255, 0.64)" />
            </View>
          )}
          <View style={styles.tagInfo}>
            <Text style={styles.tagName}>#{tag.name}</Text>
            {tag.posts && <Text style={styles.tagPosts}>{tag.posts}</Text>}
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedCheck}>
            <X size={16} color="#FFFFFF" />
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
          <Text style={styles.headerTitle}>Add Tags</Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedTagsRow}>
              {selectedTags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.selectedTagChip}
                  onPress={() => handleToggleTag(tag)}
                >
                  <Text style={styles.selectedTagText}>#{tag}</Text>
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
            placeholder="Search or create tags..."
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleAddCustomTag}
            returnKeyType="done"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="rgba(255, 255, 255, 0.48)" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && !allTags.find(t => t.name.toLowerCase() === searchQuery.toLowerCase()) && (
          <TouchableOpacity style={styles.createTagButton} onPress={handleAddCustomTag}>
            <Hash size={16} color="#007BFF" />
            <Text style={styles.createTagText}>Create &quot;#{searchQuery}&quot;</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color="#EE1045" />
                <Text style={styles.sectionTitle}>TRENDING</Text>
              </View>
              {TRENDING_TAGS.map(tag => renderTagItem(tag, true))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUGGESTED</Text>
              {SUGGESTED_TAGS.map(tag => renderTagItem(tag))}
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => renderTagItem(tag))
            ) : (
              <Text style={styles.noResultsText}>Press enter to create this tag</Text>
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
  selectedTagsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  selectedTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  selectedTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
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
  createTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  createTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007BFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tagItemSelected: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  tagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(238, 16, 69, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagInfo: {
    gap: 2,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tagPosts: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  selectedCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
