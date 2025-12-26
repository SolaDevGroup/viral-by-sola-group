import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ChevronLeft, Check, Globe, Users, Lock, Crown, AlertCircle, Baby, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type VisibilityOption = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
};

type AgeRating = {
  id: string;
  name: string;
  description: string;
  minAge?: number;
};

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  { id: 'public', name: 'Public', description: 'Anyone can view this content', icon: Globe, color: '#37B874' },
  { id: 'followers', name: 'Followers Only', description: 'Only your followers can view', icon: Users, color: '#007BFF' },
  { id: 'subscribers', name: 'Subscribers Only', description: 'Only paid subscribers can view', icon: Crown, color: '#FFB800' },
  { id: 'private', name: 'Private', description: 'Only you can view this content', icon: Lock, color: '#EE1045' },
];

const AGE_RATINGS: AgeRating[] = [
  { id: 'none', name: 'No Age Restriction', description: 'Suitable for all ages' },
  { id: '13+', name: '13+', description: 'May contain mild themes not suitable for children', minAge: 13 },
  { id: '16+', name: '16+', description: 'May contain mature themes', minAge: 16 },
  { id: '18+', name: '18+', description: 'Adult content only', minAge: 18 },
];

export default function VisibilitySettingsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currentVisibility?: string; currentAgeRating?: string }>();
  const [selectedVisibility, setSelectedVisibility] = useState(params.currentVisibility || 'public');
  const [selectedAgeRating, setSelectedAgeRating] = useState(params.currentAgeRating || 'none');

  const handleDone = () => {
    router.back();
    router.setParams({
      selectedVisibility: selectedVisibility,
      selectedAgeRating: selectedAgeRating,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="rgba(255, 255, 255, 0.64)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visibility Settings</Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHO CAN SEE THIS</Text>
          <View style={styles.optionsContainer}>
            {VISIBILITY_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedVisibility === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => setSelectedVisibility(option.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                    <IconComponent size={20} color={option.color} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedCheck, { backgroundColor: option.color }]}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AGE RATING</Text>
          <View style={styles.optionsContainer}>
            {AGE_RATINGS.map((rating) => {
              const isSelected = selectedAgeRating === rating.id;
              return (
                <TouchableOpacity
                  key={rating.id}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => setSelectedAgeRating(rating.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
                    {rating.id === 'none' ? (
                      <Baby size={20} color="rgba(255, 255, 255, 0.64)" />
                    ) : (
                      <User size={20} color="rgba(255, 255, 255, 0.64)" />
                    )}
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{rating.name}</Text>
                    <Text style={styles.optionDescription}>{rating.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.warningBox}>
          <AlertCircle size={20} color="#FFB800" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Content Guidelines</Text>
            <Text style={styles.warningText}>
              Make sure your age rating accurately reflects your content. Misrepresenting content age ratings may result in content removal or account restrictions.
            </Text>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.3)',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionDescription: {
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFB800',
  },
  warningText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 18,
  },
});
