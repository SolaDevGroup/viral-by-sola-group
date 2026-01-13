import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomModal from "@/components/CustomModal";
import CustomInput from "@/components/CustomInput";
import CustomText from "@/components/CustomText";
import ExpoIcons from "@/components/ExpoIcons";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { Image } from "expo-image";
import { Images } from "@/assets/images";

interface HashtagModalProps {
  isVisible: boolean;
  selectedTags: string[];
  onClose: () => void;
  onChange: (tags: string[]) => void;
}

interface Hashtag {
  id: string;
  views?: number;
}

const TRENDING_TAGS: Hashtag[] = [
  { id: "losangeles", views: 1445444 },
  { id: "midterms", views: 834221 },
  { id: "election", views: 992332 },
  { id: "sports", views: 552100 },
  { id: "music", views: 678442 },
];

const HashtagModal: React.FC<HashtagModalProps> = ({
  isVisible,
  selectedTags,
  onClose,
  onChange,
}) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [query, setQuery] = useState("");

  const filteredTags = useMemo(() => {
    if (!query) return TRENDING_TAGS;
    return TRENDING_TAGS.filter((tag) =>
      tag.id.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (!query.trim()) return;
    if (!selectedTags.includes(query)) {
      onChange([...selectedTags, query]);
    }
    setQuery("");
  };

  return (
    <CustomModal
      isChange
      isVisible={isVisible}
      onDisable={onClose}
      propagateSwipe={true}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={{ borderBottomWidth: 2, borderColor: theme.border }}>
          <View
            style={{
              flexDirection: "row",

              gap: 8,
              paddingHorizontal: 14,
            }}
          >
            <View style={{ flex: 1 }}>
              <CustomInput
                placeholder="Enter a tag..."
                value={query}
                onChangeText={setQuery}
                search
                height={44}
                borderRadius={99}
                isClear
                marginBottom={8}
                returnKeyType="Done"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                height: 40,
                width: 40,
                borderRadius: 40,
                backgroundColor: theme.cardBackground,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={onClose}
            >
              <ExpoIcons
                family="Entypo"
                name="cross"
                size={22}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {selectedTags.length > 0 && (
            <View>
              <FlatList
                data={selectedTags}
                keyExtractor={(item) => item}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  paddingTop: 0,
                  gap: 8,
                }}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.tagChip,
                      { backgroundColor: theme.cardBackground },
                    ]}
                  >
                    <CustomText
                      label={`#${item}`}
                      color={theme.textSecondary}
                    />
                    <TouchableOpacity onPress={() => toggleTag(item)}>
                      <Image
                        source={Images.cross}
                        style={{ height: 14, width: 14 }}
                        tintColor={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        <FlatList
          data={filteredTags}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          renderItem={({ item, index }) => {
            const isSelected = selectedTags.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.row,
                  {
                    borderBottomWidth:
                      index == filteredTags?.length - 1 ? 0 : 1,
                  },
                ]}
                onPress={() => toggleTag(item.id)}
                activeOpacity={0.9}
              >
                <View>
                  <CustomText
                    label={`#${item.id}`}
                    fontSize={16}
                    fontFamily="Poppins_500Medium"
                    color={theme.text}
                  />
                  {item.views && (
                    <CustomText
                      label={`${item.views.toLocaleString()} views`}
                      fontSize={13}
                      color={theme.textSecondary}
                    />
                  )}
                </View>

                <ExpoIcons
                  family="MaterialCommunityIcons"
                  name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                  size={22}
                  color={isSelected ? theme.text : theme.textTertiary}
                />
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            query.length > 0 && !filteredTags.length ? (
              <TouchableOpacity style={styles.createTag} onPress={addCustomTag}>
                <CustomText label={`Create #${query}`} color={Colors.primary} />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    </CustomModal>
  );
};

export default HashtagModal;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tagsContainer: {
    marginVertical: 12,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  createTag: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
