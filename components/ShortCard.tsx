import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
  Platform,
  Image,
  Dimensions,
  Share,
  Animated,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { MoreVertical, Eye, Bookmark, MessageCircle, Heart, Volume2, HandHeart, Lock, VolumeX, ArrowUpRight, Crown, MapPin } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { Short } from '@/types';
import SubscriptionModal from '@/components/SubscriptionModal';
import GiftModal from '@/components/GiftModal';
import ShareModal from '@/components/ShareModal';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShortCardProps {
  short: Short;
  isActive: boolean;
  onPress?: () => void;
  onCommentPress?: () => void;
  onLikeChange?: (liked: boolean, count: number) => void;
  onSaveChange?: (saved: boolean, count: number) => void;
  height?: number;
  showFullUI?: boolean;
  hasNavBar?: boolean;
  isTabBarVisible?: boolean;
  isMomentsVisible?: boolean;
  categoryColor?: string;
  isLive?: boolean;
}

export default function ShortCard({ 
  short, 
  isActive, 
  onPress,
  onCommentPress,
  onLikeChange,
  onSaveChange,
  height,
  showFullUI = true,
  hasNavBar = false,
  isTabBarVisible = true,
  isMomentsVisible = true,
  categoryColor = '#FFD700',
  isLive = false,
}: ShortCardProps) {
  const cardHeight = height ?? SCREEN_HEIGHT;
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0.5);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isLiked, setIsLiked] = useState(short.isLiked || false);
  const [likeCount, setLikeCount] = useState(short.likes);
  const [isSaved, setIsSaved] = useState(short.isBookmarked || false);
  const [saveCount, setSaveCount] = useState(short.bookmarks || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const videoRef = useRef<Video>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const saveScaleAnim = useRef(new Animated.Value(1)).current;

  const isAd = short.type === 'ad';
  const isMembership = short.type === 'membership';

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (isActive && webVideoRef.current) {
        webVideoRef.current.play().catch(err => console.log('Web video play error:', err));
      } else if (webVideoRef.current) {
        webVideoRef.current.pause();
      }
    } else {
      if (isActive) {
        videoRef.current?.playAsync().catch(err => console.log('Video play error:', err));
      } else {
        videoRef.current?.pauseAsync().catch(err => console.log('Video pause error:', err));
      }
    }
  }, [isActive]);

  useEffect(() => {
    const webVideo = webVideoRef.current;
    const nativeVideo = videoRef.current;
    
    return () => {
      if (Platform.OS === 'web' && webVideo) {
        webVideo.pause();
      } else {
        nativeVideo?.pauseAsync().catch(err => console.log('Video cleanup error:', err));
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (Platform.OS === 'web' && webVideoRef.current) {
      if (isPaused) {
        webVideoRef.current.play().catch(err => console.log('Play error:', err));
      } else {
        webVideoRef.current.pause();
      }
    } else {
      if (isPaused) {
        videoRef.current?.playAsync().catch(err => console.log('Play error:', err));
      } else {
        videoRef.current?.pauseAsync().catch(err => console.log('Pause error:', err));
      }
    }
    setIsPaused(!isPaused);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.durationMillis && status.positionMillis) {
        setProgress(status.positionMillis / status.durationMillis);
      }
      if (status.didJustFinish) {
        videoRef.current?.replayAsync().catch(err => console.log('Replay error:', err));
      }
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      const videoEl = webVideoRef.current;
      const handleEnded = () => {
        videoEl.currentTime = 0;
        videoEl.play();
      };
      const handleTimeUpdate = () => {
        if (videoEl.duration) {
          setProgress(videoEl.currentTime / videoEl.duration);
        }
      };
      videoEl.addEventListener('ended', handleEnded);
      videoEl.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        videoEl.removeEventListener('ended', handleEnded);
        videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

  const handleProfilePress = (e?: any) => {
    if (e) e.stopPropagation();
    router.push({
      pathname: '/profile/[userId]' as any,
      params: { userId: short.userId },
    });
  };

  const handleLike = (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newLiked);
    setLikeCount(newCount);
    onLikeChange?.(newLiked, newCount);
    
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleComment = (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onCommentPress?.();
  };

  const handleShare = async (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const result = await Share.share({
        message: `Check out this video by @${short.user.username}: ${short.caption}`,
        url: short.videoUrl,
        title: short.caption,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleSave = (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const newSaved = !isSaved;
    const newCount = newSaved ? saveCount + 1 : saveCount - 1;
    setIsSaved(newSaved);
    setSaveCount(newCount);
    onSaveChange?.(newSaved, newCount);
    
    Animated.sequence([
      Animated.timing(saveScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGift = (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowGiftModal(true);
  };

  const handleFollow = (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsFollowing(!isFollowing);
  };

  const handleMorePress = (e?: any) => {
    if (e) e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowShareModal(true);
  };

  return (
    <Pressable style={[styles.container, { height: cardHeight, width: SCREEN_WIDTH }]} onPress={handlePlayPause}>
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' ? (
          short.videoUrl ? (
            <video
              ref={webVideoRef as any}
              src={short.videoUrl}
              style={{
                width: SCREEN_WIDTH,
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
                display: 'block',
              }}
              autoPlay={isActive && !isPaused}
              loop
              muted={isMuted}
              playsInline
            />
          ) : (
            <View style={styles.videoPlaceholder} />
          )
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: short.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive && !isPaused}
            isLooping
            isMuted={isMuted}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            useNativeControls={false}
          />
        )}
      </View>

      <View style={styles.overlay} pointerEvents="none" />

      {isMembership && !showSubscriptionModal && (
        <View style={styles.membershipOverlay}>
          <View style={styles.membershipContent}>
            <View style={[styles.lockIconContainer, { backgroundColor: 'transparent' }]}>
              <Lock size={56} color={categoryColor} strokeWidth={2} />
            </View>
            <Text style={styles.membershipTitle}>Subscriber Only</Text>
            <Text style={styles.membershipSubtitle}>
              Subscribe to @{short.user.username} to unlock this exclusive content
            </Text>
            <TouchableOpacity 
              style={[styles.subscribeBtn, { backgroundColor: categoryColor }]}
              onPress={() => setShowSubscriptionModal(true)}
            >
              <Crown size={20} color="#121212" />
              <Text style={styles.subscribeBtnText}>Subscribe to View</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        creatorName={short.user.username}
        creatorUsername={short.user.username}
        creatorAvatar={short.user.avatar || 'https://i.pravatar.cc/150'}
        subscriberCount={short.user.followers || 0}
        accentColor={categoryColor}
      />

      {showFullUI && (
        <>
          <LinearGradient
            colors={['rgba(18, 18, 18, 0.64)', 'rgba(18, 18, 18, 0)']}
            locations={[0, 1]}
            style={styles.topGradient}
            pointerEvents="none"
          />

          <LinearGradient
            colors={['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.64)']}
            locations={[0, 1]}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
        </>
      )}

      <View style={[styles.header, !showFullUI && styles.headerCompact]}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.headerLeft}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <View style={styles.avatarRing}>
              {short.user.avatar ? (
                <Image source={{ uri: short.user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
            </View>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName} numberOfLines={1}>{short.user.username}</Text>
                {short.user.isVerified && (
                  <View style={styles.verifiedIcon}>
                    <Text style={styles.verifiedCheck}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.username}>@{short.user.username}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            {!isAd && !isMembership && (
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]} 
                onPress={handleFollow}
              >
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
            {isAd && (
              <View style={styles.sponsoredBadge}>
                {Platform.OS !== 'web' ? (
                  <BlurView intensity={16} tint="dark" style={styles.sponsoredBadgeBlur}>
                    <Text style={styles.sponsoredText}>Sponsored</Text>
                  </BlurView>
                ) : (
                  <View style={styles.sponsoredBadgeInner}>
                    <Text style={styles.sponsoredText}>Sponsored</Text>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
              {Platform.OS !== 'web' ? (
                <BlurView intensity={16} tint="dark" style={styles.moreBtnBlur}>
                  <MoreVertical color="rgba(255, 255, 255, 0.64)" size={20} />
                </BlurView>
              ) : (
                <View style={styles.moreBtnInner}>
                  <MoreVertical color="rgba(255, 255, 255, 0.64)" size={20} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {!isMembership && (
          <View style={styles.viewsBadgeWrapper}>
            {Platform.OS !== 'web' ? (
              <BlurView intensity={16} tint="dark" style={[styles.viewsBadge, isLive && styles.viewsBadgeLive]}>
                <Eye color="#FFFFFF" size={14} />
                <Text style={styles.viewsCount}>{formatCount(short.views)}</Text>
                <Text style={styles.viewsLabel}>{isLive ? 'viewers' : 'views'}</Text>
              </BlurView>
            ) : (
              <View style={[styles.viewsBadge, styles.viewsBadgeWeb, isLive && styles.viewsBadgeLive]}>
                <Eye color="#FFFFFF" size={14} />
                <Text style={styles.viewsCount}>{formatCount(short.views)}</Text>
                <Text style={styles.viewsLabel}>{isLive ? 'viewers' : 'views'}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {!isMembership && (
        <View style={[
          styles.bottomSection, 
          !showFullUI && styles.bottomSectionCompact,
          { paddingBottom: isTabBarVisible ? 12 : 42 }
        ]}>
          <View style={styles.captionInfoRow}>
            <TouchableOpacity 
              style={styles.captionInfoLeft}
              onPress={(e: any) => {
                e.stopPropagation();
                setCaptionExpanded(!captionExpanded);
              }}
              activeOpacity={0.8}
            >
              {short.category && (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{short.category}</Text>
                </View>
              )}
              <Text style={styles.caption} numberOfLines={captionExpanded ? undefined : 2}>
                {short.caption}
              </Text>
              <View style={styles.tagsRow}>
                {short.tags?.slice(0, 3).map((tag, i) => (
                  <Text key={i} style={styles.tag}>#{tag}</Text>
                ))}
              </View>
              {short.location && (
                <View style={styles.locationRow}>
                  <MapPin size={12} color="#FFFFFF" />
                  <Text style={styles.locationText}>{short.location}</Text>
                </View>
              )}
              <View style={styles.postedByRow}>
                <Image 
                  source={{ uri: short.user.avatar || 'https://i.pravatar.cc/150' }} 
                  style={styles.postedByAvatar} 
                />
                <View style={styles.postedByTextRow}>
                  <Text style={styles.postedByLabel}>Posted by </Text>
                  <Text style={styles.postedByUsername}>@{short.user.username}</Text>
                  <Text style={styles.postedByLabel}> on </Text>
                  <Text style={styles.postedByChannel}>@{short.channel || 'main'}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickSaveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              {Platform.OS !== 'web' ? (
                <BlurView intensity={8} tint="dark" style={styles.quickSaveBtnBlur}>
                  <Bookmark 
                    color="#FFFFFF" 
                    fill={isSaved ? "#FFFFFF" : "transparent"}
                    size={16} 
                  />
                </BlurView>
              ) : (
                <View style={styles.quickSaveBtnInner}>
                  <Bookmark 
                    color="#FFFFFF" 
                    fill={isSaved ? "#FFFFFF" : "transparent"}
                    size={16} 
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.soundButtonRow}>
            <TouchableOpacity 
              style={styles.soundButton}
              onPress={(e: any) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
            >
              {Platform.OS !== 'web' ? (
                <BlurView intensity={16} tint="dark" style={styles.soundBtnBlur}>
                  {isMuted ? (
                    <VolumeX color="#FFFFFF" size={16} />
                  ) : (
                    <Volume2 color="#FFFFFF" size={16} />
                  )}
                </BlurView>
              ) : (
                <View style={styles.soundBtnInner}>
                  {isMuted ? (
                    <VolumeX color="#FFFFFF" size={16} />
                  ) : (
                    <Volume2 color="#FFFFFF" size={16} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>

          {!isAd && (
            <>
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  {Platform.OS !== 'web' ? (
                    <BlurView intensity={16} tint="dark" style={[styles.actionBtnInner, isLiked && styles.actionBtnActive]}>
                      <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
                        <Heart 
                          color={isLiked ? "#EE1045" : "rgba(255, 255, 255, 0.48)"} 
                          fill={isLiked ? "#EE1045" : "transparent"}
                          size={20} 
                          strokeWidth={1.5} 
                        />
                      </Animated.View>
                      <Text style={[styles.actionCount, isLiked && styles.actionCountActive]}>
                        {formatCount(likeCount)}
                      </Text>
                    </BlurView>
                  ) : (
                    <View style={[styles.actionBtnInner, styles.actionBtnWeb, isLiked && styles.actionBtnActive]}>
                      <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
                        <Heart 
                          color={isLiked ? "#EE1045" : "rgba(255, 255, 255, 0.48)"} 
                          fill={isLiked ? "#EE1045" : "transparent"}
                          size={20} 
                          strokeWidth={1.5} 
                        />
                      </Animated.View>
                      <Text style={[styles.actionCount, isLiked && styles.actionCountActive]}>
                        {formatCount(likeCount)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  testID="comment-btn"
                  onPress={handleComment}
                  activeOpacity={0.7}
                >
                  {Platform.OS !== 'web' ? (
                    <BlurView intensity={16} tint="dark" style={styles.actionBtnInner}>
                      <MessageCircle color="rgba(255, 255, 255, 0.48)" size={20} strokeWidth={1.5} />
                      <Text style={styles.actionCount}>{formatCount(short.comments)}</Text>
                    </BlurView>
                  ) : (
                    <View style={[styles.actionBtnInner, styles.actionBtnWeb]}>
                      <MessageCircle color="rgba(255, 255, 255, 0.48)" size={20} strokeWidth={1.5} />
                      <Text style={styles.actionCount}>{formatCount(short.comments)}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  {Platform.OS !== 'web' ? (
                    <BlurView intensity={16} tint="dark" style={styles.actionBtnInner}>
                      <ArrowUpRight color="rgba(255, 255, 255, 0.48)" size={20} strokeWidth={1.5} />
                      <Text style={styles.actionCount}>{formatCount(short.shares)}</Text>
                    </BlurView>
                  ) : (
                    <View style={[styles.actionBtnInner, styles.actionBtnWeb]}>
                      <ArrowUpRight color="rgba(255, 255, 255, 0.48)" size={20} strokeWidth={1.5} />
                      <Text style={styles.actionCount}>{formatCount(short.shares)}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  {Platform.OS !== 'web' ? (
                    <BlurView intensity={16} tint="dark" style={[styles.actionBtnInner, isSaved && styles.actionBtnActive]}>
                      <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
                        <Bookmark 
                          color={isSaved ? "#FFFFFF" : "rgba(255, 255, 255, 0.64)"} 
                          fill={isSaved ? "#FFFFFF" : "transparent"}
                          size={20} 
                          strokeWidth={1.5} 
                        />
                      </Animated.View>
                      <Text style={[styles.actionCount, isSaved && styles.actionCountActive]}>
                        {formatCount(saveCount)}
                      </Text>
                    </BlurView>
                  ) : (
                    <View style={[styles.actionBtnInner, styles.actionBtnWeb, isSaved && styles.actionBtnActive]}>
                      <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
                        <Bookmark 
                          color={isSaved ? "#FFFFFF" : "rgba(255, 255, 255, 0.64)"} 
                          fill={isSaved ? "#FFFFFF" : "transparent"}
                          size={20} 
                          strokeWidth={1.5} 
                        />
                      </Animated.View>
                      <Text style={[styles.actionCount, isSaved && styles.actionCountActive]}>
                        {formatCount(saveCount)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={handleGift}
                  activeOpacity={0.7}
                >
                  {Platform.OS !== 'web' ? (
                    <BlurView intensity={16} tint="dark" style={styles.actionBtnInner}>
                      <HandHeart color="rgba(255, 255, 255, 0.64)" size={20} strokeWidth={1.5} />
                    </BlurView>
                  ) : (
                    <View style={[styles.actionBtnInner, styles.actionBtnWeb]}>
                      <HandHeart color="rgba(255, 255, 255, 0.64)" size={20} strokeWidth={1.5} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </>
          )}

          {isAd && short.adCtaText && (
            <TouchableOpacity style={styles.adCtaBtn}>
              <Text style={styles.adCtaText}>{short.adCtaText}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <GiftModal
        visible={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        creatorName={short.user.username}
        creatorAvatar={short.user.avatar}
        onGiftSent={(gift) => {
          console.log('Gift sent:', gift.name);
        }}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        thumbnail={short.thumbnailUrl || short.videoUrl}
        title={short.caption}
        username={short.user.username}
        videoUrl={short.videoUrl}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#141414',
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    width: SCREEN_WIDTH,
  },
  video: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.4)',
  },
  membershipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  membershipContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  membershipTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  membershipSubtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    textAlign: 'center' as const,
    marginBottom: 32,
    lineHeight: 22,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
  },
  topGradient: {
    position: 'absolute' as const,
    top: -1,
    left: 0,
    right: 0,
    height: 99,
    pointerEvents: 'none' as const,
  },
  bottomGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 132,
    pointerEvents: 'none' as const,
  },
  header: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 8,
    gap: 15,
  },
  headerCompact: {
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#007BFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 100,
  },
  userInfo: {
    justifyContent: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    letterSpacing: -0.07,
  },
  verifiedIcon: {
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
    fontWeight: '700' as const,
  },
  username: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    letterSpacing: -0.07,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#121212',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  followingText: {
    color: '#FFFFFF',
  },
  sponsoredBadge: {
    height: 28,
    borderRadius: 87.5,
    overflow: 'hidden',
  },
  sponsoredBadgeBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsoredBadgeInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsoredText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    overflow: 'hidden',
  },
  moreBtnBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtnInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewsBadgeWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 87.5,
    overflow: 'hidden',
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingLeft: 8.75,
    paddingRight: 10.5,
    gap: 1.75,
  },
  viewsBadgeWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  viewsBadgeLive: {
    backgroundColor: '#EE1045',
  },
  viewsCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: -0.28,
  },
  viewsLabel: {
    fontSize: 12.25,
    fontWeight: '400' as const,
    color: '#FFFFFF',
  },
  bottomSection: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 42,
    gap: 12,
  },
  bottomSectionCompact: {
    paddingTop: 8,
  },
  captionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 8,
  },
  captionInfoLeft: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 10,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 12,
  },
  postedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postedByAvatar: {
    width: 18,
    height: 18,
    borderRadius: 100,
  },
  postedByTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  postedByLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 12,
  },
  postedByUsername: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 12,
  },
  postedByChannel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    lineHeight: 12,
  },
  quickSaveButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    overflow: 'hidden',
  },
  quickSaveBtnBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickSaveBtnInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    letterSpacing: -0.07,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  tag: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    letterSpacing: -0.07,
  },
  soundButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    overflow: 'hidden',
  },
  soundBtnBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundBtnInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 44,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 100,
    padding: 4,
    overflow: 'hidden',
  },
  actionBtnInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  actionBtnWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    textAlign: 'center' as const,
  },
  actionCountActive: {
    color: '#FFFFFF',
  },
  progressContainer: {
    width: '100%',
    height: 4,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
  },
  adCtaBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  adCtaText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
  },
});
