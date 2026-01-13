import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";

import CustomInput from "./CustomInput";
import CustomModal from "./CustomModal";
import CustomText from "./CustomText";
import ExpoIcons from "./ExpoIcons";
import { Images } from "../assets/images";

import Colors from "@/constants/colors";
import {
  calculateDistance,
  calculateRoadDistanceAndTime,
  formatDistance,
  getLocationWithPermission,
  resetLocationRequestState,
} from "@/utils/LocationUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import axios from "axios";

const API_KEY = "AIzaSyB3Tj9fWzywtOncQ7vNjcErxRM5E--WlDA";
interface CustomModalGooglePlacesProps {
  isVisible?: boolean;
  onClose: () => void;
  onLocationSelect: (location: any) => void; // you can strongly type this if you know the shape
  initialValue?: string;
  debounceDelay?: number;
}
// Custom Skeleton Loader Component
const SkeletonLoader = ({ type = "default", style, theme }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const interpolatedBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderLight, theme.borderLight],
  });

  if (type === "prediction") {
    return (
      <View style={[styles.skeletonPredictionContainer, style]}>
        <Animated.View
          style={[
            styles.skeletonIcon,
            { backgroundColor: interpolatedBackground },
          ]}
        />
        <View style={styles.skeletonTextContainer}>
          <Animated.View
            style={[
              styles.skeletonText,
              styles.skeletonTextLong,
              { backgroundColor: interpolatedBackground },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonText,
              styles.skeletonTextShort,
              { backgroundColor: interpolatedBackground },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.skeletonDistance,
            { backgroundColor: interpolatedBackground },
          ]}
        />
      </View>
    );
  }

  if (type === "section") {
    return (
      <View style={[styles.skeletonSectionContainer, style]}>
        <Animated.View
          style={[
            styles.skeletonIcon,
            { backgroundColor: interpolatedBackground },
          ]}
        />
        <View style={styles.skeletonTextContainer}>
          <Animated.View
            style={[
              styles.skeletonText,
              styles.skeletonTextLong,
              { backgroundColor: interpolatedBackground },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonText,
              styles.skeletonTextShort,
              { backgroundColor: interpolatedBackground },
            ]}
          />
        </View>
      </View>
    );
  }

  // Default skeleton
  return (
    <View style={[styles.skeletonContainer, style]}>
      <Animated.View
        style={[styles.skeleton, { backgroundColor: interpolatedBackground }]}
      />
    </View>
  );
};

const useDebounce = (value?: any, delay?: any) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CustomModalGooglePlaces = ({
  isVisible,
  onClose,
  onLocationSelect,
  initialValue = "",
  debounceDelay = 300,
}: CustomModalGooglePlacesProps) => {
  const navigation = useNavigation();
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<
    object | null | string | any
  >(null);
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const [predictionsWithDistance, setPredictionsWithDistance] = useState([]);
  const [loadingDistances, setLoadingDistances] = useState(false);

  // Nearby cities state
  const [nearbyCities, setNearbyCities] = useState([]);
  const [loadingNearbyCities, setLoadingNearbyCities] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  const closeModal = useCallback(() => {
    onClose();
    setPredictions([]);
    setPredictionsWithDistance([]);
    setNoData(false);
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setSearchQuery(initialValue);
      setPredictions([]);
      setPredictionsWithDistance([]);
      setNoData(false);
    }
  }, [isVisible, initialValue]);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const locationData: object | any = await getLocationWithPermission();
        setCurrentUserLocation(locationData);
        // Fetch nearby cities when location is available
        if (locationData) {
          fetchNearbyCities(locationData.latitude, locationData.longitude);
        }
      } catch (error: any) {
        console.log(
          "Initial location fetch error:",
          error.userFriendlyMessage || error.message || error
        );
        // Don't show alert on initial load, just log for debugging
        if (error.code === "LOCATION_REQUEST_IN_PROGRESS") {
          // Reset state and try again after a delay
          setTimeout(() => {
            resetLocationRequestState();
          }, 1000);
        }
      }
    };

    if (isVisible) {
      getUserLocation();
    }
  }, [isVisible]);

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length > 2) {
      handleSearch(debouncedSearchQuery);
    } else {
      setPredictions([]);
      setPredictionsWithDistance([]);
      setNoData(false);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = async (text: string | null) => {
    if (!text || text.length < 3) {
      setPredictions([]);
      setPredictionsWithDistance([]);
      return;
    }

    setLoading(true);
    setNoData(false);

    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${API_KEY}&input=${encodeURIComponent(
        text
      )}&types=(cities)`;

      if (currentUserLocation) {
        url += `&location=${currentUserLocation.latitude},${currentUserLocation.longitude}&radius=50000`;
      }

      const response = await fetch(url);

      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }

      const data = await response?.json();

      if (data.error_message) {
        console.error("Google Places API Error:", data.error_message);
        setPredictions([]);
        setPredictionsWithDistance([]);
        setNoData(true);
      } else if (data.predictions?.length > 0) {
        setPredictions(data.predictions);
        setPredictionsWithDistance([]);
        setNoData(false);

        if (currentUserLocation) {
          calculatePredictionDistances(data.predictions);
        }
      } else {
        setPredictions([]);
        setPredictionsWithDistance([]);
        setNoData(true);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setPredictionsWithDistance([]);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string | number | null | any) => {
    try {
      // Check if placeId is valid
      if (!placeId || typeof placeId !== "string" || placeId.trim() === "") {
        console.warn("Invalid placeId provided:", placeId);
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?key=${API_KEY}&place_id=${placeId.trim()}&fields=address_components,geometry`
      );
      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }

      const data = await response?.json();

      if (data.error_message) {
        console.error("Google Places Details API Error:", data.error_message);
        return null;
      }

      return data.result;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  const extractAddressComponents = (addressComponents: any | null) => {
    const components = {
      state: null,
      city: null,
      zipCode: null,
      country: null,
    };

    addressComponents.forEach((component: any | null) => {
      if (component.types.includes("administrative_area_level_1")) {
        components.state = component.long_name;
      } else if (component.types.includes("locality")) {
        components.city = component.long_name;
      } else if (component.types.includes("postal_code")) {
        components.zipCode = component.long_name;
      } else if (component.types.includes("country")) {
        components.country = component.long_name;
      }
    });

    return components;
  };

  // const addToRecentSearches = useCallback(
  //   (locationData) => {
  //     const newSearch = {
  //       id: Date.now(),
  //       timestamp: new Date().toISOString(),
  //       ...locationData,
  //     };

  //     const filteredSearches = recentSearches?.filter(
  //       (search) => search.address !== locationData.address
  //     );

  //     const updatedSearches = [newSearch, ...filteredSearches].slice(0, 3);

  //   },
  //   [recentSearches]
  // );

  const saveLocation = useCallback((locationData: any | null) => {
    const newSavedLocation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...locationData,
    };

    // const filteredSaved:any|null = savedLocations?.filter(
    //   (saved) => saved.address !== locationData.address
    // );

    // const updatedSaved = [newSavedLocation, ...filteredSaved].slice(0, 10);
  }, []);

  const handlePredictionPress = async (item?: any) => {
    if (item?.latitude && item?.longitude) {
      const locationData = {
        address: item.description || item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        city: item.city,
        state: item.state,
        country: item.country,
        zipCode: item.zipCode,
        distance: item.distance,
      };

      // addToRecentSearches(locationData);
      onLocationSelect(locationData);
      closeModal();
      return;
    }

    if (!item?.place_id) {
      console.warn("No place_id found in prediction item:", item);
      onLocationSelect({
        address: item.description || item.address,
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        country: null,
        zipCode: null,
        distance: null,
      });
      closeModal();
      return;
    }

    const placeDetails = await fetchPlaceDetails(item.place_id);

    if (placeDetails) {
      const components: any | null = placeDetails?.address_components
        ? extractAddressComponents(placeDetails?.address_components)
        : {};

      let distance = null;
      if (currentUserLocation && placeDetails?.geometry?.location) {
        try {
          const road: any | null = await calculateRoadDistanceAndTime(
            {
              latitude: currentUserLocation.latitude,
              longitude: currentUserLocation.longitude,
            },
            {
              latitude: placeDetails?.geometry?.location?.lat,
              longitude: placeDetails?.geometry?.location?.lng,
            },
            { mode: "driving", units: "metric" }
          );
          distance = road?.distanceKm ?? null;
        } catch (e) {
          distance = calculateDistance(
            currentUserLocation.latitude,
            currentUserLocation.longitude,
            placeDetails?.geometry?.location?.lat,
            placeDetails?.geometry?.location?.lng
          );
        }
      }

      const locationData: object | null | any = {
        latitude: placeDetails?.geometry?.location?.lat,
        longitude: placeDetails?.geometry?.location?.lng,
        address: item.description,
        city: components.city,
        state: components.state,
        country: components.country,
        zipCode: components.zipCode,
        distance: distance,
      };

      setSelectedLocationData(locationData);
      // addToRecentSearches(locationData);

      onLocationSelect(locationData);
    } else {
      onLocationSelect({
        address: item.description || item.address,
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        country: null,
        zipCode: null,
        distance: null,
      });
    }

    closeModal();
  };

  const handleInputChange = (text: string | null | any) => {
    setSearchQuery(text);
  };

  const calculatePredictionDistances = async (predictions: any | null) => {
    if (!currentUserLocation) return;

    setLoadingDistances(true);
    try {
      const limitedPredictions = predictions.slice(0, 5);

      const predictionsWithDistanceData = await Promise.all(
        limitedPredictions.map(async (prediction: any | null) => {
          try {
            // Check if prediction has valid place_id
            if (!prediction?.place_id) {
              console.warn("No place_id found in prediction:", prediction);
              return { ...prediction, distance: null };
            }

            const placeDetails = await fetchPlaceDetails(prediction.place_id);
            if (placeDetails?.geometry?.location) {
              const { lat, lng } = placeDetails?.geometry?.location;
              let distance = null;
              try {
                const road: any | null = await calculateRoadDistanceAndTime(
                  {
                    latitude: currentUserLocation.latitude,
                    longitude: currentUserLocation.longitude,
                  },
                  {
                    latitude: placeDetails?.geometry?.location?.lat,
                    longitude: placeDetails?.geometry?.location?.lng,
                  },
                  { mode: "driving", units: "metric" }
                );
                distance = road?.distanceKm ?? null;
              } catch (e) {
                distance = calculateDistance(
                  currentUserLocation.latitude,
                  currentUserLocation.longitude,
                  placeDetails?.geometry?.location?.lat,
                  placeDetails?.geometry?.location?.lng
                );
              }

              const components: any | null = placeDetails.address_components
                ? extractAddressComponents(placeDetails.address_components)
                : {};

              return {
                ...prediction,
                distance: distance,
                coordinates: {
                  lat: placeDetails?.geometry?.location?.lat,
                  lng: placeDetails?.geometry?.location?.lng,
                },
                city: components.city || null,
                state: components.state || null,
                country: components.country || null,
                zipCode: components.zipCode || null,
              };
            }
            return { ...prediction, distance: null };
          } catch (error) {
            console.warn("Failed to get distance for prediction:", error);
            return { ...prediction, distance: null };
          }
        })
      );

      const remainingPredictions = predictions
        .slice(5)
        .map((prediction: any | null) => ({
          ...prediction,
          distance: null,
        }));

      // Keep only items that resolve to a city
      const cityPredictions: any | null = predictionsWithDistanceData.filter(
        (p) => p.city && p.city !== null
      );

      setPredictionsWithDistance(cityPredictions);
    } catch (error) {
      console.error("Error calculating prediction distances:", error);
      setPredictionsWithDistance(
        predictions.map((p: any) => ({ ...p, distance: null }))
      );
    } finally {
      setLoadingDistances(false);
    }
  };

  const handleCurrentLocationSelection = async () => {
    // Prevent multiple location requests
    if (isLoadingCurrentLocation) {
      console.log("Location request already in progress, ignoring new request");
      return;
    }

    setIsLoadingCurrentLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const address = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${API_KEY}`
      );
      const addressData = address?.data?.results?.[0]?.formatted_address;
      console.log("addressData========>", addressData);
      onLocationSelect({
        address: addressData || "",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: null,
        state: null,
        country: null,
        zipCode: null,
        distance: null,
      });
      closeModal();
    } catch (error: any | null) {
      console.log("Error getting current location:", error);
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  const renderPredictionItem = (
    { item }: any | null,
    isRecent = false,
    isSaved = false,
    hideBorder = false,
    showLocationIcon = false
  ) => {
    let distanceText = "";
    if (item?.distance !== null && item?.distance !== undefined) {
      distanceText = formatDistance(item?.distance);
    }

    const onSaveLocation = async () => {
      try {
        // Check if item has valid place_id
        if (!item?.place_id) {
          console.warn("No place_id found in item for save:", item);
          return;
        }

        const placeDetails = await fetchPlaceDetails(item.place_id);

        if (placeDetails) {
          const components: any | null = placeDetails?.address_components
            ? extractAddressComponents(placeDetails?.address_components)
            : {};

          const locationData = {
            latitude:
              placeDetails?.geometry?.location?.lat || item?.coordinates?.lat,
            longitude:
              placeDetails?.geometry?.location?.lng || item?.coordinates?.lng,
            address: item?.description || item?.address,
            city:
              components.city ||
              item?.structured_formatting?.secondary_text ||
              item?.city ||
              "",
            state: components.state || null,
            country: components.country || null,
            zipCode: components.zipCode || null,
            distance: item?.distance,
          };

          saveLocation(locationData);
        } else {
          const locationData = {
            latitude: item?.coordinates?.lat,
            longitude: item?.coordinates?.lng,
            address: item?.description,
            city: item?.structured_formatting?.secondary_text || "",
            state: null,
            country: null,
            zipCode: null,
            distance: item?.distance,
          };

          saveLocation(locationData);
        }
      } catch (error) {
        console.error("Error fetching place details for save:", error);
        const locationData: any | null = {
          latitude: item?.coordinates?.lat,
          longitude: item?.coordinates?.lng,
          address: item?.description,
          city: item?.structured_formatting?.secondary_text || "",
          state: null,
          country: null,
          zipCode: null,
          distance: item?.distance,
        };

        saveLocation(locationData);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={[
          styles.selectMap,
          {
            borderBottomWidth: hideBorder ? 0 : 1,
            borderBottomColor: hideBorder ? "transparent" : theme.borderLight,
          },
        ]}
        onPress={() => handlePredictionPress(item)}
        disabled={isLoadingCurrentLocation}
      >
        <View style={styles.row}>
          <View style={{}}>
            <CustomText
              label={item?.description || item?.address}
              fontFamily={"Poppins_500Medium"}
              fontSize={16}
              color={theme.text}
            />
            <CustomText
              label={
                item?.structured_formatting?.secondary_text || item?.city || ""
              }
              fontFamily={"Poppins_500Medium"}
              color={theme.textSecondary}
            />
          </View>
        </View>

        {distanceText ? (
          <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
            <CustomText
              label={distanceText}
              fontFamily={"Poppins_500Medium"}
              fontSize={14}
              color={theme.textSecondary}
            />
          </View>
        ) : loadingDistances && currentUserLocation ? (
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "center",
              width: "15%",
            }}
          >
            <SkeletonLoader
              type="default"
              style={[
                styles.skeletonDistanceLoader,
                { borderBottomColor: theme.borderLight },
              ]}
              theme={theme}
            />
          </View>
        ) : null}
        {/* {isSaved ? (
          <TouchableOpacity
            onPress={onSaveLocation}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={isLocationSaved ? PNGIcons.greenStar : PNGIcons.starLine}
              style={styles.map}
            />
          </TouchableOpacity>
        ) : null} */}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () =>
    noData && !loading ? (
      <View style={styles.emptyContainer}>
        <CustomText
          label="No locations found. Try searching with different terms."
          fontFamily={"Poppins_500Medium"}
          fontSize={14}
          color={theme.tabInactive}
          textAlign="center"
        />
      </View>
    ) : null;

  // Fetch nearby cities using Places Autocomplete with city restriction
  const fetchNearbyCities = async (
    latitude: any | null,
    longitude: any | null
  ) => {
    if (!latitude || !longitude) return;

    setLoadingNearbyCities(true);

    try {
      // Use a generic input to get city suggestions around the location
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${API_KEY}&input=a&types=(cities)&location=${latitude},${longitude}&radius=50000`;

      const response = await fetch(url);
      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }

      const data = await response?.json();
      if (data.error_message) {
        console.error(
          "Google Places API Error (nearby cities):",
          data.error_message
        );
        setNearbyCities([]);
        return;
      }

      const predictions = Array.isArray(data.predictions)
        ? data.predictions
        : [];

      // Resolve details and compute distance, keep only items resolving to a city
      const resolved = await Promise.all(
        predictions.slice(0, 10).map(async (prediction: any | null) => {
          try {
            if (!prediction?.place_id) return null;
            const details = await fetchPlaceDetails(prediction.place_id);
            if (!details?.geometry?.location) return null;

            let distance = null;
            try {
              const road: any | null = await calculateRoadDistanceAndTime(
                { latitude, longitude },
                {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                },
                { mode: "driving", units: "metric" }
              );
              distance = road?.distanceKm ?? null;
            } catch (e) {
              distance = calculateDistance(
                latitude,
                longitude,
                details.geometry.location.lat,
                details.geometry.location.lng
              );
            }

            const components: any | null = details.address_components
              ? extractAddressComponents(details.address_components)
              : {};

            // Only include if it resolves to a city
            if (!components.city) return null;

            return {
              place_id: prediction.place_id,
              description: prediction.description,
              structured_formatting: prediction.structured_formatting,
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              distance: distance,
              city: components.city,
              state: components.state,
              country: components.country,
              zipCode: components.zipCode,
            };
          } catch (e) {
            console.warn("Failed resolving city prediction:", e);
            return null;
          }
        })
      );

      const cities: any | null = resolved
        .filter(Boolean)
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      setNearbyCities(cities);
    } catch (error) {
      console.error("Error fetching nearby cities:", error);
      setNearbyCities([]);
    } finally {
      setLoadingNearbyCities(false);
    }
  };
  const insests = useSafeAreaInsets();

  return (
    <CustomModal isChange isVisible={isVisible} onDisable={closeModal}>
      <View
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.modalHeader,
            {
              marginTop: insests.top - 10,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <CustomInput
            search
            width="86%"
            height={44}
            borderRadius={100}
            marginBottom={0.1}
            isClear
            onChangeText={handleInputChange}
            value={searchQuery}
            placeholder="Search location..."
            autoFocus
          />
          <TouchableOpacity
            style={{
              height: 40,
              width: 40,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.cardBackground,
            }}
            onPress={closeModal}
            activeOpacity={0.7}
          >
            <ExpoIcons
              family="Entypo"
              name="cross"
              size={22}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.selectMap, { borderColor: theme.borderLight }]}
          onPress={handleCurrentLocationSelection}
          disabled={isLoadingCurrentLocation}
        >
          <View style={[styles.row]}>
            <Image
              source={Images.location}
              tintColor={theme.text}
              style={styles.map}
            />
            <View>
              <CustomText
                label={
                  currentUserLocation
                    ? currentUserLocation.city || "Current Location"
                    : "Get Current Location"
                }
                fontFamily={"Poppins_500Medium"}
                fontSize={16}
                marginLeft={8}
                color={theme.text}
              />
              <CustomText
                label={
                  currentUserLocation
                    ? `${currentUserLocation.state || ""}, ${
                        currentUserLocation.country || ""
                      }`.replace(/^, |, $/, "") || "Unknown location"
                    : "Tap to get your current location"
                }
                fontFamily={"Poppins_500Medium"}
                marginLeft={8}
                color={theme.textSecondary}
              />
            </View>
          </View>
          {isLoadingCurrentLocation ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <CustomText
              label={currentUserLocation ? "Currently here" : "Get location"}
              fontFamily={"Poppins_500Medium"}
              marginLeft={8}
              color={theme.textSecondary}
            />
          )}
        </TouchableOpacity>

        <ScrollView>
          {predictionsWithDistance.length && predictions.length ? null : (
            <>
              {loadingNearbyCities ? (
                <SkeletonLoader
                  type="section"
                  style={styles.skeletonSection}
                  theme={theme}
                />
              ) : (
                <FlatList
                  data={nearbyCities}
                  renderItem={({ item }) =>
                    renderPredictionItem({ item }, false, true, true)
                  }
                  keyExtractor={(item: any, index) =>
                    `${item?.place_id}-${index}`
                  }
                  ListEmptyComponent={renderEmptyComponent}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {/* <View>
                {recentSearches?.length ? (
                  <View style={styles.divider}>
                    <CustomText
                      label="RECENT SEARCHES"
                      fontFamily={"Poppins_500Medium"}
                      fontSize={12}
                      color="#121212A3"
                    />
                  </View>
                ) : null}

                <FlatList
                  data={recentSearches}
                  renderItem={({ item }) =>
                    renderPredictionItem({ item }, true, false)
                  }
                  keyExtractor={(item, index) => `${item?.place_id}-${index}`}
                  ListEmptyComponent={renderEmptyComponent}
                  showsVerticalScrollIndicator={false}
                />
              </View> */}

              {/* <View>
                {savedLocations?.length ? (
                  <View style={styles.divider}>
                    <CustomText
                      label="SAVED LOCATIONS"
                      fontFamily={fonts.medium}
                      fontSize={12}
                      color="#121212A3"
                    />
                  </View>
                ) : null}

                <FlatList
                  data={savedLocations}
                  renderItem={({ item }) =>
                    renderPredictionItem({ item }, false, true)
                  }
                  keyExtractor={(item, index) => `${item?.place_id}-${index}`}
                  ListEmptyComponent={renderEmptyComponent}
                  showsVerticalScrollIndicator={false}
                />
              </View> */}
            </>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              {[...Array(3)].map((_, index) => (
                <SkeletonLoader
                  key={index}
                  type="prediction"
                  style={styles.skeletonPrediction}
                  theme={theme}
                />
              ))}
            </View>
          ) : (
            <>
              {(predictionsWithDistance.length > 0 ||
                predictions.length > 0) && (
                <FlatList
                  data={
                    predictionsWithDistance.length > 0
                      ? predictionsWithDistance
                      : predictions
                  }
                  renderItem={({ item }) =>
                    renderPredictionItem({ item }, false, false, false, true)
                  }
                  keyExtractor={(item: any | null, index: any | null) =>
                    `${item?.place_id}-${index}`
                  }
                  ListEmptyComponent={renderEmptyComponent}
                  showsVerticalScrollIndicator={false}
                  style={styles.predictionsList}
                  contentContainerStyle={
                    predictionsWithDistance.length === 0 &&
                    predictions.length === 0
                      ? styles.emptyListContent
                      : undefined
                  }
                />
              )}
            </>
          )}
        </ScrollView>
      </View>
    </CustomModal>
  );
};

export default CustomModalGooglePlaces;

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    height: "100%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginTop: 15,

    borderBottomWidth: 2,
    padding: 16,
  },
  selectMap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF0A",
  },
  // crossContainer: {
  //   borderRadius: 100,
  //   backgroundColor: "rgba(18, 18, 18, 0.04)",
  //   width: 44,
  //   height: 44,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  cross: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    // padding: 16,
  },
  predictionsList: {
    flex: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  map: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF0A",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  plane: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1212120A",
    borderRadius: 100,
  },
  // Skeleton Loader Styles
  skeletonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  skeleton: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  skeletonPredictionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  skeletonSectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  skeletonTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonTextLong: {
    width: "80%",
  },
  skeletonTextShort: {
    width: "60%",
  },
  skeletonDistance: {
    width: 40,
    height: 14,
    borderRadius: 4,
  },
  skeletonSection: {
    marginBottom: 0,
  },
  skeletonPrediction: {
    marginBottom: 0,
  },
  skeletonDistanceLoader: {
    width: 30,
    height: 12,
    borderRadius: 4,
  },
});
