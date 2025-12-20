import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Heart, MessageCircle, Share2, Bookmark, Volume, ChevronLeft, MoreVertical, Eye } from 'lucide-react-native';
import { Video as VideoType } from '@/types';
import Colors from '@/constants/colors';
import { useContent } from '@/contexts/ContentContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  video: VideoType;
  isActive: boolean;
  onCommentPress: () => void;
  orientation?: 'portrait' | 'landscape';
}

export default function VideoPlayer({ video, isActive, onCommentPress, orientation = 'portrait' }: VideoPlayerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const { likeVideo } = useContent();

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (isActive && webVideoRef.current) {
        webVideoRef.current.play().catch(err => {
          console.log('Web video play error:', err);
        });
      } else if (webVideoRef.current) {
        webVideoRef.current.pause();
      }
    } else {
      if (isActive) {
        videoRef.current?.playAsync().catch(err => {
          console.log('Video play error:', err);
          setError('Failed to play video');
        });
      } else {
        videoRef.current?.pauseAsync().catch(err => {
          console.log('Video pause error:', err);
        });
      }
    }
  }, [isActive]);

  const handlePlayPause = () => {
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

  const handleMuteToggle = () => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      webVideoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    likeVideo(video.id);
  };

  const handleShare = () => {
    console.log('Share video:', video.id);
  };

  const handleSave = () => {
    console.log('Save video:', video.id);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        videoRef.current?.replayAsync().catch(err => console.log('Replay error:', err));
      }
    } else if ('error' in status && status.error) {
      console.log('Playback error:', status.error);
      setError('Video playback error');
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const isLandscape = orientation === 'landscape';

  useEffect(() => {
    if (Platform.OS === 'web' && webVideoRef.current) {
      const video = webVideoRef.current;
      const handleEnded = () => {
        video.currentTime = 0;
        video.play();
      };
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const handleFollow = () => {
    console.log('Follow user:', video.user.id);
  };

  const handleMore = () => {
    console.log('Show more options');
  };

  const handleBack = () => {
    console.log('Go back');
  };

  const extractHashtags = (text: string): string => {
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    return matches ? matches.join(' ') : '';
  };

  const getCaptionWithoutHashtags = (text: string): string => {
    return text.replace(/#[a-zA-Z0-9_]+/g, '').trim();
  };

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <Pressable style={styles.videoContainer} onPress={handlePlayPause}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Tap to retry</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          video.videoUrl ? (
            <video
              ref={webVideoRef as any}
              src={video.videoUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
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
            source={{ uri: video.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive && !isPaused}
            isLooping
            isMuted={isMuted}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            useNativeControls={false}
          />
        )}
      </Pressable>

      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.15, 0.7, 1]}
        style={styles.gradientOverlay}
        pointerEvents="box-none"
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color={Colors.white} size={28} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <View style={styles.userBadge}>
              <View style={styles.avatarRing}>
                {video.user.avatar ? (
                  <Image source={{ uri: video.user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]} />
                )}
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.displayName}>Display Name</Text>
                  {video.user.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedCheck}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.username}>username</Text>
              </View>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton} onPress={handleMore}>
              <MoreVertical color={Colors.white} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.viewsContainer}>
          <View style={styles.viewsBadge}>
            <Eye color={Colors.white} size={16} />
            <Text style={styles.viewsText}>{formatCount(video.views)} views</Text>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <View style={styles.leftBottom}>
            <Text style={styles.caption} numberOfLines={2}>
              {getCaptionWithoutHashtags(video.caption)}
            </Text>
            {extractHashtags(video.caption) && (
              <Text style={styles.hashtags}>
                {extractHashtags(video.caption)}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.likeButtonContainer} onPress={handleLike}>
              <Heart
                color={video.isLiked ? Colors.error : Colors.black}
                fill={video.isLiked ? Colors.error : Colors.white}
                size={24}
              />
              <Text style={[styles.likeCount, video.isLiked && styles.likeCountActive]}>
                {formatCount(video.likes)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
              <View style={styles.actionCircle}>
                <MessageCircle color={Colors.white} size={28} strokeWidth={2} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View style={styles.actionCircle}>
                <Share2 color={Colors.white} size={26} strokeWidth={2} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <View style={styles.actionCircle}>
                <Bookmark color={Colors.white} size={26} strokeWidth={2} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleMuteToggle}>
              <View style={styles.actionCircle}>
                <Volume color={Colors.white} size={28} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.black,
  },
  landscapeContainer: {
    width: SCREEN_HEIGHT,
    height: SCREEN_WIDTH,
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: '100%',
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
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarCenter: {
    flex: 1,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedCheck: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  username: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400' as const,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 16,
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewsText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
  },
  leftBottom: {
    gap: 4,
    paddingRight: 80,
  },
  caption: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  hashtags: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '400' as const,
  },
  actions: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 16,
    alignItems: 'center',
  },
  likeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
  },
  likeCount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  likeCountActive: {
    color: Colors.error,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
