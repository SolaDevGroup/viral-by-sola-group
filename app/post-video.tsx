import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Switch, Image } from "react-native";
import { useLocalSearchParams, router, Href } from "expo-router";
import { useState } from "react";
import { Video, ResizeMode } from "expo-av";
import { ChevronLeft, ChevronRight, MapPin, Info, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

const TOPICS = [
  'Sports',
  'Technology',
  'Politics',
  'Music',
  'Fashion',
  'Entertainment',
  'Gaming',
  'Food',
  'Health',
  'Travel',
  'Art',
  'Education'
];

const AGE_RATINGS = [
  'No Age Restriction',
  '13+',
  '16+',
  '18+'
];

const VISIBILITY_OPTIONS = [
  'Public',
  'Followers Only',
  'Subscribers Only',
  'Private'
];

type Collaborator = {
  id: string;
  name: string;
  verified: boolean;
};

type Sponsor = {
  id: string;
  name: string;
  verified: boolean;
};

export default function PostVideoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ videoUri: string; mode: string; startTime: string; endTime: string; thumbnailUri?: string }>();
  const { videoUri, mode, thumbnailUri } = params;
  const { user } = useApp();
  
  const [caption, setCaption] = useState('');
  const maxCaptionLength = user?.isPro ? 2000 : 500;
  const [selectedRatio, setSelectedRatio] = useState<'9:16' | '16:9'>('9:16');
  const [location] = useState('Geneva, Switzerland');
  const [topic, setTopic] = useState('Sports');
  const [tags] = useState('#David Beckham, #Adidas, #Football');
  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: 'David Beckham', verified: true },
    { id: '2', name: 'Jude Bellingham', verified: true },
  ]);
  const [sponsors] = useState<Sponsor[]>([
    { id: '1', name: 'Adidas', verified: true },
  ]);
  const [containsAI, setContainsAI] = useState(true);
  const [canLike, setCanLike] = useState(true);
  const [canComment, setCanComment] = useState(true);
  const [canShare, setCanShare] = useState(true);
  const [ageRating, setAgeRating] = useState('No Age Restriction');
  const [visibility, setVisibility] = useState('Public');
  const [confirmTOS, setConfirmTOS] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your video');
      return;
    }

    if (!confirmTOS) {
      Alert.alert('Terms of Service', 'Please confirm that your post is within our Terms of Service');
      return;
    }

    setIsPosting(true);
    
    try {
      console.log('Posting video:', {
        videoUri,
        mode,
        caption,
        location,
        topic,
        tags,
        collaborators,
        sponsors,
        containsAI,
        canLike,
        canComment,
        canShare,
        ageRating,
        visibility,
        userId: user?.id,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success!',
        'Your reel has been published',
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

  const renderVerifiedBadge = () => (
    <View style={styles.verifiedBadge}>
      <Check size={8} color="#fff" strokeWidth={3} />
    </View>
  );

  const renderToggleRow = (label: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.fieldRow}>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value ? 'Yes' : 'No'}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255, 255, 255, 0.16)', true: '#37B874' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="rgba(255, 255, 255, 0.16)"
      />
    </View>
  );

  const renderSelectRow = (label: string, value: string, onPress: () => void) => (
    <TouchableOpacity style={styles.fieldRow} onPress={onPress}>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldValue, !value && styles.fieldValuePlaceholder]}>
          {value || 'Select...'}
        </Text>
      </View>
      <ChevronRight size={24} color="rgba(255, 255, 255, 0.64)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="rgba(255, 255, 255, 0.64)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publish A Reel</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewContainer}>
            <View style={styles.previewWrapper}>
              <View style={styles.previewInner}>
                {videoUri ? (
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.previewVideo}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isMuted
                  />
                ) : thumbnailUri ? (
                  <Image source={{ uri: thumbnailUri }} style={styles.previewVideo} />
                ) : (
                  <View style={styles.previewPlaceholder} />
                )}
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewLabel}>Preview</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.ratioSelector}>
            <TouchableOpacity
              style={[styles.ratioButton, selectedRatio === '9:16' && styles.ratioButtonActive]}
              onPress={() => setSelectedRatio('9:16')}
            >
              <Text style={[styles.ratioText, selectedRatio === '9:16' && styles.ratioTextActive]}>
                9:16 ratio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratioButton, selectedRatio === '16:9' && styles.ratioButtonActive]}
              onPress={() => setSelectedRatio('16:9')}
            >
              <Text style={[styles.ratioText, selectedRatio === '16:9' && styles.ratioTextActive]}>
                16:9 ratio
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.captionSection}>
            <View style={styles.captionBox}>
              <Text style={styles.captionLabel}>WHAT&apos;S HAPPENING</Text>
              <TextInput
                style={styles.captionInput}
                placeholder="Write your caption here..."
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={maxCaptionLength}
              />
            </View>
            <View style={styles.charCountRow}>
              <Info size={12} color="rgba(255, 255, 255, 0.64)" />
              <Text style={styles.charCountText}>{caption.length}/{maxCaptionLength} characters.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldsSection}>
            <TouchableOpacity style={styles.fieldRow}>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>LOCATION</Text>
                <View style={styles.locationRow}>
                  <MapPin size={16} color="#007BFF" />
                  <Text style={styles.fieldValue}>{location}</Text>
                </View>
              </View>
              <ChevronRight size={24} color="rgba(255, 255, 255, 0.64)" />
            </TouchableOpacity>

            {renderSelectRow('TOPIC', topic, () => {
              Alert.alert('Select Topic', '', TOPICS.map(t => ({
                text: t,
                onPress: () => setTopic(t)
              })));
            })}

            <View style={styles.fieldWithHelper}>
              <TouchableOpacity style={styles.fieldRow}>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>ADD TAGS</Text>
                  <Text style={styles.fieldValue}>{tags}</Text>
                </View>
                <ChevronRight size={24} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
              <View style={styles.helperRow}>
                <Info size={12} color="rgba(255, 255, 255, 0.64)" />
                <Text style={styles.helperText}>Helps you get more reach.</Text>
              </View>
            </View>

            <View style={styles.fieldWithHelper}>
              <TouchableOpacity style={styles.fieldRow}>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>IN COLLABORATION WITH</Text>
                  <View style={styles.collaboratorsRow}>
                    {collaborators.map((collab, index) => (
                      <View key={collab.id} style={styles.collaboratorItem}>
                        <Text style={styles.fieldValue}>
                          {index > 0 ? ', ' : ''}{collab.name}
                        </Text>
                        {collab.verified && renderVerifiedBadge()}
                      </View>
                    ))}
                  </View>
                </View>
                <ChevronRight size={24} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
              <View style={styles.helperRow}>
                <Info size={12} color="rgba(255, 255, 255, 0.64)" />
                <Text style={styles.helperText}>Person working together on the same project or content.</Text>
              </View>
            </View>

            <View style={styles.fieldWithHelper}>
              <TouchableOpacity style={styles.fieldRow}>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>SPONSORED BY</Text>
                  <View style={styles.collaboratorsRow}>
                    {sponsors.map((sponsor) => (
                      <View key={sponsor.id} style={styles.collaboratorItem}>
                        <Text style={styles.fieldValue}>{sponsor.name}</Text>
                        {sponsor.verified && renderVerifiedBadge()}
                      </View>
                    ))}
                  </View>
                </View>
                <ChevronRight size={24} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
              <View style={styles.helperRow}>
                <Info size={12} color="rgba(255, 255, 255, 0.64)" />
                <Text style={styles.helperText}>Organization supporting financially or with resources in exchange for promotion.</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.togglesSection}>
            {renderToggleRow('DOES IT CONTAIN AI?', containsAI, setContainsAI)}
            {renderToggleRow('CAN LIKE?', canLike, setCanLike)}
            {renderToggleRow('CAN COMMENT?', canComment, setCanComment)}
            {renderToggleRow('CAN SHARE?', canShare, setCanShare)}

            {renderSelectRow('AGE RATING', ageRating, () => {
              Alert.alert('Select Age Rating', '', AGE_RATINGS.map(r => ({
                text: r,
                onPress: () => setAgeRating(r)
              })));
            })}

            {renderSelectRow('AVAILABLE TO', visibility, () => {
              Alert.alert('Select Visibility', '', VISIBILITY_OPTIONS.map(v => ({
                text: v,
                onPress: () => setVisibility(v)
              })));
            })}
          </View>

          <View style={styles.divider} />

          {renderToggleRow('I HEREBY CONFIRM THE POST IS WITHIN TOS', confirmTOS, setConfirmTOS)}

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity 
          style={[styles.publishButton, isPosting && styles.publishButtonDisabled]}
          onPress={handlePost}
          disabled={isPosting}
        >
          <Text style={styles.publishButtonText}>
            {isPosting ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: 'rgba(18, 18, 18, 0.01)',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: 16,
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewWrapper: {
    width: 124,
    height: 214,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 4,
  },
  previewInner: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.16)',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ratioSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  ratioButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  ratioButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  ratioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ratioTextActive: {
    color: '#121212',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 16,
  },
  captionSection: {
    gap: 6,
  },
  captionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    minHeight: 160,
    gap: 16,
  },
  captionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.64)',
    textTransform: 'uppercase',
  },
  captionInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 21,
    flex: 1,
    textAlignVertical: 'top',
  },
  charCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  charCountText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.3,
  },
  fieldsSection: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    minHeight: 56,
  },
  fieldContent: {
    flex: 1,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.64)',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  fieldValuePlaceholder: {
    color: 'rgba(255, 255, 255, 0.48)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldWithHelper: {
    gap: 6,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.3,
    flex: 1,
  },
  collaboratorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglesSection: {
    gap: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  publishButton: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#121212',
  },
});
