import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ChevronLeft, Search, MapPin, Navigation, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Location = {
  id: string;
  name: string;
  subtitle?: string;
  type: 'recent' | 'suggested' | 'search';
};

const RECENT_LOCATIONS: Location[] = [
  { id: '1', name: 'Geneva, Switzerland', type: 'recent' },
  { id: '2', name: 'Paris, France', type: 'recent' },
  { id: '3', name: 'London, UK', type: 'recent' },
];

const SUGGESTED_LOCATIONS: Location[] = [
  { id: '4', name: 'Zurich, Switzerland', subtitle: 'Nearby', type: 'suggested' },
  { id: '5', name: 'Lyon, France', subtitle: '150 km away', type: 'suggested' },
  { id: '6', name: 'Milan, Italy', subtitle: '280 km away', type: 'suggested' },
  { id: '7', name: 'Munich, Germany', subtitle: '320 km away', type: 'suggested' },
  { id: '8', name: 'Barcelona, Spain', subtitle: '650 km away', type: 'suggested' },
];

const ALL_LOCATIONS: Location[] = [
  { id: '9', name: 'New York, USA', type: 'search' },
  { id: '10', name: 'Los Angeles, USA', type: 'search' },
  { id: '11', name: 'Tokyo, Japan', type: 'search' },
  { id: '12', name: 'Dubai, UAE', type: 'search' },
  { id: '13', name: 'Sydney, Australia', type: 'search' },
  { id: '14', name: 'Singapore', type: 'search' },
  { id: '15', name: 'Hong Kong', type: 'search' },
  { id: '16', name: 'Berlin, Germany', type: 'search' },
  { id: '17', name: 'Amsterdam, Netherlands', type: 'search' },
  { id: '18', name: 'Madrid, Spain', type: 'search' },
];

export default function SelectLocationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currentLocation?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(params.currentLocation || '');

  const filteredLocations = searchQuery
    ? [...RECENT_LOCATIONS, ...SUGGESTED_LOCATIONS, ...ALL_LOCATIONS].filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location.name);
    router.back();
    router.setParams({ selectedLocation: location.name });
  };

  const handleUseCurrentLocation = () => {
    const currentLoc = 'Geneva, Switzerland';
    setSelectedLocation(currentLoc);
    router.back();
    router.setParams({ selectedLocation: currentLoc });
  };

  const renderLocationItem = (location: Location) => (
    <TouchableOpacity
      key={location.id}
      style={styles.locationItem}
      onPress={() => handleSelectLocation(location)}
    >
      <View style={styles.locationIcon}>
        <MapPin size={20} color="rgba(255, 255, 255, 0.64)" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{location.name}</Text>
        {location.subtitle && (
          <Text style={styles.locationSubtitle}>{location.subtitle}</Text>
        )}
      </View>
      {selectedLocation === location.name && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="rgba(255, 255, 255, 0.64)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="rgba(255, 255, 255, 0.48)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="rgba(255, 255, 255, 0.48)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            <TouchableOpacity style={styles.currentLocationButton} onPress={handleUseCurrentLocation}>
              <View style={styles.currentLocationIcon}>
                <Navigation size={20} color="#007BFF" />
              </View>
              <View style={styles.currentLocationInfo}>
                <Text style={styles.currentLocationTitle}>Use Current Location</Text>
                <Text style={styles.currentLocationSubtitle}>Geneva, Switzerland</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT</Text>
              {RECENT_LOCATIONS.map(renderLocationItem)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUGGESTED</Text>
              {SUGGESTED_LOCATIONS.map(renderLocationItem)}
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {filteredLocations.length > 0 ? (
              filteredLocations.map(renderLocationItem)
            ) : (
              <Text style={styles.noResultsText}>No locations found</Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 12,
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationInfo: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007BFF',
    marginBottom: 2,
  },
  currentLocationSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  locationSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.48)',
    marginTop: 2,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007BFF',
  },
  noResultsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
    textAlign: 'center',
    marginTop: 20,
  },
});
