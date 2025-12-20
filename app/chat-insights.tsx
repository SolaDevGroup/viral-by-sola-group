import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, MessageSquare } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_GREEN = '#014D3A';
const LIGHT_GREEN = 'rgba(1, 77, 58, 0.48)';

interface WeeklyData {
  day: string;
  value: number;
  isHighlight?: boolean;
  highlightLevel?: 'high' | 'medium';
}

const WEEKLY_DATA: WeeklyData[] = [
  { day: 'Mon', value: 21 },
  { day: 'Tue', value: 42 },
  { day: 'Wed', value: 42 },
  { day: 'Thu', value: 106, isHighlight: true, highlightLevel: 'medium' },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 130, isHighlight: true, highlightLevel: 'high' },
  { day: 'Sun', value: 42 },
];

const MAX_BAR_HEIGHT = 130;

export default function ChatInsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getBarHeight = (value: number) => {
    return (value / MAX_BAR_HEIGHT) * MAX_BAR_HEIGHT;
  };

  const getBarColor = (item: WeeklyData) => {
    if (item.isHighlight) {
      return item.highlightLevel === 'high' ? PRIMARY_GREEN : LIGHT_GREEN;
    }
    return 'rgba(18, 18, 18, 0.04)';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="rgba(18, 18, 18, 0.64)" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Insights</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalCard}>
          <MessageSquare size={24} color="rgba(18, 18, 18, 0.64)" strokeWidth={1.5} />
          <Text style={styles.totalValue}>45.5M</Text>
          <Text style={styles.totalLabel}>Total Messages</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Messages Sent</Text>
            <Text style={styles.statValue}>1,034</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Messages Received</Text>
            <Text style={styles.statValue}>1,034</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>45 days</Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Activity</Text>
              <Text style={styles.chartSubtitle}>April 1 – April 7</Text>
            </View>

            <View style={styles.barsContainer}>
              {WEEKLY_DATA.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: getBarHeight(item.value),
                        backgroundColor: getBarColor(item),
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_GREEN,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: -0.005,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 12,
  },
  totalCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '600' as const,
    color: '#121212',
    lineHeight: 32,
    letterSpacing: -0.01,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    lineHeight: 20,
    marginBottom: 4,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(18, 18, 18, 0.48)',
    letterSpacing: -0.02,
    textTransform: 'capitalize' as const,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: -0.02,
  },
  chartContainer: {
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 16,
  },
  chartHeader: {
    gap: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#121212',
    letterSpacing: -0.02,
  },
  chartSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(18, 18, 18, 0.64)',
    letterSpacing: 0.2,
  },
  barsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-between' as const,
    height: 155,
    gap: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: 8,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 21,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#121212',
    lineHeight: 18,
    textAlign: 'center' as const,
  },
});
