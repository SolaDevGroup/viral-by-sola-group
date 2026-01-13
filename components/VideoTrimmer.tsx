import { Images } from "@/assets/images";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Blur from "./Blur";
import { TrimmerFilmstrip } from "./TrimmerFilmstrip";
import { Volume2, VolumeX } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TRIMMER_WIDTH = SCREEN_WIDTH - 32;
const HANDLE_WIDTH = 10;
const BORDER_WIDTH = 2;

interface VideoTrimmerProps {
  mediaUri: string;
  mediaType: "video" | "image";
  videoDuration?: number | null | any;
  onTrimComplete: (startTime: number, endTime: number) => void;
  handleReatke?: any;
}

export function VideoTrimmer({
  mediaUri,
  videoDuration,
  mediaType = "video",
  handleReatke,
  onTrimComplete,
}: VideoTrimmerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  const insests = useSafeAreaInsets();

  // Duration and trim times
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Use refs for current values to avoid stale closures
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(0);
  const totalDurationRef = useRef(0);

  // Animation values
  const leftPosition = useRef(new Animated.Value(0)).current;
  const rightPosition = useRef(new Animated.Value(TRIMMER_WIDTH)).current;
  const trimmerProgress = useRef(new Animated.Value(HANDLE_WIDTH)).current;

  // Position tracking
  const leftPosValue = useRef(0);
  const rightPosValue = useRef(TRIMMER_WIDTH);
  const isSeeking = useRef(false);
  const isLooping = useRef(false);

  // Sync refs with state
  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  useEffect(() => {
    totalDurationRef.current = totalDuration;
  }, [totalDuration]);

  // Listen to position changes
  useEffect(() => {
    const leftListener = leftPosition.addListener(({ value }) => {
      leftPosValue.current = value;
    });
    const rightListener = rightPosition.addListener(({ value }) => {
      rightPosValue.current = value;
    });

    return () => {
      leftPosition.removeListener(leftListener);
      rightPosition.removeListener(rightListener);
    };
  }, []);

  // Initialize when video loads
  const handleLoad = async (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.durationMillis && !isVideoLoaded) {
      const duration = status.durationMillis;
      console.log('Video loaded! Duration:', duration);

      setTotalDuration(duration);
      setStartTime(0);
      setEndTime(duration);
      setIsVideoLoaded(true);

      totalDurationRef.current = duration;
      startTimeRef.current = 0;
      endTimeRef.current = duration;

      // Start playback after a short delay
      setTimeout(async () => {
        try {
          await videoRef.current?.setPositionAsync(0);
          await videoRef.current?.playAsync();
          setIsPlaying(true);
          console.log('Initial playback started');
        } catch (error) {
          console.log('Error starting playback:', error);
        }
      }, 200);
    }
  };

  // Update trim times when handles move
  function updateTrimTimes(left: number, right: number) {
    const trimmerUsableWidth = TRIMMER_WIDTH - HANDLE_WIDTH * 2;

    // Clamp positions to valid range
    const clampedLeft = Math.max(0, Math.min(left, trimmerUsableWidth));
    const clampedRight = Math.max(HANDLE_WIDTH * 2, Math.min(right, TRIMMER_WIDTH));

    const leftRatio = clampedLeft / trimmerUsableWidth;
    const rightRatio = (clampedRight - HANDLE_WIDTH * 2) / trimmerUsableWidth;

    const newStart = leftRatio * totalDurationRef.current;
    const newEnd = rightRatio * totalDurationRef.current;

    // Ensure end is at least as large as start
    const finalStart = Math.max(0, Math.min(newStart, totalDurationRef.current));
    const finalEnd = Math.max(finalStart, Math.min(newEnd, totalDurationRef.current));

    setStartTime(finalStart);
    setEndTime(finalEnd);

    startTimeRef.current = finalStart;
    endTimeRef.current = finalEnd;

    console.log('Trim updated:', { start: finalStart, end: finalEnd, totalDuration: totalDurationRef.current });
  }

  // Handle playback updates
  function handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded || isSeeking.current || isLooping.current) return;

    const pos = status.positionMillis;
    const start = startTimeRef.current;
    const end = endTimeRef.current;

    setCurrentPosition(pos);

    // Update progress indicator
    if (end > start) {
      const duration = end - start;
      const progress = Math.max(0, Math.min(1, (pos - start) / duration));
      const trimmerUsableWidth = TRIMMER_WIDTH - HANDLE_WIDTH * 2;
      const indicatorPos = leftPosValue.current + HANDLE_WIDTH + (progress * trimmerUsableWidth);
      trimmerProgress.setValue(indicatorPos);
    }

    // Loop when reaching the end
    if (status.isPlaying && pos >= end - 100) {
      console.log('Loop triggered at:', pos, 'end:', end);
      loopToStart();
    }
  }

  // Loop back to start
  async function loopToStart() {
    if (isLooping.current || isSeeking.current) return;

    isLooping.current = true;

    try {
      const start = startTimeRef.current;
      console.log('Looping to:', start);

      await videoRef.current?.setPositionAsync(start);

      if (isPlaying) {
        await videoRef.current?.playAsync();
      }
    } catch (error) {
      console.log('Loop error:', error);
    } finally {
      isLooping.current = false;
    }
  }

  // Seek to a specific position
  async function seekToPosition(position: number, shouldPlay: boolean = false) {
    if (isSeeking.current) return;

    isSeeking.current = true;

    try {
      console.log('Seeking to:', position, 'shouldPlay:', shouldPlay);
      await videoRef.current?.pauseAsync();
      await videoRef.current?.setPositionAsync(position);
      setCurrentPosition(position);

      // Reset progress indicator
      trimmerProgress.setValue(leftPosValue.current + HANDLE_WIDTH);

      if (shouldPlay) {
        await new Promise(resolve => setTimeout(resolve, 50));
        await videoRef.current?.playAsync();
        setIsPlaying(true);
        console.log('Playback resumed after seek');
      }
    } catch (error) {
      console.log('Seek error:', error);
    } finally {
      isSeeking.current = false;
    }
  }

  // Toggle play/pause
  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current?.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Toggle playback error:', error);
    }
  };

  // Left handle pan responder
  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: async () => {
        await videoRef.current?.pauseAsync();
        setIsPlaying(false);
      },
      onPanResponderMove: (_, gestureState) => {
        const newLeft = Math.max(
          0,
          Math.min(gestureState.moveX - 16, rightPosValue.current - HANDLE_WIDTH * 2)
        );
        leftPosition.setValue(newLeft);
        updateTrimTimes(newLeft, rightPosValue.current);
      },
      onPanResponderRelease: async () => {
        const start = startTimeRef.current;
        await seekToPosition(start, true);
      },
    })
  ).current;

  // Right handle pan responder
  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: async () => {
        await videoRef.current?.pauseAsync();
        setIsPlaying(false);
      },
      onPanResponderMove: (_, gestureState) => {
        const newRight = Math.max(
          leftPosValue.current + HANDLE_WIDTH * 2,
          Math.min(gestureState.moveX - 16, TRIMMER_WIDTH)
        );
        rightPosition.setValue(newRight);
        updateTrimTimes(leftPosValue.current, newRight);
      },
      onPanResponderRelease: async () => {
        const start = startTimeRef.current;
        await seekToPosition(start, true);
      },
    })
  ).current;

  // Reset to full duration
  async function handleReset() {
    await videoRef.current?.pauseAsync();
    setIsPlaying(false);

    Animated.parallel([
      Animated.spring(leftPosition, {
        toValue: 0,
        useNativeDriver: false,
      }),
      Animated.spring(rightPosition, {
        toValue: TRIMMER_WIDTH,
        useNativeDriver: false,
      }),
    ]).start();

    setStartTime(0);
    setEndTime(totalDuration);

    setTimeout(async () => {
      await seekToPosition(0, true);
    }, 300);
  }

  // Continue with trim
  function handleContinue() {
    onTrimComplete(startTime, endTime);
  }


  const toggleMute = async () => {
  if (!videoRef.current) return;

  setIsMuted(prev => {
    const next = !prev;
    videoRef.current?.setStatusAsync({ isMuted: next });
    return next;
  });
};

  // Calculate progress percentage
  const duration = endTime - startTime;
  const progressPercentage =
    duration > 0 ? ((currentPosition - startTime) / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {mediaType == "video" && (
        <>
        <BlurView
          intensity={12}
          tint="light"
          style={[styles.progressBarContainer, { paddingTop: insests.top + 5 }]}
        >
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(0, Math.min(100, progressPercentage))}%`,
                },
              ]}
            />
          </View>
        </BlurView>
              {/* <BlurView>
                <TouchableOpacity style={styles.muteButton} onPress={handleReatke}>
                  <Text>assasaaas</Text>
                  </TouchableOpacity>
                </BlurView> */}
                <TouchableOpacity style={styles.muteButton}    onPress={toggleMute}>
                 <Blur borderRadius={100} />
                     {isMuted ? (
                      <VolumeX color="#FFFFFF" size={18} />
                    ) : (
                      <Volume2 color="#FFFFFF" size={18} />
                    )}
                  </TouchableOpacity>
                  </>
      )}
      <View style={styles.mediaContainer}>
        {mediaType === "video" ? (
          <Video
            ref={videoRef}
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            onLoad={handleLoad}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            progressUpdateIntervalMillis={50}
          />
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={styles.media}
            contentFit="cover"
          />
        )}
      </View>

      <View style={styles.trimmerContainer}>
        {mediaType == "video" && (
          <View style={styles.trimmerWrapper}>
            <TrimmerFilmstrip
              videoUri={mediaUri}
              videoDuration={totalDuration}
              width={TRIMMER_WIDTH}
            />

            <Animated.View
              style={[
                styles.trimOverlay,
                styles.trimOverlayLeft,
                { width: leftPosition },
              ]}
            />
            <Animated.View
              style={[
                styles.trimOverlay,
                styles.trimOverlayRight,
                {
                  width: rightPosition.interpolate({
                    inputRange: [0, TRIMMER_WIDTH],
                    outputRange: [TRIMMER_WIDTH, 0],
                  }),
                },
              ]}
            />

            <Animated.View
              style={[
                styles.trimBorderTop,
                {
                  left: Animated.add(leftPosition, HANDLE_WIDTH),
                  width: Animated.subtract(
                    Animated.subtract(rightPosition, leftPosition),
                    HANDLE_WIDTH * 2
                  ),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.trimBorderBottom,
                {
                  left: Animated.add(leftPosition, HANDLE_WIDTH),
                  width: Animated.subtract(
                    Animated.subtract(rightPosition, leftPosition),
                    HANDLE_WIDTH * 2
                  ),
                },
              ]}
            />


            <Animated.View
              {...leftPanResponder.panHandlers}
              hitSlop={{ top: 10, bottom: 10, left: 15, right: 15 }}
              style={[
                styles.handle,
                styles.leftHandle,
                { transform: [{ translateX: leftPosition }] },
              ]}
            >
              <View style={styles.handleGrip}>
                <View style={styles.gripBar} />
              </View>
            </Animated.View>

            <Animated.View
              {...rightPanResponder.panHandlers}
              hitSlop={{ top: 10, bottom: 10, left: 15, right: 15 }}
              style={[
                styles.handle,
                styles.rightHandle,
                {
                  transform: [
                    {
                      translateX: rightPosition.interpolate({
                        inputRange: [0, TRIMMER_WIDTH],
                        outputRange: [
                          -HANDLE_WIDTH,
                          TRIMMER_WIDTH - HANDLE_WIDTH,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.handleGrip}>
                <View style={styles.gripBar} />
              </View>
            </Animated.View>
          </View>
        )}
      </View>

      <View style={styles.bottomControls}>
        <Blur borderRadius={1} />

        <LinearGradient
          colors={["rgba(55, 184, 116, 0))", "#12FFAA"]}
          locations={[0.003, 0.9876]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <TouchableOpacity style={styles.resetButton} onPress={handleReatke}>
          <View style={styles.innerCircle}>
            <Image
              source={Images.replay}
              style={{ height: 24, width: 24, tintColor: "#fff" }}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outerContinueButton}
          onPress={handleContinue}
        >
          <View style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 13,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
    muteButton: {
    position: "absolute",
    top: 100,
    right:30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    width:40,
    height:40,
    borderRadius:200,
  },
  trimmerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: "absolute",
    bottom: 112,
  },
  trimmerWrapper: {
    width: TRIMMER_WIDTH,
    height: 48,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  trimOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1,
  },
  trimOverlayLeft: {
    left: 0,
  },
  trimOverlayRight: {
    right: 0,
  },
  trimBorderTop: {
    position: "absolute",
    top: 0,
    height: BORDER_WIDTH,
    backgroundColor: "#fff",
    zIndex: 3,
  },
  trimBorderBottom: {
    position: "absolute",
    bottom: 0,
    height: BORDER_WIDTH,
    backgroundColor: "#fff",
    zIndex: 3,
  },
  handle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 4,
    backgroundColor: "#fff",
  },
  leftHandle: {
    left: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightHandle: {
    left: 0,
    zIndex: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  handleGrip: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  gripBar: {
    width: 3,
    height: 24,
    backgroundColor: "#000",
    borderRadius: 1.5,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 25,
    gap: 10,
    alignSelf: "flex-end",
    position: "absolute",
    bottom: 0,
  },
  resetButton: {
    width: 52,
    height: 52,
    borderRadius: 30,
    backgroundColor: "tranaparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.48)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 44,
    height: 44,
    borderRadius: 99,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  outerContinueButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.48)",
    padding: 4,
    borderRadius: 99,
    flex: 1,
  },
  continueButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
  mediaContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  media: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
});
