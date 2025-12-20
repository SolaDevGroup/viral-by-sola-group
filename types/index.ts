export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  isMinor: boolean;
  followers: number;
  following: number;
  totalViews: number;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  user: User;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  soundName: string;
  soundAuthor: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  location?: string;
  createdAt: string;
  expiresAt: string;
}

export type ShortType = 'regular' | 'membership' | 'ad';

export interface Short {
  id: string;
  type: ShortType;
  userId: string;
  user: User;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  tags: string[];
  soundName?: string;
  soundAuthor?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  bookmarks: number;
  isBookmarked: boolean;
  createdAt: string;
  adDuration?: number;
  adMinViewTime?: number;
  adBrand?: string;
  adCtaText?: string;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  imageUrl: string;
  videoUrl?: string;
  isLive: boolean;
  viewerCount?: number;
  postCount?: number;
  dominantColor?: string;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
}

export interface StoryPost {
  id: string;
  storyId: string;
  type: 'image' | 'video';
  mediaUrl: string;
  caption?: string;
  duration?: number;
  createdAt: string;
  isViewed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  videoId: string;
  text: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export type ChatMessageType = 'shot' | 'video' | 'message' | 'ad';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isBrand?: boolean;
  };
  lastMessage: ChatMessage;
  unreadCount: number;
  hasStory?: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'reply';
  user: User;
  videoId?: string;
  shortId?: string;
  text: string;
  commentText?: string;
  thumbnailUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Ad {
  id: string;
  brand: string;
  imageUrl: string;
  videoUrl?: string;
  ctaText: string;
  ctaUrl: string;
  impressions: number;
  clicks: number;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
  animationUrl: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  benefits: string[];
}
