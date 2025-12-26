import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Modal, PanResponder, Animated, Image, Platform } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useRef, useCallback } from "react";
import { RotateCcw, X, Move, ZoomIn, ZoomOut } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH - 48;

export default function BannerCropImageScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ imageUri: string }>();
  const { imageUri } = params;
  
  const [showExitModal, setShowExitModal] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastPan = useRef({ x: 0, y: 0 });

  const getImageDimensions = useCallback((uri: string) => {
    Image.getSize(uri, (width, height) => {
      console.log('Image dimensions:', width, height);
      setImageSize({ width, height });
      const aspectRatio = width / height;
      if (aspectRatio > 1) {
        setScale(CROP_SIZE / height);
      } else {
        setScale(CROP_SIZE / width);
      }
    }, (error) => {
      console.error('Error getting image size:', error);
    });
  }, []);

  useState(() => {
    if (imageUri) {
      getImageDimensions(imageUri);
    }
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        pan.setOffset({
          x: lastPan.current.x,
          y: lastPan.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        lastPan.current = {
          x: lastPan.current.x + gestureState.dx,
          y: lastPan.current.y + gestureState.dy,
        };
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const handleZoomIn = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pan.setValue({ x: 0, y: 0 });
    lastPan.current = { x: 0, y: 0 };
    if (imageSize.width > 0 && imageSize.height > 0) {
      const aspectRatio = imageSize.width / imageSize.height;
      if (aspectRatio > 1) {
        setScale(CROP_SIZE / imageSize.height);
      } else {
        setScale(CROP_SIZE / imageSize.width);
      }
    }
  };

  const handleContinue = () => {
    if (!imageUri) return;
    
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    router.navigate({
      pathname: '/(tabs)/profile',
      params: { 
        bannerImageUri: imageUri,
        bannerCropX: lastPan.current.x.toString(),
        bannerCropY: lastPan.current.y.toString(),
        bannerScale: scale.toString(),
      }
    });
  };

  const handleBack = () => {
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

  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
            <X size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crop Banner Image</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Drag to position • Pinch to zoom</Text>
      </View>

      <View style={styles.cropContainer}>
        <View style={styles.cropOverlay}>
          <View style={styles.cropMaskTop} />
          <View style={styles.cropMiddleRow}>
            <View style={styles.cropMaskSide} />
            <View style={styles.cropWindow}>
              <View style={styles.cropCornerTL} />
              <View style={styles.cropCornerTR} />
              <View style={styles.cropCornerBL} />
              <View style={styles.cropCornerBR} />
              <View style={styles.cropGridH1} />
              <View style={styles.cropGridH2} />
              <View style={styles.cropGridV1} />
              <View style={styles.cropGridV2} />
            </View>
            <View style={styles.cropMaskSide} />
          </View>
          <View style={styles.cropMaskBottom} />
        </View>

        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          {imageUri && (
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                {
                  width: scaledWidth || CROP_SIZE,
                  height: scaledHeight || CROP_SIZE,
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          )}
        </View>
      </View>

      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <ZoomOut size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <ZoomIn size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <View style={styles.instructionBadge}>
          <Move size={14} color="rgba(255, 255, 255, 0.64)" strokeWidth={2} />
          <Text style={styles.instructionText}>Drag to reposition image</Text>
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
          <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
            <View style={styles.cancelInner}>
              <X color="#FFFFFF" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <View style={styles.continueInner}>
              <Text style={styles.continueText}>Apply Crop</Text>
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
                    Are you sure you want to go back? Your cropping adjustments will be lost.
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
                    Are you sure you want to go back? Your cropping adjustments will be lost.
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
  header: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center',
  },
  cropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  cropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  cropMaskTop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  cropMiddleRow: {
    flexDirection: 'row',
    height: CROP_SIZE,
  },
  cropMaskSide: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  cropWindow: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    position: 'relative',
  },
  cropCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 24,
  },
  cropCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 24,
  },
  cropCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
  },
  cropCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 24,
  },
  cropGridH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cropGridH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cropGridV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cropGridV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cropMaskBottom: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -44 }],
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginHorizontal: 8,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
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
  cancelButton: {
    width: 52,
    height: 52,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelInner: {
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
