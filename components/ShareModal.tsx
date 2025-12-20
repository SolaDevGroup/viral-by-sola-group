import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Image,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, SquarePlus, Copy, Upload } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  thumbnail?: string;
  title?: string;
  username?: string;
  date?: string;
  videoUrl?: string;
}

export default function ShareModal({
  visible,
  onClose,
  thumbnail,
  title = 'Post',
  username = 'username',
  date = 'Mar 14, 2025',
  videoUrl,
}: ShareModalProps) {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, SCREEN_HEIGHT]);
  const handleShareToStory = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Share to story');
    onClose();
  };

  const handleCopyLink = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (videoUrl) {
      await Clipboard.setStringAsync(videoUrl);
    }
    console.log('Link copied');
    onClose();
  };

  const handleExternally = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Share externally');
    onClose();
  };

  const renderContent = () => (
    <View style={styles.innerContainer}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>What Do You Want To Do?</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color="#FFFFFF" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.previewSection}>
          <View style={styles.thumbnailContainer}>
            {thumbnail ? (
              <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
            )}
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.postUsername}>By {username}</Text>
            <Text style={styles.postDate}>{date}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareToStory}>
            <View style={styles.actionIconContainer}>
              <SquarePlus color="#FFFFFF" size={32} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionLabel}>Share To Story</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
            <View style={styles.actionIconContainer}>
              <Copy color="#FFFFFF" size={32} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionLabel}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleExternally}>
            <View style={styles.actionIconContainer}>
              <Upload color="#FFFFFF" size={32} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionLabel}>Externally</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}>
              {Platform.OS !== 'web' ? (
                <BlurView intensity={8} tint="dark" style={styles.blurContainer}>
                  {renderContent()}
                </BlurView>
              ) : (
                <View style={styles.webContainer}>
                  {renderContent()}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 351,
    borderRadius: 40,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
  },
  webContainer: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  innerContainer: {
    backgroundColor: '#121212',
    borderRadius: 36,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.32,
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 32,
  },
  previewSection: {
    alignItems: 'center',
    gap: 12,
  },
  thumbnailContainer: {
    width: 58,
    height: 104,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#333',
  },
  postInfo: {
    alignItems: 'center',
    gap: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.07,
    textAlign: 'center',
  },
  postUsername: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.07,
  },
  postDate: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.06,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionButton: {
    width: 86,
    alignItems: 'center',
    gap: 16,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
});
