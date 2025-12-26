import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Modal, PanResponder, Animated, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { RotateCcw } from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 24;
const HANDLE_WIDTH = 2;

const MIN_TRIM_DURATION = 1000;

export default function TrimVideoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ videoUri: string; mode: string }>();
  const { videoUri, mode } = params;
  const videoRef = useRef<Video>(null);
  
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  
  const [showExitModal, setShowExitModal] = useState(false);

  const startHandleX = useRef(new Animated.Value(0)).current;
  const endHandleX = useRef(new Animated.Value(TIMELINE_WIDTH - HANDLE_WIDTH)).current;

  const timeToPosition = useCallback((time: number) => {
    if (duration === 0) return 0;
    return (time / duration) * (TIMELINE_WIDTH - HANDLE_WIDTH * 2);
  }, [duration]);

  const positionToTime = useCallback((pos: number) => {
    if (duration === 0) return 0;
    return (pos / (TIMELINE_WIDTH - HANDLE_WIDTH * 2)) * duration;
  }, [duration]);

  useEffect(() => {
    if (duration > 0 && endTime === 0) {
      const maxDuration = mode === 'selfie' ? 15000 : mode === 'short' ? 60000 : 300000;
      const newEndTime = Math.min(duration, maxDuration);
      setEndTime(newEndTime);
      endHandleX.setValue(timeToPosition(newEndTime));
    }
  }, [duration, mode, endTime, timeToPosition, endHandleX]);

  const startPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, Math.min(gestureState.moveX - 12 - HANDLE_WIDTH, timeToPosition(endTime) - timeToPosition(MIN_TRIM_DURATION)));
        startHandleX.setValue(newX);
        const newTime = positionToTime(newX);
        setStartTime(newTime);
        videoRef.current?.setPositionAsync(newTime);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const endPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(timeToPosition(startTime) + timeToPosition(MIN_TRIM_DURATION), Math.min(gestureState.moveX - 12, TIMELINE_WIDTH - HANDLE_WIDTH));
        endHandleX.setValue(newX);
        const newTime = positionToTime(newX);
        setEndTime(newTime);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      
      
      if (duration === 0 && status.durationMillis) {
        setDuration(status.durationMillis);
      }

      if (status.positionMillis >= endTime && endTime > 0) {
        videoRef.current?.setPositionAsync(startTime);
      }
    }
  };

  const handleContinue = () => {
    if (!videoUri) {
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

  const handleReplay = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.back();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const trimmedDuration = endTime - startTime;
  const progressPercent = duration > 0 ? ((position - startTime) / trimmedDuration) * 100 : 0;
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  const trimStartPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const trimEndPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const trimWidthPercent = trimEndPercent - trimStartPercent;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {videoUri && (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping={false}
            shouldPlay={true}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        )}
        <LinearGradient
          colors={['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.64)']}
          style={styles.videoGradient}
          start={{ x: 0.5, y: 0.56 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <LinearGradient
          colors={['rgba(18, 18, 18, 0.01)', 'rgba(18, 18, 18, 0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${clampedProgress}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.trimSelectorContainer}>
        <View style={styles.trimSelector}>
          <View style={styles.timelineBackground}>
            {videoUri && (
              <Image 
                source={{ uri: videoUri }} 
                style={styles.timelineThumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.timelineOverlay} />
          </View>
          
          <View 
            style={[
              styles.selectedRange,
              { 
                left: `${trimStartPercent}%`, 
                width: `${trimWidthPercent}%` 
              }
            ]}
          >
            {videoUri && (
              <Image 
                source={{ uri: videoUri }} 
                style={[styles.selectedThumbnail, { marginLeft: -timeToPosition(startTime) }]}
                resizeMode="cover"
              />
            )}
          </View>

          <Animated.View
            style={[
              styles.handle,
              styles.leftHandle,
              { transform: [{ translateX: startHandleX }] }
            ]}
            {...startPanResponder.panHandlers}
          >
            <View style={styles.handleBar} />
          </Animated.View>

          <Animated.View
            style={[
              styles.handle,
              styles.rightHandle,
              { transform: [{ translateX: endHandleX }] }
            ]}
            {...endPanResponder.panHandlers}
          >
            <View style={styles.handleBar} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.thumbnailPreviewContainer}>
        <View style={styles.thumbnailPreview}>
          <View style={styles.thumbnailHandle} />
          <View style={styles.thumbnailContent}>
            {videoUri && (
              <Image 
                source={{ uri: videoUri }} 
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            )}
          </View>
          <View style={styles.thumbnailHandle} />
        </View>
      </View>

      <LinearGradient
        colors={['rgba(55, 184, 116, 0)', '#12FFAA']}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 34 }]}
        start={{ x: 0.5, y: 0.1121 }}
        end={{ x: 0.5, y: 0.8876 }}
        locations={[0.1121, 0.8876]}
      >
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.replayButton} onPress={handleReplay}>
            <View style={styles.replayInner}>
              <RotateCcw color="#FFFFFF" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <View style={styles.continueInner}>
              <Text style={styles.continueText}>Continue</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginBottom: insets.bottom + 20 }]}>
            <Text style={styles.modalTitle}>Discard Changes?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to record again? Your current edits will be lost.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={handleCancelExit}
              >
                <Text style={styles.modalCancelText}>Keep Editing</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleConfirmExit}
              >
                <Text style={styles.modalConfirmText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
  },
  trimSelectorContainer: {
    position: 'absolute',
    bottom: 180,
    left: 12,
    right: 12,
    height: 44,
    zIndex: 10,
  },
  trimSelector: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 18, 18, 0.64)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  timelineBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  timelineThumbnail: {
    width: '100%',
    height: '100%',
  },
  timelineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.64)',
  },
  selectedRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 4,
  },
  selectedThumbnail: {
    width: TIMELINE_WIDTH,
    height: '100%',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  leftHandle: {
    left: -10,
  },
  rightHandle: {
    left: -10,
  },
  handleBar: {
    width: 2,
    height: 16,
    backgroundColor: '#121212',
    borderRadius: 4,
  },
  thumbnailPreviewContainer: {
    position: 'absolute',
    bottom: 234,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  thumbnailPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 8,
  },
  thumbnailHandle: {
    width: 2,
    height: 16,
    backgroundColor: '#121212',
    borderRadius: 4,
  },
  thumbnailContent: {
    width: 78,
    height: 44,
    borderRadius: 4,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 32,
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replayButton: {
    width: 52,
    height: 52,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replayInner: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    flex: 1,
    height: 52,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueInner: {
    width: '100%',
    height: 44,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#121212',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.64)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
});
