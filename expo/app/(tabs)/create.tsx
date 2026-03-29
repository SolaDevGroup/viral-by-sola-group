import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Pressable
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { LinearGradient } from "expo-linear-gradient";
import { Camera as ExpoCamera, CameraView } from "expo-camera";
import Svg, { Circle } from "react-native-svg";

import ExpoIcons from "@/components/ExpoIcons";
import { Images } from "@/assets/images";
import Blur from "@/components/Blur";
import CustomText from "@/components/CustomText";
import Colors from "@/constants/colors";
import { ToastMessage } from "@/utils/ToastMessage";
import { useIsForeground } from "@/utils/UseIsForground";
import { VideoTrimmer } from "@/components/VideoTrimmer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const ReanimatedCamera: any = CameraView;
const LOCK_DRAG_THRESHOLD = -60;

const CameraRecorder = () => {
  const theme = Colors.dark;
  const navigation: any = useNavigation();
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const cameraRef = useRef<CameraView | null>(null);
  const insets = useSafeAreaInsets();
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back"
  );
  const [flash, setFlash] = useState<"off" | "on" | "auto" | "torch" | any>(
    "off"
  );
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [isPermissionChecked, setIsPermissionChecked] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null | any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [bottomClickforCapture, setbottomClickforCapture] = useState('story');
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingLocked, setIsRecordingLocked] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null | any>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [uploadedMediaUri, setUploadedMediaUri] = useState(null);
  const [videoDuration, setVideoDuration] = useState<string | null | any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
const recordingStartTimestampRef = useRef<number | null>(null);
const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const RECORD_MAX_MS = 15000;
  const MIN_RECORD_MS = 300;
  const RING_SIZE = 76;
  const RING_STROKE = 4;
  const RADIUS = (RING_SIZE - RING_STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const AnimatedCircleComp = Animated.createAnimatedComponent(Circle);
  const recordingProgress = useRef(new Animated.Value(0)).current;

  const lockButtonPosition = useRef(new Animated.Value(0)).current;
  const lockButtonOpacity = useRef(new Animated.Value(1)).current;
  const lockButtonScale = useRef(new Animated.Value(1)).current;
  const recordingStartTime = useRef<number>(0);

  const isActive =
    isFocused && isForeground && !capturedPhoto && !recordedVideo;

  const requestPermission = useCallback(async () => {
    try {
      const cameraPermission = await ExpoCamera.requestCameraPermissionsAsync();
      const microphonePermission =
        await ExpoCamera.requestMicrophonePermissionsAsync();
      const isGranted =
        cameraPermission.status === "granted" &&
        microphonePermission.status === "granted";
      setHasPermission(isGranted);
      setIsPermissionChecked(true);
    } catch (error) {
      console.log("Permission check error:", error);
      setHasPermission(false);
      setIsPermissionChecked(true);
    }
  }, []);

  const openSettings = async () => {
    try {
      if (Platform.OS === "ios") {
        const settingsUrl = "app-settings:";
        const canOpen = await Linking.canOpenURL(settingsUrl);
        if (canOpen) {
          await Linking.openURL(settingsUrl);
        } else {
          ToastMessage(
            "Unable to open settings. Please open them manually.",
            "error"
          );
        }
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      ToastMessage(
        "An unexpected error occurred while opening settings.",
        "error"
      );
    }
  };

  const handleCapture = async () => {
    if (
      !cameraRef.current ||
      !cameraReady ||
      !isActive ||
      isCapturing ||
      isRecording
    )
      return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setCapturedPhoto(photo.uri);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      ToastMessage("Failed to capture photo", "error");
    } finally {
      setIsCapturing(false);
    }
  };

  const formatTime = (ms:any) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const stopRecordingTimer = () => {
  if (recordingTimerRef.current) {
    clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
  }
  setRecordingTime("00:00");
};

 const startRecording = async () => {
  if (!cameraRef.current || !cameraReady || !isActive || isRecording) return;

  try {
    setIsRecording(true);

    // ▶️ START TIMER
    recordingStartTimestampRef.current = Date.now();
    setRecordingTime("00:00");

    recordingTimerRef.current = setInterval(() => {
      const start = recordingStartTimestampRef.current;
      if (start === null) return;

      setRecordingTime(formatTime(Date.now() - start));
    }, 1000);

    recordingJustStartedRef.current = true;
    setTimeout(() => {
      recordingJustStartedRef.current = false;
    }, 300);

    recordingStartTime.current = Date.now();
    recordingProgress.setValue(0);

    Animated.timing(recordingProgress, {
      toValue: 1,
      duration: RECORD_MAX_MS,
      useNativeDriver: false,
    }).start();

    cameraRef.current
      .recordAsync({ maxDuration: RECORD_MAX_MS / 1000 })
      .then((video) => {
        if (video?.uri) {
          setRecordedVideo(video.uri);
        }
        stopRecordingTimer();
        setIsRecording(false);
        setIsRecordingLocked(false);
        recordingProgress.stopAnimation();
        recordingProgress.setValue(0);
        resetLockButton();
        isDraggingLockRef.current = false;
        recordingJustStartedRef.current = false;
      })
      .catch((error) => {
        console.error("Recording error:", error);
        stopRecordingTimer();
        setIsRecording(false);
        setIsRecordingLocked(false);
        recordingProgress.stopAnimation();
        recordingProgress.setValue(0);
        resetLockButton();
        isDraggingLockRef.current = false;
        recordingJustStartedRef.current = false;
      });
  } catch (error) {
    console.error("Error starting recording:", error);
    stopRecordingTimer();
    ToastMessage("Failed to start recording", "error");
    setIsRecording(false);
    setIsRecordingLocked(false);
    recordingProgress.stopAnimation();
    recordingProgress.setValue(0);
    resetLockButton();
    isDraggingLockRef.current = false;
    recordingJustStartedRef.current = false;
  }
};


  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    const elapsed = Date.now() - recordingStartTime.current;
    if (elapsed < MIN_RECORD_MS) {
      console.log("Recording too short, waiting...");
      setTimeout(() => {
        if (cameraRef.current && isRecordingRef.current) {
          try {
            cameraRef.current.stopRecording();
          } catch (error) {
            console.error("Error stopping recording:", error);
          }
        }
      }, MIN_RECORD_MS - elapsed);
      return;
    }

    try {
      cameraRef.current.stopRecording();
      recordingProgress.stopAnimation();
      recordingProgress.setValue(0);
      isDraggingLockRef.current = false;
      recordingJustStartedRef.current = false;
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      setIsRecordingLocked(false);
      recordingProgress.stopAnimation();
      recordingProgress.setValue(0);
      resetLockButton();
      isDraggingLockRef.current = false;
      recordingJustStartedRef.current = false;
    }
  };

  const handleRecordButtonPress = async () => {
    if (isRecordingLocked) {
      await stopRecording();
    } else {
      await handleCapture();
    }
  };

  const resetLockButton = () => {
    Animated.parallel([
      Animated.spring(lockButtonPosition, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(lockButtonOpacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(lockButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isRecordingRef = useRef(false);
  const isRecordingLockedRef = useRef(false);
  const isDraggingLockRef = useRef(false);
  const recordingJustStartedRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
  return () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };
}, []);

  useEffect(() => {
    isRecordingLockedRef.current = isRecordingLocked;
  }, [isRecordingLocked]);

  const lockGesture = Gesture.Pan()
    .enabled(isRecording && !isRecordingLocked)
    .activeOffsetX([-2, 999999])
    .failOffsetY([-30, 30])
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      if (!isRecordingRef.current || isRecordingLockedRef.current) return;
      isDraggingLockRef.current = true;
      lockButtonScale.setValue(1.1);
    })
    .onUpdate((event) => {
      if (!isRecordingRef.current || isRecordingLockedRef.current) return;

      isDraggingLockRef.current = true;
      const clampedDx = Math.min(0, Math.max(event.translationX, LOCK_DRAG_THRESHOLD - 20));
      lockButtonPosition.setValue(clampedDx);

      const progress = Math.abs(clampedDx) / Math.abs(LOCK_DRAG_THRESHOLD);
      lockButtonScale.setValue(1.1 + progress * 0.2);
    })
    .onEnd((event) => {
      if (!isRecordingRef.current || isRecordingLockedRef.current) {
        isDraggingLockRef.current = false;
        return;
      }

      if (event.translationX <= LOCK_DRAG_THRESHOLD) {
        setIsRecordingLocked(true);
        Animated.parallel([
          Animated.spring(lockButtonPosition, {
            toValue: LOCK_DRAG_THRESHOLD,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(lockButtonScale, {
            toValue: 1.3,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.sequence([
            Animated.timing(lockButtonOpacity, {
              toValue: 0.5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(lockButtonOpacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        resetLockButton();
      }

      setTimeout(() => {
        isDraggingLockRef.current = false;
      }, 100);
    })
    .onFinalize(() => {
      setTimeout(() => {
        isDraggingLockRef.current = false;
      }, 100);
    });

  const toggleCameraPosition = () => {
    setCameraReady(false);
    setCameraPosition((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev: any) => {
      if (prev === "off") return "on";
      if (prev === "on") return "auto";
      return "off";
    });
  };

  const toggleGrid = () => {
    setShowGrid((prev) => !prev);
  };
  
  const bottomTabClickforCapture = (prop : any) => {
    setbottomClickforCapture(prop)
  }

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];

      if (asset.type === "image") {
        setCapturedPhoto(asset.uri);
        setRecordedVideo(null);
        setVideoDuration(null);
        return;
      }

      if (asset.type === "video") {
        setRecordedVideo(asset.uri);
        setCapturedPhoto(null);
        setVideoDuration(
          typeof asset?.duration === "number" ? Math.round(asset.duration) : 0
        );
        return;
      }
    } catch (error: any) {
      console.log("Gallery pick error:", error);
      ToastMessage("Failed to open gallery", "error");
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setRecordedVideo(null);
    setUploadedMediaUri(null);
    setVideoDuration(null);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    setCameraReady(false);
  }, [isActive]);

  const handleDone = () => {
    router.push({
      pathname: "/PublishStory/publish-story",
      params: {
        mediaUri: capturedPhoto || recordedVideo,
        mediaType: capturedPhoto ? "image" : "video",
      },
    });
  };

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: "none" },
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
      });
    };
  }, [navigation]);

  const onError = useCallback((error: any) => {
    console.log("camera error==>", error);
  }, []);

  if (!isPermissionChecked) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <CustomText
          label="Loading camera..."
          color={theme.text}
          fontSize={16}
          marginTop={16}
        />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.container]}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View
          style={[
            styles.row,
            { gap: 12, paddingTop: insets.top, marginLeft: 14 },
          ]}
        >
          <TouchableOpacity
            style={[styles.controlButton, { overflow: "hidden" }]}
            onPress={handleClose}
          >
            <Blur />
            <Image source={Images.back} style={{ height: 20, width: 20 }} />
          </TouchableOpacity>
          <CustomText
            label={"Back"}
            fontFamily={"Poppins_600SemiBold"}
            fontSize={20}
          />
        </View>
        <View style={styles.permissionContainer}>
          <ExpoIcons
            family="Ionicons"
            name="camera-outline"
            size={80}
            color={theme.textSecondary}
          />
          <CustomText
            label="Camera Permission Required"
            color={theme.text}
            fontSize={20}
            fontWeight="600"
            marginTop={24}
            textAlign="center"
          />
          <CustomText
            label="Please grant camera permission to use this feature"
            color={theme.textSecondary}
            fontSize={14}
            marginTop={8}
            textAlign="center"
          />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openSettings}
          >
            <CustomText
              label="Open Settings"
              color={theme.text}
              fontSize={16}
              fontWeight="600"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (capturedPhoto || recordedVideo) {
    return (
      <VideoTrimmer
        mediaUri={capturedPhoto ? capturedPhoto : recordedVideo}
        videoDuration={videoDuration}
        onTrimComplete={handleDone}
        mediaType={capturedPhoto ? "image" : "video"}
        handleReatke={handleRetake}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {isActive && (
        <ReanimatedCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraPosition}
          enableTorch={flash === "on" && cameraPosition === "back"}
          mode="video"
          onCameraReady={() => setCameraReady(true)}
          onMountError={onError}
        />
      )}

      {cameraPosition === "front" && flash !== "off" && (
        <View style={styles.flashOverlay} pointerEvents="none" />
      )}

      {showGrid && (
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridRow}>
            <View style={styles.gridCell} />
            <View style={[styles.gridCell, styles.gridBorderLeft]} />
            <View style={[styles.gridCell, styles.gridBorderLeft]} />
          </View>
          <View style={[styles.gridRow, styles.gridBorderTop]}>
            <View style={styles.gridCell} />
            <View style={[styles.gridCell, styles.gridBorderLeft]} />
            <View style={[styles.gridCell, styles.gridBorderLeft]} />
          </View>
          <View style={[styles.gridRow, styles.gridBorderTop]}>
            <View style={styles.gridCell} />
            <View style={[styles.gridCell, styles.gridBorderLeft]} />
            <View style={[styles.gridCell, styles.gridBorderLeft]} />
          </View>
        </View>
      )}

      <LinearGradient
        colors={[isRecording ? "rgba(55, 184, 116, 1)":"rgba(18, 18, 18, 1)", "rgba(18, 18, 18, 0)"]}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <LinearGradient
        colors={["rgba(18, 18, 18, 0)", isRecording ? "rgba(238, 16, 69, 1)" : "rgba(18, 18, 18, 1)"]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <View style={styles.topControls}>
        <View style={[styles.row, { gap: 12 }]}>
          <TouchableOpacity
            style={[styles.controlButton, { overflow: "hidden" }]}
            onPress={handleClose}
          >
            <Blur />
            <Image source={Images.back} style={{ height: 20, width: 20 }} />
          </TouchableOpacity>
          <CustomText
            label={"Back"}
            fontFamily={"Poppins_600SemiBold"}
            fontSize={20}
          />
        </View>

        <TouchableOpacity
          style={[styles.controlButton, { overflow: "hidden" }]}
          onPress={toggleFlash}
        >
          <Blur blurType="light" />

          <ExpoIcons
            family={"MaterialIcons"}
            name={
              flash === "off"
                ? "flash-off"
                : flash === "on"
                ? "flash-on"
                : "flash-auto"
            }
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
        
      </View>
      {isRecording && (
      <View style={styles.recordingTimer}>
          <CustomText
            label={recordingTime}
            fontSize={14}
            fontFamily= {"Poppins_600SemiBold"}
            color={"#fff"}
          />
      </View>
      )}

      

      <View style={styles.bottomControls}>
        <View style={styles.captureContainer}>
          {isRecording ? 
          <TouchableOpacity
            style={[styles.flipButton, { overflow: "hidden" }]}
            onPress={toggleCameraPosition}
            disabled={isRecording}
          >
            <Blur />
            <Image
              source={Images.CameraFlip}
              style={{ height: 24, width: 24, tintColor: "white" }}
            />
          </TouchableOpacity>
          :
           <TouchableOpacity
            style={[styles.flipButton, { overflow: "hidden" }]}
            onPress={pickFromGallery}
            disabled={isRecording}
          >
            <Blur />
            <Image
              source={Images.galleryUser}
              style={{ height: 40, width: 40,}}
            />
          </TouchableOpacity>
          }
          <GestureDetector gesture={lockGesture}>
            <View style={styles.row}>
              {isRecording ?
              <Animated.View
                style={[
                  styles.lockContainer,
                  {
                    overflow: "hidden",
                    transform: [
                      { translateX: lockButtonPosition },
                      { scale: lockButtonScale },
                    ],
                    opacity: lockButtonOpacity,
                  },
                ]}
              >
                <Blur />
                <Image
                  source={
                    isRecordingLocked ? Images.cameraLock : Images.cameraLock
                  }
                  style={{
                    height: 16,
                    width: 16,
                    tintColor: isRecordingLocked ? "#12FFAA" : "white",
                  }}
                />
              </Animated.View>
              :null}
            <View
              style={{
                width: RING_SIZE,
                height: RING_SIZE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Svg
                width={RING_SIZE}
                height={RING_SIZE}
                style={{ position: "absolute" }}
              >
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={"rgba(255, 255, 255, 0.48)"}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircleComp
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={isRecording ? "red" : Colors.white}
                  strokeWidth={RING_STROKE}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={recordingProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [CIRCUMFERENCE, 0],
                  })}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  fill="none"
                />
              </Svg>
              <Pressable
                style={[
                  !isRecording? styles.captureButton : styles.recordingredbutton ,
                  isRecording && styles.recordingButton,
                  (isCapturing || isRecording) && styles.capturingButton,
                ]}
                onPress={handleRecordButtonPress}
                onLongPress={startRecording}
                onPressOut={() => {
                  if (!isRecordingLocked && !isDraggingLockRef.current && !recordingJustStartedRef.current) {
                    stopRecording();
                  }
                }}
                disabled={!cameraReady || !isActive || isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <View
                    style={[
                      styles.captureButtonInner,
                      !isRecording ? styles.recordingButtonInner : styles.recordingredbutton,
                    ]}
                  />
                )}
              </Pressable>
            </View>
            </View>
          </GestureDetector>

            {!isRecording ? 
            <TouchableOpacity
            style={[styles.galleryContainer, { overflow: "hidden" }]}
            onPress={toggleCameraPosition}
            disabled={isRecording}
          >
            <Blur />
            <Image
              source={Images.CameraFlip}
              style={{ height: 16, width: 16, tintColor: "white" }}
            />
          </TouchableOpacity>
           :null}
          
          <TouchableOpacity
            style={[styles.flipButton, { overflow: "hidden" }]}
            onPress={toggleGrid}
          >
            <Blur />
            <Image
              source={Images.grid2}
              style={{
                height: 24,
                width: 24,
                tintColor: showGrid ? Colors.primary : "white",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => bottomTabClickforCapture('story')}>
          <CustomText
            label="Story"
            fontSize={14}
            fontFamily= {bottomClickforCapture== 'story' ?"Poppins_500Medium" : "Poppins_400Regular"}
            color={bottomClickforCapture== 'story' ? theme.text : theme.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => bottomTabClickforCapture('short')}>
          <CustomText
            label="Short"
            fontSize={14}
            fontFamily= {bottomClickforCapture== 'short' ?"Poppins_500Medium" : "Poppins_400Regular"}
            color={bottomClickforCapture== 'short' ? theme.text : theme.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => bottomTabClickforCapture('live')} >
          <CustomText
            label="Live"
            fontSize={14}
            fontFamily= {bottomClickforCapture== 'live' ?"Poppins_500Medium" : "Poppins_400Regular"}
            color={bottomClickforCapture== 'live' ? theme.text : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {isUploadingStory && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <ActivityIndicator size="small" color={theme.text} />
            <CustomText
              label="Uploading your story..."
              color={theme.text}
              fontSize={14}
              marginTop={8}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default CameraRecorder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  settingsButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 22,
  },
  topControls: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
    recordingTimer: {
    position: "absolute",
    top: 120,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    width:62,
    height:28,
    borderRadius:100,
    backgroundColor:"rgba(238, 16, 69, 1)"
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 22,
  },
  bottomControls: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  captureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  recordingredbutton:{
    width: 64,
    height: 64,
    borderRadius: 40,
    backgroundColor: "rgba(238, 16, 69, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "rgba(238, 16, 69, 1)",
  },
  recordingButton: {
    borderColor: "rgba(238, 16, 69, 1)",
    borderWidth: 4,
  },
  capturingButton: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor:  Colors.white,
  },
    captureRedButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor:  "rgba(238, 16, 69, 1)",
  },
  recordingButtonInner: {},
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  previewControls: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 60,
  },
  previewButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lockContainer: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    position: "absolute",
    zIndex: 999,
    right: 80,
  },
  galleryContainer: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    position: "absolute",
    zIndex: 999,
    right: 140,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
  },
  gridCell: {
    flex: 1,
  },
  gridBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
  },
  gridBorderTop: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  flashOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  uploadCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 0,

    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tab: {
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
