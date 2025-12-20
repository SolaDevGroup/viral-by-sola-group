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
import { MoreVertical, Eye, Bookmark, MessageCircle, Heart, Share2, Volume2, Download, ChevronLeft } from 'lucide-react-native';
import { Video as VideoType } from '@/types';
import { useContent } from '@/contexts/ContentContext';
import { LinearGradient } from 'expo-linear-gradient';

interface FullScreenVideoPlayerProps {
  video: VideoType;
  isActive: boolean;
  onCommentPress: () => void;
  onBack: () => void;
  isLive?: boolean;
  viewerCount?: number;
}

export default function FullScreenVideoPlayer({ 
  video, 
  isActive, 
  onCommentPress,
  onBack,
  isLive = false,
  viewerCount,
}: FullScreenVideoPlayerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isLandscape, setIsLandscape] = useState(false);
  const [progress, setProgress] = useState(0.5);
  const videoRef = useRef<Video>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const { likeVideo } = useContent();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setIsLandscape(window.width > window.height);
    });

    const initialDimensions = Dimensions.get('window');
    setIsLandscape(initialDimensions.width > initialDimensions.height);

    return () => {
      subscription?.remove();
    };
  }, []);

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

  const handleLike = () => {
    likeVideo(video.id);
  };

  const handleShare = () => {
    console.log('Share video:', video.id);
  };

  const handleSave = () => {
    console.log('Save video:', video.id);
  };

  const handleDownload = () => {
    console.log('Download video:', video.id);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.durationMillis && status.positionMillis) {
        setProgress(status.positionMillis / status.durationMillis);
      }
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

  const handleFollow = () => {
    console.log('Follow user:', video.user.id);
  };

  const handleMore = () => {
    console.log('Show more options');
  };

  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
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

      {!isLandscape && (
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

      {!isLandscape && (
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <ChevronLeft color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <View style={styles.avatarRing}>
                {video.user.avatar ? (
                  <Image source={{ uri: video.user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]} />
                )}
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.displayName} numberOfLines={1}>Display Name</Text>
                  {video.user.isVerified && (
                    <View style={styles.verifiedIcon}>
                      <Text style={styles.verifiedCheck}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.username}>username</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton} onPress={handleMore}>
                <MoreVertical color="rgba(255, 255, 255, 0.64)" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.viewsBadge, isLive && styles.liveBadge]}>
            {isLive && <View style={styles.liveDot} />}
            <Eye color="#FFFFFF" size={14} />
            <Text style={styles.viewsCount}>{formatCount(isLive && viewerCount !== undefined ? viewerCount : video.views)}</Text>
            <Text style={styles.viewsLabel}>{isLive ? 'viewers' : 'views'}</Text>
          </View>
        </View>
      )}

      {!isLandscape && (
        <View style={styles.bottomSection}>
          <View style={styles.captionRow}>
            <View style={styles.captionLeft}>
              <Text style={styles.caption} numberOfLines={1}>
                Caption goes as far as one line if it continue...
              </Text>
              <View style={styles.tagsRow}>
                <Text style={styles.tag}>#tag</Text>
                <Text style={styles.tag}>#tag</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.soundButton} onPress={() => setIsMuted(!isMuted)}>
              <Volume2 color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <View style={styles.actionBtnInnerPrimary}>
                <Heart 
                  color="rgba(255, 255, 255, 0.64)" 
                  fill={video.isLiked ? "#EE1045" : "none"}
                  size={20} 
                  strokeWidth={1.5} 
                />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onCommentPress}>
              <View style={styles.actionBtnInner}>
                <MessageCircle color="rgba(255, 255, 255, 0.48)" size={20} strokeWidth={1.5} />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <View style={styles.actionBtnInner}>
                <Share2 color="rgba(255, 255, 255, 0.48)" size={20} strokeWidth={1.5} />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
              <View style={styles.actionBtnInner}>
                <Bookmark color="rgba(255, 255, 255, 0.64)" size={20} strokeWidth={1.5} />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <View style={styles.actionBtnInner}>
                <Download color="rgba(255, 255, 255, 0.64)" size={20} strokeWidth={1.5} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>
      )}

      {isLandscape && (
        <View style={styles.landscapeControls}>
          <View style={styles.landscapeTopRow}>
            <TouchableOpacity style={styles.landscapeBackButton} onPress={onBack}>
              <Text style={styles.landscapeBackText}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.landscapeBottomRow}>
            <TouchableOpacity style={styles.landscapeActionBtn} onPress={handleLike}>
              <Heart 
                color="#FFFFFF" 
                fill={video.isLiked ? "#EE1045" : "none"}
                size={24} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.landscapeActionBtn} onPress={onCommentPress}>
              <MessageCircle color="#FFFFFF" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.landscapeActionBtn} onPress={handleShare}>
              <Share2 color="#FFFFFF" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.landscapeActionBtn} onPress={() => setIsMuted(!isMuted)}>
              <Volume2 color="#FFFFFF" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
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
  topGradient: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 99,
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 132,
    pointerEvents: 'none',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 8,
    gap: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
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
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#121212',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingHorizontal: 10.5,
    borderRadius: 87.5,
    gap: 1.75,
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
    color: 'rgba(255, 255, 255, 0.64)',
  },
  liveBadge: {
    backgroundColor: 'rgba(238, 16, 69, 0.8)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 42,
    gap: 12,
  },
  captionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
  },
  captionLeft: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
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
  },
  tag: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    letterSpacing: -0.07,
  },
  soundButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
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
  },
  actionBtnInnerPrimary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  actionBtnInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    textAlign: 'center' as const,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  landscapeControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  landscapeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landscapeBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeBackText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  landscapeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  landscapeActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
