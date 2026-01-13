import { useNavigation } from "@react-navigation/native";
import { getPalette } from "@somesoap/react-native-image-palette";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Video from "react-native-video";

import CustomText from "@/components/CustomText";
import ExpoIcons from "./ExpoIcons";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { Images } from "@/assets/images";
import { useApp } from "@/contexts/AppContext";
import RevolvingCircle from "./RevolvingCircle";
import { useSelector } from "react-redux";

const StoryBorder = ({ segments = 1, size = 72, colors = [] }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapAngle = segments == 1 ? 0 : 15;
  const totalGapAngle = gapAngle * segments;
  const segmentAngle = (360 - totalGapAngle) / segments;

  const segmentLength = (segmentAngle / 360) * circumference;

  // Fallback to your original colors if the prop is empty
  const activeColors =
    colors.length > 0 ? colors : [Colors.error, Colors.iosBlue, Colors.primary];

  return (
    <Svg width={size} height={size} style={styles.storyBorder}>
      {Array.from({ length: segments }).map((_, index) => {
        // Calculate the rotation for this specific segment
        // They are spaced evenly by (360 / segments) degrees
        const rotateAngle = -90 + index * (360 / segments);

        // Pick a color, cycling if there are fewer colors than segments
        const strokeColor = activeColors[index % activeColors.length];

        return (
          <Circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            // Draw one segment (segmentLength) and leave the rest of the circle empty
            strokeDasharray={`${segmentLength} ${
              circumference - segmentLength
            }`}
            strokeLinecap="round"
            rotation={rotateAngle}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}
    </Svg>
  );
};

const MomentItem = ({
  item,
  index,
  navigation,
  handleStoryPress,
  selectedCategory,
  selectedCategoryColor,
  selectedIconColor,
  userData,
  myStories,
}: {
  item: any;
  index: any;
  navigation: any;
  handleStoryPress: any;
  selectedCategory: any;
  selectedCategoryColor: any;
  selectedIconColor: any;
  userData?: object | any;
  myStories?: null | any;
}) => {
  const stories = Array.isArray(item.stories) ? item.stories : [];
  const [storyColors, setStoryColors] = useState([]);
  const { isStoryUploading } = useApp();
  // const { userData } = useSelector((state) => state.users);
  const currentUserId = userData?._id; // This is the LOGGED IN user's ID

  useEffect(() => {
    if (!item?.stories || !currentUserId) return;

    const extractColors = async () => {
      const colors: any = [];

      for (const story of stories) {
        if (story?.media?.type === "image" && story.media?.url) {
          try {
            const palette = await getPalette(story.media.url);
            if (palette?.vibrant) {
              colors.push(palette.vibrant);
            } else if (palette?.muted) {
              colors.push(palette.muted);
            } else if (palette?.darkMuted) {
              colors.push(palette.darkMuted);
            } else {
              colors.push(Colors.primary);
            }
          } catch (e) {
            colors.push(Colors.primary);
          }
        } else if (story.media?.type === "video") {
          // For videos, use buttonColor
          colors.push(Colors.primary);
        } else {
          // Unknown type
          colors.push(Colors.primary);
        }
      }

      // Fallback if no colors extracted
      if (colors.length === 0) {
        colors.push(Colors.primary);
      }

      setStoryColors(colors);
    };

    extractColors();
  }, [item]);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isStoryUploading) {
      rotateAnim.setValue(0);

      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      animation.start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }

    return () => {
      animation?.stop();
    };
  }, [isStoryUploading]);

  return (
    <View>
      {item?.type === "add" ? (
        isStoryUploading ? (
          <RevolvingCircle
            size={72}
            borderWidth={3}
            borderColor="rgba(255, 255, 255, 0.16)"
            spinning={isStoryUploading}
          >
            <TouchableOpacity
              style={styles.momentItem}
              onPress={() => {
                console.log("Press");
                if (myStories?.length > 0) {
                } else {
                  // Else, open camera to add story
                  navigation.navigate("Create");
                }
              }}
            >
              <LinearGradient
                colors={[
                  selectedCategory === "Technology" || selectedCategory == null
                    ? "#37B874"
                    : selectedCategoryColor,
                  "#121212",
                ]}
                start={{ x: 0.05, y: 0.05 }}
                end={{ x: 0.9, y: 0.9 }}
                style={[
                  styles.momentAddInner,
                  { borderColor: `${selectedCategoryColor}20` },
                ]}
              >
                <Image
                  source={Images.spark_home}
                  style={{
                    height: 27,
                    width: 27,
                    tintColor: selectedIconColor,
                  }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </RevolvingCircle>
        ) : (
          <View style={styles.momentAdd}>
            <TouchableOpacity
              style={styles.momentItem}
              onPress={() => {
                if (Array.isArray(myStories) && myStories?.length > 0) {
                  const storyObj: any = myStories[0]; // <-- pick the first object
                  const transformedMyStories = [
                    {
                      type: "story",
                      stories: Array.isArray(storyObj.stories)
                        ? storyObj.stories
                        : [],
                      userId: storyObj.userId,
                      username: storyObj.user?.[0]?.username || "User",
                      userImage: storyObj.user?.[0]?.profilePicture
                        ? { uri: storyObj.user[0].profilePicture }
                        : undefined,
                    },
                  ];

                  navigation.navigate("StoryViewer", {
                    userStories: transformedMyStories,
                    initialUserIndex: 0,
                    isMyStories: true,
                  });
                } else {
                  navigation.navigate("create");
                }
              }}
            >
              <LinearGradient
                colors={[
                  selectedCategory === "Technology" || selectedCategory == null
                    ? "#37B874"
                    : selectedCategoryColor,
                  "#121212",
                ]}
                start={{ x: 0.05, y: 0.05 }}
                end={{ x: 0.9, y: 0.9 }}
                style={[
                  styles.momentAddInner,
                  { borderColor: `${selectedCategoryColor}20` },
                ]}
              >
                <Image
                  source={Images.spark_home}
                  style={{
                    height: 27,
                    width: 27,
                    tintColor: selectedIconColor,
                  }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            handleStoryPress(item, index);
          }}
          style={styles.cardWrapper}
        >
          <View style={styles.storyContainer}>
            {item?.stories?.length > 0 && storyColors.length > 0 && (
              <StoryBorder
                segments={item.stories.length}
                size={72}
                colors={storyColors}
              />
            )}

            <View style={styles.imageContainer}>
              {item?.stories?.[0]?.media?.type === "video" ? (
                <Video
                  source={{ uri: item.stories[0].media.url }}
                  style={styles.cardImage}
                  resizeMode="cover"
                  muted
                  paused
                />
              ) : (
                <Image
                  source={{ uri: item.stories[0].media.url }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const MomentCard = ({
  myStories,
  storiesData,
  selectedCategory,
  selectedCategoryColor,
  selectedIconColor,
}: {
  myStories?: any;
  storiesData: any;
  selectedCategory: any;
  selectedCategoryColor: any;
  selectedIconColor: any;
}) => {
  const actualUser = useSelector((state: any) => state?.users?.userData);
  const navigation: any = useNavigation();

  const data = useMemo(() => {
    const apiStories = storiesData?.map((item?: any) => ({
      ...item,
      type: "story",
      username: item.user?.[0]?.username || "User",
      userImage: { uri: item.user?.[0]?.profilePicture },
    }));
    return [{ type: "add" }, ...apiStories];
  }, [storiesData]);

  const handleStoryPress = (item: any) => {
    if (item.type === "story" && item.stories) {
      const validStories = data.filter(
        (d) => d.type === "story" && d.stories && d.stories.length > 0
      );
      const initialIndex = validStories.findIndex(
        (s) => s.userId === item.userId
      );

      navigation.navigate("StoryViewer", {
        userStories: validStories,
        initialUserIndex: initialIndex,
      });
    }
  };

  const handlePlayAll = () => {
    const validStories = data.filter(
      (d) => d.type === "story" && d.stories && d.stories.length > 0
    );

    if (validStories.length > 0) {
      navigation.navigate("StoryViewer", {
        userStories: validStories,
        initialUserIndex: 0,
      });
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.row, styles.spaceBetween]}>
        <View style={styles.row}>
          <CustomText
            label={"MOMENTS"}
            color={Colors.whiteOpacity48}
            fontFamily={"Poppins_500Medium"}
          />
          <CustomText
            label={storiesData.length.toString()}
            color={Colors.white}
            fontFamily={"Poppins_500Medium"}
          />
        </View>
        <TouchableOpacity style={styles.row} onPress={handlePlayAll}>
          <ExpoIcons
            name={"controller-play"}
            family={"Entypo"}
            color={"#FFFFFF29"}
          />
          <CustomText
            label={"PLAY ALL"}
            color={Colors.white}
            fontFamily={"Poppins_500Medium"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(_, i) => `moment-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <MomentItem
            item={item}
            index={index}
            navigation={navigation}
            handleStoryPress={handleStoryPress}
            selectedCategory={selectedCategory}
            selectedCategoryColor={selectedCategoryColor}
            selectedIconColor={selectedIconColor}
            userData={actualUser}
            myStories={myStories}
          />
        )}
      />
    </View>
  );
};

export default React.memo(MomentCard);

const styles = StyleSheet.create({
  mainContainer: { backgroundColor: Colors.black },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  spaceBetween: { justifyContent: "space-between" },
  listContent: { gap: 10 },
  cardWrapper: {
    position: "relative",
  },
  card: {
    padding: 12,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "#FFFFFF0A",
    height: 72,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  storyContainer: {
    height: 72,
    width: 72,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  storyBorder: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  imageContainer: {
    height: 64,
    width: 64,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: Colors.black,
    borderWidth: 3,
    borderColor: Colors.black,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  momentItem: {
    alignItems: "center",
  },
  momentCircle: {
    width: 72,
    height: 72,
    // borderRadius: 32,
    // borderWidth: 2,
    // borderColor: "rgba(255, 255, 255, 0.16)",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  momentAdd: {
    padding: 3,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },

  momentAddInner: {
    width: 61,
    height: 61,
    borderRadius: 100,
    backgroundColor: "#121212",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
});
