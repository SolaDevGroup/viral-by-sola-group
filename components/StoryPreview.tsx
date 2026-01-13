import React from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import CustomText from "./CustomText";
import { Images } from "@/assets/images";
import { useRouter } from "expo-router";

type Props = {
  mediaUri: string;
  mediaType: "image" | "video";
  aspectRatio: "9:16" | "16:9";
  onAspectChange: (ratio: "9:16" | "16:9") => void;
};

const PHONE_WIDTH = 220;
const PHONE_HEIGHT_9_16 = 390;
const PHONE_HEIGHT_16_9 = 260;

const StoryPreview: React.FC<Props> = ({
  mediaUri,
  mediaType,
  aspectRatio,
  onAspectChange,
}) => {
  const router = useRouter();

  const phoneHeight =
    aspectRatio === "9:16" ? PHONE_HEIGHT_9_16 : PHONE_HEIGHT_16_9;
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  return (
    <View style={styles.container}>
      <View style={[styles.outerBorder, { borderColor: theme.borderLight }]}>
        <View style={[styles.phoneFrame, { height: phoneHeight }]}>
          {mediaType === "video" ? (
            <Video
              source={{ uri: mediaUri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              isMuted
              isLooping
              shouldPlay
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}

          <BlurView intensity={16} tint="light" style={styles.previewOverlay}>
            <LinearGradient
              colors={["rgba(18, 18, 18, 0)", "rgba(18, 18, 18, 0.16)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <Text style={styles.previewText}>Preview</Text>
          </BlurView>
        </View>
      </View>

      <View style={styles.ratioRow}>
        {["9:16", "16:9"].map((ratio) => {
          const selected = aspectRatio === ratio;
          return (
            <TouchableOpacity
              key={ratio}
              onPress={() => onAspectChange(ratio as "9:16" | "16:9")}
              style={[
                styles.ratioButton,
                {
                  backgroundColor: selected ? theme.text : theme.cardBackground,
                },
              ]}
            >
              <Text
                style={[
                  styles.ratioText,
                  {
                    color: selected ? theme.background : theme.text,
                  },
                ]}
              >
                {ratio} ratio
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.outer}>
        <TouchableOpacity
          style={styles.addPic}
          onPress={() => router.push("/imageCamera")}
        >
          <Image source={Images.camera1} style={{ width: 20, height: 20 }} />
          <CustomText
            fontSize={8}
            marginTop={4}
            label="Add more"
            textAlign={"center"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StoryPreview;
const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },

  phoneFrame: {
    width: PHONE_WIDTH,
    backgroundColor: "#000",
    borderRadius: 18,
    overflow: "hidden",
  },

  previewOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
  },

  previewText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
  },

  ratioRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
    alignSelf: "center",
  },

  ratioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#1c1c1c",
  },

  ratioButtonActive: {
    backgroundColor: "#fff",
  },

  ratioText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,

    fontWeight: "600",
  },
  outerBorder: {
    padding: 3,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  ratioTextActive: {
    color: "#000",
  },
  addPic: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 10,
    borderColor: "#FFFFFF0A",
  },
  outer: {
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 8,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderColor: "#FFFFFF0A",
  },
});
