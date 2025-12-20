import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Stack, router, useFocusEffect, Href } from 'expo-router';
import { Bell, Inbox, Compass, Star, Users, Rss } from 'lucide-react-native';
import type { Video as VideoType, Comment } from '@/types';
import ShortCard from '@/components/ShortCard';
import CommentsSheet from '@/components/CommentsSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 136;
const TAB_BAR_HEIGHT = 83;
const FIRST_CARD_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT;
const EXPANDED_CARD_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT;

const CATEGORIES = [
  { name: 'Technology', color: '#014D3A' },
  { name: 'Politics', color: '#4D013A' },
  { name: 'Sports', color: '#4D3A01' },
  { name: 'Music', color: '#3A014D' },
  { name: 'Fashion', color: '#4D0126' },
  { name: 'Entertainment', color: '#264D01' },
  { name: 'Gaming', color: '#01264D' },
  { name: 'Food', color: '#4D2601' },
  { name: 'Health', color: '#014D26' },
];

type FeedType = 'social' | 'friends' | 'favorites';

interface LiveStream extends VideoType {
  viewerCount: number;
  isLive: boolean;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    userId: '10',
    videoId: 'live-1',
    user: {
      id: '10',
      username: 'viewer_1',
      email: 'viewer1@app.com',
      avatar: 'https://i.pravatar.cc/150?img=10',
      bio: '',
      isVerified: false,
      isMinor: false,
      followers: 100,
      following: 50,
      totalViews: 1000,
      createdAt: new Date().toISOString(),
    },
    text: 'Amazing stream! 🔥',
    likes: 45,
    isLiked: false,
    replies: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    userId: '11',
    videoId: 'live-1',
    user: {
      id: '11',
      username: 'fan_2',
      email: 'fan2@app.com',
      avatar: 'https://i.pravatar.cc/150?img=11',
      bio: '',
      isVerified: false,
      isMinor: false,
      followers: 200,
      following: 100,
      totalViews: 2000,
      createdAt: new Date().toISOString(),
    },
    text: 'Love this content!',
    likes: 32,
    isLiked: false,
    replies: [],
    createdAt: new Date().toISOString(),
  },
];

const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: 'live-1',
    userId: '1',
    user: {
      id: '1',
      username: 'emma_creates',
      email: 'emma@viral.app',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Content creator | Fashion & Lifestyle',
      isVerified: true,
      isMinor: false,
      followers: 125000,
      following: 342,
      totalViews: 5600000,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    caption: 'Live shopping haul! Ask me anything 💕',
    soundName: 'Live Audio',
    soundAuthor: 'emma_creates',
    likes: 8543,
    comments: 1234,
    shares: 234,
    views: 45231,
    viewerCount: 12543,
    isLiked: false,
    isLive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'live-2',
    userId: '2',
    user: {
      id: '2',
      username: 'alex_vibes',
      email: 'alex@viral.app',
      avatar: 'https://i.pravatar.cc/150?img=12',
      bio: 'Music & Dance',
      isVerified: true,
      isMinor: false,
      followers: 45000,
      following: 189,
      totalViews: 1200000,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    caption: 'DJ Set - Taking requests! 🎵🔥',
    soundName: 'Live Audio',
    soundAuthor: 'alex_vibes',
    likes: 5234,
    comments: 876,
    shares: 123,
    views: 23456,
    viewerCount: 8765,
    isLiked: true,
    isLive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'live-3',
    userId: '3',
    user: {
      id: '3',
      username: 'chef_mike',
      email: 'mike@viral.app',
      avatar: 'https://i.pravatar.cc/150?img=33',
      bio: 'Professional Chef',
      isVerified: true,
      isMinor: false,
      followers: 78000,
      following: 234,
      totalViews: 2300000,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    caption: 'Cooking Italian pasta from scratch! 🍝',
    soundName: 'Live Audio',
    soundAuthor: 'chef_mike',
    likes: 6789,
    comments: 543,
    shares: 234,
    views: 34567,
    viewerCount: 15234,
    isLiked: false,
    isLive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'live-4',
    userId: '4',
    user: {
      id: '4',
      username: 'fitness_sarah',
      email: 'sarah@viral.app',
      avatar: 'https://i.pravatar.cc/150?img=47',
      bio: 'Fitness Coach',
      isVerified: false,
      isMinor: false,
      followers: 32000,
      following: 156,
      totalViews: 890000,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    caption: 'Morning workout session! Join me 💪',
    soundName: 'Live Audio',
    soundAuthor: 'fitness_sarah',
    likes: 3456,
    comments: 234,
    shares: 89,
    views: 18765,
    viewerCount: 6543,
    isLiked: false,
    isLive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'live-5',
    userId: '5',
    user: {
      id: '5',
      username: 'gamer_pro',
      email: 'gamer@viral.app',
      avatar: 'https://i.pravatar.cc/150?img=68',
      bio: 'Pro Gamer',
      isVerified: true,
      isMinor: false,
      followers: 156000,
      following: 423,
      totalViews: 8900000,
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    caption: 'Late night gaming stream 🎮',
    soundName: 'Live Audio',
    soundAuthor: 'gamer_pro',
    likes: 12456,
    comments: 2345,
    shares: 456,
    views: 67890,
    viewerCount: 23456,
    isLiked: true,
    isLive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function LiveFeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Technology');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [showFeedSelector, setShowFeedSelector] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>('social');
  const [isTabBarVisibleState, setIsTabBarVisibleState] = useState(true);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const feedSelectorOpacity = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');

  const selectedCategoryColor = useMemo(() => {
    const cat = CATEGORIES.find(c => c.name === selectedCategory);
    return cat?.color || '#121212';
  }, [selectedCategory]);

  const toggleFeedSelector = () => {
    if (showFeedSelector) {
      Animated.timing(feedSelectorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowFeedSelector(false));
    } else {
      setShowFeedSelector(true);
      Animated.timing(feedSelectorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const selectFeedType = (type: FeedType) => {
    setSelectedFeedType(type);
    Animated.timing(feedSelectorOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowFeedSelector(false));
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index || 0;
      setCurrentIndex(index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
        scrollDirection.current = direction;
        lastScrollY.current = currentScrollY;

        if (currentIndex > 0) {
          if (direction === 'up') {
            setIsTabBarVisibleState(true);
          } else if (direction === 'down') {
            setIsTabBarVisibleState(false);
          }
        } else {
          setIsTabBarVisibleState(true);
        }
      },
    }
  );

  const getCardHeight = (index: number) => {
    if (index === 0) {
      return FIRST_CARD_HEIGHT;
    }
    return EXPANDED_CARD_HEIGHT;
  };

  const getItemLayout = (_: any, index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getCardHeight(i);
    }
    return {
      length: getCardHeight(index),
      offset,
      index,
    };
  };

  const snapOffsets = MOCK_LIVE_STREAMS.map((_, index) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getCardHeight(i);
    }
    return offset;
  });

  const handleCardPress = (index: number) => {
    console.log('Live card pressed:', index);
  };

  const renderLiveStream = ({ item, index }: { item: LiveStream; index: number }) => {
    const isActive = index === currentIndex && isScreenFocused;
    const isTabBarVisible = index === 0 ? true : isTabBarVisibleState;
    
    let cardHeight = SCREEN_HEIGHT - HEADER_HEIGHT;
    if (isTabBarVisible) {
      cardHeight -= TAB_BAR_HEIGHT;
    }

    const shortData = {
      id: item.id,
      type: 'regular' as const,
      userId: item.userId,
      user: item.user,
      videoUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl,
      caption: item.caption,
      tags: [],
      soundName: item.soundName,
      soundAuthor: item.soundAuthor,
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      views: item.viewerCount,
      isLiked: item.isLiked,
      bookmarks: 0,
      isBookmarked: false,
      createdAt: item.createdAt,
    };

    return (
      <ShortCard
        short={shortData}
        isActive={isActive}
        height={cardHeight}
        showFullUI={false}
        hasNavBar={index === 0}
        isTabBarVisible={isTabBarVisible}
        isMomentsVisible={false}
        categoryColor={selectedCategoryColor}
        isLive={true}
        onPress={() => handleCardPress(index)}
        onCommentPress={() => {
          setSelectedVideoId(item.id);
          setCommentsSheetVisible(true);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerWrapper}>
        {Platform.OS === 'web' ? (
          <View style={styles.headerWebFallback}>
            <LinearGradient
              colors={['#121212', `${selectedCategoryColor}A3`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ) : (
          <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={['#121212', `${selectedCategoryColor}A3`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </BlurView>
        )}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.tabsWrapper}>
              <TouchableOpacity 
                style={styles.tabItem}
                onPress={() => router.back()}
              >
                <Text style={styles.tabTextInactive}>Shorts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabItem}>
                <Text style={styles.tabTextActive}>Live</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconContainer}
                onPress={() => router.push('/notifications' as Href)}
              >
                <Bell size={24} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconContainer}>
                <Inbox size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity 
              style={styles.filterIconBtn}
              onPress={toggleFeedSelector}
            >
              <Compass size={16} color="rgba(255, 255, 255, 0.64)" />
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.name && { backgroundColor: cat.color }
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={MOCK_LIVE_STREAMS}
        renderItem={renderLiveStream}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={onScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.flatListContent}
      />

      <CommentsSheet
        visible={commentsSheetVisible}
        onClose={() => setCommentsSheetVisible(false)}
        videoId={selectedVideoId}
        comments={MOCK_COMMENTS}
      />

      {showFeedSelector && (
        <Animated.View 
          style={[
            styles.feedSelectorOverlay,
            { opacity: feedSelectorOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.feedSelectorBackdrop}
            activeOpacity={1}
            onPress={toggleFeedSelector}
          >
            <LinearGradient
              colors={['rgba(18, 18, 18, 0)', '#DF3838']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.feedSelectorGradient}
            />
          </TouchableOpacity>
          
          <View style={styles.feedSelectorContent}>
            <TouchableOpacity 
              style={styles.feedOption}
              onPress={() => selectFeedType('favorites')}
            >
              <View style={[
                styles.feedOptionIcon,
                selectedFeedType === 'favorites' && styles.feedOptionIconActive
              ]}>
                <Star 
                  size={24} 
                  color={selectedFeedType === 'favorites' ? '#121212' : '#FFFFFF'}
                  fill={selectedFeedType === 'favorites' ? '#121212' : '#FFFFFF'}
                />
              </View>
              <Text style={[
                styles.feedOptionText,
                selectedFeedType === 'favorites' && styles.feedOptionTextActive
              ]}>
                Favorites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.feedOption}
              onPress={() => selectFeedType('friends')}
            >
              <View style={[
                styles.feedOptionIcon,
                selectedFeedType === 'friends' && styles.feedOptionIconActive
              ]}>
                <Users 
                  size={24} 
                  color={selectedFeedType === 'friends' ? '#121212' : '#FFFFFF'}
                />
              </View>
              <Text style={[
                styles.feedOptionText,
                selectedFeedType === 'friends' && styles.feedOptionTextActive
              ]}>
                Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.feedOption}
              onPress={() => selectFeedType('social')}
            >
              <View style={[
                styles.feedOptionIcon,
                selectedFeedType === 'social' && styles.feedOptionIconActive
              ]}>
                <Rss 
                  size={24} 
                  color={selectedFeedType === 'social' ? '#121212' : '#FFFFFF'}
                />
              </View>
              <Text style={[
                styles.feedOptionText,
                selectedFeedType === 'social' && styles.feedOptionTextActive
              ]}>
                Social Feed
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerWrapper: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerWebFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.64)',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  tabsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    flex: 1,
  },
  tabItem: {
    paddingHorizontal: 4,
  },
  tabTextActive: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'left' as const,
  },
  tabTextInactive: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center' as const,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
  },
  notificationDot: {
    position: 'absolute' as const,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EE1045',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  categoriesContainer: {
    marginTop: 4,
  },
  categoriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 12,
  },
  filterIconBtn: {
    width: 36,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBtn: {
    paddingHorizontal: 10,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  flatListContent: {
    paddingTop: HEADER_HEIGHT,
  },
  feedSelectorOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  feedSelectorBackdrop: {
    flex: 1,
  },
  feedSelectorGradient: {
    flex: 1,
  },
  feedSelectorContent: {
    position: 'absolute' as const,
    bottom: 100,
    left: 16,
    gap: 12,
  },
  feedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  feedOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DF3838',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedOptionIconActive: {
    backgroundColor: '#FFFFFF',
  },
  feedOptionText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.5,
  },
  feedOptionTextActive: {
    color: '#FFFFFF',
  },
});
