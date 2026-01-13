import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Images } from "@/assets/images";
import Blur from "@/components/Blur";
import CustomButton from "@/components/CustomButton";
import CustomText from "@/components/CustomText";
// import Video from "react-native-video";
const Video = (props) => (
  <View {...props} style={[props.style, { backgroundColor: "black" }]} />
);
import { post } from "@/services/ApiRequest";
import ExpoIcons from "@/components/ExpoIcons";
import Colors from "@/constants/colors";
import { Image } from "expo-image";
import { useApp } from "@/contexts/AppContext";
import { useSelector } from "react-redux";
const { width, height } = Dimensions.get("window");

// Mapping between emoji display and API reaction values
const EMOJI_MAPPING: any = {
  "😀": "grinning",
  "😂": "joy",
  "😍": "heart_eyes",
  "🥲": "smiling_face_with_tear",
  "😎": "sunglasses",
  "🤯": "exploding_head",
  "😭": "sob",
  "🔥": "fire",
  "❤️": "love",
  "👍": "like",
};

const EMOJIS = ["😀", "😂", "😍", "🥲", "😎", "🤯", "😭", "🔥", "❤️", "👍"];

const FloatingReaction = ({ emoji, startX, onComplete }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const duration = 2000 + Math.random() * 1000;
    const swayAmplitude = 20 + Math.random() * 30;
    const swayDuration = 500 + Math.random() * 500;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -height * 0.3 - Math.random() * 200,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: startX + swayAmplitude,
            duration: swayDuration,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: startX - swayAmplitude,
            duration: swayDuration,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start(() => onComplete && onComplete());
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        fontSize: 30 + Math.random() * 20,
        opacity,
        transform: [{ translateY }, { translateX }],
        zIndex: 1000,
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

const StoryViewer = () => {
  const insets = useSafeAreaInsets();
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const {
    userStories = [],
    initialUserIndex = 0,
    isMyStories,
  } = route?.params || {};

  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const flatStories = useMemo(() => {
    let flattened: any = [];
    userStories?.forEach((user: any, uIdx: any) => {
      user.stories.forEach((story: any, sIdx: any) => {
        flattened.push({
          ...story,
          userIndex: uIdx,
          storyIndex: sIdx,
          userInfo: user,
          totalStories: user.stories.length,
        });
      });
    });
    return flattened;
  }, [userStories]);

  const initialGlobalIndex = useMemo(() => {
    return flatStories.findIndex((s) => s.userIndex === initialUserIndex) || 0;
  }, [flatStories, initialUserIndex]);

  const [currentIndex, setCurrentIndex] = useState(initialGlobalIndex);
  const [isPaused, setIsPaused] = useState(false);
  const pausedProgress = useRef(0);
  const videoRef = useRef(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [reactionCounts, setReactionCounts] = useState(() => {
    // Initialize with animation values
    return Object.keys(EMOJI_MAPPING).reduce((acc, emoji): any => {
      acc[emoji] = {
        count: 0,
        scaleAnim: new Animated.Value(1),
      };
      return acc;
    }, {});
  });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<any> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentItem = flatStories[currentIndex];

  // Initialize reaction counts when current item changes
  useEffect(() => {
    if (currentItem?.stats?.reactions) {
      const newCounts = { ...reactionCounts };

      Object.entries(EMOJI_MAPPING).forEach(([emoji, reactionKey]) => {
        const count: any = currentItem.stats.reactions[reactionKey] || 0;
        newCounts[emoji] = {
          ...newCounts[emoji],
          count,
        };
      });

      setReactionCounts(newCounts);
    }
  }, [currentItem]);

  // Animation Logic - Optimized
  useEffect(() => {
    if (!currentItem) return;

    // Track story view
    const trackView = async () => {
      try {
        if (currentItem._id) {
          const url = `stories/${currentItem?._id}/view`;
          const response = await post(url);
        }
      } catch (error) {
        console.log("Error tracking story view:", error);
      }
    };
    trackView();

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Only reset progress when index changes, not when pausing
    progressAnim.setValue(0);
    pausedProgress.current = 0;

    if (!isPaused) {
      startProgressAnimation();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [currentIndex, currentItem]);

  // Separate useEffect to handle pause/resume
  useEffect(() => {
    if (!currentItem) return;

    if (isPaused) {
      // Save current progress when pausing
      if (animationRef.current) {
        animationRef.current.stop();
        // @ts-ignore
        pausedProgress.current = progressAnim._value;
        animationRef.current = null;
      }
    } else {
      // Resume from paused position
      startProgressAnimation();
    }
  }, [isPaused]);

  const startProgressAnimation = () => {
    const duration =
      currentItem?.media?.type === "video"
        ? (currentItem?.media?.duration || 15) * 1000
        : 5000;

    // Calculate remaining duration based on paused progress
    const currentProgress = pausedProgress.current;
    const remainingDuration = duration * (1 - currentProgress);

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }: { finished: any }) => {
      if (finished) {
        goToNext();
      }
      animationRef.current = null;
    });
  };

  const goToNext = useCallback(() => {
    if (currentIndex < flatStories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    } else {
      navigation.goBack();
    }
  }, [currentIndex, flatStories.length, navigation]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
    } else {
      navigation.goBack();
    }
  }, [currentIndex, navigation]);

  const handlePress = useCallback(
    (evt?: any) => {
      const { locationX } = evt.nativeEvent;
      if (locationX < width / 2) {
        goToPrev();
      } else {
        goToNext();
      }
    },
    [goToPrev, goToNext]
  );

  const handleEmojiPress = useCallback(
    async (emoji?: any) => {
      const reactionType: any = EMOJI_MAPPING[emoji];

      if (!reactionType || !currentItem?._id) return;

      try {
        // Make API call to post reaction
        const url = `stories/${currentItem._id}/reactions`;
        const response = await post(url, { reaction: reactionType });

        // Update local state with +1 count
        setReactionCounts((prev: any) => ({
          ...prev,
          [emoji]: {
            ...prev[emoji],
            count: prev[emoji].count + 1,
          },
        }));

        // Animation for the emoji button
        Animated.sequence([
          Animated.timing(reactionCounts[emoji].scaleAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(reactionCounts[emoji].scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Create floating emojis
        const newEmojis: any = [];
        const count = 40 + Math.floor(Math.random() * 10);

        for (let i = 0; i < count; i++) {
          newEmojis.push({
            id: Date.now() + i + Math.random(),
            emoji: emoji,
            startX: Math.random() * width,
          });
        }

        setFloatingEmojis((prev): any => [...prev, ...newEmojis]);
      } catch (error) {
        console.log("Error posting reaction:", error);
      }
    },
    [currentItem, reactionCounts]
  );

  const removeEmoji = useCallback((id?: any) => {
    setFloatingEmojis((prev) => prev.filter((e) => e?.id !== id));
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null && index !== undefined && index !== currentIndex) {
          setCurrentIndex(index);
        }
      }
    }
  ).current;

  const renderProgressBars = useCallback(() => {
    if (!currentItem) return null;
    const { storyIndex, totalStories } = currentItem;

    return (
      <View style={styles.progressBarContainer}>
        {Array.from({ length: totalStories }).map((_, idx) => {
          return (
            <View key={idx} style={styles.progressBarBackground}>
              {idx === storyIndex ? (
                <Animated.View
                  style={[
                    styles.progressBarForeground,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.progressBarForeground,
                    { width: idx < storyIndex ? "100%" : "0%" },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  }, [currentItem, progressAnim]);

  const renderStoryItem = useCallback(
    ({ item }: { item: any }) => {
      const isCurrentItem = flatStories[currentIndex] === item;

      return (
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.storyItemContainer,
            {
              width: width,
              height: height,
            },
          ]}
          onPress={handlePress}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          delayLongPress={200}
        >
          {item?.media?.type === "video" ? (
            <Video
              ref={isCurrentItem ? videoRef : null}
              source={{ uri: item.media.url }}
              style={styles.storyImage}
              // resizeMode="contain"
              paused={isPaused || !isCurrentItem}
              repeat={false}
              playInBackground={false}
              playWhenInactive={false}
              onLoad={(data: any) => {
                // Update duration if different from expected
                if (isCurrentItem && data.duration) {
                  item.media.duration = data.duration;
                }
              }}
            />
          ) : (
            <Image
              source={{ uri: item?.media?.url }}
              style={styles.storyImage}
              // resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      );
    },
    [currentIndex, flatStories, handlePress, isPaused]
  );
  const actualUser = useSelector((state: any) => state?.users?.userData);
  if (!currentItem) return null;

  const { userInfo } = currentItem;

  return (
    <View style={{ backgroundColor: Colors.black }}>
      <StatusBar barStyle="light-content" />

      <FlatList
        ref={flatListRef}
        data={flatStories}
        renderItem={renderStoryItem}
        keyExtractor={(item, index) => `story-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        scrollEnabled={!isPaused}
        initialScrollIndex={initialGlobalIndex}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        windowSize={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
      />

      {floatingEmojis.map((item: any) => (
        <FloatingReaction
          key={item.id}
          emoji={item.emoji}
          startX={item.startX}
          onComplete={() => removeEmoji(item.id)}
        />
      ))}

      <View style={[styles.overlayContainer, { bottom: insets.bottom }]}>
        {!isMyStories && (
          <View style={styles.emojiStripContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.emojiStripContent}
            >
              {EMOJIS.map((emoji, idx: any) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.emojiButtonContainer}
                  activeOpacity={0.7}
                  onPress={() => handleEmojiPress(emoji, idx)}
                >
                  <View style={styles.emojiButton}>
                    <Blur blurAmount={10} style={StyleSheet.absoluteFill} />
                    <View style={styles.emojiContent}>
                      <CustomText label={emoji} fontSize={20} />
                      <Animated.View
                        style={[
                          styles.countContainer,
                          {
                            transform: [
                              { scale: reactionCounts[emoji]?.scaleAnim || 1 },
                            ],
                          },
                        ]}
                      >
                        <CustomText
                          label={
                            reactionCounts[emoji]?.count?.toString() || "0"
                          }
                          fontFamily={"Poppins_500Medium"}
                        />
                      </Animated.View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {renderProgressBars()}
      </View>

      <View style={[styles.overlayContainer, { top: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.leftHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Blur />
              <Image source={Images.back} style={styles.backIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userInfo}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("UserProfile", {
                  item: currentItem,
                })
              }
            >
              <View style={styles.avatarContainer}>
                {/* <Image source={userInfo.userImage} style={styles.avatar} /> */}
                <Image source={Images.user} style={styles.avatar} />
              </View>
              <View style={styles.userTexts}>
                <View style={styles.nameRow}>
                  <CustomText
                    label={
                      isMyStories ? actualUser?.name : userInfo?.user[0]?.name
                    }
                    color={theme.text}
                    fontFamily={"Poppins_600SemiBold"}
                    fontSize={14}
                  />
                  <ExpoIcons
                    family="MaterialIcons"
                    name="verified"
                    size={14}
                    color={Colors.iosBlue}
                  />
                </View>
                {!isMyStories && (
                  <CustomText
                    label={`@${userInfo.username?.toLowerCase() || "username"}`}
                    color={theme.tabInactive}
                    fontSize={12}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.rightHeader}>
            {!isMyStories && (
              <CustomButton
                title={"Follow"}
                width={80}
                height={32}
                borderRadius={8}
                fontSize={14}
                backgroundColor={"rgba(255, 255, 255, 0.2)"}
                color={theme.text}
              />
            )}

            <TouchableOpacity style={styles.moreButton}>
              <Blur />
              <ExpoIcons
                family="Feather"
                name="more-vertical"
                color={Colors.white}
                size={22}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storyItemContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  progressBarContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBarForeground: {
    height: "100%",
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.white,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userTexts: {
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moreButton: {
    height: 32,
    width: 32,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  moreIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    tintColor: Colors.white,
  },
  backIcon: {
    height: 24,
    width: 24,
  },
  emojiStripContainer: {
    marginBottom: 20,
  },
  emojiStripContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  emojiButton: {
    width: 60,
    height: 40,
    borderRadius: 99,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiButtonContainer: {
    width: 70,
    height: 48,
    borderRadius: 99,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.whiteOpacity48,
  },
  emojiContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  countContainer: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StoryViewer;
