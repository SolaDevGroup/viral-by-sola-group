import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoTrimmer } from "@/components/VideoTrimmer";
import { TrimmedVideoPreview } from "@/components/TrimmedVideoPreview";
import Colors from "@/constants/colors";
const { width, height } = Dimensions.get("window");

export default function TrimVideoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ videoUri: string; mode: string }>();
  const { videoUri, mode } = params;
  const [videoDuration, setVideoDuration] = useState(0);

  const handleGetDuration = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.durationMillis) {
      setVideoDuration(status.durationMillis);
    }
  };

  const handleTrimComplete = (startTime: number, endTime: number) => {
    if (!videoUri) return;
    router.push({
      pathname: "/PublishStory/publish-story",
      params: {
        mediaUri: videoUri,
        mediaType: "video",
      },
    });
  };

  return (
    <View style={[styles.container]}>
      {videoUri && (
        <Video
          source={{ uri: videoUri }}
          style={{ width: 0, height: 0 }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          onPlaybackStatusUpdate={handleGetDuration}
        />
      )}

      {videoUri && videoDuration > 0 && (
        <VideoTrimmer
          mediaUri={videoUri}
          videoDuration={videoDuration}
          onTrimComplete={handleTrimComplete}
          mediaType="video"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  uploadCard: {
    padding: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
});
