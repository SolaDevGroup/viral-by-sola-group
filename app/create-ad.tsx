import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, Alert } from "react-native";
import { useState } from "react";
import { Stack, router } from "expo-router";
import { X, ImageIcon, Video, MapPin, Users, DollarSign, ChevronDown, Check, Target, Globe, TrendingUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import * as ImagePicker from "expo-image-picker";

type MediaType = 'image' | 'video' | null;
type AudienceType = 'all' | 'followers' | 'similar' | 'custom';
type ObjectiveType = 'views' | 'engagement' | 'followers' | 'traffic';

const AUDIENCE_OPTIONS: { id: AudienceType; label: string; desc: string; icon: any }[] = [
  { id: 'all', label: 'Everyone', desc: 'Reach the widest audience', icon: Globe },
  { id: 'followers', label: 'Followers', desc: 'Target your existing fans', icon: Users },
  { id: 'similar', label: 'Similar Audiences', desc: 'People like your followers', icon: Target },
  { id: 'custom', label: 'Custom', desc: 'Define your own criteria', icon: TrendingUp },
];

const OBJECTIVE_OPTIONS: { id: ObjectiveType; label: string; desc: string }[] = [
  { id: 'views', label: 'Maximize Views', desc: 'Get your content seen by more people' },
  { id: 'engagement', label: 'Boost Engagement', desc: 'Increase likes, comments & shares' },
  { id: 'followers', label: 'Grow Followers', desc: 'Attract new followers to your profile' },
  { id: 'traffic', label: 'Drive Traffic', desc: 'Send viewers to your link' },
];

const DURATION_OPTIONS = [3, 7, 14, 30];
const RADIUS_OPTIONS = [10, 25, 50, 100, 0];

export default function CreateAdScreen() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState<AudienceType>('all');
  const [objective, setObjective] = useState<ObjectiveType>('views');
  const [duration, setDuration] = useState(7);
  const [radius, setRadius] = useState(0);
  const [dailyBudget, setDailyBudget] = useState('10');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);

  const MAX_CAPTION_LENGTH = 150;

  const pickMedia = async (type: 'image' | 'video') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
      console.log('Media selected:', result.assets[0].uri);
    }
  };

  const getAudienceLabel = () => {
    return AUDIENCE_OPTIONS.find(a => a.id === audience)?.label || 'Everyone';
  };

  const getObjectiveLabel = () => {
    return OBJECTIVE_OPTIONS.find(o => o.id === objective)?.label || 'Maximize Views';
  };

  const getRadiusLabel = () => {
    if (radius === 0) return 'Global';
    return `${radius} miles`;
  };

  const calculateEstimatedReach = () => {
    const base = 10000;
    const budgetMultiplier = parseFloat(dailyBudget) || 10;
    const durationMultiplier = duration;
    const audienceMultiplier = audience === 'all' ? 1.5 : audience === 'similar' ? 1.2 : 1;
    const radiusMultiplier = radius === 0 ? 1.5 : radius > 50 ? 1.2 : 1;
    
    const reach = Math.round(base * budgetMultiplier * durationMultiplier * audienceMultiplier * radiusMultiplier / 100);
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}K`;
    return reach.toString();
  };

  const calculateTotalBudget = () => {
    const daily = parseFloat(dailyBudget) || 0;
    return (daily * duration).toFixed(2);
  };

  const handleCreateAd = () => {
    if (!mediaUri) {
      Alert.alert('Media Required', 'Please upload an image or video for your ad.');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your ad.');
      return;
    }
    
    console.log('Creating ad campaign:', {
      mediaUri,
      mediaType,
      caption,
      audience,
      objective,
      duration,
      radius,
      dailyBudget,
      totalBudget: calculateTotalBudget(),
    });
    
    Alert.alert(
      'Campaign Created!',
      `Your ad campaign is now live.\n\nEstimated reach: ${calculateEstimatedReach()} people\nTotal budget: $${calculateTotalBudget()}`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color={theme.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Ad Campaign</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ad Creative</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Upload 9:16 vertical media</Text>
          
          {mediaUri ? (
            <View style={styles.mediaPreviewContainer}>
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} resizeMode="cover" />
              <TouchableOpacity 
                style={styles.removeMediaBtn}
                onPress={() => { setMediaUri(null); setMediaType(null); }}
              >
                <X size={16} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
              <View style={styles.mediaTypeBadge}>
                {mediaType === 'video' ? (
                  <Video size={14} color="#fff" strokeWidth={2} />
                ) : (
                  <ImageIcon size={14} color="#fff" strokeWidth={2} />
                )}
                <Text style={styles.mediaTypeText}>{mediaType === 'video' ? 'Video' : 'Image'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity 
                style={[styles.uploadBtn, { backgroundColor: theme.cardBackground }]}
                onPress={() => pickMedia('image')}
              >
                <ImageIcon size={28} color={theme.textSecondary} strokeWidth={1.5} />
                <Text style={[styles.uploadBtnText, { color: theme.text }]}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.uploadBtn, { backgroundColor: theme.cardBackground }]}
                onPress={() => pickMedia('video')}
              >
                <Video size={28} color={theme.textSecondary} strokeWidth={1.5} />
                <Text style={[styles.uploadBtnText, { color: theme.text }]}>Upload Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Caption</Text>
          <TextInput
            style={[styles.captionInput, { backgroundColor: theme.cardBackground, color: theme.text }]}
            value={caption}
            onChangeText={(text) => text.length <= MAX_CAPTION_LENGTH && setCaption(text)}
            placeholder="Write an engaging caption..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={[styles.captionCounter, { color: theme.textSecondary }]}>{caption.length}/{MAX_CAPTION_LENGTH}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Campaign Objective</Text>
          <TouchableOpacity 
            style={[styles.selectBtn, { backgroundColor: theme.cardBackground }]}
            onPress={() => setShowObjectiveModal(!showObjectiveModal)}
          >
            <TrendingUp size={20} color="#EE1045" strokeWidth={2} />
            <View style={styles.selectBtnContent}>
              <Text style={[styles.selectBtnLabel, { color: theme.text }]}>{getObjectiveLabel()}</Text>
              <Text style={[styles.selectBtnDesc, { color: theme.textSecondary }]}>
                {OBJECTIVE_OPTIONS.find(o => o.id === objective)?.desc}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          
          {showObjectiveModal && (
            <View style={[styles.optionsContainer, { backgroundColor: theme.cardBackground }]}>
              {OBJECTIVE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionItem, objective === opt.id && styles.optionItemActive]}
                  onPress={() => { setObjective(opt.id); setShowObjectiveModal(false); }}
                >
                  <View>
                    <Text style={[styles.optionLabel, { color: theme.text }, objective === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
                    <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>{opt.desc}</Text>
                  </View>
                  {objective === opt.id && <Check size={20} color="#EE1045" strokeWidth={2.5} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Target Audience</Text>
          <TouchableOpacity 
            style={[styles.selectBtn, { backgroundColor: theme.cardBackground }]}
            onPress={() => setShowAudienceModal(!showAudienceModal)}
          >
            <Users size={20} color="#EE1045" strokeWidth={2} />
            <View style={styles.selectBtnContent}>
              <Text style={[styles.selectBtnLabel, { color: theme.text }]}>{getAudienceLabel()}</Text>
              <Text style={[styles.selectBtnDesc, { color: theme.textSecondary }]}>
                {AUDIENCE_OPTIONS.find(a => a.id === audience)?.desc}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          
          {showAudienceModal && (
            <View style={[styles.optionsContainer, { backgroundColor: theme.cardBackground }]}>
              {AUDIENCE_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionItem, audience === opt.id && styles.optionItemActive]}
                    onPress={() => { setAudience(opt.id); setShowAudienceModal(false); }}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[styles.optionIconWrap, { backgroundColor: 'rgba(238, 16, 69, 0.1)' }]}>
                        <IconComponent size={18} color="#EE1045" strokeWidth={2} />
                      </View>
                      <View>
                        <Text style={[styles.optionLabel, { color: theme.text }, audience === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
                        <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>{opt.desc}</Text>
                      </View>
                    </View>
                    {audience === opt.id && <Check size={20} color="#EE1045" strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Location Radius</Text>
          <View style={styles.radiusContainer}>
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.radiusBtn,
                  { backgroundColor: theme.cardBackground },
                  radius === r && styles.radiusBtnActive
                ]}
                onPress={() => setRadius(r)}
              >
                <MapPin size={16} color={radius === r ? '#fff' : theme.textSecondary} strokeWidth={2} />
                <Text style={[styles.radiusBtnText, { color: radius === r ? '#fff' : theme.text }]}>
                  {r === 0 ? 'Global' : `${r}mi`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Campaign Duration</Text>
          <View style={styles.durationContainer}>
            {DURATION_OPTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.durationBtn,
                  { backgroundColor: theme.cardBackground },
                  duration === d && styles.durationBtnActive
                ]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationBtnText, { color: duration === d ? '#fff' : theme.text }]}>{d} days</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Budget</Text>
          <View style={[styles.budgetInputContainer, { backgroundColor: theme.cardBackground }]}>
            <DollarSign size={20} color="#EE1045" strokeWidth={2} />
            <TextInput
              style={[styles.budgetInput, { color: theme.text }]}
              value={dailyBudget}
              onChangeText={setDailyBudget}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>per day</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: 'rgba(238, 16, 69, 0.08)' }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Campaign Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Estimated Reach</Text>
            <Text style={[styles.summaryValue, { color: '#EE1045' }]}>{calculateEstimatedReach()} people</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Duration</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{duration} days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Location</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{getRadiusLabel()}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotalLabel, { color: theme.text }]}>Total Budget</Text>
            <Text style={styles.summaryTotalValue}>${calculateTotalBudget()}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.createBtn, (!mediaUri || !caption.trim()) && styles.createBtnDisabled]}
          onPress={handleCreateAd}
          disabled={!mediaUri || !caption.trim()}
        >
          <Text style={styles.createBtnText}>Launch Campaign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  uploadContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBtn: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  mediaPreviewContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTypeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mediaTypeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#fff',
  },
  captionInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 80,
  },
  captionCounter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectBtnContent: {
    flex: 1,
  },
  selectBtnLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  selectBtnDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  optionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  optionItemActive: {
    backgroundColor: 'rgba(238, 16, 69, 0.08)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  optionLabelActive: {
    color: '#EE1045',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  radiusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  radiusBtnActive: {
    backgroundColor: '#EE1045',
  },
  radiusBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  durationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderRadius: 100,
  },
  durationBtnActive: {
    backgroundColor: '#EE1045',
  },
  durationBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600' as const,
  },
  budgetLabel: {
    fontSize: 14,
  },
  summaryCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#EE1045',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  createBtn: {
    backgroundColor: '#EE1045',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
