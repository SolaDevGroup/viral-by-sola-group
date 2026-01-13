import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/Header";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import OptionSelector from "../../components/OptionSelector";
import SelectionModal from "../../components/SelectionModal";
import Border from "@/components/Border";
import { ToastMessage } from "@/utils/ToastMessage";
import { uploadAndGetUrl } from "@/utils/constants";
import SwitchOption from "../../components/SwitchOption";
import { post } from "@/services/ApiRequest";

const CreateProduct = () => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [ageRating, setAgeRating] = useState<string | null>(null);
  const [visibleTo, setVisibleTo] = useState<string | null>(null);
  const [hasInformation, setHasInformation] = useState(false);
  const [iAcceptTOS, setIAcceptTOS] = useState(false);

  // Selection Modal State
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<
    "category" | "age" | "visibleTo" | null
  >(null);

  const openSelectionModal = (type: "category" | "age" | "visibleTo") => {
    setSelectionType(type);
    setIsSelectionModalVisible(true);
  };

  const handleSelection = (value: string) => {
    switch (selectionType) {
      case "category":
        setCategory(value);
        break;
      case "age":
        setAgeRating(value);
        break;
      case "visibleTo":
        setVisibleTo(value);
        break;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handlePublish = async () => {
    if (!name || !price || !brand || !category || images.length === 0) {
      ToastMessage("Please fill all required fields", "error");
      return;
    }

    // TODO: Implement actual publish logic

    let uploadedUrl: string | null = null;
    const mediaUri = images[0];

    // Upload first image
    if (mediaUri) {
      try {
        uploadedUrl = await uploadAndGetUrl({ path: mediaUri });
      } catch (e) {
        console.log("Image upload failed", e);
        ToastMessage("Image upload failed", "error");
        return;
      }
    }

    if (!uploadedUrl) {
      ToastMessage("Image upload failed", "error");
      return;
    }

    // Format values for backend
    const formatAgeRating = (rating: string) => {
      if (rating === "Kids") return "all";
      if (rating.startsWith("+")) return rating.substring(1) + "+";
      return rating;
    };

    const payload = {
      title: name,
      brand,
      description,
      category: category!.toLowerCase(),
      ageRating: formatAgeRating(ageRating!),
      avaliableTo: visibleTo!.toLowerCase(),
      price: Number(price),
      images: [uploadedUrl],
    };
    console.log("Publishing:", payload);
    try {
      const res = await post("store", payload);
      console.log("Response:=====>", res?.data);

      if (res?.data?.success) {
        ToastMessage("Product published successfully!", "success");
        router.back();
      } else {
        ToastMessage(
          res?.data?.message || "Failed to publish product",
          "error"
        );
      }
    } catch (e) {
      console.log("Error publishing product", e);
      ToastMessage("Failed to publish product", "error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Publish A Product" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesList}
          >
            <TouchableOpacity
              style={[
                styles.addImageButton,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Camera size={24} color={theme.textSecondary} />
            </TouchableOpacity>

            {images.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.image} />
              </View>
            ))}
          </ScrollView>
        </View>

        <Border marginVertical={16} />

        {/* Form Fields */}
        <View style={styles.form}>
          {/* 1. PRODUCT TITLE */}
          <CustomInput
            withLabel="PRODUCT TITLE"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Vintage Denim Jacket"
            cardInfo={`${name.length}/35 characters.`}
          />

          {/* 2. BRAND */}
          <CustomInput
            withLabel="BRAND"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Zara"
            cardInfo={`${brand.length}/35 characters.`}
          />

          {/* 3. DESCRIPTION */}
          <CustomInput
            withLabel="DESCRIPTION"
            height={120}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item..."
            cardInfo={`${description.length}/500 characters`}
          />

          {/* 4. CATEGORY */}
          <OptionSelector
            label="Category"
            placeHolder="Select Category"
            value={category || undefined}
            onPress={() => openSelectionModal("category")}
          />

          {/* 5. AGE RATING */}
          <OptionSelector
            label="Age Rating"
            placeHolder="Select Age Rating"
            value={ageRating || undefined}
            onPress={() => openSelectionModal("age")}
          />

          {/* 6. AVAILABLE TO */}
          <OptionSelector
            label="Available To"
            placeHolder="Select Availability"
            value={visibleTo || undefined}
            onPress={() => openSelectionModal("visibleTo")}
          />

          {/* 7. PRICE */}
          <CustomInput
            withLabel="PRICE"
            value={price}
            onChangeText={setPrice}
            placeholder="$0.00"
            keyboardType="numeric"
            cardInfo="Default currency is US Dollar."
          />
        </View>
        <SwitchOption
          label="CONFIRM ALL ABOVE INFORMATIONS"
          value={hasInformation}
          setValue={setHasInformation}
        />
        <SwitchOption
          label="I accept the TOS"
          value={iAcceptTOS}
          setValue={setIAcceptTOS}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <CustomButton
          title="Publish"
          backgroundColor={theme.text}
          color={isDarkMode ? "#121212" : "#fff"}
          onPress={handlePublish}
        />
      </View>

      {/* Selection Modal */}
      <SelectionModal
        isVisible={isSelectionModalVisible}
        type={selectionType ?? "category"}
        selected={
          selectionType === "category"
            ? category ?? undefined
            : selectionType === "age"
            ? ageRating ?? undefined
            : visibleTo ?? undefined
        }
        onSelection={handleSelection}
        onModalClose={() => setIsSelectionModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  imageSection: {
    marginBottom: 8,
  },
  imagesList: {
    gap: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderStyle: "dashed",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  form: {
    gap: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});

export default CreateProduct;
