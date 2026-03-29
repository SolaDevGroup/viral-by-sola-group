import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Video, Story } from '@/types';
import { MOCK_VIDEOS, MOCK_STORIES } from '@/constants/mockData';

interface ContentState {
  videos: Video[];
  stories: Story[];
  filterExpiredContent: () => void;
  likeVideo: (videoId: string) => void;
  addVideo: (video: Video) => void;
  deleteVideo: (videoId: string) => void;
}

export const [ContentProvider, useContent] = createContextHook<ContentState>(() => {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);

  useEffect(() => {
    const interval = setInterval(() => {
      filterExpiredContent();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const filterExpiredContent = () => {
    const now = new Date().getTime();
    setVideos(prev => prev.filter(v => new Date(v.expiresAt).getTime() > now));
    setStories(prev => prev.filter(s => new Date(s.expiresAt).getTime() > now));
    console.log('Filtered expired content');
  };

  const likeVideo = (videoId: string) => {
    setVideos(prev =>
      prev.map(v =>
        v.id === videoId
          ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
          : v
      )
    );
  };

  const addVideo = (video: Video) => {
    setVideos(prev => [video, ...prev]);
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  return {
    videos,
    stories,
    filterExpiredContent,
    likeVideo,
    addVideo,
    deleteVideo,
  };
});
