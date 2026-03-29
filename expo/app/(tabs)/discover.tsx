import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  FlatList,
} from "react-native";
import {
  DISCOVER_CATEGORIES,
  DISCOVER_VIDEOS,
  SEARCH_ACCOUNTS,
  LIVE_STREAMS,
} from "@/constants/mockData";
import { post } from "@/services/ApiRequest";
import { Plus, BadgeCheck, ShieldCheck } from "lucide-react-native";
import { Stack, router, Href } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { Images } from "@/assets/images";
import colors from "@/constants/colors";
import ExpoIcons from "@/components/ExpoIcons";
import { useQuery } from "@tanstack/react-query";
import { fetchRecommendedUsers } from "@/services/users";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 2;
const GRID_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const CARD_GAP = 1;
const COLUMN_WIDTH = (GRID_WIDTH - CARD_GAP * 2) / 3;
const ROW_HEIGHT = 240;
const SMALL_CARD_HEIGHT = (ROW_HEIGHT - CARD_GAP) / 2;

type CardType = "big" | "small";
type CardPosition = 0 | 1 | 2;
type SearchTab = "Accounts" | "Reels" | "Live" | null | string;
type AccountFilter = "all" | "pro" | "verified";

interface GridItem {
  video: (typeof DISCOVER_VIDEOS)[0];
  type: CardType;
  isPlaying: boolean;
}

interface SearchAccount {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isPro: boolean;
  totalViews: number;
  isFollowing: boolean;
  name?: string;
}

export default function DiscoverScreen() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const {
    data: accounts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["recommended-users"],
    queryFn: fetchRecommendedUsers,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab>("Accounts");
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    {}
  );

  const hasSearchText = searchQuery.length > 0;
  const TABS = ["Accounts", "Reels", "Live"] as const;

  const visibleTabs = activeSearchTab === null ? TABS : [activeSearchTab];
  const filteredVideos = useMemo(() => {
    let filtered = DISCOVER_VIDEOS;
    if (selectedCategory) {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }
    return filtered;
  }, [selectedCategory]);

  const filteredLiveStreams = useMemo(() => {
    let filtered = LIVE_STREAMS;
    if (selectedCategory) {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }
    return filtered;
  }, [selectedCategory]);

  // const filteredAccounts = useMemo(() => {
  //   let accounts = [...SEARCH_ACCOUNTS].sort(
  //     (a, b) => b.totalViews - a.totalViews
  //   );

  //   if (accountFilter === "pro") {
  //     accounts = accounts.filter((a) => a.isPro);
  //   } else if (accountFilter === "verified") {
  //     accounts = accounts.filter((a) => a.isVerified);
  //   }

  //   if (searchQuery) {
  //     const query = searchQuery.toLowerCase();
  //     accounts = accounts.filter(
  //       (a) =>
  //         a.displayName.toLowerCase().includes(query) ||
  //         a.username.toLowerCase().includes(query)
  //     );
  //   }

  //   return accounts;
  // }, [accountFilter, searchQuery]);
  const filteredAccounts = useMemo(() => {
    let list = [...accounts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.displayName?.toLowerCase().includes(query) ||
          a.username?.toLowerCase().includes(query)
      );
    }

    return list;
  }, [accounts, searchQuery]);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const buildGridRows = (videos: typeof DISCOVER_VIDEOS) => {
    const rows: { items: GridItem[]; bigPosition: CardPosition }[] = [];
    let videoIndex = 0;
    let rowIndex = 0;

    while (videoIndex < videos.length) {
      const bigPosition = (rowIndex % 3) as CardPosition;
      const rowItems: GridItem[] = [];

      for (let col = 0; col < 3; col++) {
        if (col === bigPosition) {
          if (videoIndex < videos.length) {
            rowItems.push({
              video: videos[videoIndex],
              type: "big",
              isPlaying: true,
            });
            videoIndex++;
          }
        } else {
          const smallItems: GridItem[] = [];
          for (let i = 0; i < 2; i++) {
            if (videoIndex < videos.length) {
              smallItems.push({
                video: videos[videoIndex],
                type: "small",
                isPlaying: false,
              });
              videoIndex++;
            }
          }
          rowItems.push(...smallItems);
        }
      }

      if (rowItems.length > 0) {
        rows.push({ items: rowItems, bigPosition });
      }
      rowIndex++;
    }

    return rows;
  };

  const gridRows = buildGridRows(filteredVideos);
  const liveGridRows = useMemo(() => {
    return buildGridRows(
      filteredLiveStreams.map((l) => ({
        id: l.id,
        videoUrl: l.videoUrl,
        thumbnailUrl: l.thumbnailUrl,
        views: l.viewers,
        category: l.category,
      }))
    );
  }, [filteredLiveStreams]);

  const renderViewBadge = (views: number, isLive: boolean = false) => (
    <View style={[styles.viewsBadge, isLive && styles.liveViewsBadge]}>
      <Image
        source={Images.eye}
        style={{ height: 12, width: 12, tintColor: colors.white }}
      />

      <Text style={styles.viewsText}>{formatViews(views)}</Text>
    </View>
  );

  const handleCardPress = (videoId: string) => {
    const videoIndex = filteredVideos.findIndex((v) => v.id === videoId);
    router.push(`/video-feed?index=${videoIndex}` as Href);
  };

  const handleLiveCardPress = (liveId: string) => {
    router.push(`/live-feed?liveId=${liveId}` as Href);
  };

  const handleFollowToggle = useCallback(
    async (accountId: string, currentFollowing: boolean) => {
      try {
        const res = await post(`relationships/follow/${accountId}`);
        console.log("#######", res?.data);
        setFollowingState((prev) => ({
          ...prev,
          [accountId]: !currentFollowing,
        }));
      } catch (error) {
        console.error("Follow/unfollow failed", error);
      }
    },
    []
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setActiveSearchTab(null);
    setAccountFilter("all");
    setSelectedCategory(null);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (!hasSearchText) {
      setActiveSearchTab("Accounts");
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0 && activeSearchTab === "Accounts" && !hasSearchText) {
      setActiveSearchTab("Accounts");
    }
  };

  const renderBigCard = (item: GridItem, isLive: boolean = false) => (
    <TouchableOpacity
      key={item.video.id}
      style={styles.bigCard}
      activeOpacity={0.9}
      onPress={() =>
        isLive
          ? handleLiveCardPress(item.video.id)
          : handleCardPress(item.video.id)
      }
    >
      <Video
        source={{ uri: item.video.videoUrl }}
        style={styles.cardMedia}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        useNativeControls={false}
      />
      {renderViewBadge(item.video.views, isLive)}
    </TouchableOpacity>
  );

  const renderSmallCard = (item: GridItem, isLive: boolean = false) => (
    <TouchableOpacity
      key={item.video.id}
      style={styles.smallCard}
      activeOpacity={0.9}
      onPress={() =>
        isLive
          ? handleLiveCardPress(item.video.id)
          : handleCardPress(item.video.id)
      }
    >
      <Image
        source={{ uri: item.video.thumbnailUrl }}
        style={styles.cardMedia}
      />
      {renderViewBadge(item.video.views, isLive)}
    </TouchableOpacity>
  );

  const renderRow = (
    row: { items: GridItem[]; bigPosition: CardPosition },
    rowIndex: number,
    isLive: boolean = false
  ) => {
    const { items, bigPosition } = row;

    const bigItem = items.find((item) => item.type === "big");
    const smallItems = items.filter((item) => item.type === "small");

    const columns: React.ReactNode[] = [];
    let smallIndex = 0;

    for (let col = 0; col < 3; col++) {
      if (col === bigPosition && bigItem) {
        columns.push(
          <View key={`col-${col}`} style={styles.column}>
            {renderBigCard(bigItem, isLive)}
          </View>
        );
      } else {
        const colSmallItems = smallItems.slice(smallIndex, smallIndex + 2);
        smallIndex += 2;
        columns.push(
          <View key={`col-${col}`} style={styles.column}>
            {colSmallItems.map((item) => renderSmallCard(item, isLive))}
          </View>
        );
      }
    }

    return (
      <View key={rowIndex} style={styles.row}>
        {columns}
      </View>
    );
  };

  const renderAccountItem = ({ item }: { item: any }) => {
    const isFollowing = followingState[item.id] ?? item.isFollowing;
    console.log("--->", item);
    return (
      <View style={styles.accountItem}>
        <TouchableOpacity
          style={styles.accountInfo}
          onPress={() => router.push(`/profile/${item.id}` as Href)}
        >
          <View
            style={[
              styles.avatarContainer,
              item.isPro ? styles.proAvatarBorder : styles.regularAvatarBorder,
            ]}
          >
            <Image
              source={item.avatar ? { uri: item?.avatar } : Images.user}
              style={styles.avatar}
            />
          </View>
          <View style={styles.accountDetails}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.displayName, { color: theme.text }]}
                numberOfLines={1}
              >
                {item?.name}
              </Text>
              {item?.isVerified && (
                <ExpoIcons
                  family="MaterialIcons"
                  name="verified"
                  size={14}
                  color="#007BFF"
                />
              )}
            </View>
            <View style={styles.statsRow}>
              <Text style={[styles.username, { color: theme.textSecondary }]}>
                {item?.name}
              </Text>
              <View style={styles.dotSeparator} />
              <Text style={[styles.viewsCount, { color: theme.textSecondary }]}>
                {/* {formatViews(item.totalViews)} views */}
                1.2k views
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.accountActions}>
          {isFollowing ? (
            <>
              <TouchableOpacity
                style={styles.followingButtonGreen}
                onPress={() => handleFollowToggle(item.id, isFollowing)}
              >
                <Image
                  source={Images.check_user}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.messageButton,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => router.push(`/conversation/${item.id}` as Href)}
              >
                <ExpoIcons
                  family="MaterialIcons"
                  color={theme.text}
                  size={20}
                  name="chat-bubble"
                />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => handleFollowToggle(item._id, isFollowing)}
            >
              <Plus size={20} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSearchTabs = () => {
    if (!hasSearchText) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.searchTabsContainer}
        >
          <TouchableOpacity
            style={[
              styles.searchTab,
              { backgroundColor: isDarkMode ? "#fff" : "#121212" },
            ]}
          >
            <Text
              style={[
                styles.searchTabText,
                { color: isDarkMode ? "#121212" : "#FFFFFF" },
              ]}
            >
              Accounts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: theme.inputBackground },
              accountFilter === "pro" && isDarkMode && styles.filterDarkActive,
              accountFilter === "pro" && !isDarkMode && styles.filterTabActive,
            ]}
            onPress={() =>
              setAccountFilter(accountFilter === "pro" ? "all" : "pro")
            }
          >
            {isDarkMode ? (
              <ExpoIcons
                family="MaterialIcons"
                name="verified"
                size={18}
                color={accountFilter === "pro" ? "#121212" : "#FFFFFF"}
              />
            ) : (
              <ExpoIcons
                family="MaterialIcons"
                name="verified"
                size={18}
                color={accountFilter === "pro" ? "#FFFFFF" : "#121212"}
              />
            )}

            <Text
              style={[
                styles.filterTabText,
                {
                  color: theme.text,
                },
                accountFilter === "pro" &&
                  isDarkMode &&
                  styles.filterDarkActiveText,
                accountFilter === "pro" &&
                  !isDarkMode &&
                  styles.filterLightActiveText,
              ]}
            >
              Pro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: theme.inputBackground },
              accountFilter === "verified" &&
                isDarkMode &&
                styles.filterDarkActive,
              accountFilter === "verified" &&
                !isDarkMode &&
                styles.filterTabActive,
            ]}
            onPress={() =>
              setAccountFilter(
                accountFilter === "verified" ? "all" : "verified"
              )
            }
          >
            {isDarkMode ? (
              <ExpoIcons
                family="MaterialCommunityIcons"
                name={"shield-check"}
                size={18}
                color={accountFilter === "verified" ? "#121212" : "#fff"}
              />
            ) : (
              <ExpoIcons
                family="MaterialCommunityIcons"
                name={"shield-check"}
                size={18}
                color={accountFilter === "verified" ? "#FFFFFF" : "#121212"}
              />
            )}

            <Text
              style={[
                styles.filterTabText,
                {
                  color: theme.text,
                },
                accountFilter === "verified" &&
                  isDarkMode &&
                  styles.filterDarkActiveText,
                accountFilter === "verified" &&
                  !isDarkMode &&
                  styles.filterLightActiveText,
              ]}
            >
              Verified
            </Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.searchTabsContainer}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeSearchTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.searchTab,
                {
                  backgroundColor: isActive ? theme.text : theme.cardBackground,
                },
              ]}
              onPress={() => {
                setActiveSearchTab(isActive ? null : tab);
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  styles.searchTabText,
                  {
                    color: isActive ? theme.background : theme.text,
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}

        {activeSearchTab === "Accounts" && (
          <>
            <TouchableOpacity
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    accountFilter === "pro"
                      ? theme.text
                      : theme.inputBackground,
                },
              ]}
              onPress={() =>
                setAccountFilter(accountFilter === "pro" ? "all" : "pro")
              }
            >
              {isDarkMode ? (
                <ExpoIcons
                  family="MaterialIcons"
                  name={"verified"}
                  size={18}
                  color={accountFilter === "pro" ? "#121212" : "#fff"}
                />
              ) : (
                <ExpoIcons
                  family="MaterialIcons"
                  name={"verified"}
                  size={18}
                  color={accountFilter === "pro" ? "#FFFFFF" : "#121212"}
                />
              )}
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color:
                      accountFilter === "pro" ? theme.background : theme.text,
                  },
                ]}
              >
                Pro
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    accountFilter === "verified"
                      ? theme.text
                      : theme.inputBackground,
                },
              ]}
              onPress={() =>
                setAccountFilter(
                  accountFilter === "verified" ? "all" : "verified"
                )
              }
            >
              {isDarkMode ? (
                <ExpoIcons
                  family="MaterialCommunityIcons"
                  name={"shield-check"}
                  size={18}
                  color={accountFilter === "verified" ? "#121212" : "#fff"}
                />
              ) : (
                <ExpoIcons
                  family="MaterialCommunityIcons"
                  name={"shield-check"}
                  size={18}
                  color={accountFilter === "verified" ? "#FFFFFF" : "#121212"}
                />
              )}

              <Text
                style={[
                  styles.filterTabText,
                  {
                    color:
                      accountFilter === "verified"
                        ? theme.background
                        : theme.text,
                  },
                ]}
              >
                Verified
              </Text>
            </TouchableOpacity>
          </>
        )}

        {(activeSearchTab === "Reels" || activeSearchTab === "Live") && (
          <>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor: theme.inputBackground,
                  flexDirection: "row",
                  gap: 2,
                },
              ]}
            >
              <Text
                style={[styles.categoryText, { color: theme.textSecondary }]}
              >
                #midterms
              </Text>
              <ExpoIcons
                family="Entypo"
                name="cross"
                size={16}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
            {DISCOVER_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: theme.inputBackground },
                  selectedCategory === category.name &&
                    styles.categoryChipActive,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === category.name
                          ? "#121212"
                          : theme.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (!isSearchFocused) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {gridRows.map((row, index) => renderRow(row, index))}
          </View>
        </ScrollView>
      );
    }

    if (!hasSearchText) {
      return (
        <FlatList
          data={filteredAccounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.accountsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
          )}
        />
      );
    }

    if (activeSearchTab === null) {
      return (
        <View style={styles.selectTabPrompt}>
          <Text style={[styles.selectTabText, { color: theme.textSecondary }]}>
            Select a tab to see results
          </Text>
        </View>
      );
    }

    if (activeSearchTab === "Accounts") {
      return (
        <FlatList
          data={filteredAccounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.accountsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
          )}
        />
      );
    }

    if (activeSearchTab === "Reels") {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {gridRows.map((row, index) => renderRow(row, index, false))}
          </View>
        </ScrollView>
      );
    }

    if (activeSearchTab === "Live") {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {liveGridRows.map((row, index) => renderRow(row, index, true))}
          </View>
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.inputBackground },
            ]}
          >
            <Image
              source={Images.search}
              style={{ height: 24, width: 24, tintColor: theme.textSecondary }}
            />

            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={
                isSearchFocused
                  ? hasSearchText
                    ? "Search..."
                    : "Elon X..."
                  : "Search Accounts, Reels, Live..."
              }
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {(searchQuery.length > 0 || isSearchFocused) && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={{
                  height: 18.33,
                  width: 18.33,
                  borderRadius: 99,
                  backgroundColor: theme.tabInactive,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpoIcons
                  family="Entypo"
                  name="cross"
                  color={theme.background}
                  size={17}
                />
              </TouchableOpacity>
            )}
          </View>
          {isSearchFocused &&
            (activeSearchTab === "Accounts" || !hasSearchText) && (
              <TouchableOpacity
                style={[styles.filterButton, { borderColor: theme.border }]}
              >
                <Image
                  source={Images.adjust}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: isDarkMode ? "#fff" : "#121212",
                  }}
                />
                {/* <Sliders size={20} color={theme.text} strokeWidth={2} /> */}
              </TouchableOpacity>
            )}
        </View>
        {!isSearchFocused && (
          <Text
            style={{
              fontSize: 22,
              color: theme.text,
              fontFamily: "Poppins_600SemiBold_Italic",
            }}
          >
            Best of Jan 24th 2025
          </Text>
        )}
        {isSearchFocused && renderSearchTabs()}
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 70,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    fontWeight: "500" as const,

    color: "#121212",
    padding: 0,
    margin: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(18, 18, 18, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchTabsContainer: {
    flexDirection: "row",
    gap: 4,
    paddingBottom: 4,
  },
  searchTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 32,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchTabActive: {
    backgroundColor: "#121212",
  },
  searchTabText: {
    fontSize: 14,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingLeft: 6,
    paddingVertical: 6,
    height: 32,
    borderRadius: 8,
    gap: 2,
  },
  accountLightActive: {
    backgroundColor: "#121212",
  },
  accountDarkAccont: {
    backgroundColor: "#fff",
  },
  filterTabActive: {
    backgroundColor: "#121212",
  },
  filterDarkActive: {
    backgroundColor: "#fff",
  },
  filterTabText: {
    fontSize: 14,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  filterDarkActiveText: {
    color: "#121212",
  },
  filterLightActiveText: {
    color: "#fff",
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 32,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: "#FFFFFF",
  },
  categoryText: {
    fontSize: 14,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 98,
  },
  gridContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    height: ROW_HEIGHT,
    gap: CARD_GAP,
  },
  column: {
    width: COLUMN_WIDTH,
    height: ROW_HEIGHT,
    gap: CARD_GAP,
  },
  bigCard: {
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  smallCard: {
    height: SMALL_CARD_HEIGHT,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  cardMedia: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  viewsBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 87.5,
    gap: 2,
  },
  liveViewsBadge: {
    backgroundColor: "#FF4D67",
  },
  viewsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600" as const,
    letterSpacing: -0.24,
  },
  accountsList: {
    paddingHorizontal: 12,
    paddingBottom: 98,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 100,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  proAvatarBorder: {
    borderWidth: 2,
    borderColor: "#014D3A",
  },
  regularAvatarBorder: {
    borderWidth: 2,
    borderColor: "rgba(18, 18, 18, 0.64)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  accountDetails: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  displayName: {
    fontSize: 16,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",

    letterSpacing: -0.5,
    textTransform: "capitalize",
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    fontSize: 14,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",

    letterSpacing: -0.14,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 100,
    backgroundColor: "rgba(18, 18, 18, 0.16)",
  },
  viewsCount: {
    fontSize: 12,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",

    letterSpacing: -0.24,
  },
  accountActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  followingButtonGreen: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#014D3A",
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
  },
  selectTabPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  selectTabText: {
    fontSize: 16,

    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
});
