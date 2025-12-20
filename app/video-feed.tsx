import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
  Platform,
  Animated,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { DISCOVER_VIDEOS, MOCK_USERS } from '@/constants/mockData';
import FullScreenVideoPlayer from '@/components/FullScreenVideoPlayer';
import { Video } from '@/types';



export default function VideoFeedScreen() {
  const params = useLocalSearchParams();
  const startIndex = params.index ? parseInt(params.index as string) : 0;
  const [activeIndex, setActiveIndex] = useState<number>(startIndex);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenHeight(window.height);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const videos: Video[] = DISCOVER_VIDEOS.map((video, index) => {
    const mockUser = MOCK_USERS[index % MOCK_USERS.length];
    return {
      id: video.id,
      userId: mockUser.id,
      user: mockUser,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      caption: `Check out this amazing ${video.category} content! #${video.category.toLowerCase()}`,
      soundName: 'Original Sound',
      soundAuthor: mockUser.username,
      likes: Math.floor(video.views * 0.08),
      comments: Math.floor(video.views * 0.02),
      shares: Math.floor(video.views * 0.005),
      views: video.views,
      isLiked: false,
      createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleCommentPress = useCallback(() => {
    console.log('Open comments');
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Video; index: number }) => {
    return (
      <FullScreenVideoPlayer
        video={item}
        isActive={index === activeIndex}
        onCommentPress={handleCommentPress}
        onBack={handleBack}
      />
    );
  }, [activeIndex, handleCommentPress, handleBack]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  }), [screenHeight]);

  const keyExtractor = useCallback((item: Video) => item.id, []);

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      },
    ]}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={1}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
