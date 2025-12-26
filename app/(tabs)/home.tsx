import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation, router, useFocusEffect, useLocalSearchParams, Href } from 'expo-router';
import { Bell, Inbox, Compass, Play, ArrowDown, Star, Users, Rss, Plus } from 'lucide-react-native';
import CommentsSheet from '@/components/CommentsSheet';
import ShortCard from '@/components/ShortCard';
import NewFollowerAlert from '@/components/NewFollowerAlert';
import SuggestedProfilesCard from '@/components/SuggestedProfilesCard';
import { MOCK_SHORTS, MOCK_STORIES, MOCK_SUGGESTED_PROFILES } from '@/constants/mockData';
import type { Short } from '@/types';
import type { SuggestedProfile } from '@/components/SuggestedProfilesCard';
import { useApp } from '@/contexts/AppContext';

type FeedItem = 
  | { type: 'short'; data: Short; index: number }
  | { type: 'suggestions'; data: SuggestedProfile[]; index: number };

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 136;
const BLUR_SECTION_HEIGHT = 32;
const MOMENTS_HEIGHT = 108;
const TAB_BAR_HEIGHT = 83;
const FIRST_CARD_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - MOMENTS_HEIGHT - TAB_BAR_HEIGHT;
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

export default function HomeScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ showFeedSelector?: string }>();
  const { accentColor } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Technology');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRefreshNotif, setShowRefreshNotif] = useState(false);
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(false);
  const [selectedShortId, setSelectedShortId] = useState<string>('');
  const [showFeedSelector, setShowFeedSelector] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>('social');
  const [activeTab, setActiveTab] = useState<'reels' | 'live'>('reels');
  const [newFollower, setNewFollower] = useState<{
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  } | null>(null);
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>(MOCK_SUGGESTED_PROFILES);
  const feedSelectorOpacity = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const momentsTranslateY = useRef(new Animated.Value(0)).current;
  const refreshNotifTranslateY = useRef(new Animated.Value(-100)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const [isTabBarVisibleState, setIsTabBarVisibleState] = useState(true);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  
  const selectedCategoryColor = useMemo(() => {
    if (!selectedCategory) return accentColor;
    const cat = CATEGORIES.find(c => c.name === selectedCategory);
    return cat?.color || accentColor;
  }, [selectedCategory, accentColor]);

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

  useEffect(() => {
    if (params.showFeedSelector === 'true') {
      setShowFeedSelector(true);
      Animated.timing(feedSelectorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      router.setParams({ showFeedSelector: undefined });
    }
  }, [params.showFeedSelector, feedSelectorOpacity]);

  useEffect(() => {
    const followerTimer = setTimeout(() => {
      setNewFollower({
        id: 'follower-1',
        username: 'Abassi Konaté',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        isVerified: true,
      });
    }, 5000);

    return () => clearTimeout(followerTimer);
  }, []);
  


  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setShowRefreshNotif(true);
      Animated.timing(refreshNotifTranslateY, {
        toValue: HEADER_HEIGHT + 16,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(refreshNotifTranslateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowRefreshNotif(false);
        });
      }, 3000);
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, [refreshNotifTranslateY]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index || 0;
      setCurrentIndex(index);
      
      if (index > 0) {
        if (scrollDirection.current === 'down') {
          navigation.setOptions({ tabBarStyle: { display: 'none' } });
        }
        Animated.timing(momentsTranslateY, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        navigation.setOptions({ 
          tabBarStyle: { 
            backgroundColor: '#121212',
            borderTopColor: 'rgba(255, 255, 255, 0.08)',
            borderTopWidth: 1,
          } 
        });
        Animated.timing(momentsTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
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
            navigation.setOptions({ 
              tabBarStyle: { 
                backgroundColor: '#121212',
                borderTopColor: 'rgba(255, 255, 255, 0.08)',
                borderTopWidth: 1,
              } 
            });
          } else if (direction === 'down') {
            setIsTabBarVisibleState(false);
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
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

  const feedData = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];
    let shortIndex = 0;
    
    MOCK_SHORTS.forEach((short, i) => {
      items.push({ type: 'short', data: short, index: shortIndex });
      shortIndex++;
      
      if ((i + 1) % 12 === 0 && i < MOCK_SHORTS.length - 1) {
        const startIdx = ((i + 1) / 12 - 1) * 4 % suggestedProfiles.length;
        const profiles = [
          ...suggestedProfiles.slice(startIdx, startIdx + 4),
          ...suggestedProfiles.slice(0, Math.max(0, 4 - (suggestedProfiles.length - startIdx)))
        ].slice(0, 4);
        items.push({ type: 'suggestions', data: profiles, index: shortIndex });
        shortIndex++;
      }
    });
    
    return items;
  }, [suggestedProfiles]);

  const handleShuffleSuggestions = () => {
    const shuffled = [...suggestedProfiles].sort(() => Math.random() - 0.5);
    setSuggestedProfiles(shuffled);
  };

  const snapOffsets = feedData.map((_, index) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getCardHeight(i);
    }
    return index === 0 ? offset : offset + MOMENTS_HEIGHT;
  });

  const handleCardPress = (index: number) => {
    router.push(`/video-feed?index=${index}` as Href);
  };

  const renderFeedItem = ({ item, index }: { item: FeedItem; index: number }) => {
    const isActive = index === currentIndex && isScreenFocused;
    
    const isTabBarVisible = index === 0 ? true : isTabBarVisibleState;
    const isMomentsVisible = index === 0;
    
    // Use consistent heights matching getItemLayout to prevent alignment issues when scrolling
    const cardHeight = index === 0 ? FIRST_CARD_HEIGHT : EXPANDED_CARD_HEIGHT;

    if (item.type === 'suggestions') {
      return (
        <SuggestedProfilesCard
          profiles={item.data}
          height={cardHeight}
          onShuffle={handleShuffleSuggestions}
        />
      );
    }

    return (
      <ShortCard
        short={item.data}
        isActive={isActive}
        height={cardHeight}
        showFullUI={false}
        hasNavBar={index === 0}
        isTabBarVisible={isTabBarVisible}
        isMomentsVisible={isMomentsVisible}
        categoryColor={selectedCategoryColor}
        onPress={() => handleCardPress(index)}
        onCommentPress={() => {
          setSelectedShortId(item.data.id);
          setCommentsSheetVisible(true);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
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
        
        {/* Progressive blur at bottom of header */}
        <View style={styles.progressiveBlurContainer} pointerEvents="none">
          {Platform.OS === 'web' ? (
            <>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT }]}>
                <LinearGradient
                  colors={['transparent', `${selectedCategoryColor}20`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT * 0.75 }]}>
                <LinearGradient
                  colors={['transparent', `${selectedCategoryColor}40`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT * 0.5 }]}>
                <LinearGradient
                  colors={['transparent', `${selectedCategoryColor}60`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT * 0.25 }]}>
                <LinearGradient
                  colors={['transparent', `${selectedCategoryColor}80`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </>
          ) : (
            <>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT }]}>
                <BlurView intensity={4} tint="dark" style={StyleSheet.absoluteFill}>
                  <LinearGradient
                    colors={['transparent', `${selectedCategoryColor}30`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </BlurView>
              </View>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT * 0.75 }]}>
                <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill}>
                  <LinearGradient
                    colors={['transparent', `${selectedCategoryColor}50`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </BlurView>
              </View>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT * 0.5 }]}>
                <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill}>
                  <LinearGradient
                    colors={['transparent', `${selectedCategoryColor}70`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </BlurView>
              </View>
              <View style={[styles.blurLayer, { bottom: 0, height: BLUR_SECTION_HEIGHT * 0.25 }]}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
                  <LinearGradient
                    colors={['transparent', `${selectedCategoryColor}90`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </BlurView>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.tabsWrapper}>
              <TouchableOpacity 
                style={styles.tabItem}
                onPress={() => setActiveTab('reels')}
              >
                <Text style={activeTab === 'reels' ? styles.tabTextActive : styles.tabTextInactive}>
                  {activeTab === 'reels' ? 'Reels.' : 'Reels'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.tabItem}
                onPress={() => {
                  setActiveTab('live');
                  router.push('/live-feed' as Href);
                }}
              >
                <Text style={activeTab === 'live' ? styles.tabTextActive : styles.tabTextInactive}>
                  {activeTab === 'live' ? 'Live.' : 'Live'}
                </Text>
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
              <TouchableOpacity 
                style={styles.iconContainer}
                onPress={() => router.push('/inbox' as Href)}
              >
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
              onPress={() => setSelectedCategory(null)}
            >
              <Compass size={16} color={selectedCategory === null ? '#12FFAA' : 'rgba(255, 255, 255, 0.64)'} />
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

      <Animated.View 
        style={[
          styles.momentsSection,
          { transform: [{ translateY: momentsTranslateY }] }
        ]}
        pointerEvents={currentIndex === 0 ? 'auto' : 'none'}
      >
        <View style={styles.momentsHeader}>
          <View style={styles.momentsTitle}>
            <Text style={styles.momentsLabel}>MOMENTS</Text>
            <Text style={styles.momentsCount}>14</Text>
          </View>
          <TouchableOpacity 
            style={styles.playAllBtn}
            onPress={() => router.push('/story-viewer?playAll=true' as Href)}
          >
            <Play size={10} color="rgba(255, 255, 255, 0.16)" fill="rgba(255, 255, 255, 0.16)" />
            <Text style={styles.playAllText}>PLAY ALL</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.momentsScroll}
        >
          <TouchableOpacity 
            style={styles.momentItem}
            onPress={() => router.push('/camera?mode=story' as Href)}
          >
            <View style={[styles.momentCircle, styles.momentAdd, { borderColor: selectedCategoryColor }]}>
              <LinearGradient
                colors={[selectedCategoryColor, '#121212']}
                start={{ x: 0.73, y: 0.05 }}
                end={{ x: 0.27, y: 0.95 }}
                style={[styles.momentAddInner, { borderColor: `${selectedCategoryColor}20` }]}
              >
                <Plus size={12} color="rgba(255, 255, 255, 0.64)" strokeWidth={3} />
              </LinearGradient>
            </View>
          </TouchableOpacity>
          
          {MOCK_STORIES.map((story) => (
            <TouchableOpacity 
              key={story.id} 
              style={styles.momentItem}
              onPress={() => {
                if (story.isLive) {
                  router.push('/live-feed' as Href);
                } else {
                  router.push(`/story-viewer?storyId=${story.id}` as Href);
                }
              }}
            >
              <View style={[
                styles.momentCircle,
                { borderColor: story.dominantColor || 'rgba(255, 255, 255, 0.16)' },
                story.isLive && styles.momentCircleLive,
              ]}>
                <View style={styles.momentImageWrapper}>
                  {story.user.avatar ? (
                    <View style={styles.momentImage}>
                      <View style={[styles.momentImageInner, { backgroundColor: story.dominantColor || '#666' }]} />
                    </View>
                  ) : (
                    <View style={[styles.momentImage, { backgroundColor: '#666' }]} />
                  )}
                  {story.postCount && story.postCount > 0 && (
                    <View style={[styles.momentBadge, { backgroundColor: story.dominantColor || '#EE1045' }]}>
                      <Text style={styles.momentBadgeText}>{story.postCount}</Text>
                    </View>
                  )}
                  {story.isLive && (
                    <View style={styles.momentLiveBadge}>
                      <Text style={styles.momentLiveText}>LIVE</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.type === 'short' ? item.data.id : `suggestions-${item.index}`}
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

      {showRefreshNotif && (
        <Animated.View 
          style={[
            styles.refreshNotification,
            { transform: [{ translateY: refreshNotifTranslateY }] }
          ]}
        >
          <View style={styles.refreshNotifContent}>
            <ArrowDown size={16} color="#12FFAA" />
            <Text style={styles.refreshNotifText}>New Shorts available</Text>
          </View>
        </Animated.View>
      )}

      <CommentsSheet
        visible={commentsSheetVisible}
        onClose={() => setCommentsSheetVisible(false)}
        videoId={selectedShortId}
        comments={[]}
      />

      <NewFollowerAlert
        follower={newFollower}
        headerHeight={HEADER_HEIGHT}
        onFollowBack={(followerId) => {
          console.log('Follow back:', followerId);
          setNewFollower(null);
        }}
        onDismiss={() => setNewFollower(null)}
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
              colors={['rgba(18, 18, 18, 0)', '#12FFAA']}
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
  progressiveBlurContainer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: BLUR_SECTION_HEIGHT,
    zIndex: 5,
  },
  blurLayer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    overflow: 'hidden' as const,
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
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 8,
    flex: 1,
  },
  tabItem: {
    paddingHorizontal: 4,
  },
  tabTextActive: {
    fontSize: 32,
    fontWeight: '600',
    fontStyle: 'italic' as const,
    color: '#FFFFFF',
    letterSpacing: -1.92,
  },
  tabTextInactive: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.48)',
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
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
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
    fontWeight: '500',
    color: '#FFFFFF',
  },
  momentsSection: {
    position: 'absolute' as const,
    top: 136,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    zIndex: 9,
  },
  momentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  momentsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  momentsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
  },
  momentsCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  momentsScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  momentItem: {
    alignItems: 'center',
  },
  momentCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  momentAdd: {
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  momentAddInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#121212',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#12FFAA',
  },
  momentCircleLive: {
    borderColor: '#DF3838',
    borderStyle: 'dashed' as const,
  },
  momentImageWrapper: {
    position: 'relative' as const,
  },
  momentImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden' as const,
  },
  momentImageInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  momentBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#121212',
    zIndex: 10,
  },
  momentBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  momentLiveBadge: {
    position: 'absolute' as const,
    bottom: -6,
    left: '50%' as const,
    marginLeft: -20,
    backgroundColor: '#DF3838',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#121212',
    zIndex: 10,
  },
  momentLiveText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  flatListContent: {
    paddingTop: HEADER_HEIGHT + MOMENTS_HEIGHT,
  },
  refreshNotification: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    zIndex: 11,
  },
  refreshNotifContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(18, 255, 170, 0.3)',
  },
  refreshNotifText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  feedSelectorOverlay: {
    position: 'absolute',
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
    position: 'absolute',
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
    backgroundColor: '#00B080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedOptionIconActive: {
    backgroundColor: '#FFFFFF',
  },
  feedOptionText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.64)',
    letterSpacing: -0.5,
  },
  feedOptionTextActive: {
    color: '#FFFFFF',
  },
});
