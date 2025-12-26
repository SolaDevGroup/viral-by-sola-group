import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Animated, Modal, TextInput, KeyboardAvoidingView, Platform, NativeScrollEvent, NativeSyntheticEvent, TouchableWithoutFeedback, ScrollView, Alert } from "react-native";
import { useState, useRef, useCallback } from "react";
import { Stack, router, Href } from "expo-router";
import { Home, Eye, Link2, DollarSign, ChevronRight, ArrowUpDown, Share2, Edit3, BadgeCheck, X, Check, Camera, Lock, Users, Globe, Megaphone, Info, SlidersHorizontal, UserPlus, Star, Palette, Sun, Moon, ImageIcon, Video as VideoIcon, Volume2, VolumeX, Trophy } from "lucide-react-native";
import { Video, ResizeMode } from 'expo-av';
import { useApp } from "@/contexts/AppContext";
import { MOCK_SHORTS } from "@/constants/mockData";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const GRID_GAP = 2;
const ITEM_SIZE = (width - GRID_GAP * 2) / 3;

const PROFILE_COLORS = [
  '#014D3A', '#1A9D7C', '#0D7C66', '#2C6E49', '#1B4D3E',
  '#2F5233', '#3D5A3E', '#006D5B', '#004D40', '#00695C',
  '#1565C0', '#0D47A1', '#1976D2', '#283593', '#303F9F',
  '#512DA8', '#5E35B1', '#7B1FA2', '#8E24AA', '#6A1B9A',
  '#C2185B', '#D81B60', '#E91E63', '#AD1457', '#880E4F',
  '#D84315', '#E64A19', '#BF360C', '#5D4037', '#4E342E',
];

type TabType = 'shorts' | 'liked' | 'saved' | 'history';
type SortType = 'recent' | 'oldest' | 'popular';
type VisibilityType = 'private' | 'followers' | 'subscribers' | 'public';

const MOCK_POSTS = MOCK_SHORTS.filter(s => s.type === 'regular').slice(0, 9);
const MOCK_LIKED = MOCK_SHORTS.slice(2, 11);
const MOCK_HISTORY = MOCK_SHORTS.slice(0, 12);


export default function ProfileScreen() {
  const { user, isDarkMode, accentColor, setAccentColor, toggleDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<TabType>('shorts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);
  const [showBannerPickerModal, setShowBannerPickerModal] = useState(false);
  const [customBanner, setCustomBanner] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<'image' | 'video'>('image');
  const [isBannerMuted, setIsBannerMuted] = useState(true);
  
  const userWorldRank = 42;
  const isTop99Percentile = userWorldRank <= 100;
  
  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [editName, setEditName] = useState('James Wilson');
  const [editUsername, setEditUsername] = useState('jameswilson');
  const [editBio, setEditBio] = useState(user?.bio || "Creating viral content daily ✨ Views > Everything");
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickyHeaderAnim = useRef(new Animated.Value(-200)).current;
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { updateUser } = useApp();

  const STICKY_HEADER_THRESHOLD = 850;

  const MAX_BIO_LENGTH = 150;

  const handleSaveProfile = () => {
    console.log('Saving profile:', { editName, editUsername, editBio });
    updateUser({
      username: editUsername,
      bio: editBio,
    });
    setShowEditModal(false);
  };

  const openEditModal = () => {
    setEditName('James Wilson');
    setEditUsername(user?.username || 'jameswilson');
    setEditBio(user?.bio || "Creating viral content daily ✨ Views > Everything");
    setShowEditModal(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getSortLabel = (): string => {
    switch (sortBy) {
      case 'recent': return 'Most Recent';
      case 'oldest': return 'Oldest';
      case 'popular': return 'Most Popular';
      default: return 'Most Recent';
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'private': return <Lock size={20} color={theme.text} strokeWidth={2} />;
      case 'followers': return <Users size={20} color={theme.text} strokeWidth={2} />;
      case 'subscribers': return <DollarSign size={20} color={theme.text} strokeWidth={2} />;
      case 'public': return <Globe size={20} color={theme.text} strokeWidth={2} />;
      default: return <Globe size={20} color={theme.text} strokeWidth={2} />;
    }
  };

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    if (offsetY > STICKY_HEADER_THRESHOLD && !showStickyHeader) {
      setShowStickyHeader(true);
      Animated.spring(stickyHeaderAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (offsetY <= STICKY_HEADER_THRESHOLD && showStickyHeader) {
      setShowStickyHeader(false);
      Animated.spring(stickyHeaderAnim, {
        toValue: -200,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [showStickyHeader, stickyHeaderAnim]);

  const handleFollowPress = useCallback(() => {
    setIsFollowing(!isFollowing);
  }, [isFollowing]);

  const handleBannerPress = () => {
    console.log('Banner pressed - opening media picker modal');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBannerPickerModal(true);
  };

  const pickImage = async () => {
    console.log('Picking image...');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Image selected:', result.assets[0].uri);
        setCustomBanner(result.assets[0].uri);
        setBannerType('image');
        setShowBannerPickerModal(false);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    console.log('Picking video...');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Video selected:', result.assets[0].uri);
        setCustomBanner(result.assets[0].uri);
        setBannerType('video');
        setShowBannerPickerModal(false);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.bannerContainer, { opacity: bannerOpacity }]}>
          <TouchableOpacity 
            style={styles.bannerTouchable}
            onPress={handleBannerPress}
            activeOpacity={0.9}
          >
            {customBanner && bannerType === 'video' ? (
              <Video
                source={{ uri: customBanner }}
                style={styles.bannerImage}
                resizeMode={ResizeMode.COVER}
                shouldPlay={true}
                isLooping={true}
                isMuted={isBannerMuted}
                useNativeControls={false}
              />
            ) : (
              <Image
                source={{ uri: customBanner || user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&h=600&fit=crop' }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
          
          <View style={[styles.bannerTopBar, { paddingTop: insets.top + 8 }]}>
            <View style={styles.bannerTopLeft}>
              <TouchableOpacity style={styles.bannerIconBtn} onPress={() => router.push('/')}>
                <BlurView intensity={20} tint="light" style={styles.bannerIconBlur} />
                <Home size={20} color="#F8F9FB" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bannerIconBtn} onPress={() => setShowColorPickerModal(true)}>
                <BlurView intensity={20} tint="light" style={styles.bannerIconBlur} />
                <Palette size={20} color="#F8F9FB" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.bannerTopRight}>
              {bannerType === 'video' && customBanner && (
                <TouchableOpacity 
                  style={styles.bannerIconBtn} 
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsBannerMuted(!isBannerMuted);
                  }}
                >
                  <BlurView intensity={20} tint="light" style={styles.bannerIconBlur} />
                  {isBannerMuted ? (
                    <VolumeX size={20} color="#fff" strokeWidth={2} />
                  ) : (
                    <Volume2 size={20} color="#fff" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.bannerIconBtn} onPress={() => router.push('/insights' as Href)}>
                <BlurView intensity={20} tint="light" style={styles.bannerIconBlur} />
                <Info size={20} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bannerIconBtn} onPress={() => router.push('/settings' as Href)}>
                <BlurView intensity={20} tint="light" style={styles.bannerIconBlur} />
                <SlidersHorizontal size={20} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {isTop99Percentile && (
            <View style={styles.rankBadgeContainer}>
              <BlurView intensity={20} tint="light" style={styles.rankBadgeBlur} />
              <View style={styles.rankBadgeContent}>
                <View style={styles.rankIconContainer}>
                  <Trophy size={14} color="#FFD700" strokeWidth={2.5} fill="#FFD700" />
                </View>
                <Text style={styles.rankBadgeText}>#{userWorldRank}</Text>
                <Text style={styles.rankBadgeLabel}>Worldwide</Text>
              </View>
            </View>
          )}

          <View style={styles.bannerBottomBar}>
            <LinearGradient
              colors={['rgba(18, 18, 18, 0)', getColorWithOpacity(accentColor, 0.64)]}
              style={styles.bannerBottomGradient}
            />
            <View style={styles.gradientBlurContainer}>
              <BlurView intensity={0} tint="dark" style={[styles.gradientBlurLayer, { height: '20%', top: 0 }]} />
              <BlurView intensity={5} tint="dark" style={[styles.gradientBlurLayer, { height: '20%', top: '20%' }]} />
              <BlurView intensity={10} tint="dark" style={[styles.gradientBlurLayer, { height: '20%', top: '40%' }]} />
              <BlurView intensity={15} tint="dark" style={[styles.gradientBlurLayer, { height: '20%', top: '60%' }]} />
              <BlurView intensity={20} tint="dark" style={[styles.gradientBlurLayer, { height: '40%', top: '80%' }]} />
            </View>
            <TouchableOpacity
              style={styles.bannerQrButton}
              onPress={() => router.push('/qr-code' as any)}
              activeOpacity={0.8}
            >
              <View style={styles.bannerQrOuter}>
                <View style={styles.bannerQrInner}>
                  <View style={styles.bannerQrIcon}>
                    <View style={styles.bannerQrCornerTL} />
                    <View style={styles.bannerQrCornerTR} />
                    <View style={styles.bannerQrCornerBL} />
                    <View style={styles.bannerQrCornerBR} />
                    <View style={styles.bannerQrCenter} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.profileHeader}>
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: theme.text }]}>James Wilson</Text>
              <BadgeCheck size={20} color="#1A9D7C" fill="#1A9D7C" strokeWidth={0} />
            </View>
            <Text style={[styles.username, { color: theme.textSecondary }]}>@{user?.username || 'jameswilson'}</Text>
          </View>
        </View>

        <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
          <View style={styles.viralRow}>
            <Link2 size={16} color={theme.text} strokeWidth={2} />
            <Text style={[styles.viralLabel, { color: theme.text }]}>Viral</Text>
            <View style={[styles.viralDivider, { backgroundColor: theme.border }]} />
            <Text style={[styles.latestLabel, { color: theme.textSecondary }]}>Latest Content</Text>
          </View>

          <View style={styles.viewsHighlight}>
            <Eye size={24} color={theme.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.viewsNumber, { color: theme.text }]}>{formatNumber(user?.totalViews || 45500000)}</Text>
            <Text style={[styles.viewsLabel, { color: theme.textSecondary }]}>Total Views</Text>
          </View>

          <Text style={[styles.bio, { color: theme.textSecondary }]}>
            {user?.bio || "Hi I'm James, let's bond. Who cares, I'm awesome. Love me or hate me but you will never change me."}
          </Text>

          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>125K</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Likes</Text>
            </TouchableOpacity>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <TouchableOpacity style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>{formatNumber(user?.followers || 125000)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
            </TouchableOpacity>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <TouchableOpacity style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>{formatNumber(user?.following || 125000)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={openEditModal}>
              <Edit3 size={18} color={theme.text} strokeWidth={2} />
              <Text style={[styles.editProfileText, { color: theme.text }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareProfileBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Share2 size={18} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.monetizationCard} activeOpacity={0.85} onPress={() => router.push('/monetization' as Href)}>
            <View style={[styles.monetizationGradient, { backgroundColor: accentColor }]}>
              <View style={styles.monetizationIconWrap}>
                <DollarSign size={20} color="#fff" strokeWidth={2.5} />
              </View>
              <View style={styles.monetizationContent}>
                <Text style={styles.monetizationTitle}>Creator Monetization</Text>
                <Text style={styles.monetizationDesc}>Set up subscriptions & pricing</Text>
              </View>
              <View style={styles.monetizationArrow}>
                <ChevronRight size={20} color="#fff" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adCard} activeOpacity={0.85} onPress={() => router.push('/create-ad' as any)}>
            <View style={styles.adCardGradient}>
              <View style={styles.adIconWrap}>
                <Megaphone size={20} color="#fff" strokeWidth={2.5} />
              </View>
              <View style={styles.adCardContent}>
                <Text style={styles.adCardTitle}>Create Ad Campaign</Text>
                <Text style={styles.adCardDesc}>Promote your content & reach more</Text>
              </View>
              <View style={styles.adCardArrow}>
                <ChevronRight size={20} color="#fff" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'shorts' && [styles.tabItemActive, { backgroundColor: getColorWithOpacity(accentColor, isDarkMode ? 0.16 : 0.08) }]]}
              onPress={() => setSelectedTab('shorts')}
            >
              <Text style={[styles.tabLabel, { color: accentColor }]}>Shorts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'liked' && [styles.tabItemActive, { backgroundColor: getColorWithOpacity(accentColor, isDarkMode ? 0.16 : 0.08) }]]}
              onPress={() => setSelectedTab('liked')}
            >
              <Text style={[styles.tabLabel, { color: accentColor }]}>Liked</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'saved' && [styles.tabItemActive, { backgroundColor: getColorWithOpacity(accentColor, isDarkMode ? 0.16 : 0.08) }]]}
              onPress={() => setSelectedTab('saved')}
            >
              <Text style={[styles.tabLabel, { color: accentColor }]}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'history' && [styles.tabItemActive, { backgroundColor: getColorWithOpacity(accentColor, isDarkMode ? 0.16 : 0.08) }]]}
              onPress={() => setSelectedTab('history')}
            >
              <Text style={[styles.tabLabel, { color: accentColor }]}>History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sortRow}>
            <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortModal(true)}>
              <ArrowUpDown size={16} color={theme.text} strokeWidth={2} />
              <Text style={[styles.sortText, { color: theme.text }]}>{getSortLabel()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowVisibilityModal(true)}>
              {getVisibilityIcon()}
            </TouchableOpacity>
          </View>

          {selectedTab === 'shorts' && (
            <View style={styles.gridContainer}>
              {MOCK_POSTS.map((post, index) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/video-feed?startIndex=${index}` as Href)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: post.thumbnailUrl }}
                    style={styles.gridThumbnail}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gridOverlay}
                  >
                    <View style={styles.gridViewsBadge}>
                      <Eye size={12} color="#fff" strokeWidth={2} />
                      <Text style={styles.gridViewsText}>{formatNumber(post.views)}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedTab === 'liked' && (
            <View style={styles.gridContainer}>
              {MOCK_LIKED.map((post, index) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/video-feed?startIndex=${index}` as Href)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: post.thumbnailUrl }}
                    style={styles.gridThumbnail}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gridOverlay}
                  >
                    <View style={styles.gridViewsBadge}>
                      <Eye size={12} color="#fff" strokeWidth={2} />
                      <Text style={styles.gridViewsText}>{formatNumber(post.views)}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedTab === 'saved' && (
            <View style={styles.gridContainer}>
              {MOCK_SHORTS.slice(5, 14).map((post, index) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/video-feed?startIndex=${index}` as Href)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: post.thumbnailUrl }}
                    style={styles.gridThumbnail}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gridOverlay}
                  >
                    <View style={styles.gridViewsBadge}>
                      <Eye size={12} color="#fff" strokeWidth={2} />
                      <Text style={styles.gridViewsText}>{formatNumber(post.views)}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedTab === 'history' && (
            <View style={styles.gridContainer}>
              {MOCK_HISTORY.map((post, index) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridItem}
                  onPress={() => router.push(`/video-feed?startIndex=${index}` as Href)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: post.thumbnailUrl }}
                    style={styles.gridThumbnail}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gridOverlay}
                  >
                    <View style={styles.gridViewsBadge}>
                      <Eye size={12} color="#fff" strokeWidth={2} />
                      <Text style={styles.gridViewsText}>{formatNumber(post.views)}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <Animated.View 
        style={[
          styles.stickyHeader,
          { 
            paddingTop: insets.top,
            transform: [{ translateY: stickyHeaderAnim }]
          }
        ]}
        pointerEvents={showStickyHeader ? 'auto' : 'none'}
      >
        <Image
          source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&h=600&fit=crop' }}
          style={styles.stickyHeaderBanner}
          resizeMode="cover"
        />
        <View style={styles.stickyHeaderOverlay} />
        
        <View style={styles.stickyHeaderContent}>
          <View style={styles.stickyHeaderLeft}>
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=400&fit=crop' }}
              style={styles.stickyHeaderAvatar}
            />
            <View style={styles.stickyHeaderInfo}>
              <View style={styles.stickyHeaderNameRow}>
                <Text style={styles.stickyHeaderName} numberOfLines={1}>James Wilson</Text>
                <BadgeCheck size={14} color="#007BFF" fill="#007BFF" strokeWidth={0} />
                <Star size={14} color="#FFD700" fill="#FFD700" strokeWidth={0} />
              </View>
              <Text style={styles.stickyHeaderUsername}>@{user?.username || 'jameswilson'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.stickyFollowBtn,
              isFollowing && styles.stickyFollowingBtn
            ]} 
            onPress={handleFollowPress}
            activeOpacity={0.8}
          >
            {!isFollowing && <UserPlus size={16} color="#121212" strokeWidth={2} />}
            <Text style={[
              styles.stickyFollowText,
              isFollowing && styles.stickyFollowingText
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.stickyTabsContainer}>
          <View style={styles.stickyTabsRow}>
            <TouchableOpacity
              style={[styles.stickyTabItem, selectedTab === 'shorts' && [styles.stickyTabItemActive, { backgroundColor: getColorWithOpacity(accentColor, 0.08) }]]}
              onPress={() => setSelectedTab('shorts')}
            >
              <Text style={[styles.stickyTabLabel, { color: accentColor }]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stickyTabItem, selectedTab === 'liked' && [styles.stickyTabItemActive, { backgroundColor: getColorWithOpacity(accentColor, 0.08) }]]}
              onPress={() => setSelectedTab('liked')}
            >
              <Text style={[styles.stickyTabLabel, { color: accentColor }]}>Liked</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stickyTabItem, selectedTab === 'saved' && [styles.stickyTabItemActive, { backgroundColor: getColorWithOpacity(accentColor, 0.08) }]]}
              onPress={() => setSelectedTab('saved')}
            >
              <Text style={[styles.stickyTabLabel, { color: accentColor }]}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stickyTabItem, selectedTab === 'history' && [styles.stickyTabItemActive, { backgroundColor: getColorWithOpacity(accentColor, 0.08) }]]}
              onPress={() => setSelectedTab('history')}
            >
              <Text style={[styles.stickyTabLabel, { color: accentColor }]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.stickySortRow}>
          <TouchableOpacity style={styles.stickySortBtn} onPress={() => setShowSortModal(true)}>
            <ArrowUpDown size={20} color="#121212" strokeWidth={2} />
            <Text style={styles.stickySortText}>{getSortLabel()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowVisibilityModal(true)}>
            {getVisibilityIcon()}
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal
        visible={showEditModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
          <View style={styles.floatingModalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.floatingModalKeyboard}
            >
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.floatingModalWrapper}>
                  {Platform.OS !== 'web' ? (
                    <BlurView intensity={8} tint="dark" style={styles.floatingModalBlur}>
                      <View style={styles.floatingModalInner}>
                        <View style={styles.floatingModalHeader}>
                          <TouchableOpacity 
                            style={styles.floatingModalCloseBtn} 
                            onPress={() => setShowEditModal(false)}
                          >
                            <X size={16} color="#FFFFFF" strokeWidth={2} />
                          </TouchableOpacity>
                          <Text style={styles.floatingModalTitle}>Edit Profile</Text>
                          <TouchableOpacity 
                            style={[styles.floatingModalSaveBtn, { backgroundColor: accentColor }]} 
                            onPress={handleSaveProfile}
                          >
                            <Check size={16} color="#fff" strokeWidth={2.5} />
                          </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.floatingModalContent} showsVerticalScrollIndicator={false}>
                          <View style={styles.editAvatarSection}>
                            <View style={styles.editAvatarContainer}>
                              <Image
                                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=400&fit=crop' }}
                                style={[styles.editAvatar, { borderColor: accentColor }]}
                              />
                              <TouchableOpacity style={[styles.editAvatarBadge, { backgroundColor: accentColor }]}>
                                <Camera size={16} color="#fff" strokeWidth={2} />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                              style={styles.textInput}
                              value={editName}
                              onChangeText={setEditName}
                              placeholder="Your Name"
                              placeholderTextColor="#666"
                            />
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <View style={styles.usernameInputContainer}>
                              <Text style={styles.usernamePrefix}>@</Text>
                              <TextInput
                                style={styles.usernameInput}
                                value={editUsername}
                                onChangeText={setEditUsername}
                                placeholder="your.username"
                                placeholderTextColor="#666"
                                autoCapitalize="none"
                              />
                            </View>
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                              style={styles.bioInput}
                              value={editBio}
                              onChangeText={(text) => {
                                if (text.length <= MAX_BIO_LENGTH) {
                                  setEditBio(text);
                                }
                              }}
                              placeholder="Write something about yourself..."
                              placeholderTextColor="#666"
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                            />
                            <Text style={styles.bioCounter}>{editBio.length}/{MAX_BIO_LENGTH}</Text>
                          </View>

                          <TouchableOpacity 
                            style={[styles.saveChangesBtn, { backgroundColor: accentColor }]} 
                            onPress={handleSaveProfile}
                          >
                            <Text style={styles.saveChangesBtnText}>Save Changes</Text>
                          </TouchableOpacity>
                        </ScrollView>
                      </View>
                    </BlurView>
                  ) : (
                    <View style={styles.floatingModalWebContainer}>
                      <View style={styles.floatingModalInner}>
                        <View style={styles.floatingModalHeader}>
                          <TouchableOpacity 
                            style={styles.floatingModalCloseBtn} 
                            onPress={() => setShowEditModal(false)}
                          >
                            <X size={16} color="#FFFFFF" strokeWidth={2} />
                          </TouchableOpacity>
                          <Text style={styles.floatingModalTitle}>Edit Profile</Text>
                          <TouchableOpacity 
                            style={[styles.floatingModalSaveBtn, { backgroundColor: accentColor }]} 
                            onPress={handleSaveProfile}
                          >
                            <Check size={16} color="#fff" strokeWidth={2.5} />
                          </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.floatingModalContent} showsVerticalScrollIndicator={false}>
                          <View style={styles.editAvatarSection}>
                            <View style={styles.editAvatarContainer}>
                              <Image
                                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=400&fit=crop' }}
                                style={[styles.editAvatar, { borderColor: accentColor }]}
                              />
                              <TouchableOpacity style={[styles.editAvatarBadge, { backgroundColor: accentColor }]}>
                                <Camera size={16} color="#fff" strokeWidth={2} />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                              style={styles.textInput}
                              value={editName}
                              onChangeText={setEditName}
                              placeholder="Your Name"
                              placeholderTextColor="#666"
                            />
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <View style={styles.usernameInputContainer}>
                              <Text style={styles.usernamePrefix}>@</Text>
                              <TextInput
                                style={styles.usernameInput}
                                value={editUsername}
                                onChangeText={setEditUsername}
                                placeholder="your.username"
                                placeholderTextColor="#666"
                                autoCapitalize="none"
                              />
                            </View>
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                              style={styles.bioInput}
                              value={editBio}
                              onChangeText={(text) => {
                                if (text.length <= MAX_BIO_LENGTH) {
                                  setEditBio(text);
                                }
                              }}
                              placeholder="Write something about yourself..."
                              placeholderTextColor="#666"
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                            />
                            <Text style={styles.bioCounter}>{editBio.length}/{MAX_BIO_LENGTH}</Text>
                          </View>

                          <TouchableOpacity 
                            style={[styles.saveChangesBtn, { backgroundColor: accentColor }]} 
                            onPress={handleSaveProfile}
                          >
                            <Text style={styles.saveChangesBtnText}>Save Changes</Text>
                          </TouchableOpacity>
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showSortModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSortModal(false)}>
          <View style={styles.floatingModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.floatingModalWrapper}>
                {Platform.OS !== 'web' ? (
                  <BlurView intensity={8} tint="dark" style={styles.floatingModalBlur}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Sort By</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowSortModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <TouchableOpacity
                          style={[styles.floatingOption, sortBy === 'recent' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSortBy('recent');
                            setShowSortModal(false);
                          }}
                        >
                          <Text style={[styles.floatingOptionText, sortBy === 'recent' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                            Most Recent
                          </Text>
                          {sortBy === 'recent' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, sortBy === 'oldest' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSortBy('oldest');
                            setShowSortModal(false);
                          }}
                        >
                          <Text style={[styles.floatingOptionText, sortBy === 'oldest' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                            Oldest
                          </Text>
                          {sortBy === 'oldest' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, sortBy === 'popular' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSortBy('popular');
                            setShowSortModal(false);
                          }}
                        >
                          <Text style={[styles.floatingOptionText, sortBy === 'popular' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                            Most Popular
                          </Text>
                          {sortBy === 'popular' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </BlurView>
                ) : (
                  <View style={styles.floatingModalWebContainer}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Sort By</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowSortModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <TouchableOpacity
                          style={[styles.floatingOption, sortBy === 'recent' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setSortBy('recent');
                            setShowSortModal(false);
                          }}
                        >
                          <Text style={[styles.floatingOptionText, sortBy === 'recent' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                            Most Recent
                          </Text>
                          {sortBy === 'recent' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, sortBy === 'oldest' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setSortBy('oldest');
                            setShowSortModal(false);
                          }}
                        >
                          <Text style={[styles.floatingOptionText, sortBy === 'oldest' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                            Oldest
                          </Text>
                          {sortBy === 'oldest' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, sortBy === 'popular' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setSortBy('popular');
                            setShowSortModal(false);
                          }}
                        >
                          <Text style={[styles.floatingOptionText, sortBy === 'popular' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                            Most Popular
                          </Text>
                          {sortBy === 'popular' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showVisibilityModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowVisibilityModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowVisibilityModal(false)}>
          <View style={styles.floatingModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.floatingModalWrapper}>
                {Platform.OS !== 'web' ? (
                  <BlurView intensity={8} tint="dark" style={styles.floatingModalBlur}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Content Visibility</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowVisibilityModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'private' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setVisibility('private');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <Lock size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'private' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Private
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Only you can see</Text>
                            </View>
                          </View>
                          {visibility === 'private' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'followers' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setVisibility('followers');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <Users size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'followers' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Followers
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Only your followers</Text>
                            </View>
                          </View>
                          {visibility === 'followers' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'subscribers' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setVisibility('subscribers');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <DollarSign size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'subscribers' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Subscribers
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Subscribers only</Text>
                            </View>
                          </View>
                          {visibility === 'subscribers' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'public' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setVisibility('public');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <Globe size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'public' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Public
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Everyone can see</Text>
                            </View>
                          </View>
                          {visibility === 'public' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </BlurView>
                ) : (
                  <View style={styles.floatingModalWebContainer}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Content Visibility</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowVisibilityModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'private' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setVisibility('private');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <Lock size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'private' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Private
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Only you can see</Text>
                            </View>
                          </View>
                          {visibility === 'private' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'followers' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setVisibility('followers');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <Users size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'followers' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Followers
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Only your followers</Text>
                            </View>
                          </View>
                          {visibility === 'followers' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'subscribers' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setVisibility('subscribers');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <DollarSign size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'subscribers' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Subscribers
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Subscribers only</Text>
                            </View>
                          </View>
                          {visibility === 'subscribers' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.floatingOption, visibility === 'public' && [styles.floatingOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]]}
                          onPress={() => {
                            setVisibility('public');
                            setShowVisibilityModal(false);
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={styles.floatingVisibilityIcon}>
                              <Globe size={18} color="#888" strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, visibility === 'public' && [styles.floatingOptionTextActive, { color: accentColor }]]}>
                                Public
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Everyone can see</Text>
                            </View>
                          </View>
                          {visibility === 'public' && <Check size={20} color={accentColor} strokeWidth={2.5} />}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showColorPickerModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowColorPickerModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowColorPickerModal(false)}>
          <View style={styles.floatingModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.floatingModalWrapper}>
                {Platform.OS !== 'web' ? (
                  <BlurView intensity={8} tint="dark" style={styles.floatingModalBlur}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Profile Color Theme</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowColorPickerModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <Text style={styles.floatingColorSubtitle}>Theme Mode</Text>
                        <View style={styles.floatingThemeModeRow}>
                          <TouchableOpacity
                            style={[
                              styles.floatingThemeModeOption,
                              !isDarkMode && [styles.floatingThemeModeOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16), borderColor: accentColor }]
                            ]}
                            onPress={() => {
                              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              if (isDarkMode) toggleDarkMode();
                            }}
                          >
                            <Sun size={20} color={!isDarkMode ? accentColor : '#888'} strokeWidth={2} />
                            <Text style={[
                              styles.floatingThemeModeText,
                              !isDarkMode && { color: accentColor, fontWeight: '600' }
                            ]}>Light</Text>
                            {!isDarkMode && <Check size={18} color={accentColor} strokeWidth={2.5} />}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.floatingThemeModeOption,
                              isDarkMode && [styles.floatingThemeModeOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16), borderColor: accentColor }]
                            ]}
                            onPress={() => {
                              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              if (!isDarkMode) toggleDarkMode();
                            }}
                          >
                            <Moon size={20} color={isDarkMode ? accentColor : '#888'} strokeWidth={2} />
                            <Text style={[
                              styles.floatingThemeModeText,
                              isDarkMode && { color: accentColor, fontWeight: '600' }
                            ]}>Dark</Text>
                            {isDarkMode && <Check size={18} color={accentColor} strokeWidth={2.5} />}
                          </TouchableOpacity>
                        </View>

                        <Text style={[styles.floatingColorSubtitle, { marginTop: 20 }]}>Choose a color that represents your profile</Text>
                        <View style={styles.floatingColorGrid}>
                          {PROFILE_COLORS.map((color) => (
                            <TouchableOpacity
                              key={color}
                              style={[
                                styles.floatingColorOption,
                                { backgroundColor: color },
                                accentColor === color && styles.floatingColorOptionSelected
                              ]}
                              onPress={() => {
                                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setAccentColor(color);
                                setShowColorPickerModal(false);
                              }}
                            >
                              {accentColor === color && (
                                <Check size={20} color="#fff" strokeWidth={3} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </BlurView>
                ) : (
                  <View style={styles.floatingModalWebContainer}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Profile Color Theme</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowColorPickerModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <Text style={styles.floatingColorSubtitle}>Theme Mode</Text>
                        <View style={styles.floatingThemeModeRow}>
                          <TouchableOpacity
                            style={[
                              styles.floatingThemeModeOption,
                              !isDarkMode && [styles.floatingThemeModeOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16), borderColor: accentColor }]
                            ]}
                            onPress={() => {
                              if (!isDarkMode) return;
                              toggleDarkMode();
                            }}
                          >
                            <Sun size={20} color={!isDarkMode ? accentColor : '#888'} strokeWidth={2} />
                            <Text style={[
                              styles.floatingThemeModeText,
                              !isDarkMode && { color: accentColor, fontWeight: '600' }
                            ]}>Light</Text>
                            {!isDarkMode && <Check size={18} color={accentColor} strokeWidth={2.5} />}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.floatingThemeModeOption,
                              isDarkMode && [styles.floatingThemeModeOptionActive, { backgroundColor: getColorWithOpacity(accentColor, 0.16), borderColor: accentColor }]
                            ]}
                            onPress={() => {
                              if (isDarkMode) return;
                              toggleDarkMode();
                            }}
                          >
                            <Moon size={20} color={isDarkMode ? accentColor : '#888'} strokeWidth={2} />
                            <Text style={[
                              styles.floatingThemeModeText,
                              isDarkMode && { color: accentColor, fontWeight: '600' }
                            ]}>Dark</Text>
                            {isDarkMode && <Check size={18} color={accentColor} strokeWidth={2.5} />}
                          </TouchableOpacity>
                        </View>

                        <Text style={[styles.floatingColorSubtitle, { marginTop: 20 }]}>Choose a color that represents your profile</Text>
                        <View style={styles.floatingColorGrid}>
                          {PROFILE_COLORS.map((color) => (
                            <TouchableOpacity
                              key={color}
                              style={[
                                styles.floatingColorOption,
                                { backgroundColor: color },
                                accentColor === color && styles.floatingColorOptionSelected
                              ]}
                              onPress={() => {
                                setAccentColor(color);
                                setShowColorPickerModal(false);
                              }}
                            >
                              {accentColor === color && (
                                <Check size={20} color="#fff" strokeWidth={3} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showBannerPickerModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowBannerPickerModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowBannerPickerModal(false)}>
          <View style={styles.floatingModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.floatingModalWrapper}>
                {Platform.OS !== 'web' ? (
                  <BlurView intensity={8} tint="dark" style={styles.floatingModalBlur}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Change Banner</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowBannerPickerModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <TouchableOpacity
                          style={styles.floatingBannerOption}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            pickImage();
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={[styles.floatingVisibilityIcon, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]}>
                              <ImageIcon size={20} color={accentColor} strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, { color: '#FFFFFF' }]}>
                                Upload Image
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Choose an image from gallery</Text>
                            </View>
                          </View>
                          <ChevronRight size={20} color="#666" strokeWidth={2} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.floatingBannerOption}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            pickVideo();
                          }}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={[styles.floatingVisibilityIcon, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]}>
                              <VideoIcon size={20} color={accentColor} strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, { color: '#FFFFFF' }]}>
                                Upload Video
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Choose a video from gallery</Text>
                            </View>
                          </View>
                          <ChevronRight size={20} color="#666" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </BlurView>
                ) : (
                  <View style={styles.floatingModalWebContainer}>
                    <View style={styles.floatingModalInner}>
                      <View style={styles.floatingModalHeader}>
                        <View style={styles.floatingModalHeaderSpacer} />
                        <Text style={styles.floatingModalTitle}>Change Banner</Text>
                        <TouchableOpacity 
                          style={styles.floatingModalCloseBtn} 
                          onPress={() => setShowBannerPickerModal(false)}
                        >
                          <X size={16} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.floatingModalOptions}>
                        <TouchableOpacity
                          style={styles.floatingBannerOption}
                          onPress={pickImage}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={[styles.floatingVisibilityIcon, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]}>
                              <ImageIcon size={20} color={accentColor} strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, { color: '#FFFFFF' }]}>
                                Upload Image
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Choose an image from gallery</Text>
                            </View>
                          </View>
                          <ChevronRight size={20} color="#666" strokeWidth={2} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.floatingBannerOption}
                          onPress={pickVideo}
                        >
                          <View style={styles.floatingVisibilityLeft}>
                            <View style={[styles.floatingVisibilityIcon, { backgroundColor: getColorWithOpacity(accentColor, 0.16) }]}>
                              <VideoIcon size={20} color={accentColor} strokeWidth={2} />
                            </View>
                            <View>
                              <Text style={[styles.floatingOptionText, { color: '#FFFFFF' }]}>
                                Upload Video
                              </Text>
                              <Text style={styles.floatingVisibilityDesc}>Choose a video from gallery</Text>
                            </View>
                          </View>
                          <ChevronRight size={20} color="#666" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    width: width,
    height: width,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#121212',
    borderTopWidth: 0,
  },
  bannerTouchable: {
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  bannerTopLeft: {
    flexDirection: 'row',
    gap: 10,
  },
  bannerTopRight: {
    flexDirection: 'row',
    gap: 10,
  },
  bannerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerIconBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  rankBadgeContainer: {
    position: 'absolute',
    bottom: 90,
    left: 12,
    borderRadius: 100,
    overflow: 'hidden',
    zIndex: 20,
  },
  rankBadgeBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  rankBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  rankIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFD700',
    letterSpacing: -0.28,
  },
  rankBadgeLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: -0.24,
  },
  bannerBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBottomGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBlurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBlurLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  bannerQrButton: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bannerQrOuter: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerQrInner: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerQrIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  bannerQrCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#121212',
    borderTopLeftRadius: 2,
  },
  bannerQrCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#121212',
    borderTopRightRadius: 2,
  },
  bannerQrCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#121212',
    borderBottomLeftRadius: 2,
  },
  bannerQrCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#121212',
    borderBottomRightRadius: 2,
  },
  bannerQrCenter: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    backgroundColor: '#121212',
    borderRadius: 1,
  },

  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    zIndex: 5,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1A9D7C',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameSection: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700' as const,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  username: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  contentContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 12,
    paddingBottom: 120,
  },
  viralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  viralLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  viralDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  latestLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.5,
  },
  viewsHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  viewsNumber: {
    fontSize: 36,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: -0.36,
  },
  viewsLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    lineHeight: 15,
    color: 'rgba(255, 255, 255, 0.64)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
  },
  statDivider: {
    width: 1,
    height: 67,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  shareProfileBtn: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  monetizationCard: {
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 16,
  },
  monetizationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
    backgroundColor: '#014D3A',
  },
  colorPickerSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  monetizationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monetizationContent: {
    flex: 1,
    gap: 8,
  },
  monetizationTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#fff',
    letterSpacing: -0.5,
  },
  monetizationDesc: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.48)',
    letterSpacing: -0.24,
  },
  monetizationArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCard: {
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#EE1045',
  },
  adCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
    backgroundColor: '#EE1045',
  },
  adIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCardContent: {
    flex: 1,
    gap: 8,
  },
  adCardTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#fff',
    letterSpacing: -0.5,
  },
  adCardDesc: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: -0.24,
  },
  adCardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 100,
  },
  tabItemActive: {
    backgroundColor: 'rgba(26, 157, 124, 0.16)',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1A9D7C',
    letterSpacing: -0.5,
  },
  tabLabelActive: {
    color: '#1A9D7C',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },

  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sortModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(26, 157, 124, 0.16)',
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  sortOptionTextActive: {
    color: '#1A9D7C',
    fontWeight: '600' as const,
  },
  visibilityOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visibilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityDesc: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginHorizontal: -12,
    paddingHorizontal: 0,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.4,
    position: 'relative',
    overflow: 'hidden',
  },
  gridThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    padding: 8,
  },
  gridViewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridViewsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalSaveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A9D7C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 24,
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editAvatarContainer: {
    position: 'relative',
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1A9D7C',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A9D7C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
  },
  usernamePrefix: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  bioInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '400' as const,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 100,
  },
  bioCounter: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'right',
    marginTop: 8,
  },
  saveChangesBtn: {
    backgroundColor: '#1A9D7C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveChangesBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    zIndex: 100,
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  stickyHeaderBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  stickyHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.56)',
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  stickyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stickyHeaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 100,
  },
  stickyHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  stickyHeaderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stickyHeaderName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    letterSpacing: -0.07,
  },
  stickyHeaderUsername: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.07,
  },
  stickyFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingLeft: 10,
    gap: 4,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  stickyFollowingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingLeft: 12,
  },
  stickyFollowText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.07,
  },
  stickyFollowingText: {
    color: '#FFFFFF',
  },
  stickyTabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  stickyTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stickyTabItem: {
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  stickyTabItemActive: {
    backgroundColor: 'rgba(1, 77, 58, 0.08)',
  },
  stickyTabLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#014D3A',
    letterSpacing: -0.5,
  },
  stickyTabLabelActive: {
    color: '#014D3A',
  },
  stickySortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  stickySortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stickySortText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.07,
  },
  floatingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  floatingModalKeyboard: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  floatingModalWrapper: {
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 40,
    overflow: 'hidden',
  },
  floatingModalBlur: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
  },
  floatingModalWebContainer: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  floatingModalInner: {
    backgroundColor: '#121212',
    borderRadius: 36,
    overflow: 'hidden',
  },
  floatingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  floatingModalHeaderSpacer: {
    width: 32,
    height: 32,
  },
  floatingModalTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: -0.32,
  },
  floatingModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingModalSaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingModalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: 500,
  },
  floatingModalOptions: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 8,
  },
  floatingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  floatingOptionActive: {
    backgroundColor: 'rgba(26, 157, 124, 0.16)',
  },
  floatingOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  floatingOptionTextActive: {
    fontWeight: '600' as const,
  },
  floatingVisibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingVisibilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingVisibilityDesc: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    marginTop: 2,
  },
  floatingColorSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    marginBottom: 16,
  },
  floatingColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  floatingColorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  floatingColorOptionSelected: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  floatingThemeModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  floatingThemeModeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  floatingThemeModeOptionActive: {
    borderColor: '#1A9D7C',
    borderWidth: 2,
  },
  floatingThemeModeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.64)',
  },
  floatingBannerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
