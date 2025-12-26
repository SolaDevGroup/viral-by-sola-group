import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useLocalSearchParams, router, Href } from "expo-router";
import { useState } from "react";
import { Video, ResizeMode } from "expo-av";
import { X, Hash, Globe, Users, Lock } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

const CATEGORIES = [
  'Technology',
  'Politics',
  'Sports',
  'Music',
  'Fashion',
  'Entertainment',
  'Gaming',
  'Food',
  'Health'
];

type PrivacyOption = 'public' | 'following' | 'subscribers';

export default function PostVideoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ videoUri: string; mode: string; startTime: string; endTime: string }>();
  const { videoUri, mode } = params;
  const { user } = useApp();
  
  const [caption, setCaption] = useState('');
  const maxCaptionLength = user?.isPro ? 2000 : 500;
  const [tags, setTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Technology');
  const [privacy, setPrivacy] = useState<PrivacyOption>('public');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your video');
      return;
    }

    setIsPosting(true);
    
    try {
      console.log('Posting video:', {
        videoUri,
        mode,
        caption,
        tags: tags.split(' ').filter(tag => tag.startsWith('#')),
        category: selectedCategory,
        privacy,
        userId: user?.id,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Your video has been posted',
        [
          {
            text: 'View Profile',
            onPress: () => {
              router.dismissAll();
              router.push('/(tabs)/profile' as Href);
            }
          },
          {
            text: 'Go to Feed',
            onPress: () => {
              router.dismissAll();
              router.push('/(tabs)/home' as Href);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error posting video:', error);
      Alert.alert('Error', 'Failed to post video. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const privacyOptions: { value: PrivacyOption; label: string; icon: any }[] = [
    { value: 'public', label: 'Public', icon: Globe },
    { value: 'following', label: 'Following', icon: Users },
    { value: 'subscribers', label: 'Subscribers', icon: Lock },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post {mode === 'short' ? 'Short' : mode === 'selfie' ? 'Selfie' : 'Live'}</Text>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={isPosting}
          style={styles.postButton}
        >
          <Text style={styles.postButtonText}>{isPosting ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoPreview}>
          {videoUri && (
            <Video
              source={{ uri: videoUri }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping
            />
          )}
          <View style={styles.videoOverlay}>
            <Text style={styles.videoLabel}>Preview</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor={Colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={maxCaptionLength}
          />
          <Text style={styles.charCount}>{caption.length}/{maxCaptionLength}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Hash color={Colors.primary} size={20} />
            <Text style={styles.sectionLabel}>Tags</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="#tag1 #tag2 #tag3"
            placeholderTextColor={Colors.textSecondary}
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.hint}>Separate tags with spaces, e.g., #dance #viral #fyp</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Audience</Text>
          <View style={styles.dropdownContainer}>
            {privacyOptions.map(({ value, label, icon: Icon }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.dropdownOption,
                  privacy === value && styles.dropdownOptionSelected
                ]}
                onPress={() => setPrivacy(value)}
              >
                <View style={styles.dropdownOptionLeft}>
                  <Icon 
                    color={privacy === value ? Colors.primary : Colors.text} 
                    size={20} 
                  />
                  <Text style={[
                    styles.dropdownOptionText,
                    privacy === value && styles.dropdownOptionTextSelected
                  ]}>
                    {label}
                  </Text>
                </View>
                {privacy === value && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  videoPreview: {
    width: 120,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    alignSelf: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  videoLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  captionInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  dropdownContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(18, 255, 170, 0.08)',
  },
  dropdownOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  dropdownOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
