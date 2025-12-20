import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from "react-native";
import { Search, ShoppingBag, Tag, Sparkles, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

const CATEGORIES = [
  { id: '1', name: 'Featured', icon: Sparkles },
  { id: '2', name: 'Deals', icon: Tag },
  { id: '3', name: 'New Arrivals', icon: ShoppingBag },
];

const FEATURED_PRODUCTS = [
  { id: '1', name: 'Premium Headphones', price: '$299', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', discount: '20% OFF' },
  { id: '2', name: 'Smart Watch Pro', price: '$449', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', discount: null },
  { id: '3', name: 'Wireless Earbuds', price: '$149', image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400', discount: '15% OFF' },
  { id: '4', name: 'Camera Lens Kit', price: '$599', image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400', discount: null },
];

const TRENDING_SHOPS = [
  { id: '1', name: 'TechVibe', avatar: 'https://i.pravatar.cc/150?img=1', followers: '12.5K' },
  { id: '2', name: 'StyleHub', avatar: 'https://i.pravatar.cc/150?img=2', followers: '8.2K' },
  { id: '3', name: 'GadgetWorld', avatar: 'https://i.pravatar.cc/150?img=3', followers: '15.1K' },
  { id: '4', name: 'FashionForward', avatar: 'https://i.pravatar.cc/150?img=4', followers: '22.3K' },
];

export default function ShopScreen() {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [selectedCategory, setSelectedCategory] = useState('1');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Shop</Text>
          <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.cardBackground }]}>
            <Search size={20} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: isSelected ? accentColor : theme.cardBackground }
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Icon size={18} color={isSelected ? '#FFF' : theme.textSecondary} strokeWidth={2} />
                <Text style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFF' : theme.textSecondary }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.bannerContainer, { backgroundColor: '#1A3A2E' }]}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerLabel}>SPECIAL OFFER</Text>
            <Text style={styles.bannerTitle}>Up to 50% Off</Text>
            <Text style={styles.bannerSubtitle}>On selected items</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Shop Now</Text>
              <ChevronRight size={16} color="#1A3A2E" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerImageContainer}>
            <ShoppingBag size={80} color="rgba(55, 184, 116, 0.3)" strokeWidth={1} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Shops</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: accentColor }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopsScroll}>
            {TRENDING_SHOPS.map((shop) => (
              <TouchableOpacity key={shop.id} style={styles.shopCard} activeOpacity={0.7}>
                <Image source={{ uri: shop.avatar }} style={styles.shopAvatar} />
                <Text style={[styles.shopName, { color: theme.text }]}>{shop.name}</Text>
                <Text style={[styles.shopFollowers, { color: theme.textTertiary }]}>{shop.followers} followers</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: accentColor }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {FEATURED_PRODUCTS.map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={[styles.productCard, { backgroundColor: theme.cardBackground }]}
                activeOpacity={0.7}
              >
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  {product.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{product.discount}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productPrice, { color: accentColor }]}>{product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {},
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categoriesContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row' as const,
    overflow: 'hidden' as const,
    marginBottom: 24,
  },
  bannerContent: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#37B874',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  bannerButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#12FFAA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start' as const,
    gap: 4,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A3A2E',
  },
  bannerImageContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  shopsScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  shopCard: {
    alignItems: 'center' as const,
    width: 80,
  },
  shopAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  shopName: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  shopFollowers: {
    fontSize: 11,
    textAlign: 'center' as const,
  },
  productsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 12,
    gap: 12,
  },
  productCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  productImageContainer: {
    position: 'relative' as const,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
  },
  discountBadge: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    backgroundColor: '#FF4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
