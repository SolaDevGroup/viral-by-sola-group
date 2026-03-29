import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Image,
  Animated,
  StatusBar,
  Platform,
  PanResponder,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, Send, MoreHorizontal, Volume2, VolumeX, Pause } from 'lucide-react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { MOCK_STORIES, MOCK_STORY_POSTS } from '@/constants/mockData';

Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewerScreen() {
  const params = useLocalSearchParams<{ storyId?: string; playAll?: string }>();
  const insets = useSafeAreaInsets();
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;

  const videoRef = useRef<Video>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  
  const playAll = params.playAll === 'true';
  const stories = playAll 
    ? MOCK_STORIES.filter(s => !s.isViewed && !s.isLive)
    : MOCK_STORIES.filter(s => s.id === params.storyId);
  
  const currentStory = stories[currentStoryIndex];
  const storyPosts = MOCK_STORY_POSTS.filter(p => p.storyId === currentStory?.id && !p.isViewed);
  const currentPost = storyPosts[currentPostIndex];
  


  const goToNextPost = useCallback(() => {
    if (currentPostIndex < storyPosts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setCurrentPostIndex(0);
    } else {
      router.back();
    }
  }, [currentPostIndex, currentStoryIndex, storyPosts.length, stories.length]);

  const goToPreviousPost = useCallback(() => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      const prevStoryPosts = MOCK_STORY_POSTS.filter(p => p.storyId === stories[currentStoryIndex - 1]?.id && !p.isViewed);
      setCurrentPostIndex(prevStoryPosts.length - 1);
    }
  }, [currentPostIndex, currentStoryIndex, stories]);

  const startProgressAnimation = useCallback(() => {
    progressAnimation.setValue(0);
    
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: currentPost?.type === 'video' ? (currentPost.duration || STORY_DURATION) : STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        goToNextPost();
      }
    });
  }, [currentPost, isPaused, goToNextPost, progressAnimation]);

  const pauseProgress = useCallback(() => {
    progressAnimation.stopAnimation();
    setIsPaused(true);
  }, [progressAnimation]);

  const resumeProgress = useCallback(() => {
    setIsPaused(false);
    const currentValue = (progress * (currentPost?.type === 'video' ? (currentPost.duration || STORY_DURATION) : STORY_DURATION));
    const remainingDuration = (currentPost?.type === 'video' ? (currentPost.duration || STORY_DURATION) : STORY_DURATION) - currentValue;
    
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goToNextPost();
      }
    });
  }, [progress, currentPost, goToNextPost, progressAnimation]);

  useEffect(() => {
    if (currentPost && !isPaused) {
      startProgressAnimation();
    }
    
    return () => {
      progressAnimation.stopAnimation();
    };
  }, [currentPostIndex, currentStoryIndex, currentPost, isPaused, startProgressAnimation, progressAnimation]);

  useEffect(() => {
    const listenerId = progressAnimation.addListener(({ value }) => {
      setProgress(value);
    });
    
    return () => {
      progressAnimation.removeListener(listenerId);
    };
  }, [progressAnimation]);

  const handleTapLeft = () => {
    goToPreviousPost();
  };

  const handleTapRight = () => {
    goToNextPost();
  };

  const handleLongPressIn = () => {
    pauseProgress();
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.pause();
    } else {
      videoRef.current?.pauseAsync();
    }
  };

  const handleLongPressOut = () => {
    resumeProgress();
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.play();
    } else {
      videoRef.current?.playAsync();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20 || Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          router.back();
        } else if (gestureState.dx < -100) {
          // Swipe left - go to next user's story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            setCurrentPostIndex(0);
          } else {
            router.back();
          }
        } else if (gestureState.dx > 100) {
          // Swipe right - go to previous user's story
          if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
            setCurrentPostIndex(0);
          }
        }
      },
    })
  ).current;

  const onVideoPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      goToNextPost();
    }
  };

  if (!currentStory || !currentPost) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No unseen stories</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" />
      
      {currentPost.type === 'video' && currentPost.mediaUrl ? (
        Platform.OS === 'web' ? (
          <video
            ref={webVideoRef as any}
            src={currentPost.mediaUrl}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#000',
            }}
            autoPlay
            muted={isMuted}
            playsInline
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: currentPost.mediaUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={!isPaused}
            isMuted={isMuted}
            isLooping={false}
            onPlaybackStatusUpdate={onVideoPlaybackStatusUpdate}
          />
        )
      ) : (
        <Image
          source={{ uri: currentPost.mediaUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={[styles.bottomGradient, { paddingBottom: insets.bottom }]}
      />

      <TouchableWithoutFeedback
        onPressIn={handleLongPressIn}
        onPressOut={handleLongPressOut}
      >
        <View style={styles.tapZones}>
          <TouchableOpacity 
            style={styles.tapLeft} 
            onPress={handleTapLeft}
            activeOpacity={1}
          />
          <TouchableOpacity 
            style={styles.tapRight} 
            onPress={handleTapRight}
            activeOpacity={1}
          />
        </View>
      </TouchableWithoutFeedback>

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.progressBars}>
          {storyPosts.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <View style={styles.progressBarBg} />
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: index < currentPostIndex
                      ? '100%'
                      : index === currentPostIndex
                      ? progressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {currentStory.user.avatar ? (
                <Image
                  source={{ uri: currentStory.user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
            </View>
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.username}>{currentStory.user.username}</Text>
                {currentStory.user.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedCheck}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timestamp}>{getTimeAgo(currentPost.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => setIsMuted(!isMuted)}
            >
              <BlurView intensity={40} tint="dark" style={styles.blurBtn}>
                {isMuted ? (
                  <VolumeX size={20} color="#FFFFFF" />
                ) : (
                  <Volume2 size={20} color="#FFFFFF" />
                )}
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <BlurView intensity={40} tint="dark" style={styles.blurBtn}>
                <MoreHorizontal size={20} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {currentPost.caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {currentPost.caption}
          </Text>
        )}
        
        <View style={styles.footerActions}>
          <View style={styles.replyContainer}>
            <BlurView intensity={40} tint="dark" style={styles.replyBlur}>
              <Text style={styles.replyPlaceholder}>Send a message...</Text>
            </BlurView>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <BlurView intensity={40} tint="dark" style={styles.blurActionBtn}>
              <Heart size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <BlurView intensity={40} tint="dark" style={styles.blurActionBtn}>
              <Send size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {isPaused && (
        <View style={styles.pausedIndicator}>
          <Pause size={48} color="rgba(255,255,255,0.8)" />
        </View>
      )}
    </View>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  closeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 10,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  progressBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
  },
  userDetails: {
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedCheck: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  blurBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  caption: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  replyContainer: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  replyBlur: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  replyPlaceholder: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurActionBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    zIndex: 30,
  },
});
