import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ChevronLeft, Search, X, Check, Gamepad2, Music, Film, Palette, BookOpen, Utensils, Plane, Heart, Dumbbell, Laptop, Briefcase, Camera, Shirt, Globe, TrendingUp, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Topic = {
  id: string;
  name: string;
  icon: any;
  color: string;
};

const TOPICS: Topic[] = [
  { id: '1', name: 'Sports', icon: Dumbbell, color: '#EE1045' },
  { id: '2', name: 'Technology', icon: Laptop, color: '#007BFF' },
  { id: '3', name: 'Music', icon: Music, color: '#8E1DFE' },
  { id: '4', name: 'Entertainment', icon: Film, color: '#FF6B00' },
  { id: '5', name: 'Gaming', icon: Gamepad2, color: '#37B874' },
  { id: '6', name: 'Fashion', icon: Shirt, color: '#FF69B4' },
  { id: '7', name: 'Food', icon: Utensils, color: '#FFB800' },
  { id: '8', name: 'Travel', icon: Plane, color: '#00CED1' },
  { id: '9', name: 'Health', icon: Heart, color: '#EE1045' },
  { id: '10', name: 'Art', icon: Palette, color: '#8E1DFE' },
  { id: '11', name: 'Education', icon: BookOpen, color: '#007BFF' },
  { id: '12', name: 'Business', icon: Briefcase, color: '#014D3A' },
  { id: '13', name: 'Photography', icon: Camera, color: '#FF6B00' },
  { id: '14', name: 'Politics', icon: Globe, color: '#6B7280' },
  { id: '15', name: 'Finance', icon: TrendingUp, color: '#37B874' },
  { id: '16', name: 'Lifestyle', icon: Users, color: '#FF69B4' },
];

export default function SelectTopicScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currentTopic?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(params.currentTopic || '');

  const filteredTopics = searchQuery
    ? TOPICS.filter(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TOPICS;

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic.name);
    router.back();
    router.setParams({ selectedTopic: topic.name });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="rgba(255, 255, 255, 0.64)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Topic</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="rgba(255, 255, 255, 0.48)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
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
        <View style={styles.topicsGrid}>
          {filteredTopics.map((topic) => {
            const IconComponent = topic.icon;
            const isSelected = selectedTopic === topic.name;
            return (
              <TouchableOpacity
                key={topic.id}
                style={[
                  styles.topicCard,
                  isSelected && { borderColor: topic.color, borderWidth: 2 }
                ]}
                onPress={() => handleSelectTopic(topic)}
              >
                <View style={[styles.topicIconContainer, { backgroundColor: `${topic.color}20` }]}>
                  <IconComponent size={24} color={topic.color} />
                </View>
                <Text style={styles.topicName}>{topic.name}</Text>
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: topic.color }]}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredTopics.length === 0 && (
          <Text style={styles.noResultsText}>No topics found</Text>
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
  headerSpacer: {
    width: 40,
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
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topicIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center',
    marginTop: 40,
  },
});
