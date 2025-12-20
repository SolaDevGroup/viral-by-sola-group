import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { Search, X, Eye, Bookmark, UserPlus, MessageSquare, ChevronRight } from "lucide-react-native";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { MOCK_PRO_USERS, MOCK_NON_PRO_USERS, SHOP_CATEGORIES } from "@/constants/mockData";
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
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return `${views}`;
};

const formatTotalViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k views`;
  }
  return `${views} views`;
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onFavorite: () => void;
  onBookmark: () => void;
}

const ProductCard = ({ product, onPress, onFavorite, onBookmark }: ProductCardProps) => {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productOverlay}>
          <View style={styles.productTopRow}>
            <TouchableOpacity style={styles.iconButton} onPress={onPress}>
              <Eye size={12} color="#121212" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.productTopRight}>
              <TouchableOpacity style={styles.iconButton} onPress={onFavorite}>
                <View style={[styles.favoriteIcon, product.isFavorited && styles.favoriteIconActive]}>
                  <Text style={styles.starIcon}>★</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={onBookmark}>
                <Bookmark 
                  size={12} 
                  color={product.isBookmarked ? "#014D3A" : "#121212"} 
                  fill={product.isBookmarked ? "#014D3A" : "transparent"}
                  strokeWidth={2} 
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.viewsPill}>
            <Eye size={12} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.viewsText}>{formatViews(product.views)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productPrice}>${product.price}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface ProUserSectionProps {
  user: ProUser;
  products: Product[];
  onFollow: () => void;
  onMessage: () => void;
  onProductPress: (product: Product) => void;
}

const ProUserSection = ({ user, products, onFollow, onMessage, onProductPress }: ProUserSectionProps) => {
  const router = useRouter();

  const handleUserPress = useCallback(() => {
    router.push(`/profile/${user.id}`);
  }, [router, user.id]);

  return (
    <View style={styles.userSection}>
      <TouchableOpacity style={styles.userHeader} onPress={handleUserPress} activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            {user.isVerified && <VerifiedBadge />}
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.viewCount}>{formatTotalViews(user.totalViews)}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.followButton} onPress={onFollow}>
            <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
            <MessageSquare size={20} color="#121212" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.productsScroll}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => onProductPress(product)}
            onFavorite={() => console.log('Favorite:', product.id)}
            onBookmark={() => console.log('Bookmark:', product.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface NonProUserRowProps {
  user: typeof MOCK_NON_PRO_USERS[0];
  onPress: () => void;
}

const NonProUserRow = ({ user, onPress }: NonProUserRowProps) => {
  return (
    <TouchableOpacity style={styles.nonProUserRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.nonProAvatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.nonProAvatar} />
      </View>
      <View style={styles.nonProUserInfo}>
        <Text style={styles.nonProDisplayName}>{user.displayName}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.username}>{user.username}</Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.viewCount}>{formatTotalViews(user.totalViews)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.nonProMessageButton} onPress={() => console.log('Message non-pro user')}>
        <ChevronRight size={20} color="#121212" strokeWidth={2} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function ShopScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof SHOP_CATEGORIES[number]>('Clothing');

  const filteredUsers = useMemo(() => {
    return MOCK_PRO_USERS.map(user => ({
      ...user,
      products: user.products.filter(product => product.category === selectedCategory)
    })).filter(user => user.products.length > 0);
  }, [selectedCategory]);

  const handleProductPress = useCallback((product: Product) => {
    console.log('Product pressed:', product.id);
  }, []);

  const handleFollow = useCallback((userId: string) => {
    console.log('Follow user:', userId);
  }, []);

  const handleMessage = useCallback((userId: string) => {
    router.push(`/conversation/${userId}`);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={24} color="rgba(18, 18, 18, 0.64)" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Dress..."
            placeholderTextColor="rgba(18, 18, 18, 0.48)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={22} color="rgba(18, 18, 18, 0.48)" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesContainer}
        >
          {SHOP_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.map((user) => (
          <ProUserSection
            key={user.id}
            user={user}
            products={user.products}
            onFollow={() => handleFollow(user.id)}
            onMessage={() => handleMessage(user.id)}
            onProductPress={handleProductPress}
          />
        ))}

        {filteredUsers.length > 0 && <View style={styles.divider} />}

        {MOCK_NON_PRO_USERS.map((user) => (
          <NonProUserRow
            key={user.id}
            user={user}
            onPress={() => router.push(`/profile/${user.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 100,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.02,
  },
  categoriesContainer: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#121212',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#121212',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userSection: {
    borderRadius: 12,
    marginBottom: 1,
  },
  userHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 100,
    padding: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.5,
    textTransform: 'capitalize' as const,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  verifiedInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007BFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  verifiedCheck: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  statsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.01,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.16)',
  },
  viewCount: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.02,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#014D3A',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(11, 44, 19, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  productsScroll: {
    paddingHorizontal: 8,
    paddingBottom: 12,
    gap: 8,
  },
  productCard: {
    width: 140,
    gap: 8,
  },
  productImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    justifyContent: 'space-between' as const,
  },
  productTopRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  productTopRight: {
    flexDirection: 'row' as const,
    gap: 3,
  },
  iconButton: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  favoriteIcon: {
    width: 12,
    height: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  favoriteIconActive: {},
  starIcon: {
    fontSize: 10,
    color: '#014D3A',
  },
  viewsPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 87.5,
  },
  viewsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: -0.02,
  },
  productInfo: {
    gap: 6,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: -0.02,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.02,
    lineHeight: 13,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: -0.02,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    marginVertical: 8,
  },
  nonProUserRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  nonProAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(18, 18, 18, 0.64)',
    padding: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  nonProAvatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  nonProUserInfo: {
    flex: 1,
    gap: 4,
  },
  nonProDisplayName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.5,
    textTransform: 'capitalize' as const,
  },
  nonProMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
