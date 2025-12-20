import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Heart, Share2, MessageSquare, ShoppingBag, Eye, Shield, Truck, RotateCcw } from "lucide-react-native";
import { useState, useCallback, useMemo } from "react";
import { MOCK_PRO_USERS } from "@/constants/mockData";
import { Product, ProUser } from "@/types";

const VerifiedBadge = () => (
  <View style={styles.verifiedBadge}>
    <View style={styles.verifiedInner}>
      <Text style={styles.verifiedCheck}>✓</Text>
    </View>
  </View>
);

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return `${views}`;
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId, sellerId } = useLocalSearchParams<{ productId: string; sellerId: string }>();
  
  const [isFavorited, setIsFavorited] = useState(false);

  const { product, seller } = useMemo(() => {
    let foundProduct: Product | undefined;
    let foundSeller: ProUser | undefined;

    for (const user of MOCK_PRO_USERS) {
      const prod = user.products.find(p => p.id === productId);
      if (prod) {
        foundProduct = prod;
        foundSeller = user;
        break;
      }
    }

    if (sellerId) {
      const specificSeller = MOCK_PRO_USERS.find(u => u.id === sellerId);
      if (specificSeller) {
        foundSeller = specificSeller;
      }
    }

    return { product: foundProduct, seller: foundSeller };
  }, [productId, sellerId]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
  }, []);

  const handleShare = useCallback(() => {
    Alert.alert("Share", "Product link copied to clipboard!");
  }, []);

  const handleBuyNow = useCallback(() => {
    Alert.alert(
      "Complete Purchase",
      `Proceed to checkout for ${product?.name}?\n\nTotal: $${product?.price}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Buy Now", onPress: () => Alert.alert("Success", "Order placed successfully!") }
      ]
    );
  }, [product]);

  const handleMessageSeller = useCallback(() => {
    if (seller) {
      router.push(`/conversation/${seller.id}`);
    }
  }, [router, seller]);

  const handleVisitStore = useCallback(() => {
    if (seller) {
      router.push(`/profile/${seller.id}`);
    }
  }, [router, seller]);

  if (!product || !seller) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#121212" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Product not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleFavorite}>
            <Heart 
              size={22} 
              color={isFavorited ? "#E53935" : "#121212"} 
              fill={isFavorited ? "#E53935" : "transparent"}
              strokeWidth={2} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleShare}>
            <Share2 size={22} color="#121212" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.viewsBadge}>
            <Eye size={14} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.viewsText}>{formatViews(product.views)} views</Text>
          </View>
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.sellerSection} onPress={handleVisitStore} activeOpacity={0.7}>
          <View style={styles.sellerAvatar}>
            <Image source={{ uri: seller.avatar }} style={styles.avatarImage} />
          </View>
          <View style={styles.sellerInfo}>
            <View style={styles.sellerNameRow}>
              <Text style={styles.sellerName}>{seller.displayName}</Text>
              {seller.isVerified && <VerifiedBadge />}
            </View>
            <Text style={styles.sellerUsername}>{seller.username}</Text>
          </View>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessageSeller}>
            <MessageSquare size={20} color="#121212" strokeWidth={2} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.guaranteesSection}>
          <View style={styles.guaranteeItem}>
            <View style={styles.guaranteeIcon}>
              <Shield size={18} color="#014D3A" strokeWidth={2} />
            </View>
            <View style={styles.guaranteeText}>
              <Text style={styles.guaranteeTitle}>Buyer Protection</Text>
              <Text style={styles.guaranteeDesc}>Money-back guarantee</Text>
            </View>
          </View>
          <View style={styles.guaranteeItem}>
            <View style={styles.guaranteeIcon}>
              <Truck size={18} color="#014D3A" strokeWidth={2} />
            </View>
            <View style={styles.guaranteeText}>
              <Text style={styles.guaranteeTitle}>Fast Shipping</Text>
              <Text style={styles.guaranteeDesc}>2-5 business days</Text>
            </View>
          </View>
          <View style={styles.guaranteeItem}>
            <View style={styles.guaranteeIcon}>
              <RotateCcw size={18} color="#014D3A" strokeWidth={2} />
            </View>
            <View style={styles.guaranteeText}>
              <Text style={styles.guaranteeTitle}>Easy Returns</Text>
              <Text style={styles.guaranteeDesc}>30-day return policy</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>About this item</Text>
          <Text style={styles.descriptionText}>
            High-quality {product.category.toLowerCase()} product from {product.brand}. 
            This item has been viewed {formatViews(product.views)} times and is currently available for purchase.
            Direct from verified seller with fast shipping and buyer protection included.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow} activeOpacity={0.8}>
          <ShoppingBag size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.buyButtonText}>Buy Now - ${product.price}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    position: 'relative' as const,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  viewsBadge: {
    position: 'absolute' as const,
    bottom: 16,
    left: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 100,
  },
  viewsText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#FFFFFF',
    letterSpacing: -0.02,
  },
  productDetails: {
    padding: 16,
    gap: 8,
  },
  productPrice: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#121212',
    letterSpacing: -0.5,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
    color: '#121212',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  categoryBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 100,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(18, 18, 18, 0.64)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.06)',
    marginHorizontal: 16,
  },
  sellerSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    gap: 12,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden' as const,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  sellerInfo: {
    flex: 1,
    gap: 4,
  },
  sellerNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  sellerName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  verifiedInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  verifiedCheck: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  sellerUsername: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.01,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  guaranteesSection: {
    padding: 16,
    gap: 16,
  },
  guaranteeItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  guaranteeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(1, 77, 58, 0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  guaranteeText: {
    flex: 1,
    gap: 2,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#121212',
    letterSpacing: -0.01,
  },
  guaranteeDesc: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.64)',
  },
  descriptionSection: {
    padding: 16,
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(18, 18, 18, 0.72)',
    lineHeight: 22,
    letterSpacing: -0.01,
  },
  bottomBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(18, 18, 18, 0.06)',
  },
  buyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: '#014D3A',
    paddingVertical: 16,
    borderRadius: 100,
  },
  buyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: -0.02,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(18, 18, 18, 0.64)',
  },
});
