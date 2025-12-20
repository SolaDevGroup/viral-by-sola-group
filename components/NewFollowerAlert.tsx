import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { UserPlus, X, BadgeCheck } from 'lucide-react-native';

interface NewFollower {
  id: string;
  username: string;
  avatar: string;
  isVerified: boolean;
}

interface NewFollowerAlertProps {
  follower: NewFollower | null;
  onFollowBack: (followerId: string) => void;
  onDismiss: () => void;
  headerHeight?: number;
}

export default function NewFollowerAlert({
  follower,
  onFollowBack,
  onDismiss,
  headerHeight = 136,
}: NewFollowerAlertProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (follower) {
      setIsVisible(true);
      Animated.spring(translateY, {
        toValue: headerHeight + 16,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start(() => {
        dismissTimer.current = setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setIsVisible(false);
            onDismiss();
          });
        }, 3000);
      });
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [follower, headerHeight, translateY, onDismiss]);

  const handleDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    Animated.timing(translateY, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss();
    });
  };

  const handleFollowBack = () => {
    if (follower) {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
      onFollowBack(follower.id);
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        onDismiss();
      });
    }
  };

  if (!isVisible || !follower) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
    >
      <View style={styles.outerWrapper}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={8} tint="dark" style={styles.blurBackground} />
        ) : (
          <View style={styles.webBlurFallback} />
        )}
        <View style={styles.innerContainer}>
          <View style={styles.content}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: follower.avatar }}
                style={styles.avatar}
              />
              <View style={styles.textContainer}>
                <Text style={styles.label}>NEW FOLLOWER</Text>
                <View style={styles.usernameRow}>
                  <Text style={styles.username} numberOfLines={1}>
                    {follower.username}
                  </Text>
                  {follower.isVerified && (
                    <BadgeCheck size={14} color="#007BFF" fill="#007BFF" />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFollowBack}
                activeOpacity={0.7}
              >
                <UserPlus size={16} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <X size={16} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  outerWrapper: {
    width: 351,
    height: 60,
    borderRadius: 20,
    padding: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(18, 18, 18, 0.16)',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  webBlurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  textContainer: {
    gap: 4,
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    letterSpacing: -0.05,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.07,
    maxWidth: 120,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
