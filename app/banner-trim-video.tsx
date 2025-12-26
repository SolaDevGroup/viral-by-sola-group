import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Modal, PanResponder, Animated, Image, Platform } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { RotateCcw, Volume2, VolumeX, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 24;
const HANDLE_WIDTH = 2;
const MIN_TRIM_DURATION = 1000;
const MAX_BANNER_DURATION = 30000;

export default function BannerTrimVideoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ videoUri: string }>();
  const { videoUri } = params;
  const videoRef = useRef<Video>(null);
  
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
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
      const newEndTime = Math.min(duration, MAX_BANNER_DURATION);
      setEndTime(newEndTime);
      endHandleX.setValue(timeToPosition(newEndTime));
    }
  }, [duration, endTime, timeToPosition, endHandleX]);

  const startPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, Math.min(gestureState.moveX - 12 - HANDLE_WIDTH, timeToPosition(endTime) - timeToPosition(MIN_TRIM_DURATION)));
        startHandleX.setValue(newX);
        const newTime = positionToTime(newX);
        setStartTime(newTime);
        videoRef.current?.setPositionAsync(newTime);
      },
      onPanResponderRelease: () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
    })
  ).current;

  const endPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const maxEndTime = Math.min(duration, startTime + MAX_BANNER_DURATION);
        const newX = Math.max(
          timeToPosition(startTime) + timeToPosition(MIN_TRIM_DURATION), 
          Math.min(gestureState.moveX - 12, timeToPosition(maxEndTime))
        );
        endHandleX.setValue(newX);
        const newTime = positionToTime(newX);
        setEndTime(newTime);
      },
      onPanResponderRelease: () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
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
    if (!videoUri) return;
    
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    router.navigate({
      pathname: '/(tabs)/profile',
      params: { 
        bannerVideoUri: videoUri,
        bannerStartTime: startTime.toString(),
        bannerEndTime: endTime.toString(),
        bannerMuted: isMuted ? 'true' : 'false',
      }
    });
  };

  const handleReplay = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.back();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const toggleMute = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const trimmedDuration = endTime - startTime;
  const progressPercent = trimmedDuration > 0 ? ((position - startTime) / trimmedDuration) * 100 : 0;
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  const trimStartPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const trimEndPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const trimWidthPercent = trimEndPercent - trimStartPercent;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.videoContainer}>
        {videoUri && (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping={false}
            shouldPlay={true}
            isMuted={isMuted}
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
          colors={['rgba(18, 18, 18, 0.5)', 'rgba(18, 18, 18, 0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleReplay}>
            <X size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trim Banner Video</Text>
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            {isMuted ? (
              <VolumeX size={20} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Volume2 size={20} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${clampedProgress}%` }]} />
          </View>
        </View>
        <View style={styles.durationRow}>
          <Text style={styles.durationText}>{formatTime(trimmedDuration)}</Text>
          <Text style={styles.durationLabel}>selected</Text>
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
        <View style={styles.soundToggleRow}>
          <TouchableOpacity 
            style={[styles.soundToggle, !isMuted && styles.soundToggleActive]} 
            onPress={toggleMute}
          >
            {isMuted ? (
              <VolumeX size={16} color="rgba(255, 255, 255, 0.64)" strokeWidth={2} />
            ) : (
              <Volume2 size={16} color="#FFFFFF" strokeWidth={2} />
            )}
            <Text style={[styles.soundToggleText, !isMuted && styles.soundToggleTextActive]}>
              {isMuted ? 'Sound Off' : 'Sound On'}
            </Text>
          </TouchableOpacity>
        </View>

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
            {Platform.OS !== 'web' ? (
              <BlurView intensity={20} tint="dark" style={styles.modalBlur}>
                <View style={styles.modalInner}>
                  <Text style={styles.modalTitle}>Discard Changes?</Text>
                  <Text style={styles.modalMessage}>
                    Are you sure you want to go back? Your trimming edits will be lost.
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
              </BlurView>
            ) : (
              <View style={styles.modalWebContainer}>
                <View style={styles.modalInner}>
                  <Text style={styles.modalTitle}>Discard Changes?</Text>
                  <Text style={styles.modalMessage}>
                    Are you sure you want to go back? Your trimming edits will be lost.
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
            )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: -0.32,
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
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
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.64)',
  },
  trimSelectorContainer: {
    position: 'absolute',
    bottom: 220,
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
    bottom: 274,
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
  soundToggleRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  soundToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  soundToggleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  soundToggleText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
  },
  soundToggleTextActive: {
    color: '#FFFFFF',
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
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalWebContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
  },
  modalInner: {
    padding: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 24,
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
