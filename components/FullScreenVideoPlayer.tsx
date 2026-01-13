import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  MoreVertical,
  Eye,
  Bookmark,
  MessageCircle,
  Heart,
  Share2,
  Volume2,
  Download,
  ChevronLeft,
  VolumeX,
} from "lucide-react-native";
import { Video as VideoType } from "@/types";
import { useContent } from "@/contexts/ContentContext";
import { LinearGradient } from "expo-linear-gradient";
import { Images } from "@/assets/images";
import colors from "@/constants/colors";
import ExpoIcons from "./ExpoIcons";
import { BlurView } from "expo-blur";
import AnimatedCircle from "./AnimatedCircle";
import { router } from "expo-router";
import AnimatedCaption from "./AnimatedCaption";
import { useDispatch, useSelector } from "react-redux";
import { toggleMute } from "@/store/slices/reelsSlice";

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
  const dispatch = useDispatch();
  const isMuted = useSelector((state: any) => state?.reels?.isMuted);

  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get("window").width > Dimensions.get("window").height
  );
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [progress, setProgress] = useState(0.5);
  const videoRef = useRef<Video>(null);
  const short = {
    caption: `Late night vibes under city lights 🌃 Sometimes the quiet moments say the most Just breathing and letting life flow`,
    tags: ["fashion", "style"],
  };
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const { likeVideo } = useContent();
  const isOrientationChanging = useRef(false);
  const orientationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Unlock orientation for this screen only
    async function changeScreenOrientation() {
      await ScreenOrientation.unlockAsync();
    }
    changeScreenOrientation();

    return () => {
      // Cleanup timeouts
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }

      // Lock back to portrait when leaving this screen
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      // Prevent rapid orientation changes
      if (isOrientationChanging.current) {
        return;
      }

      // Mark that orientation is changing
      isOrientationChanging.current = true;

      // Clear any existing timeout
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }

      setDimensions(window);
      setIsLandscape(window.width > window.height);

      // Wait longer for the video component to stabilize after orientation change
      orientationTimeoutRef.current = setTimeout(() => {
        isOrientationChanging.current = false;
      }, 1000);
    });

    // Set initial landscape state
    const initialDimensions = Dimensions.get("window");
    setIsLandscape(initialDimensions.width > initialDimensions.height);

    return () => {
      subscription?.remove();
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Skip video operations during orientation changes
    if (isOrientationChanging.current) {
      return;
    }

    if (Platform.OS === "web") {
      if (isActive && webVideoRef.current) {
        webVideoRef.current.play().catch((err) => {
          console.log("Web video play error:", err);
        });
      } else if (webVideoRef.current) {
        webVideoRef.current.pause();
      }
    } else {
      const video = videoRef.current;
      if (!video) return;

      // Add a small delay to ensure video component is mounted
      const timeoutId = setTimeout(() => {
        if (isActive) {
          video
            .getStatusAsync()
            .then((status: AVPlaybackStatus) => {
              if (status.isLoaded) {
                video.playAsync().catch((err: Error) => {
                  console.log("Video play error:", err);
                });
              }
            })
            .catch((err: Error) => {
              console.log("Video status check error:", err);
            });
        } else {
          video
            .getStatusAsync()
            .then((status: AVPlaybackStatus) => {
              if (status.isLoaded) {
                video.pauseAsync().catch((err: Error) => {
                  console.log("Video pause error:", err);
                });
              }
            })
            .catch(() => {
              // Video not ready yet, ignore
            });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isActive]);

  const toggleMuteVolume = () => {
    if (isOrientationChanging.current) {
      return;
    }
    dispatch(toggleMute());
    // setIsMuted(!isMuted);
  };

  const handlePlayPause = () => {
    // Skip if orientation is changing
    if (isOrientationChanging.current) {
      return;
    }

    if (Platform.OS === "web" && webVideoRef.current) {
      if (isPaused) {
        webVideoRef.current
          .play()
          .catch((err) => console.log("Play error:", err));
      } else {
        webVideoRef.current.pause();
      }
      setIsPaused(!isPaused);
    } else {
      const video = videoRef.current;
      if (!video) return;

      if (isPaused) {
        video
          .getStatusAsync()
          .then((status: AVPlaybackStatus) => {
            if (status.isLoaded && !isOrientationChanging.current) {
              video
                .playAsync()
                .catch((err: Error) => console.log("Play error:", err));
            }
          })
          .catch(() => {
            // Video not ready
          });
        setIsPaused(false);
      } else {
        video
          .getStatusAsync()
          .then((status: AVPlaybackStatus) => {
            if (status.isLoaded) {
              video
                .pauseAsync()
                .catch((err: Error) => console.log("Pause error:", err));
            }
          })
          .catch(() => {
            // Video not ready
          });
        setIsPaused(true);
      }
    }
  };

  const handleLike = () => {
    likeVideo(video.id);
  };

  const handleShare = () => {
    console.log("Share video:", video.id);
  };

  const handleSave = () => {
    console.log("Save video:", video.id);
  };

  const handleDownload = () => {
    console.log("Download video:", video.id);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.durationMillis && status.positionMillis) {
        setProgress(status.positionMillis / status.durationMillis);
      }
      if (status.didJustFinish) {
        const video = videoRef.current;
        if (video) {
          video
            .replayAsync()
            .catch((err: Error) => console.log("Replay error:", err));
        }
      }
    } else if ("error" in status && status.error) {
      console.log("Playback error:", status.error);
      setError("Video playback error");
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };
  const handleProfilePress = (e?: any) => {
    if (e) e.stopPropagation();
    router.push({
      pathname: "/profile/[userId]" as any,
      params: { userId: video.userId },
    });
  };

  useEffect(() => {
    if (Platform.OS === "web" && webVideoRef.current) {
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
      videoEl.addEventListener("ended", handleEnded);
      videoEl.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        videoEl.removeEventListener("ended", handleEnded);
        videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, []);

  const handleFollow = () => {
    console.log("Follow user:", video.user.id);
  };

  const handleMore = () => {
    console.log("Show more options");
  };

  return (
    <View
      style={[
        styles.container,
        { width: dimensions.width, height: dimensions.height },
      ]}
    >
      <Pressable style={styles.videoContainer} onPress={handlePlayPause}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Tap to retry</Text>
          </View>
        ) : Platform.OS === "web" ? (
          video.videoUrl ? (
            <video
              ref={webVideoRef as any}
              src={video.videoUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                backgroundColor: "#000",
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
            key={`video-${isLandscape ? "landscape" : "portrait"}`}
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
            colors={["rgba(18, 18, 18, 0.64)", "rgba(18, 18, 18, 0)"]}
            locations={[0, 1]}
            style={styles.topGradient}
            pointerEvents="none"
          />

          <LinearGradient
            colors={["rgba(18, 18, 18, 0)", "rgba(18, 18, 18, 0.64)"]}
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
              <TouchableOpacity
                style={styles.headerLeft}
                onPress={handleProfilePress}
                activeOpacity={0.7}
              >
                <View style={{ marginTop: 5, marginLeft: 8, marginRight: 6 }}>
                  <AnimatedCircle
                    size={47}
                    strokeWidth={3}
                    gap={4}
                    duration={2000}
                  >
                    {video.user.avatar ? (
                      <Image
                        source={{ uri: video.user.avatar }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]} />
                    )}
                  </AnimatedCircle>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.displayName} numberOfLines={1}>
                      {video.user.username}
                    </Text>
                    {video.user.isVerified && (
                      <ExpoIcons
                        family="MaterialIcons"
                        name="verified"
                        color={colors.iosBlue}
                        size={14}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: -3,
                    }}
                  >
                    <Text style={styles.username}>{video.user.username}</Text>
                    <View style={styles.circle} />
                    <Text style={styles.timestamp}>Just Now</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.followButton}
                onPress={handleFollow}
              >
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton} onPress={handleMore}>
                <MoreVertical color="rgba(255, 255, 255, 0.64)" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.viewsBadge, isLive && styles.liveBadge]}>
            {isLive && <View style={styles.liveDot} />}
            <Image
              source={Images.eye}
              style={{ height: 14, width: 14, tintColor: colors.white }}
            />

            <Text style={styles.viewsCount}>
              {formatCount(
                isLive && viewerCount !== undefined ? viewerCount : video.views
              )}
            </Text>
            <Text style={styles.viewsLabel}>
              {isLive ? " viewers" : " views"}
            </Text>
          </View>
        </View>
      )}

      {!isLandscape && (
        <View style={styles.bottomSection}>
          <View style={styles.AiBadge}>
            <BlurView
              intensity={16}
              tint="dark"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                overflow: "hidden",
                backgroundColor: "#FFFFFF0A",
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Poppins_600SemiBold",
                color: colors.whiteOpacity64,
              }}
            >
              CONTAINS AI
            </Text>
          </View>
          <View style={styles.captionRow}>
            <TouchableOpacity
              style={[styles.captionLeft]}
              onPress={(e: any) => {
                e.stopPropagation();
                setCaptionExpanded(!captionExpanded);
              }}
              activeOpacity={0.8}
            >
              <AnimatedCaption text={short.caption} />

              <View style={styles.tagsRow}>
                {short.tags?.slice(0, 2).map((tag, i) => (
                  <Text key={i} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>

            <View>
              <TouchableOpacity
                style={styles.soundButton}
                onPress={(e: any) => {
                  e.stopPropagation();
                  toggleMuteVolume();
                }}
              >
                {Platform.OS !== "web" ? (
                  <BlurView
                    intensity={16}
                    tint="dark"
                    style={styles.soundBtnBlur}
                  >
                    <Image
                      source={Images.add_save}
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: colors.white,
                      }}
                    />
                  </BlurView>
                ) : (
                  <View style={styles.soundBtnInner}>
                    <Image
                      source={Images.add_save}
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: colors.white,
                      }}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.captionRow, { marginBottom: 12, marginTop: 2 }]}>
            <View style={[styles.captionLeft, { gap: 8 }]}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Image
                  source={Images.location}
                  style={{ height: 12, width: 12 }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.whiteOpacity64,
                  }}
                >
                  SACRAMENTO, US
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Image source={Images.user} style={{ height: 18, width: 18 }} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_500Medium",
                    color: colors.whiteOpacity64,
                  }}
                >
                  Liked by{" "}
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    YoshiAma
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                    }}
                  >
                    133,544 others
                  </Text>
                </Text>
              </View>
            </View>
            <View>
              <TouchableOpacity
                style={styles.soundButton}
                onPress={(e: any) => {
                  e.stopPropagation();
                  toggleMuteVolume();
                }}
              >
                {Platform.OS !== "web" ? (
                  <BlurView
                    intensity={16}
                    tint="dark"
                    style={styles.soundBtnBlur}
                  >
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
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <View style={styles.actionBtnInnerPrimary}>
                <Image
                  source={video?.isLiked ? Images.heart_filled : Images.heart}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: video.isLiked
                      ? "#EE1045"
                      : colors.whiteOpacity64,
                  }}
                />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onCommentPress}>
              <View style={styles.actionBtnInner}>
                <Image
                  source={Images.message}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: colors.whiteOpacity64,
                  }}
                />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <View style={styles.actionBtnInner}>
                <Image
                  source={Images.right_up}
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: colors.whiteOpacity64,
                  }}
                />
                <Text style={styles.actionCount}>75</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <View style={styles.actionBtnInner}>
                <Image
                  source={Images.like}
                  style={{
                    height: 20,
                    width: 20,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressBar, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>
        </View>
      )}

      {isLandscape && (
        <View style={styles.landscapeControls}>
          <View style={styles.landscapeTopRow}>
            <TouchableOpacity
              style={styles.landscapeBackButton}
              onPress={onBack}
            >
              <Text style={styles.landscapeBackText}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.landscapeBottomRow}>
            <TouchableOpacity
              style={styles.landscapeActionBtn}
              onPress={handleLike}
            >
              <Image
                source={video?.isLiked ? Images.heart_filled : Images.heart}
                style={{
                  height: 24,
                  width: 24,
                  tintColor: video.isLiked ? "#EE1045" : colors.white,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.landscapeActionBtn}
              onPress={onCommentPress}
            >
              <Image
                source={Images.message}
                style={{
                  height: 24,
                  width: 24,
                  tintColor: colors.white,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.landscapeActionBtn}
              onPress={handleShare}
            >
              <Share2 color="#FFFFFF" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.landscapeActionBtn}
              onPress={toggleMuteVolume}
            >
              {isMuted ? (
                <VolumeX color="#FFFFFF" size={24} strokeWidth={2} />
              ) : (
                <Volume2 color="#FFFFFF" size={24} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#141414",
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
  },
  avatarPlaceholder: {
    backgroundColor: "#333",
  },
  topGradient: {
    position: "absolute",
    top: -1,
    left: 0,
    right: 0,
    height: 99,
    pointerEvents: "none",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 132,
    pointerEvents: "none",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 8,
    gap: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#007BFF",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 100,
  },
  userInfo: {
    justifyContent: "center",
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 9,
  },
  displayName: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
    letterSpacing: -0.07,
  },
  verifiedIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedCheck: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  username: {
    fontSize: 14,
    fontWeight: "400" as const,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.48)",
    letterSpacing: -0.07,
  },
  circle: {
    width: 3,
    height: 3,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.64)",
  },
  timestamp: {
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  followButton: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  followText: {
    fontSize: 14,
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",

    color: "#121212",
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  followingText: {
    color: "#FFFFFF",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  viewsBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingVertical: 6,
    paddingHorizontal: 10.5,
    borderRadius: 87.5,
    gap: 1.75,
  },
  viewsCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  viewsLabel: {
    fontSize: 12.25,
    fontWeight: "400" as const,
    color: "rgba(255, 255, 255, 0.64)",
  },
  liveBadge: {
    backgroundColor: "rgba(238, 16, 69, 0.8)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 42,
    gap: 12,
  },
  captionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 32,
  },
  captionLeft: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
    letterSpacing: -0.07,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tag: {
    fontSize: 14,
    fontWeight: "400" as const,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.48)",
    letterSpacing: -0.07,
    marginBottom: 4,
    marginTop: 2,
  },
  soundButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    overflow: "hidden",
  },
  soundBtnBlur: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  soundBtnInner: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 44,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 100,
    padding: 4,
  },
  actionBtnInnerPrimary: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  actionBtnInner: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255, 255, 255, 0.64)",
    textAlign: "center" as const,
  },
  progressContainer: {
    width: "100%",
    height: 4,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 100,
    overflow: "hidden",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  landscapeControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  landscapeTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  landscapeBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  landscapeBackText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  landscapeBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
  },
  landscapeActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  AiBadge: {
    borderRadius: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF29",
    alignSelf: "flex-start",
    marginBottom: 8,
    overflow: "hidden",
    paddingVertical: 2,
  },
  moreText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255, 255, 255, 0.48)",
    marginTop: 2,
  },
});
