import { StyleSheet, View, TouchableOpacity, Text, Platform, Alert, Pressable } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X, RotateCw, Zap, ZapOff } from "lucide-react-native";
import Colors from "@/constants/colors";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams, useNavigation, Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RecordingMode = 'story' | 'short' | 'live';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [flash, setFlash] = useState(false);
  const [mode, setMode] = useState<RecordingMode>('short');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    if (params.mode === 'story') {
      setMode('story');
    } else if (params.mode === 'live') {
      setMode('live');
    } else {
      setMode('short');
    }
  }, [params.mode]);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' }
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        }
      });
    };
  }, [navigation]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need camera permissions to continue</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording || !isCameraReady) {
      if (!isCameraReady) {
        console.log('Camera not ready yet, waiting...');
        return;
      }
      return;
    }

    try {
      setIsRecording(true);
      if (Platform.OS !== 'web') {
        const video = await cameraRef.current.recordAsync({
          maxDuration: mode === 'short' ? 60 : mode === 'story' ? 15 : 300,
        });
        
        if (video) {
          console.log('Video recorded:', video.uri);
          router.push(`/trim-video?videoUri=${encodeURIComponent(video.uri)}&mode=${mode}` as Href);
        }
      } else {
        Alert.alert('Not Supported', 'Video recording is not supported on web');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Video picked:', result.assets[0].uri);
        router.push(`/trim-video?videoUri=${encodeURIComponent(result.assets[0].uri)}&mode=${mode}` as Href);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) {
      if (!isCameraReady) {
        console.log('Camera not ready yet for photo');
      }
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          console.log('Photo taken:', photo.uri);
          router.push(`/post-video?mediaUri=${encodeURIComponent(photo.uri)}&mode=story&type=photo` as Href);
        }
      } else {
        Alert.alert('Not Supported', 'Photo capture is not supported on web');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handlePressIn = () => {
    isLongPress.current = false;
    recordingTimer.current = setTimeout(() => {
      isLongPress.current = true;
      startRecording();
    }, 300);
  };

  const handlePressOut = () => {
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }

    if (isRecording) {
      stopRecording();
    } else if (!isLongPress.current) {
      if (mode === 'story') {
        takePicture();
      } else if (mode === 'short') {
        startRecording();
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
        enableTorch={flash && facing === 'back'}
        onCameraReady={handleCameraReady}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <X color="#fff" size={28} />
          </TouchableOpacity>

          <View style={styles.headerSpacer} />

          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            {flash ? <Zap color="#FFD700" size={28} fill="#FFD700" /> : <ZapOff color="#fff" size={28} />}
          </TouchableOpacity>
        </View>

        <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.sideButton} onPress={pickVideo}>
              <ImageIcon color="#fff" size={32} />
            </TouchableOpacity>

            <Pressable
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
            </Pressable>

            <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
              <RotateCw color="#fff" size={32} />
            </TouchableOpacity>
          </View>

          <View style={styles.modeSelector}>
            <TouchableOpacity 
              onPress={() => setMode('story')}
              style={styles.modeButton}
            >
              <Text style={[styles.modeText, mode === 'story' && styles.modeTextActive]}>Story</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setMode('short')}
              style={styles.modeButton}
            >
              <Text style={[styles.modeText, mode === 'short' && styles.modeTextActive]}>Short</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setMode('live')}
              style={styles.modeButton}
            >
              <Text style={[styles.modeText, mode === 'live' && styles.modeTextActive]}>Live</Text>
            </TouchableOpacity>
          </View>

          {mode === 'story' && (
            <Text style={styles.modeHint}>Tap for photo, hold for video</Text>
          )}
        </View>

        {isRecording && (
          <View style={[styles.recordingIndicator, { top: insets.top + 70 }]}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
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
  headerSpacer: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  modeButton: {
    paddingVertical: 8,
  },
  modeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modeTextActive: {
    color: '#fff',
  },
  modeHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '400' as const,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderColor: '#FF3B30',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
