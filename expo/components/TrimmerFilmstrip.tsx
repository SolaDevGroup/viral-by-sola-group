import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';

interface TrimmerFilmstripProps {
  videoUri: string;
  videoDuration: number;
  width: number;
}

const THUMBNAIL_COUNT = 8;
const THUMBNAIL_HEIGHT = 60;

export function TrimmerFilmstrip({
  videoUri,
  videoDuration,
  width,
}: TrimmerFilmstripProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const thumbnailWidth = width / THUMBNAIL_COUNT;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      generateThumbnails().catch((error) => {
        console.error('Failed to generate thumbnails:', error);
        setThumbnails(Array(THUMBNAIL_COUNT).fill(''));
      });
    } else {
      setThumbnails(Array(THUMBNAIL_COUNT).fill(''));
    }
  }, [videoUri, videoDuration]);

  const generateThumbnails = async () => {
    try {
      const thumbs: string[] = [];
      const interval = videoDuration / THUMBNAIL_COUNT;

      for (let i = 0; i < THUMBNAIL_COUNT; i++) {
        const time = Math.floor(i * interval);
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
            time: time,
            quality: 0.5,
          });
          thumbs.push(uri);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          thumbs.push('');
        }
      }

      setThumbnails(thumbs);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    }
  };

  return (
    <View style={[styles.container, { width }]}>
      {Array.from({ length: THUMBNAIL_COUNT }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.thumbnailContainer,
            {
              width: thumbnailWidth,
              height: THUMBNAIL_HEIGHT,
            },
          ]}
        >
          {thumbnails[index] ? (
            <Image
              source={{ uri: thumbnails[index] }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: THUMBNAIL_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingBar: {
    width: '50%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  thumbnailContainer: {
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
  },
});
