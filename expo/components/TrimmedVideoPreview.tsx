import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Check, X } from "lucide-react-native";
import { formatTime } from "@/utils/time";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TrimmedVideoPreviewProps {
  videoUri: string;
  startTime: number;
  endTime: number;
  onConfirm: () => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export function TrimmedVideoPreview({
  videoUri,
  startTime,
  endTime,
  onConfirm,
  onCancel,
  isUploading = false,
}: TrimmedVideoPreviewProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  async function handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (status.isLoaded) {
      if (!isReady) {
        setIsReady(true);
        try {
          await videoRef.current?.setPositionAsync(startTime);
          await videoRef.current?.playAsync();
          setIsPlaying(true);
        } catch (error) {
          console.log("Initial playback error:", error);
        }
      } else if (status.positionMillis >= endTime && status.isPlaying) {
        try {
          await videoRef.current?.setPositionAsync(startTime);
        } catch (error) {
          console.log("Loop playback error:", error);
        }
      }
    }
  }

  const duration = endTime - startTime;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trimmed Video Preview</Text>
        <Text style={styles.subtitle}>Duration: {formatTime(duration)}</Text>
      </View>

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          progressUpdateIntervalMillis={50}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Ready to upload this trimmed video?</Text>
        <Text style={styles.infoSubtext}>
          Start: {formatTime(startTime)} - End: {formatTime(endTime)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isUploading}
        >
          <X size={24} color="#fff" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            isUploading && styles.confirmButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Check size={24} color="#000" />
              <Text style={styles.confirmButtonText}>Confirm & Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  infoSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
});
