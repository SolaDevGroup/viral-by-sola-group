import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
import { DISCOVER_CATEGORIES, DISCOVER_VIDEOS } from "@/constants/mockData";
import { X, SlidersHorizontal, Sliders, Search, Eye } from "lucide-react-native";
import { Stack, router, Href } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 2;
const GRID_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const CARD_GAP = 1;
const COLUMN_WIDTH = (GRID_WIDTH - CARD_GAP * 2) / 3;
const ROW_HEIGHT = 240;
const SMALL_CARD_HEIGHT = (ROW_HEIGHT - CARD_GAP) / 2;

type CardType = 'big' | 'small';
type CardPosition = 0 | 1 | 2;

interface GridItem {
  video: typeof DISCOVER_VIDEOS[0];
  type: CardType;
  isPlaying: boolean;
}

export default function DiscoverScreen() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    let filtered = DISCOVER_VIDEOS;
    if (selectedCategory) {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }
    return filtered;
  }, [selectedCategory]);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const buildGridRows = () => {
    const rows: { items: GridItem[]; bigPosition: CardPosition }[] = [];
    let videoIndex = 0;
    let rowIndex = 0;

    while (videoIndex < filteredVideos.length) {
      const bigPosition = (rowIndex % 3) as CardPosition;
      const rowItems: GridItem[] = [];
      
      for (let col = 0; col < 3; col++) {
        if (col === bigPosition) {
          if (videoIndex < filteredVideos.length) {
            rowItems.push({
              video: filteredVideos[videoIndex],
              type: 'big',
              isPlaying: true,
            });
            videoIndex++;
          }
        } else {
          const smallItems: GridItem[] = [];
          for (let i = 0; i < 2; i++) {
            if (videoIndex < filteredVideos.length) {
              smallItems.push({
                video: filteredVideos[videoIndex],
                type: 'small',
                isPlaying: false,
              });
              videoIndex++;
            }
          }
          rowItems.push(...smallItems);
        }
      }
      
      if (rowItems.length > 0) {
        rows.push({ items: rowItems, bigPosition });
      }
      rowIndex++;
    }

    return rows;
  };

  const gridRows = buildGridRows();

  const renderViewBadge = (views: number) => (
    <View style={styles.viewsBadge}>
      <Eye size={12} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.viewsText}>{formatViews(views)}</Text>
    </View>
  );

  const handleCardPress = (videoId: string) => {
    const videoIndex = filteredVideos.findIndex(v => v.id === videoId);
    router.push(`/video-feed?index=${videoIndex}` as Href);
  };

  const renderBigCard = (item: GridItem) => (
    <TouchableOpacity
      key={item.video.id}
      style={styles.bigCard}
      activeOpacity={0.9}
      onPress={() => handleCardPress(item.video.id)}
    >
      <Video
        source={{ uri: item.video.videoUrl }}
        style={styles.cardMedia}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        useNativeControls={false}
      />
      {renderViewBadge(item.video.views)}
    </TouchableOpacity>
  );

  const renderSmallCard = (item: GridItem) => (
    <TouchableOpacity
      key={item.video.id}
      style={styles.smallCard}
      activeOpacity={0.9}
      onPress={() => handleCardPress(item.video.id)}
    >
      <Image
        source={{ uri: item.video.thumbnailUrl }}
        style={styles.cardMedia}
      />
      {renderViewBadge(item.video.views)}
    </TouchableOpacity>
  );

  const renderRow = (row: { items: GridItem[]; bigPosition: CardPosition }, rowIndex: number) => {
    const { items, bigPosition } = row;
    
    const bigItem = items.find(item => item.type === 'big');
    const smallItems = items.filter(item => item.type === 'small');
    
    const columns: React.ReactNode[] = [];
    let smallIndex = 0;

    for (let col = 0; col < 3; col++) {
      if (col === bigPosition && bigItem) {
        columns.push(
          <View key={`col-${col}`} style={styles.column}>
            {renderBigCard(bigItem)}
          </View>
        );
      } else {
        const colSmallItems = smallItems.slice(smallIndex, smallIndex + 2);
        smallIndex += 2;
        columns.push(
          <View key={`col-${col}`} style={styles.column}>
            {colSmallItems.map(item => renderSmallCard(item))}
          </View>
        );
      }
    }

    return (
      <View key={rowIndex} style={styles.row}>
        {columns}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
            <Search size={24} color={theme.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Eg. Plombier..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={22} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.filterButton, { borderColor: theme.border }]}>
            <Sliders size={20} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity 
            style={[styles.categoryChip, styles.editChip, { backgroundColor: theme.inputBackground }]}
            onPress={() => setSelectedCategory(null)}
          >
            <SlidersHorizontal size={16} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          {DISCOVER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                { backgroundColor: theme.inputBackground },
                selectedCategory === category.name && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(
                selectedCategory === category.name ? null : category.name
              )}
            >
              <Text style={[
                styles.categoryText,
                { color: theme.text },
                selectedCategory === category.name && styles.categoryTextActive
              ]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {gridRows.map((row, index) => renderRow(row, index))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#121212",
    paddingTop: 52,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#FFFFFF",
    padding: 0,
    margin: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 4,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: "#FFFFFF",
  },
  editChip: {
    paddingHorizontal: 10,
    width: 36,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  categoryTextActive: {
    color: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 98,
  },
  gridContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    height: ROW_HEIGHT,
    gap: CARD_GAP,
  },
  column: {
    width: COLUMN_WIDTH,
    height: ROW_HEIGHT,
    gap: CARD_GAP,
  },
  bigCard: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  smallCard: {
    height: SMALL_CARD_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  cardMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 87.5,
    gap: 2,
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: -0.24,
  },
});
