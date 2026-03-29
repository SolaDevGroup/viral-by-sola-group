import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Animated,
  Platform,
  Image,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  useNavigation,
  router,
  useFocusEffect,
  useLocalSearchParams,
  Href,
} from "expo-router";
import { Play, ArrowDown, Star, Users, Rss } from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";
import CommentsSheet from "@/components/CommentsSheet";
import ShortCard from "@/components/ShortCard";
import NewFollowerAlert from "@/components/NewFollowerAlert";
import { MOCK_SHORTS } from "@/constants/mockData";
import type { Short } from "@/types";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import ExpoIcons from "@/components/ExpoIcons";
import { Images } from "@/assets/images";
import { get } from "@/services/ApiRequest";
import MomentCard from "@/components/MomentCard";
import SimpleTextAlert from "@/components/TextAlert";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 140;
const MOMENTS_HEIGHT = 110;
const TAB_BAR_HEIGHT = 83;
const FIRST_CARD_HEIGHT =
  SCREEN_HEIGHT - HEADER_HEIGHT - MOMENTS_HEIGHT - TAB_BAR_HEIGHT;
const EXPANDED_CARD_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT;

const CATEGORIES = [
  {
    name: "Technology",
    color: "#014D3A",
    iconColor: "#12FFAA",
  },
  {
    name: "Politics",
    color: "#4D013A",
    iconColor: "#FFB3E6",
  },
  {
    name: "Sports",
    color: "#4D3A01",
    iconColor: "#FFE58A",
  },
  {
    name: "Music",
    color: "#3A014D",
    iconColor: "#E6B3FF",
  },
  {
    name: "Fashion",
    color: "#4D0126",
    iconColor: "#FFB3CC",
  },
  {
    name: "Entertainment",
    color: "#264D01",
    iconColor: "#D6FF8A", // lime green
  },
  {
    name: "Gaming",
    color: "#01264D",
    iconColor: "#8AC6FF", // electric blue
  },
  {
    name: "Food",
    color: "#4D2601",
    iconColor: "#FFD6A5", // peach
  },
  {
    name: "Health",
    color: "#014D26",
    iconColor: "#8AFFC1", // fresh green
  },
];

type FeedType = "social" | "friends" | "favorites";

export default function HomeScreen() {
  const isFocus = useIsFocused();
  const navigation: any = useNavigation();
  const isAtTopRef = useRef(true);
  const [storiesData, setStoriesData] = useState([]);
  const swipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // detect horizontal swipe only
        return Math.abs(gesture.dx) > 20 && Math.abs(gesture.dy) < 20;
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -50) {
          // swipe left → Live
          setActiveTab("live");
        } else if (gesture.dx > 50) {
          // swipe right → Reels
          setActiveTab("reels");
        }
      },
    })
  ).current;

  const params = useLocalSearchParams<{ showFeedSelector?: string }>();
  const {
    isDarkMode,
    accentColor,
    isStoryUploading,
    actualUser,
    isStoryUploaded,
  } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "Technology"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRefreshNotif, setShowRefreshNotif] = useState(false);
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(false);
  const [selectedShortId, setSelectedShortId] = useState<string>("");
  const [showFeedSelector, setShowFeedSelector] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>("social");
  const [activeTab, setActiveTab] = useState<"reels" | "live">("reels");
  const [newFollower, setNewFollower] = useState<{
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  } | null>(null);
  const feedSelectorOpacity = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const momentsTranslateY = useRef(new Animated.Value(0)).current;
  const refreshNotifTranslateY = useRef(new Animated.Value(-100)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<"up" | "down">("down");
  const [isTabBarVisibleState, setIsTabBarVisibleState] = useState(true);
  const [mystoreis, setMyStories] = useState([]);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  const selectedIconColor = useMemo(() => {
    if (!selectedCategory) return "#12FFAA";
    const cat = CATEGORIES.find((c) => c.name === selectedCategory);
    return cat?.iconColor;
  }, [selectedCategory]);

  const selectedCategoryColor = useMemo(() => {
    if (!selectedCategory) return accentColor;
    const cat = CATEGORIES.find((c) => c.name === selectedCategory);
    return cat?.color || accentColor;
  }, [selectedCategory, accentColor]);

  const toggleFeedSelector = () => {
    if (showFeedSelector) {
      Animated.timing(feedSelectorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowFeedSelector(false));
    } else {
      setShowFeedSelector(true);
      Animated.timing(feedSelectorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const selectFeedType = (type: FeedType) => {
    setSelectedFeedType(type);
    Animated.timing(feedSelectorOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowFeedSelector(false));
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    if (params.showFeedSelector === "true") {
      setShowFeedSelector(true);
      Animated.timing(feedSelectorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      router.setParams({ showFeedSelector: undefined });
    }
  }, [params.showFeedSelector, feedSelectorOpacity]);

  useEffect(() => {
    const followerTimer = setTimeout(() => {
      setNewFollower({
        id: "follower-1",
        username: "Abassi Konaté",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        isVerified: true,
      });
    }, 5000);

    return () => clearTimeout(followerTimer);
  }, []);

  useEffect(() => {
    getStories();
  }, [isFocus]);
  useEffect(() => {
    getMyStories();
  }, [isFocus, isStoryUploading]);
  const getStories = async () => {
    try {
      const response: any = await get("stories");
      setStoriesData(response.data?.data || []);
    } catch (error) {
      console.log("getStories error", error);
    }
  };
  const getMyStories = async () => {
    try {
      const response: any = await get("stories/me");
      setMyStories(response.data?.data || []);
    } catch (error) {
      console.log("getStories error", error);
    }
  };
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setShowRefreshNotif(true);
      Animated.timing(refreshNotifTranslateY, {
        toValue: HEADER_HEIGHT + 16,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(refreshNotifTranslateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowRefreshNotif(false);
        });
      }, 3000);
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, [refreshNotifTranslateY]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index || 0;
      setCurrentIndex(index);

      if (index > 0) {
        if (scrollDirection.current === "down") {
          navigation.setOptions({ tabBarStyle: { display: "none" } });
        }
        Animated.timing(momentsTranslateY, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        navigation.setOptions({
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            borderTopWidth: 1,
          },
        });
        Animated.timing(momentsTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const direction = currentScrollY > lastScrollY.current ? "down" : "up";
        scrollDirection.current = direction;
        lastScrollY.current = currentScrollY;
        if (currentIndex > 0) {
          if (direction === "up") {
            setIsTabBarVisibleState(true);
            navigation.setOptions({
              tabBarStyle: {
                backgroundColor: theme.background,
                borderTopColor: theme.border,
                borderTopWidth: 1,
              },
            });
          } else if (direction === "down") {
            setIsTabBarVisibleState(false);
            navigation.setOptions({ tabBarStyle: { display: "none" } });
          }
        } else {
          setIsTabBarVisibleState(true);
        }
      },
    }
  );

  const getCardHeight = (index: number) => {
    if (index === 0) {
      return FIRST_CARD_HEIGHT;
    }
    return EXPANDED_CARD_HEIGHT;
  };

 const getItemLayout = (_: any, index: number) => {
  // All items have same height, so calculation is simpler
  const offset = index * EXPANDED_CARD_HEIGHT;
  return {
    length: EXPANDED_CARD_HEIGHT,
    offset,
    index,
  };
};

  const snapOffsets = MOCK_SHORTS.map((_, index) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getCardHeight(i);
    }

    return index === 0 ? offset : offset + MOMENTS_HEIGHT;
  });

  const handleCardPress = (index: number) => {
    router.push(`/video-feed?index=${index}` as Href);
  };

  const renderShort = ({ item, index }: { item: Short; index: number }) => {
    const isActive = index === currentIndex && isScreenFocused;

    const isTabBarVisible = index === 0 ? true : isTabBarVisibleState;

    const isMomentsVisible = index === 0 && activeTab == "reels";

    let cardHeight = SCREEN_HEIGHT - HEADER_HEIGHT;
    if (isMomentsVisible) {
      cardHeight -= MOMENTS_HEIGHT;
    }
    if (isTabBarVisible) {
      cardHeight -= TAB_BAR_HEIGHT;
    }

    // Add this before your return statement (around line 340)
 

    return (
      <ShortCard
        short={item}
        isActive={isActive}
        height={cardHeight}
        showFullUI={false}
        hasNavBar={index === 0}
        isTabBarVisible={isTabBarVisible}
        isMomentsVisible={isMomentsVisible}
        categoryColor={selectedCategoryColor}
        onPress={() => handleCardPress(index)}
        onCommentPress={() => {
          setSelectedShortId(item.id);
          setCommentsSheetVisible(true);
        }}
      />
    );
  };

  return (
    <View style={styles.container} {...swipeResponder.panHandlers}>
      <View style={styles.headerWrapper}>
        {Platform.OS === "web" ? (
          <View style={styles.headerWebFallback}>
            <LinearGradient
              colors={["#121212", `${selectedCategoryColor}A3`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ) : (
          <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={["#121212", `${selectedCategoryColor}A3`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </BlurView>
        )}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.tabsWrapper}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab("reels")}
              >
                <Text
                  style={
                    activeTab === "reels"
                      ? styles.tabTextActive
                      : styles.tabTextInactive
                  }
                >
                  {activeTab === "reels" ? "Reels" : "Reels"}
                  {activeTab === "reels" && (
                    <Text style={{ color: selectedIconColor }}>.</Text>
                  )}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => {
                  setActiveTab("live");
                  // router.push("/live-feed" as Href);
                }}
              >
                <Text
                  style={
                    activeTab === "live"
                      ? styles.tabTextActive
                      : styles.tabTextInactive
                  }
                >
                  {activeTab === "live" ? "Live" : "Live"}
                  {activeTab === "live" && (
                    <Text style={{ color: "#EE1045" }}>.</Text>
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => router.push("/notifications" as Href)}
              >
                <Image
                  source={Images.bell}
                  style={{ width: 24, height: 24, tintColor: Colors.white }}
                />

                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => router.push("/chat-list" as Href)}
              >
                <Image
                  source={Images.inbox}
                  style={{ width: 32, height: 32, tintColor: Colors.white }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity
              style={styles.filterIconBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <ExpoIcons
                family="Ionicons"
                name="compass-sharp"
                size={16}
                color={"#fff"}
              />
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.name && {
                    backgroundColor: cat.color,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      {activeTab == "reels" && (
        <Animated.View
          style={[
            styles.momentsSection,
            { transform: [{ translateY: momentsTranslateY }] },
          ]}
          pointerEvents={currentIndex === 0 ? "auto" : "none"}
        >
          <MomentCard
            myStories={mystoreis}
            storiesData={storiesData}
            selectedCategory={selectedCategory}
            selectedCategoryColor={selectedCategoryColor}
            selectedIconColor={selectedIconColor}
          />
        </Animated.View>
      )}

      <FlatList
        ref={flatListRef}
        data={MOCK_SHORTS}
        renderItem={renderShort}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={getItemLayout}
        contentContainerStyle={
          activeTab == "reels"
            ? styles.flatListContent
            : { paddingTop: HEADER_HEIGHT }
        }
      />

      {showRefreshNotif && (
        <Animated.View
          style={[
            styles.refreshNotification,
            { transform: [{ translateY: refreshNotifTranslateY }] },
          ]}
        >
          <View style={styles.refreshNotifContent}>
            <ArrowDown size={16} color="#12FFAA" />
            <Text style={styles.refreshNotifText}>New Shorts available</Text>
          </View>
        </Animated.View>
      )}

      <CommentsSheet
        visible={commentsSheetVisible}
        onClose={() => setCommentsSheetVisible(false)}
        videoId={selectedShortId}
        comments={[]}
      />

      <NewFollowerAlert
        follower={newFollower}
        headerHeight={HEADER_HEIGHT}
        onFollowBack={(followerId) => {
          console.log("Follow back:", followerId);
          setNewFollower(null);
        }}
        onDismiss={() => setNewFollower(null)}
      />

      {showFeedSelector && (
        <Animated.View
          style={[styles.feedSelectorOverlay, { opacity: feedSelectorOpacity }]}
        >
          <TouchableOpacity
            style={styles.feedSelectorBackdrop}
            activeOpacity={1}
            onPress={toggleFeedSelector}
          >
            <LinearGradient
              colors={["rgba(18, 18, 18, 0)", "#12FFAA"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.feedSelectorGradient}
            />
          </TouchableOpacity>

          <View style={styles.feedSelectorContent}>
            <TouchableOpacity
              style={styles.feedOption}
              onPress={() => selectFeedType("favorites")}
            >
              <View
                style={[
                  styles.feedOptionIcon,
                  selectedFeedType === "favorites" &&
                    styles.feedOptionIconActive,
                ]}
              >
                <Star
                  size={24}
                  color={
                    selectedFeedType === "favorites" ? "#121212" : "#FFFFFF"
                  }
                  fill={
                    selectedFeedType === "favorites" ? "#121212" : "#FFFFFF"
                  }
                />
              </View>
              <Text
                style={[
                  styles.feedOptionText,
                  selectedFeedType === "favorites" &&
                    styles.feedOptionTextActive,
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feedOption}
              onPress={() => selectFeedType("friends")}
            >
              <View
                style={[
                  styles.feedOptionIcon,
                  selectedFeedType === "friends" && styles.feedOptionIconActive,
                ]}
              >
                <Users
                  size={24}
                  color={selectedFeedType === "friends" ? "#121212" : "#FFFFFF"}
                />
              </View>
              <Text
                style={[
                  styles.feedOptionText,
                  selectedFeedType === "friends" && styles.feedOptionTextActive,
                ]}
              >
                Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feedOption}
              onPress={() => selectFeedType("social")}
            >
              <View
                style={[
                  styles.feedOptionIcon,
                  selectedFeedType === "social" && styles.feedOptionIconActive,
                ]}
              >
                <Rss
                  size={24}
                  color={selectedFeedType === "social" ? "#121212" : "#FFFFFF"}
                />
              </View>
              <Text
                style={[
                  styles.feedOptionText,
                  selectedFeedType === "social" && styles.feedOptionTextActive,
                ]}
              >
                Social Feed
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      <SimpleTextAlert
        visible={isStoryUploaded}
        title="Success"
        // onHide={() => setShowAlert(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerWrapper: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerWebFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18, 18, 18, 0.64)",
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  tabsWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 2,
    flex: 1,
  },
  tabItem: {
    paddingHorizontal: 4,
  },
  tabTextActive: {
    fontSize: 32,
    fontWeight: "600",

    color: Colors.white,
    letterSpacing: -1.92,
    fontFamily: "Poppins_600SemiBold_Italic",
  },
  tabTextInactive: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: Colors.whiteOpacity48,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EE1045",
    top: 4,
    right: 4,
    zIndex: 1,
  },
  categoriesContainer: {
    marginTop: 4,
  },
  categoriesContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 12,
  },
  filterIconBtn: {
    width: 36,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBtn: {
    paddingHorizontal: 10,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.white,
    fontFamily: "Poppins_500Medium",
  },
  momentsSection: {
    position: "absolute" as const,
    top: 136,
    left: 0,
    right: 0,
    backgroundColor: "#121212",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    zIndex: 9,
  },
  momentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  momentsTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  momentsLabel: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.whiteOpacity48,
  },
  momentsCount: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playAllText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    color: Colors.white,
  },
  momentsScroll: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 1,
  },
  momentItem: {
    alignItems: "center",
  },
  momentCircle: {
    width: 63,
    height: 63,
    // borderRadius: 32,
    // borderWidth: 2,
    // borderColor: "rgba(255, 255, 255, 0.16)",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  momentAdd: {
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
  momentAddInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#121212",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 24,
    color: "#12FFAA",
  },
  momentCircleLive: {
    borderStyle: "dashed" as const,
  },
  momentImageWrapper: {
    position: "relative" as const,
  },
  momentImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: "hidden" as const,
  },
  momentImageInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  momentBadge: {
    position: "absolute" as const,

    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "#121212",
    zIndex: 10,
    flexDirection: "row",
    gap: 2,
  },

  momentBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
  },
  momentLiveBadge: {
    position: "absolute" as const,
    bottom: -6,
    left: "50%" as const,
    marginLeft: -20,
    backgroundColor: "#EE1045",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#121212",
    zIndex: 10,
  },
  momentLiveText: {
    fontSize: 9,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  flatListContent: {
    paddingTop: HEADER_HEIGHT + MOMENTS_HEIGHT,
  },
  refreshNotification: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    zIndex: 11,
  },
  refreshNotifContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 18, 18, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(18, 255, 170, 0.3)",
  },
  refreshNotifText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  feedSelectorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  feedSelectorBackdrop: {
    flex: 1,
  },
  feedSelectorGradient: {
    flex: 1,
  },
  feedSelectorContent: {
    position: "absolute",
    bottom: 100,
    left: 16,
    gap: 12,
  },
  feedOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  feedOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00B080",
    justifyContent: "center",
    alignItems: "center",
  },
  feedOptionIconActive: {
    backgroundColor: "#FFFFFF",
  },
  feedOptionText: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.64)",
    letterSpacing: -0.5,
    fontFamily: "Poppins_600SemiBold",
  },
  feedOptionTextActive: {
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
  },
});
