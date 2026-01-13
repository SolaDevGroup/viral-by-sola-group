import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import CustomModal from "@/components/CustomModal";
import CustomText from "@/components/CustomText";
import ExpoIcons from "@/components/ExpoIcons";
import Header from "@/components/Header";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SelectionType =
  | "age"
  | "topic"
  | "visibleTo"
  | "category"
  | "cta"
  | "redirectTo"
  | "audience";

interface BaseOption {
  id: string;
  title?: string;
  emoji?: string;
}

interface SelectionModalProps {
  isVisible: boolean;
  onModalClose: () => void;
  type?: SelectionType;
  selected?: string;
  onSelection?: (value: string) => void;
  options?: string[]; // New prop for custom options
}

const ageRatings: BaseOption[] = [
  { id: "+14", title: "14 years old or older" },
  { id: "+16", title: "16 years old or older" },
  { id: "+18", title: "18 years old or older" },
  { id: "+21", title: "21 years old or older" },
];

const topic: BaseOption[] = [
  { id: "Technology", emoji: "💡 " },
  { id: "Politics", emoji: "🏛️ " },
  { id: "Sports", emoji: "🎾 " },
  { id: "Music", emoji: "🎹 " },
  { id: "Entertainment", emoji: "🎬 " },
  { id: "Fashion", emoji: "👟 " },
  { id: "Food", emoji: "🥖 " },
  { id: "Gaming", emoji: "🎮 " },
  { id: "Health", emoji: "💚 " },
];

const visibleToOptions: BaseOption[] = [
  { id: "Public" },
  { id: "Followers" },
  { id: "Favorites" },
  { id: "Private" },
];

const SelectionModal = ({
  isVisible,
  onModalClose,
  type = "age",
  selected,
  onSelection = () => {},
  options = [],
}: SelectionModalProps) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getOptions = (): BaseOption[] => {
    // If custom options are provided, convert them to BaseOption format
    if (options && options.length > 0) {
      return options.map((opt) => ({
        id: opt,
        title: undefined,
        emoji: undefined,
      }));
    }

    switch (type) {
      case "age":
        return ageRatings;
      case "topic":
        return topic;
      case "visibleTo":
        return visibleToOptions;
      case "category":
        return topic;
      default:
        return [];
    }
  };

  const getTitle = (): string => {
    switch (type) {
      case "age":
        return "Age Rating";
      case "topic":
        return "Select a topic";
      case "visibleTo":
        return "Visible To";
      case "category":
        return "Select Category";
      case "cta":
        return "Call To Action";
      case "redirectTo":
        return "Redirect To";
      case "audience":
        return "Select Audience";
      default:
        return "Select Option";
    }
  };

  return (
    <CustomModal isChange isVisible={isVisible} onDisable={onModalClose}>
      <View
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View style={{ borderBottomWidth: 2, borderColor: theme.border }}>
          <Header title={getTitle()} onBackPress={onModalClose} />
        </View>

        <FlatList
          data={getOptions()}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                const selectedValue = item.id;
                onSelection(selectedValue);
                onModalClose();
              }}
              activeOpacity={0.9}
              style={[
                styles.row,
                {
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderBottomWidth: index == getOptions()?.length - 1 ? 0 : 1,
                  borderBottomColor: theme.borderLight,
                },
              ]}
            >
              <View>
                <CustomText
                  label={`${item.emoji ?? ""} ${item.id}`}
                  fontSize={16}
                  fontFamily="Poppins_500Medium"
                  color={theme.text}
                />

                {item.title && (
                  <CustomText
                    label={item.title}
                    fontSize={14}
                    color={theme.textSecondary}
                  />
                )}
              </View>

              <ExpoIcons
                family="MaterialCommunityIcons"
                name={
                  selected === item.id ? "radiobox-marked" : "radiobox-blank"
                }
                size={22}
                color={selected === item.id ? theme.text : theme.textTertiary}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </CustomModal>
  );
};

export default SelectionModal;

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    height: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    borderRadius: 99,
    height: 35,
    width: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});
