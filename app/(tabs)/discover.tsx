import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Image, FlatList } from "react-native";
import { DISCOVER_CATEGORIES, DISCOVER_VIDEOS, SEARCH_ACCOUNTS, LIVE_STREAMS } from "@/constants/mockData";
import { X, Search, Eye, Sliders, UserPlus, MessageSquare, Plus, BadgeCheck, ShieldCheck } from "lucide-react-native";
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
type SearchTab = 'Accounts' | 'Reels' | 'Live';
type AccountFilter = 'all' | 'pro' | 'verified';

interface GridItem {
  video: typeof DISCOVER_VIDEOS[0];
  type: CardType;
  isPlaying: boolean;
}

interface SearchAccount {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isPro: boolean;
  totalViews: number;
  isFollowing: boolean;
}

export default function DiscoverScreen() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab>('Accounts');
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

  const filteredVideos = useMemo(() => {
    let filtered = DISCOVER_VIDEOS;
    if (selectedCategory) {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }
    return filtered;
  }, [selectedCategory]);

  const filteredLiveStreams = useMemo(() => {
    let filtered = LIVE_STREAMS;
    if (selectedCategory) {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }
    return filtered;
  }, [selectedCategory]);

  const filteredAccounts = useMemo(() => {
    let accounts = [...SEARCH_ACCOUNTS].sort((a, b) => b.totalViews - a.totalViews);
    
    if (accountFilter === 'pro') {
      accounts = accounts.filter(a => a.isPro);
    } else if (accountFilter === 'verified') {
      accounts = accounts.filter(a => a.isVerified);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      accounts = accounts.filter(a => 
        a.displayName.toLowerCase().includes(query) || 
        a.username.toLowerCase().includes(query)
      );
    }
    
    return accounts;
  }, [accountFilter, searchQuery]);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const buildGridRows = (videos: typeof DISCOVER_VIDEOS) => {
    const rows: { items: GridItem[]; bigPosition: CardPosition }[] = [];
    let videoIndex = 0;
    let rowIndex = 0;

    while (videoIndex < videos.length) {
      const bigPosition = (rowIndex % 3) as CardPosition;
      const rowItems: GridItem[] = [];
      
      for (let col = 0; col < 3; col++) {
        if (col === bigPosition) {
          if (videoIndex < videos.length) {
            rowItems.push({
              video: videos[videoIndex],
              type: 'big',
              isPlaying: true,
            });
            videoIndex++;
          }
        } else {
          const smallItems: GridItem[] = [];
          for (let i = 0; i < 2; i++) {
            if (videoIndex < videos.length) {
              smallItems.push({
                video: videos[videoIndex],
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

  const gridRows = buildGridRows(filteredVideos);
  const liveGridRows = useMemo(() => {
    return buildGridRows(filteredLiveStreams.map(l => ({
      id: l.id,
      videoUrl: l.videoUrl,
      thumbnailUrl: l.thumbnailUrl,
      views: l.viewers,
      category: l.category,
    })));
  }, [filteredLiveStreams]);

  const renderViewBadge = (views: number, isLive: boolean = false) => (
    <View style={[styles.viewsBadge, isLive && styles.liveViewsBadge]}>
      <Eye size={12} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.viewsText}>{formatViews(views)}</Text>
    </View>
  );

  const handleCardPress = (videoId: string) => {
    const videoIndex = filteredVideos.findIndex(v => v.id === videoId);
    router.push(`/video-feed?index=${videoIndex}` as Href);
  };

  const handleLiveCardPress = (liveId: string) => {
    router.push(`/live-feed?liveId=${liveId}` as Href);
  };

  const handleFollowToggle = useCallback((accountId: string, currentFollowing: boolean) => {
    setFollowingState(prev => ({
      ...prev,
      [accountId]: !currentFollowing
    }));
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setActiveSearchTab('Accounts');
    setAccountFilter('all');
    setSelectedCategory(null);
  };

  const renderBigCard = (item: GridItem, isLive: boolean = false) => (
    <TouchableOpacity
      key={item.video.id}
      style={styles.bigCard}
      activeOpacity={0.9}
      onPress={() => isLive ? handleLiveCardPress(item.video.id) : handleCardPress(item.video.id)}
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
      {renderViewBadge(item.video.views, isLive)}
    </TouchableOpacity>
  );

  const renderSmallCard = (item: GridItem, isLive: boolean = false) => (
    <TouchableOpacity
      key={item.video.id}
      style={styles.smallCard}
      activeOpacity={0.9}
      onPress={() => isLive ? handleLiveCardPress(item.video.id) : handleCardPress(item.video.id)}
    >
      <Image
        source={{ uri: item.video.thumbnailUrl }}
        style={styles.cardMedia}
      />
      {renderViewBadge(item.video.views, isLive)}
    </TouchableOpacity>
  );

  const renderRow = (row: { items: GridItem[]; bigPosition: CardPosition }, rowIndex: number, isLive: boolean = false) => {
    const { items, bigPosition } = row;
    
    const bigItem = items.find(item => item.type === 'big');
    const smallItems = items.filter(item => item.type === 'small');
    
    const columns: React.ReactNode[] = [];
    let smallIndex = 0;

    for (let col = 0; col < 3; col++) {
      if (col === bigPosition && bigItem) {
        columns.push(
          <View key={`col-${col}`} style={styles.column}>
            {renderBigCard(bigItem, isLive)}
          </View>
        );
      } else {
        const colSmallItems = smallItems.slice(smallIndex, smallIndex + 2);
        smallIndex += 2;
        columns.push(
          <View key={`col-${col}`} style={styles.column}>
            {colSmallItems.map(item => renderSmallCard(item, isLive))}
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

  const renderAccountItem = ({ item }: { item: SearchAccount }) => {
    const isFollowing = followingState[item.id] ?? item.isFollowing;
    const showFullActions = item.isPro || item.isVerified;
    
    return (
      <View style={styles.accountItem}>
        <TouchableOpacity 
          style={styles.accountInfo}
          onPress={() => router.push(`/profile/${item.id}` as Href)}
        >
          <View style={[
            styles.avatarContainer, 
            item.isPro ? styles.proAvatarBorder : styles.regularAvatarBorder
          ]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          </View>
          <View style={styles.accountDetails}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: theme.text }]} numberOfLines={1}>
                {item.displayName}
              </Text>
              {item.isVerified && (
                <BadgeCheck size={14} color="#007BFF" fill="#007BFF" strokeWidth={0} style={styles.verifiedIcon} />
              )}
            </View>
            <View style={styles.statsRow}>
              <Text style={[styles.username, { color: theme.textSecondary }]}>{item.username}</Text>
              <View style={styles.dotSeparator} />
              <Text style={[styles.viewsCount, { color: theme.textSecondary }]}>
                {formatViews(item.totalViews)} views
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.accountActions}>
          {showFullActions ? (
            <>
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={() => handleFollowToggle(item.id, isFollowing)}
              >
                <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton}>
                <MessageSquare size={20} color="#121212" strokeWidth={2} fill="#121212" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleFollowToggle(item.id, isFollowing)}
            >
              <Plus size={20} color="#121212" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSearchTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.searchTabsContainer}
    >
      {(['Accounts', 'Reels', 'Live'] as SearchTab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.searchTab,
            activeSearchTab === tab && styles.searchTabActive
          ]}
          onPress={() => {
            setActiveSearchTab(tab);
            setSelectedCategory(null);
          }}
        >
          <Text style={[
            styles.searchTabText,
            { color: activeSearchTab === tab ? '#FFFFFF' : theme.text }
          ]}>{tab}</Text>
        </TouchableOpacity>
      ))}
      
      {activeSearchTab === 'Accounts' && (
        <>
          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: theme.inputBackground },
              accountFilter === 'pro' && styles.filterTabActive
            ]}
            onPress={() => setAccountFilter(accountFilter === 'pro' ? 'all' : 'pro')}
          >
            <BadgeCheck size={18} color={accountFilter === 'pro' ? '#FFFFFF' : '#121212'} fill={accountFilter === 'pro' ? '#FFFFFF' : '#121212'} strokeWidth={0} />
            <Text style={[
              styles.filterTabText,
              { color: accountFilter === 'pro' ? '#FFFFFF' : theme.text }
            ]}>Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: theme.inputBackground },
              accountFilter === 'verified' && styles.filterTabActive
            ]}
            onPress={() => setAccountFilter(accountFilter === 'verified' ? 'all' : 'verified')}
          >
            <ShieldCheck size={18} color={accountFilter === 'verified' ? '#FFFFFF' : '#121212'} strokeWidth={2} />
            <Text style={[
              styles.filterTabText,
              { color: accountFilter === 'verified' ? '#FFFFFF' : theme.text }
            ]}>Verified</Text>
          </TouchableOpacity>
        </>
      )}
      
      {(activeSearchTab === 'Reels' || activeSearchTab === 'Live') && (
        <>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { backgroundColor: theme.inputBackground },
              !selectedCategory && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryText,
              { color: !selectedCategory ? '#121212' : theme.text }
            ]}>Reels</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { backgroundColor: theme.inputBackground }
            ]}
          >
            <Text style={[styles.categoryText, { color: theme.text }]}>#tag</Text>
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
                { color: selectedCategory === category.name ? '#121212' : theme.text }
              ]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    if (!isSearchFocused) {
      return (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {gridRows.map((row, index) => renderRow(row, index))}
          </View>
        </ScrollView>
      );
    }

    if (activeSearchTab === 'Accounts') {
      return (
        <FlatList
          data={filteredAccounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.accountsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
        />
      );
    }

    if (activeSearchTab === 'Reels') {
      return (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {gridRows.map((row, index) => renderRow(row, index, false))}
          </View>
        </ScrollView>
      );
    }

    if (activeSearchTab === 'Live') {
      return (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {liveGridRows.map((row, index) => renderRow(row, index, true))}
          </View>
        </ScrollView>
      );
    }

    return null;
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
              placeholder={isSearchFocused ? "Search..." : "Search Accounts, Reels, Live..."}
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
            />
            {(searchQuery.length > 0 || isSearchFocused) && (
              <TouchableOpacity onPress={handleClearSearch}>
                <X size={22} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
          {isSearchFocused && activeSearchTab === 'Accounts' && (
            <TouchableOpacity style={[styles.filterButton, { borderColor: theme.border }]}>
              <Sliders size={20} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {isSearchFocused && renderSearchTabs()}
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    fontWeight: "500" as const,
    color: "#121212",
    padding: 0,
    margin: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(18, 18, 18, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchTabsContainer: {
    flexDirection: "row",
    gap: 4,
    paddingBottom: 4,
  },
  searchTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 32,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchTabActive: {
    backgroundColor: "#121212",
  },
  searchTabText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    fontWeight: "500" as const,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingLeft: 6,
    paddingVertical: 6,
    height: 32,
    borderRadius: 8,
    gap: 2,
  },
  filterTabActive: {
    backgroundColor: "#121212",
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    fontWeight: "500" as const,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 32,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: "#FFFFFF",
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    fontWeight: "500" as const,
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
  liveViewsBadge: {
    backgroundColor: '#FF4D67',
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    fontWeight: '600' as const,
    letterSpacing: -0.24,
  },
  accountsList: {
    paddingHorizontal: 12,
    paddingBottom: 98,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 100,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proAvatarBorder: {
    borderWidth: 2,
    borderColor: '#014D3A',
  },
  regularAvatarBorder: {
    borderWidth: 2,
    borderColor: 'rgba(18, 18, 18, 0.64)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  accountDetails: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  displayName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    fontWeight: '500' as const,
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    fontWeight: '500' as const,
    letterSpacing: -0.14,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.16)',
  },
  viewsCount: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    fontWeight: '500' as const,
    letterSpacing: -0.24,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#014D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: 'rgba(1, 77, 58, 0.5)',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
  },
});
