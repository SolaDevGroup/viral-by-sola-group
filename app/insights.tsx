import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { useState } from "react";
import { Stack, router, Href } from "expo-router";
import { ChevronLeft, Eye, Users, Heart, MessageCircle, Share2, ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MOCK_SHORTS } from "@/constants/mockData";

type PeriodType = 'weekly' | 'monthly' | 'yearly';

const TOP_SHORTS = MOCK_SHORTS.slice(0, 3);

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('weekly');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return 'April 1 - April 7';
      case 'monthly':
        return 'March 1 - March 31';
      case 'yearly':
        return 'Jan 1 - Dec 31';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#121212" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Insights</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.periodTabs}>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'weekly' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('weekly')}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'weekly' && styles.periodTabTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'monthly' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'monthly' && styles.periodTabTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'yearly' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'yearly' && styles.periodTabTextActive]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Period</Text>
            <Text style={styles.cardSubtitle}>{getPeriodLabel()}</Text>
          </View>
          <View style={styles.twoColRow}>
            <View style={styles.statCardLarge}>
              <View style={styles.statCardContent}>
                <View style={styles.statIconRow}>
                  <Eye size={16} color="#121212" strokeWidth={2} />
                  <Text style={styles.statIconLabel}>Total Views</Text>
                </View>
                <Text style={styles.statValueLarge}>328k</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgePositive]}>
                <Text style={styles.percentText}>+4.3%</Text>
              </View>
            </View>
            <View style={styles.statCardLarge}>
              <View style={styles.statCardContent}>
                <View style={styles.statIconRow}>
                  <Users size={16} color="#121212" strokeWidth={2} />
                  <Text style={styles.statIconLabel}>New Followers</Text>
                </View>
                <Text style={styles.statValueLarge}>3,2k</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgeNegative]}>
                <Text style={styles.percentText}>-4.3%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Views</Text>
            <Text style={styles.cardSubtitle}>{getPeriodLabel()}</Text>
          </View>
          <View style={styles.threeColRow}>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardSmallContent}>
                <Text style={styles.statValueMedium}>328k</Text>
                <Text style={styles.statLabelSmall}>Stories</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgePositive]}>
                <Text style={styles.percentText}>+4.3%</Text>
              </View>
            </View>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardSmallContent}>
                <Text style={styles.statValueMedium}>3,2k</Text>
                <Text style={styles.statLabelSmall}>Posts</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgeNegative]}>
                <Text style={styles.percentText}>-4.3%</Text>
              </View>
            </View>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardSmallContent}>
                <Text style={styles.statValueMedium}>178k</Text>
                <Text style={styles.statLabelSmall}>Shorts</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgePositive]}>
                <Text style={styles.percentText}>+4.3%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Average Watch Time</Text>
            <Text style={styles.cardSubtitle}>85% of viewers watch to the end</Text>
          </View>
          <Text style={styles.watchTimeValue}>12.4s</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Engagement</Text>
            <Text style={styles.cardSubtitle}>{getPeriodLabel()}</Text>
          </View>
          <View style={styles.threeColRow}>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardSmallContent}>
                <Heart size={20} color="#121212" strokeWidth={2} />
                <Text style={styles.statValueMedium}>328k</Text>
                <Text style={styles.statLabelSmall}>Likes</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgePositive]}>
                <Text style={styles.percentText}>+4.3%</Text>
              </View>
            </View>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardSmallContent}>
                <MessageCircle size={20} color="#121212" strokeWidth={2} />
                <Text style={styles.statValueMedium}>3,2k</Text>
                <Text style={styles.statLabelSmall}>Comments</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgeNegative]}>
                <Text style={styles.percentText}>-4.3%</Text>
              </View>
            </View>
            <View style={styles.statCardSmall}>
              <View style={styles.statCardSmallContent}>
                <Share2 size={20} color="#121212" strokeWidth={2} />
                <Text style={styles.statValueMedium}>178k</Text>
                <Text style={styles.statLabelSmall}>Shares</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgePositive]}>
                <Text style={styles.percentText}>+4.3%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>5.0M Views</Text>
              <Text style={styles.cardSubtitle}>{getPeriodLabel()}</Text>
            </View>
            <TouchableOpacity style={styles.chartDropdown}>
              <Text style={styles.chartDropdownText}>Like</Text>
              <ChevronDown size={14} color="#121212" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              {['500k', '400k', '300k', '200k', '100k', '0'].map((val, idx) => (
                <Text key={idx} style={styles.chartYLabel}>{val}</Text>
              ))}
            </View>
            <View style={styles.chartArea}>
              <View style={styles.chartLine}>
                {[70, 40, 30, 55, 15, 45, 35, 65, 68, 75, 50, 25, 60, 62].map((height, idx) => (
                  <View key={idx} style={styles.chartPointContainer}>
                    <View style={[styles.chartBar, { height: `${height}%` }]} />
                    <View style={styles.chartDot} />
                  </View>
                ))}
              </View>
              <View style={styles.chartXAxis}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <Text key={idx} style={styles.chartXLabel}>{day}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Viewers</Text>
            <Text style={styles.cardSubtitle}>{getPeriodLabel()}</Text>
          </View>
          <View style={styles.twoColRow}>
            <View style={styles.viewerCard}>
              <View style={styles.viewerCardContent}>
                <Text style={styles.viewerValue}>328k</Text>
                <Text style={styles.viewerLabel}>Followers</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgePositive]}>
                <Text style={styles.percentText}>+4.3%</Text>
              </View>
            </View>
            <View style={styles.viewerCard}>
              <View style={styles.viewerCardContent}>
                <Text style={styles.viewerValue}>3,2k</Text>
                <Text style={styles.viewerLabel}>Non-followers</Text>
              </View>
              <View style={[styles.percentBadge, styles.percentBadgeNegative]}>
                <Text style={styles.percentText}>-4.3%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top Performing Shorts</Text>
            <Text style={styles.cardSubtitle}>{getPeriodLabel()}</Text>
          </View>
          <View style={styles.topShortsRow}>
            {TOP_SHORTS.map((short, index) => (
              <TouchableOpacity 
                key={short.id} 
                style={styles.topShortCard}
                onPress={() => router.push(`/video-feed?startIndex=${index}` as Href)}
              >
                <Image
                  source={{ uri: short.thumbnailUrl }}
                  style={styles.topShortImage}
                  resizeMode="cover"
                />
                <View style={styles.topShortOverlay}>
                  <Text style={styles.topShortRank}>#{index + 1}</Text>
                  <View style={styles.topShortViews}>
                    <Eye size={12} color="#121212" strokeWidth={2} />
                    <Text style={styles.topShortViewsText}>{formatNumber(short.views)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
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
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#121212',
    marginLeft: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    gap: 8,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(1, 77, 58, 0.04)',
    borderRadius: 48,
    padding: 4,
    gap: 8,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTabActive: {
    backgroundColor: '#014D3A',
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#014D3A',
  },
  periodTabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: -0.32,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: 0.2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  threeColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  statCardContent: {
    gap: 10,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIconLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: 0.2,
  },
  statValueLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#121212',
    letterSpacing: -0.64,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  statCardSmallContent: {
    gap: 8,
    flex: 1,
  },
  statValueMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: 0.2,
  },
  statLabelSmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: 0.2,
  },
  percentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 40,
  },
  percentBadgePositive: {
    backgroundColor: '#014D3A',
  },
  percentBadgeNegative: {
    backgroundColor: '#EE1045',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    letterSpacing: -0.12,
  },
  watchTimeValue: {
    fontSize: 32,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: 0.2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chartDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 32,
    gap: 4,
  },
  chartDropdownText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#121212',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
    gap: 8,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  chartYLabel: {
    fontSize: 10,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.32)',
  },
  chartArea: {
    flex: 1,
  },
  chartLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  chartPointContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  chartBar: {
    width: 4,
    backgroundColor: '#014D3A',
    borderRadius: 2,
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#014D3A',
    borderWidth: 1.5,
    borderColor: '#121212',
    marginTop: -3,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartXLabel: {
    fontSize: 10,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.32)',
    textAlign: 'center',
  },
  viewerCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  viewerCardContent: {
    gap: 8,
  },
  viewerValue: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: 0.2,
  },
  viewerLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: 0.2,
  },
  topShortsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topShortCard: {
    flex: 1,
    aspectRatio: 0.56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  topShortImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  topShortOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.32)',
    justifyContent: 'space-between',
    padding: 12,
  },
  topShortRank: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  topShortViews: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 40,
    gap: 2,
  },
  topShortViewsText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#121212',
    letterSpacing: -0.12,
  },
});
