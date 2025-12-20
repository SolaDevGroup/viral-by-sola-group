import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Check, X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

export default function TrimVideoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ videoUri: string; mode: string }>();
  const { videoUri, mode } = params;
  const videoRef = useRef<Video>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (duration > 0 && endTime === 0) {
      const maxDuration = mode === 'selfie' ? 15000 : mode === 'short' ? 60000 : 300000;
      setEndTime(Math.min(duration, maxDuration));
    }
  }, [duration, mode, endTime]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      
      if (duration === 0 && status.durationMillis) {
        setDuration(status.durationMillis);
      }

      if (status.positionMillis >= endTime && endTime > 0) {
        videoRef.current?.setPositionAsync(startTime);
      }
    }
  };

  const handleTrimStart = (value: number) => {
    setStartTime(value);
    videoRef.current?.setPositionAsync(value);
  };

  const handleTrimEnd = (value: number) => {
    setEndTime(value);
  };

  const handleContinue = () => {
    if (!videoUri) {
      Alert.alert('Error', 'No video selected');
      return;
    }

    router.push({
      pathname: '/post-video',
      params: { 
        videoUri, 
        mode,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      }
    });
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const trimmedDuration = endTime - startTime;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {videoUri && (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        )}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <X color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Trim Video</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + 32 }]}>
          <View style={styles.timeInfo}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Duration:</Text>
              <Text style={styles.timeValue}>{formatTime(trimmedDuration)}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Current:</Text>
              <Text style={styles.timeValue}>{formatTime(position)}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>

          <View style={styles.trimControls}>
            <View style={styles.trimRow}>
              <Text style={styles.trimLabel}>Start: {formatTime(startTime)}</Text>
              <View style={styles.trimButtons}>
                <TouchableOpacity 
                  style={styles.trimButton}
                  onPress={() => handleTrimStart(Math.max(0, startTime - 1000))}
                >
                  <Text style={styles.trimButtonText}>-1s</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.trimButton}
                  onPress={() => handleTrimStart(Math.min(endTime - 1000, startTime + 1000))}
                >
                  <Text style={styles.trimButtonText}>+1s</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.trimRow}>
              <Text style={styles.trimLabel}>End: {formatTime(endTime)}</Text>
              <View style={styles.trimButtons}>
                <TouchableOpacity 
                  style={styles.trimButton}
                  onPress={() => handleTrimEnd(Math.max(startTime + 1000, endTime - 1000))}
                >
                  <Text style={styles.trimButtonText}>-1s</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.trimButton}
                  onPress={() => handleTrimEnd(Math.min(duration, endTime + 1000))}
                >
                  <Text style={styles.trimButtonText}>+1s</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Check color="#fff" size={24} />
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  controls: {
    paddingHorizontal: 20,
    gap: 20,
  },
  timeInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  timeValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  playButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  trimControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  trimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trimLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  trimButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  trimButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
