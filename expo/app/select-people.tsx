import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import { Image } from "expo-image";
import Header from "@/components/Header";
import CustomInput from "@/components/CustomInput";
import CustomText from "@/components/CustomText";
import ExpoIcons from "@/components/ExpoIcons";
import Colors from "@/constants/colors";
import { Images } from "@/assets/images";
import { useLocalSearchParams } from "expo-router";

type ScreenType = "collaborator" | "sponsor";
type TabType = "followers" | "following";

interface User {
  id: string;
  name: string;
  username: string;
  role?: string;
  verified?: boolean;
}

const MOCK_USERS: User[] = [
  {
    id: "Alice Johnson",
    name: "Alice Johnson",
    username: "alicej",
    role: "Designer",
    verified: true,
  },
  {
    id: "Bob Smith",
    name: "Bob Smith",
    username: "bobsmith",
    role: "Developer",
    verified: false,
  },
  {
    id: "Charlie Lee",
    name: "Charlie Lee",
    username: "charliel",
    role: "Doctor",
    verified: true,
  },
  {
    id: "Diana King",
    name: "Diana King",
    username: "dianak",
    role: "Photographer",
    verified: false,
  },
  {
    id: "Ethan Hunt",
    name: "Ethan Hunt",
    username: "ethanh",
    role: "Agent",
    verified: true,
  },
  {
    id: "Fiona Chen",
    name: "Fiona Chen",
    username: "fionac",
    role: "Engineer",
    verified: false,
  },
  {
    id: "George Brown",
    name: "George Brown",
    username: "georgeb",
    role: "Teacher",
    verified: true,
  },
  {
    id: "Hannah White",
    name: "Hannah White",
    username: "hannahw",
    role: "Writer",
    verified: false,
  },
  {
    id: "Ian Black",
    name: "Ian Black",
    username: "ianb",
    role: "Doctor",
    verified: true,
  },
  {
    id: "Julia Green",
    name: "Julia Green",
    username: "juliag",
    role: "Designer",
    verified: false,
  },
];

const SelectPeopleScreen: React.FC = () => {
  const { type } = useLocalSearchParams<{ type: string }>();
  const insets = useSafeAreaInsets();
  const {
    isDarkMode,
    selectedCollaborators,
    selectedSponsor,
    setSelectedCollaborators,
    setSelectedSponsor,
    accentColor,
  } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    type === "sponsor" ? selectedSponsor : selectedCollaborators
  );
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabType>("followers");

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id];

      if (type === "sponsor") {
        setSelectedSponsor(updated);
      } else {
        setSelectedCollaborators(updated);
      }

      return updated;
    });
  };

  const filtered = useMemo(() => {
    if (!query) return MOCK_USERS;
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.includes(item.id);
    return (
      <View style={[styles.row, { borderColor: theme.borderLight }]}>
        <View style={styles.userInfo}>
          <Image source={Images.user} style={styles.avatar} />
          <View>
            <View style={styles.nameRow}>
              <CustomText
                label={item.name}
                fontFamily="Poppins_500Medium"
                color={theme.text}
              />
              {item.verified && (
                <ExpoIcons
                  family="MaterialIcons"
                  name="verified"
                  size={16}
                  color="#3B82F6"
                />
              )}
              <View
                style={[
                  styles.usernameChip,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <CustomText
                  label={item.username}
                  fontSize={12}
                  color={theme.textSecondary}
                />
              </View>
            </View>
            <CustomText
              label={`${item.role} • 2`}
              fontSize={13}
              color={theme.textSecondary}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => toggleUser(item.id)}
          activeOpacity={0.8}
          style={[
            styles.actionBtn,
            {
              backgroundColor: isSelected ? accentColor : theme.cardBackground,
            },
          ]}
        >
          <ExpoIcons
            family="Entypo"
            name={isSelected ? "minus" : "plus"}
            size={18}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: accentColor }]}>
      <Header
        iconBackgroundColor="#FFFFFF0A"
        title={
          type === "collaborator" ? "Select Collaborators" : "Select Sponsor"
        }
        textColor="#fff"
        iconColor="#fff"
      />

      <View style={styles.tabs}>
        {(["followers", "following"] as TabType[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { backgroundColor: "#fff" }]}
          >
            <CustomText
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              color={tab === t ? "#000" : "#A3A3A3"}
              fontSize={14}
              fontFamily="Poppins_500Medium"
            />
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={{
          backgroundColor: theme.background,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          flex: 1,
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <CustomInput
            placeholder="Search users..."
            value={query}
            onChangeText={setQuery}
            search
            height={44}
            borderRadius={99}
            isClear
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default SelectPeopleScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 5,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  userInfo: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  usernameChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 6,
    borderRadius: 100,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
