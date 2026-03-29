import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { X, Coins, Sparkles, Heart, Star, Flame, Diamond, Crown, Gift, Zap } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface GiftItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  color: string;
}

interface GiftModalProps {
  visible: boolean;
  onClose: () => void;
  creatorName: string;
  creatorAvatar?: string;
  onGiftSent?: (gift: GiftItem) => void;
}

const GIFTS: GiftItem[] = [
  { id: '1', name: 'Heart', icon: <Heart size={28} color="#FF6B8A" fill="#FF6B8A" />, price: 10, color: '#FF6B8A' },
  { id: '2', name: 'Star', icon: <Star size={28} color="#FFD700" fill="#FFD700" />, price: 50, color: '#FFD700' },
  { id: '3', name: 'Fire', icon: <Flame size={28} color="#FF6B35" fill="#FF6B35" />, price: 100, color: '#FF6B35' },
  { id: '4', name: 'Sparkle', icon: <Sparkles size={28} color="#A78BFA" />, price: 200, color: '#A78BFA' },
  { id: '5', name: 'Diamond', icon: <Diamond size={28} color="#60A5FA" />, price: 500, color: '#60A5FA' },
  { id: '6', name: 'Crown', icon: <Crown size={28} color="#F59E0B" fill="#F59E0B" />, price: 1000, color: '#F59E0B' },
  { id: '7', name: 'Zap', icon: <Zap size={28} color="#10B981" fill="#10B981" />, price: 250, color: '#10B981' },
  { id: '8', name: 'Gift Box', icon: <Gift size={28} color="#EC4899" />, price: 2000, color: '#EC4899' },
];

export default function GiftModal({
  visible,
  onClose,
  creatorName,
  creatorAvatar,
  onGiftSent,
}: GiftModalProps) {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [userCoins, setUserCoins] = useState(5000);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftSentAnimation, setGiftSentAnimation] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const giftScaleAnim = useRef(new Animated.Value(1)).current;
  const sentGiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelectGift = (gift: GiftItem) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedGift(gift);
    
    Animated.sequence([
      Animated.timing(giftScaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(giftScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendGift = () => {
    if (!selectedGift || userCoins < selectedGift.price) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setSendingGift(true);
    setGiftSentAnimation(true);
    
    Animated.sequence([
      Animated.timing(sentGiftAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(sentGiftAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setUserCoins(prev => prev - selectedGift.price);
      setSendingGift(false);
      setGiftSentAnimation(false);
      onGiftSent?.(selectedGift);
      setSelectedGift(null);
    });
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return (price / 1000).toFixed(1) + 'k';
    }
    return price.toString();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View 
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity 
            style={styles.backdropTouch} 
            activeOpacity={1} 
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {Platform.OS !== 'web' ? (
            <BlurView intensity={80} tint="dark" style={styles.blurBackground}>
              <View style={styles.innerContent} />
            </BlurView>
          ) : (
            <View style={[styles.blurBackground, styles.webBackground]}>
              <View style={styles.innerContent} />
            </View>
          )}

          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>Send a Gift</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={24} color="rgba(255, 255, 255, 0.64)" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.recipientRow}>
              <View style={styles.recipientInfo}>
                {creatorAvatar ? (
                  <Image source={{ uri: creatorAvatar }} style={styles.recipientAvatar} />
                ) : (
                  <View style={[styles.recipientAvatar, styles.avatarPlaceholder]} />
                )}
                <Text style={styles.recipientText}>
                  Sending to <Text style={styles.recipientName}>@{creatorName}</Text>
                </Text>
              </View>
              <View style={styles.coinsBalance}>
                <Coins size={16} color="#FFD700" />
                <Text style={styles.coinsText}>{userCoins.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          <ScrollView 
            style={styles.giftsContainer}
            contentContainerStyle={styles.giftsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.giftsGrid}>
              {GIFTS.map((gift) => (
                <TouchableOpacity
                  key={gift.id}
                  style={[
                    styles.giftItem,
                    selectedGift?.id === gift.id && styles.giftItemSelected,
                    selectedGift?.id === gift.id && { borderColor: gift.color },
                  ]}
                  onPress={() => handleSelectGift(gift)}
                  activeOpacity={0.7}
                >
                  <Animated.View 
                    style={[
                      styles.giftIconContainer,
                      selectedGift?.id === gift.id && { 
                        transform: [{ scale: giftScaleAnim }],
                        backgroundColor: `${gift.color}20`,
                      }
                    ]}
                  >
                    {gift.icon}
                  </Animated.View>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <View style={styles.giftPriceRow}>
                    <Coins size={12} color="#FFD700" />
                    <Text style={styles.giftPrice}>{formatPrice(gift.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!selectedGift || userCoins < (selectedGift?.price || 0)) && styles.sendButtonDisabled,
                selectedGift && { backgroundColor: selectedGift.color },
              ]}
              onPress={handleSendGift}
              disabled={!selectedGift || userCoins < (selectedGift?.price || 0) || sendingGift}
              activeOpacity={0.8}
            >
              {sendingGift ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : selectedGift ? (
                <>
                  <Gift size={20} color="#121212" />
                  <Text style={styles.sendButtonText}>
                    Send {selectedGift.name} • {formatPrice(selectedGift.price)}
                  </Text>
                </>
              ) : (
                <Text style={styles.sendButtonText}>Select a Gift</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.buyCoinsBtn}>
              <Coins size={16} color="#FFD700" />
              <Text style={styles.buyCoinsText}>Get More Coins</Text>
            </TouchableOpacity>
          </View>

          {giftSentAnimation && selectedGift && (
            <Animated.View 
              style={[
                styles.giftSentOverlay,
                {
                  opacity: sentGiftAnim,
                  transform: [{
                    scale: sentGiftAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  }],
                },
              ]}
            >
              <View style={[styles.giftSentContent, { backgroundColor: `${selectedGift.color}20` }]}>
                <View style={styles.giftSentIcon}>
                  {selectedGift.icon}
                </View>
                <Text style={styles.giftSentText}>Gift Sent!</Text>
                <Text style={styles.giftSentSubtext}>
                  {selectedGift.name} sent to @{creatorName}
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouch: {
    flex: 1,
  },
  content: {
    height: SCREEN_HEIGHT * 0.65,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  webBackground: {
    backgroundColor: 'rgba(30, 30, 30, 0.98)',
  },
  innerContent: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recipientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
  },
  recipientText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.64)',
  },
  recipientName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  coinsBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  giftsContainer: {
    flex: 1,
  },
  giftsContent: {
    padding: 16,
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  giftItem: {
    width: (SCREEN_WIDTH - 32 - 36) / 4,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  giftItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  giftIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  giftName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  giftPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.64)',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 100,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
  },
  buyCoinsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  buyCoinsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD700',
  },
  giftSentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  giftSentContent: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
  },
  giftSentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  giftSentText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  giftSentSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.64)',
  },
});
