import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  View,
} from "react-native";

import CustomInput from "./CustomInput";
import CustomModal from "./CustomModal";
import CustomText from "./CustomText";

import { COUNTRIES as COUNTRIES_DATA } from "../utils/COUNTRIES";
import { Fonts } from "@/constants/fonts";
import colors from "@/constants/colors";

const COUNTRIES = COUNTRIES_DATA.map((country) => ({
  code: country.code,
  dialCode: country.dialCode,
  name: country.name,
  flag: country.emoji,
})).sort((a, b) => a.name.localeCompare(b.name));

const ITEMS_PER_PAGE = 20;

const CustomPhoneInput = ({
  value = "",
  setValue,
  withLabel,
  onEndEditing,
  error,
  labelColor,
  isChange = false,
  marginBottom,
  defaultCode = "US",
  height = 56,
  borderRadius,
  marginTop,
  width,
  placeholder = "XXX XXX XX",
  onValidationChange,
  disabled = false,
}) => {
  const location = async () => {};

  const [isFocused, setIsFocused] = useState(false);
  const [showSuccessColor, setShowSuccessColor] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (value && value.trim()) {
      for (const country of COUNTRIES) {
        if (value.startsWith(country.dialCode)) {
          return country;
        }
      }
    }

    const locationCode = ((location?.countryCode || location?.country) ?? "")
      .toString()
      .toUpperCase();
    const locationCountry = COUNTRIES.find(
      (country) => country.code === locationCode
    );

    if (locationCountry) return locationCountry;

    const foundCountry = COUNTRIES.find(
      (country) => country.code === defaultCode
    );
    return (
      foundCountry ||
      COUNTRIES[0] || {
        code: "US",
        dialCode: "+1",
        name: "United States",
        flag: "🇺🇸",
      }
    );
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    try {
      if (value && value.trim()) {
        for (const country of COUNTRIES) {
          if (value.startsWith(country.dialCode)) {
            const phoneOnly = value.replace(country.dialCode, "").trim();
            return phoneOnly;
          }
        }
        return value.trim();
      }
      return "";
    } catch (error) {
      console.log("Phone number initialization error:", error);
      return "";
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    if (value && value.trim()) {
      for (const country of COUNTRIES) {
        if (value.startsWith(country.dialCode)) {
          const phoneOnly = value.replace(country.dialCode, "").trim();
          setSelectedCountry(country);
          setPhoneNumber(phoneOnly);
          return;
        }
      }
      setPhoneNumber(value.trim());
    } else {
      setPhoneNumber("");
    }
  }, [value]);

  useEffect(() => {
    const locationCode = ((location?.countryCode || location?.country) ?? "")
      .toString()
      .toUpperCase();
    if (!locationCode) return;

    const locationCountry = COUNTRIES.find(
      (country) => country.code === locationCode
    );
    if (!locationCountry) return;

    const userHasTyped = phoneNumber && phoneNumber.trim().length > 0;
    const alreadySelected =
      selectedCountry && selectedCountry.code === locationCountry.code;

    if (!alreadySelected && !userHasTyped) {
      setSelectedCountry(locationCountry);
      const fullNumber = `${locationCountry.dialCode}${phoneNumber}`.trim();
      setValue(fullNumber);
    }
  }, [location?.countryCode]);

  const allFilteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchText.toLowerCase()) ||
      country.dialCode.includes(searchText)
  );

  const totalPages = Math.ceil(allFilteredCountries.length / ITEMS_PER_PAGE);
  const paginatedCountries = allFilteredCountries.slice(
    0,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onEndEditing) {
      onEndEditing();
    }
  };

  const validatePhoneNumber = (fullNumber) => {
    const phoneOnly = fullNumber.replace(selectedCountry.dialCode, "").trim();
    const cleanedPhone = phoneOnly.replace(/[^\d]/g, "");

    const isValid = cleanedPhone.length >= 7 && cleanedPhone.length <= 15;

    if (isValid) {
      setShowSuccessColor(true);
      setTimeout(() => {
        setShowSuccessColor(false);
      }, 2000);
    } else {
      setShowSuccessColor(false);
    }

    if (onValidationChange) {
      onValidationChange(isValid);
    }

    return isValid;
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    setCurrentPage(1);
    setSearchText("");
    const fullNumber = `${country.dialCode}${phoneNumber}`.trim();
    setValue(fullNumber);
    validatePhoneNumber(fullNumber);
  };

  const handleModalOpen = () => {
    setModalVisible(true);
    setCurrentPage(1);
    setSearchText("");
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^\d\s-]/g, "");
    setPhoneNumber(cleaned);
    const fullNumber = `${selectedCountry.dialCode}${cleaned}`.trim();
    setValue(fullNumber);
    validatePhoneNumber(fullNumber);
  };

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6
      )}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      10
    )}`;
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };
  const insets = useSafeAreaInsets();
  return (
    <View style={{ width: width || "100%" }}>
      <View
        style={[
          styles.container,
          {
            marginBottom: error ? 5 : marginBottom || 15,
            marginTop,
            height: height,
            width: isChange ? "auto" : "100%",
            borderRadius: borderRadius || 12,
            backgroundColor: error
              ? "#EE10450A"
              : showSuccessColor
              ? "#64CD750A"
              : colors.inputBg,
            borderColor: error
              ? "#EE1045CC"
              : showSuccessColor
              ? "#64CD75"
              : "transparent",
          },
        ]}
      >
        {withLabel && (
          <CustomText
            label={withLabel}
            color={
              labelColor ||
              (error
                ? "#EE1045CC"
                : showSuccessColor
                ? "#64CD75"
                : colors.subtitle)
            }
            fontFamily={Fonts.medium}
            fontSize={12}
            lineHeight={12 * 1.4}
            textTransform="uppercase"
            marginTop={5}
          />
        )}

        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => !isChange && handleModalOpen()}
            disabled={isChange || disabled}
          >
            <Image
              source={{
                uri: `https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`,
              }}
              style={{
                height: 18,
                width: 18,
                marginRight: 10,
                borderRadius: 99,
              }}
              // resizeMode="contain"
            />
            <CustomText
              label={selectedCountry.dialCode}
              fontSize={16}
              lineHeight={16 * 1.4}
              fontFamily={Fonts.medium}
              color={
                error ? "#EE1045" : showSuccessColor ? "#64CD75" : colors.black
              }
              marginLeft={6}
              marginRight={6}
            />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={[
              styles.phoneInput,
              {
                color: error
                  ? "#EE1045"
                  : showSuccessColor
                  ? "#64CD75"
                  : colors.black,
              },
            ]}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder={placeholder}
            placeholderTextColor={colors.gray}
            keyboardType="phone-pad"
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={15}
            editable={!disabled}
          />
        </View>
      </View>

      <CustomModal
        isChange
        isVisible={modalVisible}
        blurType="dark"
        blurAmount={0.1}
        isBlur
        onDisable={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <CustomInput
              search
              width="86%"
              height={44}
              borderRadius={100}
              marginBottom={0.1}
              placeholder="Search Country or Code..."
              value={searchText}
              onChangeText={handleSearchChange}
              autoFocus={false}
              backgroundColor="#1212120A"
              color="#121212"
              placeholderColor="#1212127A"
            />
            <TouchableOpacity
              style={styles.crossContainer}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Entypo name="cross" size={24} color="#1212127A" />
            </TouchableOpacity>
          </View>

          {paginatedCountries && paginatedCountries.length > 0 ? (
            <FlatList
              data={paginatedCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isSelected =
                  selectedCountry && selectedCountry.code === item.code;

                return (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => handleCountrySelect(item)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.countryContent}>
                      <Image
                        source={{
                          uri: `https://flagcdn.com/w40/${item.code.toLowerCase()}.png`,
                        }}
                        style={{
                          height: 20,
                          width: 20,
                          marginRight: 10,
                          borderRadius: 99,
                        }}
                        // resizeMode="contain"
                      />
                      <View style={styles.countryInfo}>
                        <CustomText
                          label={item.name}
                          fontSize={16}
                          fontFamily={Fonts.medium}
                          color={isSelected ? colors.primary : colors.black}
                        />
                        <CustomText
                          label={item.dialCode}
                          fontSize={14}
                          fontFamily={Fonts.regular}
                          color={isSelected ? colors.primary : colors.gray1}
                        />
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                      size={26}
                      color={isSelected ? colors.primary : "#1212127A"}
                    />
                  </TouchableOpacity>
                );
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              style={{ marginTop: 10 }}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={renderFooter}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <CustomText
                label="No countries found"
                color={colors.inputLabel}
                fontSize={14}
              />
            </View>
          )}
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
  },

  dialCodeText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16 * 1.4,
    fontFamily: Fonts.medium,
    height: "100%",
    paddingVertical: 0,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  modalContainer: {
    backgroundColor: colors.white,
    width: "100%",
    height: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBlockColor: "#F6F6F6",
    borderBottomWidth: 4,
    padding: 16,
  },
  crossContainer: {
    borderRadius: 100,
    backgroundColor: "rgba(18, 18, 18, 0.04)",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cross: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  searchInput: {
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBg,
    fontFamily: Fonts.regular,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBg,
  },
  selectedItem: {
    backgroundColor: "rgba(106, 90, 224, 0.1)",
  },
  countryContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagText: {
    fontSize: 24,
    marginRight: 15,
  },
  countryInfo: {
    flex: 1,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIconBg: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    position: "absolute",
    right: 0,
    top: -10,
  },
});

export default CustomPhoneInput;
