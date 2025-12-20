import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Heart, MessageCircle, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Comment } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

interface CommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  comments: Comment[];
}

type SortType = 'Most likes' | 'Most recent';

export default function CommentsSheet({ visible, onClose, videoId, comments }: CommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortType>('Most likes');
  
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log('Send comment:', commentText);
      setCommentText('');
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isLiked = likedComments.has(item.id) || item.isLiked;
    
    return (
      <View style={styles.commentItem}>
        <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <View style={styles.commentTop}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentDisplayName}>{item.user.username}</Text>
              <Text style={styles.commentDot}>·</Text>
              <View style={styles.usernameBadge}>
                <Text style={styles.commentUsername}>username</Text>
              </View>
            </View>
            <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.replyButton}>
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleLikeComment(item.id)}
            >
              <Heart
                color={isLiked ? Colors.error : Colors.textSecondary}
                fill={isLiked ? Colors.error : 'transparent'}
                size={14}
              />
              <Text style={[styles.likeCountText, isLiked && styles.likeCountTextActive]}>
                {formatCount(item.likes)} likes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.replyCountButton}>
              <MessageCircle color={Colors.textSecondary} size={14} />
              <Text style={styles.replyCountText}>
                {formatCount(item.replies.length)} replies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const quickReactions = [
    { emoji: '👍', label: 'thumbs up' },
    { emoji: '😂', label: 'laugh' },
    { emoji: '❤️', label: 'heart' },
    { emoji: '🙈', label: 'see no evil' },
    { emoji: '😱', label: 'scream' },
    { emoji: '😂', label: 'laugh 2' },
    { emoji: '😡', label: 'angry' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          >
            {Platform.OS !== 'web' ? (
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={styles.backdropWeb} />
            )}
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              paddingBottom: insets.bottom || 16,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {comments.length} Comments
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <View style={styles.closeButtonCircle}>
                  <X color="#666666" size={20} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'Most likes' && styles.sortButtonActive]}
              onPress={() => setSortBy('Most likes')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'Most likes' && styles.sortButtonTextActive]}>
                Most likes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'Most recent' && styles.sortButtonActive]}
              onPress={() => setSortBy('Most recent')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'Most recent' && styles.sortButtonTextActive]}>
                Most recent
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.inputIconButton}>
                <View style={styles.inputIcon}>
                  <Heart color="#FFFFFF" fill="#FFFFFF" size={16} />
                </View>
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Type message"
                  placeholderTextColor="#999999"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendComment}
                disabled={!commentText.trim()}
              >
                <View style={styles.sendButtonCircle}>
                  <ArrowRight color="#FFFFFF" size={20} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.quickReactions}>
              {quickReactions.map((reaction, index) => (
                <TouchableOpacity key={index} style={styles.reactionButton}>
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropWeb: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SHEET_HEIGHT,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: '#121212',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sortButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666666',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentDisplayName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000000',
  },
  commentDot: {
    fontSize: 12,
    color: '#999999',
  },
  usernameBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: '#666666',
  },
  commentTime: {
    fontSize: 13,
    color: '#999999',
  },
  commentText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
    marginTop: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  replyButton: {
    paddingVertical: 2,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#666666',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCountText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: '#666666',
  },
  likeCountTextActive: {
    color: '#FF3B30',
  },
  replyCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyCountText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: '#666666',
  },
  reportButton: {
    marginLeft: 'auto',
  },
  reportButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#666666',
  },
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  inputIconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  input: {
    minHeight: 44,
    maxHeight: 80,
    paddingVertical: 10,
    fontSize: 14,
    color: '#121212',
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  quickReactions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  reactionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 24,
  },
});
