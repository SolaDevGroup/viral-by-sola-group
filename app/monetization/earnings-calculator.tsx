import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { Stack, router } from "expo-router";
import { ChevronLeft, TrendingUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";

export default function EarningsCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const [followers, setFollowers] = useState(1000000);
  const [conversionRate, setConversionRate] = useState(2);
  const [avgViews, setAvgViews] = useState(1000000);

  const monthlyPrice = 4.99;
  const subscribers = Math.round(followers * (conversionRate / 100));
  const subscriptionRevenue = subscribers * monthlyPrice * 0.771;
  const adRevenue = (avgViews / 1000) * 3.50;
  const paymentProcessing = subscribers * monthlyPrice * 0.029;
  const totalMonthlyEarnings = subscriptionRevenue + adRevenue;
  const yearlyProjection = totalMonthlyEarnings * 12;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const benchmarkMonthly = 1000000 * 0.02 * monthlyPrice * 0.771;
  const benchmarkYearly = benchmarkMonthly * 12;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#121212" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings Calculator</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <Text style={styles.sectionTitle}>Earnings Calculator</Text>
        <Text style={styles.sectionSubtitle}>
          Estimate your potential earnings based on your audience size.
        </Text>

        <LinearGradient
          colors={['#1A9D7C', '#14866A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningsCard}
        >
          <Text style={styles.earningsLabel}>Estimated Monthly Earnings</Text>
          <Text style={styles.earningsValue}>{formatCurrency(totalMonthlyEarnings)}</Text>
          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>From Subscriptions</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(subscriptionRevenue)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>From Ad Revenue</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(adRevenue)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <Text style={styles.projectionLabel}>Yearly Projection</Text>
            <TrendingUp size={24} color="#1A9D7C" strokeWidth={2} />
          </View>
          <Text style={styles.projectionValue}>{formatCurrency(yearlyProjection)}</Text>
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Total Followers/Viewers</Text>
            <Text style={styles.sliderValue}>{formatNumber(followers)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1000}
            maximumValue={10000000}
            step={1000}
            value={followers}
            onValueChange={setFollowers}
            minimumTrackTintColor="#1A9D7C"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1A9D7C"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>1K</Text>
            <Text style={styles.sliderLabelText}>10M</Text>
          </View>
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Subscriber Conversion Rate</Text>
            <Text style={styles.sliderValue}>{conversionRate}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={10}
            step={0.5}
            value={conversionRate}
            onValueChange={setConversionRate}
            minimumTrackTintColor="#1A9D7C"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1A9D7C"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0.5%</Text>
            <Text style={styles.sliderLabelText}>10%</Text>
          </View>
          <Text style={styles.subscribersCount}>= {formatNumber(subscribers)} paying subscribers</Text>
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Avg. Views per Video</Text>
            <Text style={styles.sliderValue}>{formatNumber(avgViews)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1000}
            maximumValue={10000000}
            step={1000}
            value={avgViews}
            onValueChange={setAvgViews}
            minimumTrackTintColor="#1A9D7C"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#1A9D7C"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>1K</Text>
            <Text style={styles.sliderLabelText}>10M</Text>
          </View>
        </View>

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownRowLabel}>Payment Processing (2.9%)</Text>
            <Text style={styles.breakdownRowValueNegative}>-{formatCurrency(paymentProcessing)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownRowLabel}>Ad Revenue (CPM $3.50)</Text>
            <Text style={styles.breakdownRowValuePositive}>+{formatCurrency(adRevenue)}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownRowTotal]}>
            <Text style={styles.breakdownRowLabelBold}>Your Monthly Earnings</Text>
            <Text style={styles.breakdownRowValueBold}>{formatCurrency(totalMonthlyEarnings)}</Text>
          </View>
        </View>

        <View style={styles.benchmarkCard}>
          <View style={styles.benchmarkHeader}>
            <TrendingUp size={20} color="#1A9D7C" strokeWidth={2} />
            <Text style={styles.benchmarkTitle}>1M Followers Benchmark</Text>
          </View>
          <Text style={styles.benchmarkDescription}>
            With 1 million followers and a 2% conversion rate at $4.99/month:
          </Text>
          <View style={styles.benchmarkValues}>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkLabel}>Monthly</Text>
              <Text style={styles.benchmarkValue}>{formatCurrency(benchmarkMonthly)}</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkLabel}>Yearly</Text>
              <Text style={styles.benchmarkValue}>{formatCurrency(benchmarkYearly)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#121212',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(18, 18, 18, 0.64)',
    marginBottom: 20,
  },
  earningsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    gap: 24,
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  projectionCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectionLabel: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  projectionValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#121212',
  },
  sliderSection: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#121212',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A9D7C',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  subscribersCount: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownRowTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(18, 18, 18, 0.08)',
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownRowLabel: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.64)',
  },
  breakdownRowLabelBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121212',
  },
  breakdownRowValueNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EE1045',
  },
  breakdownRowValuePositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A9D7C',
  },
  breakdownRowValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121212',
  },
  benchmarkCard: {
    backgroundColor: 'rgba(26, 157, 124, 0.08)',
    borderRadius: 16,
    padding: 16,
  },
  benchmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  benchmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
  },
  benchmarkDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(18, 18, 18, 0.64)',
    marginBottom: 12,
  },
  benchmarkValues: {
    flexDirection: 'row',
    gap: 24,
  },
  benchmarkItem: {
    flex: 1,
  },
  benchmarkLabel: {
    fontSize: 12,
    color: 'rgba(18, 18, 18, 0.48)',
    marginBottom: 4,
  },
  benchmarkValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A9D7C',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#1A9D7C',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
