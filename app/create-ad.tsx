import Border from "@/components/Border";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import CustomModalGooglePlaces from "@/components/CustomModalGooglePlaces";
import HashtagModal from "@/components/HashtagModal";
import Header from "@/components/Header";
import InfoComponent from "@/components/InfoComponent";
import OptionSelector from "@/components/OptionSelector";
import SelectionModal from "@/components/SelectionModal";
import StoryPreview from "@/components/StoryPreview";
import SwitchOption from "@/components/SwitchOption";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { post } from "@/services/ApiRequest";
import { uploadAndGetUrl, uploadFileGetUrl } from "@/utils/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import DateRange from "@/components/DateRange";

type SelectionType =
  | "age"
  | "topic"
  | "visibleTo"
  | "cta"
  | "redirectTo"
  | "audience"
  | null;

interface LocationDetail {
  name?: string;
  address?: string;
  [key: string]: any;
}

interface CampaignDuration {
  days: number;
  startDate: Date;
  endDate: Date;
}

const CreateAdScreen: React.FC = () => {
  const { mediaUri, mediaType, duration } = useLocalSearchParams<{
    mediaUri?: string;
    mediaType?: "image" | "video";
    duration?: string;
  }>();
  const insets = useSafeAreaInsets();
  const {
    isDarkMode,
    selectedCollaborators,
    selectedSponsor,
    setSelectedCollaborators,
    setSelectedSponsor,
    setIsStoryUploading,
    setIsStoryUploaded,
  } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Story & Media
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [storyText, setStoryText] = useState("");
  const [caption, setCaption] = useState("");

  // Hashtags & Location
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isHashtagModalVisible, setIsHashtagModalVisible] = useState(false);
  const [locationDetail, setLocationDetail] = useState<LocationDetail>({});
  const [location, setLocation] = useState<string | null>(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [locationRadius, setLocationRadius] = useState<number>(10);

  // Content Settings
  const [topic, setTopic] = useState<string | null>(null);
  const [ageRating, setAgeRating] = useState<string | null>(null);
  const [visibleTo, setVisibleTo] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [callToAction, setCallToAction] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [urlLink, setUrlLink] = useState<string>("");

  // Campaign Duration
  const [campaignDays, setCampaignDays] = useState<number>(7);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Campaign Pricing
  const [pricePerDay, setPricePerDay] = useState<string>("");

  // Flags & Permissions
  const [containsAI, setContainsAI] = useState(false);
  const [canReact, setCanReact] = useState(true);
  const [tosConfirmed, setTosConfirmed] = useState(false);

  // Modal Management
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<SelectionType>(null);

  const openSelectionModal = (type: SelectionType) => {
    setSelectionType(type);
    setIsSelectionModalVisible(true);
  };

  const closeSelectionModal = () => {
    setIsSelectionModalVisible(false);
    setSelectionType(null);
  };

  const handleSelection = (value: string) => {
    switch (selectionType) {
      case "topic":
        setTopic(value);
        break;
      case "age":
        setAgeRating(value);
        break;
      case "visibleTo":
        setVisibleTo(value);
        break;
      case "cta":
        setCallToAction(value);
        break;
      case "redirectTo":
        setRedirectTo(value);
        break;
      case "audience":
        setAudience(value);
        break;
    }
    closeSelectionModal();
  };

  // Selection options data
  const selectionOptions = {
    topic: [
      "Fashion",
      "Technology",
      "Travel",
      "Food",
      "Lifestyle",
      "Sports",
      "Beauty",
      "Entertainment",
    ],
    age: ["+14", "+16", "+18", "+20", "+21"],
    visibleTo: ["Everyone", "Followers", "Subscribers", "Favorites", "Private"],
    cta: [
      "Get It Now",
      "Shop Now",
      "Get Special Offer Now!",
      "Order Now",
      "Order Yours Today",
      "Buy Today",
      "Book Now",
      "See How",
      "Talk With Us",
      "Order Before It's Too Late!",
      "Learn More",
      "Contact Us",
      "Check Availability",
    ],
    audience: ["Everyone", "Men Only", "Women Only"],
    redirectTo: [
      "Visit Profile",
      "Send Message",
      "Visit Website",
      "Download App",
    ],
  };

  const handleCampaignDaysChange = (days: number) => {
    setCampaignDays(days);
    if (!startDate) return;
    const newEndDate = new Date(startDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    setEndDate(newEndDate);
  };

  const calculateTotalCost = (): number => {
    return Number(pricePerDay) * campaignDays;
  };

  const getEstimatedReach = (): number => {
    // Mock calculation based on audience and location
    const baseReach = 1000;
    const radiusMultiplier = Math.max(1, locationRadius / 10);
    return Math.floor(baseReach * radiusMultiplier * campaignDays);
  };

  const handlePublishStory = useCallback(async () => {
    setIsStoryUploading(true);
    router.replace("/(tabs)/home");
    return;
    try {
      let uploadedUrl: string | null = null;

      if (mediaType === "image") {
        uploadedUrl = await uploadAndGetUrl({ path: mediaUri });
      } else {
        const uploadRes = await uploadFileGetUrl(
          { localUri: mediaUri, name: "story-video.mp4" },
          "video/mp4"
        );

        uploadedUrl =
          uploadRes?.file ||
          uploadRes?.url ||
          uploadRes?.image ||
          (typeof uploadRes === "string" ? uploadRes : null);
      }

      if (!uploadedUrl) throw new Error("Upload failed");

      const totalCost = calculateTotalCost();

      const payload = {
        ...(hashtags?.length ? { hashtags } : {}),
        ...(location ? { location, locationRadius } : {}),
        ...(topic ? { topic } : {}),
        ...(audience ? { audience } : {}),
        ...(ageRating ? { ageRating: Number(ageRating.replace("+", "")) } : {}),
        ...(visibleTo ? { availableTo: visibleTo } : {}),
        ...(callToAction ? { callToAction } : {}),
        ...(redirectTo ? { redirectTo } : {}),
        ...(urlLink ? { urlLink } : {}),
        ...(selectedCollaborators?.length
          ? { collaboration: selectedCollaborators }
          : {}),
        ...(selectedSponsor?.length ? { sponsoredBy: selectedSponsor } : {}),
        campaignName: storyText,
        caption: caption,
        media: {
          url: uploadedUrl,
          type: mediaType,
          ...(mediaType === "video" && duration
            ? { duration: Number(duration) }
            : {}),
        },
        campaignDuration: {
          days: campaignDays,
          startDate: startDate,
          endDate: endDate,
          startTime,
          endTime,
        },
        pricing: {
          pricePerDay,
          totalCost,
          estimatedReach: getEstimatedReach(),
        },
        permissions: {
          containsAI,
        },
      };

      console.log(payload);
      const res = await post("stories", payload);
      if (res?.data?.success) {
        setIsStoryUploaded(true);
        setSelectedCollaborators([]);
        setSelectedSponsor([]);
      }
    } catch (error) {
      console.log("Story upload failed:", error);
    } finally {
      setIsStoryUploading(false);
    }
  }, [
    mediaUri,
    mediaType,
    storyText,
    caption,
    hashtags,
    location,
    locationRadius,
    topic,
    audience,
    ageRating,
    visibleTo,
    callToAction,
    redirectTo,
    urlLink,
    containsAI,
    selectedCollaborators,
    selectedSponsor,
    campaignDays,
    startDate,
    endDate,
    startTime,
    endTime,
    pricePerDay,
  ]);

  const isPublishDisabled = false;

  const radiusOptions = [10, 25, 50, 100, 200];
  const durationOptions = [3, 7, 14, 30];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Create Ad Campaign" />

      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
      >
        {/* Story Preview */}
        <StoryPreview
          mediaUri={mediaUri!}
          mediaType={mediaType!}
          aspectRatio={aspectRatio}
          onAspectChange={setAspectRatio}
        />
        <Border marginVertical={16} marginTop={8} />

        {/* General Details */}
        <Text style={styles.sectionTitle}>General Details</Text>
        <Text style={styles.sectionSubTitle}>
          Viral-exposure for your content & brand.
        </Text>

        <CustomInput
          color="#fff"
          value={storyText}
          withLabel="CAMPAIGN NAME"
          onChangeText={setStoryText}
          placeholder="E.g Summer Collection"
        />
        <OptionSelector
          label="Topic"
          placeHolder="Select topic"
          value={topic ?? undefined}
          onPress={() => openSelectionModal("topic")}
        />
        <OptionSelector
          label="Add tags"
          placeHolder="#sports"
          value={
            hashtags.length
              ? hashtags.map((tag) => `#${tag}`).join(", ")
              : undefined
          }
          onPress={() => setIsHashtagModalVisible(true)}
        />
        <CustomInput
          withLabel="Caption"
          height={150}
          multiline
          value={caption}
          onChangeText={setCaption}
          placeholder="Enter caption..."
          cardInfo={`${caption.length}/500 characters`}
        />

        <View style={{ marginTop: 8 }} />

        {/* Collaboration & Call to Action */}
        <OptionSelector
          label="In collaboration with"
          placeHolder="Select collaborators"
          value={
            selectedCollaborators?.length
              ? selectedCollaborators.join(", ")
              : undefined
          }
          onPress={() =>
            router.push({
              pathname: "/select-people",
              params: { type: "collaborator" },
            })
          }
        />
        <InfoComponent
          text="Person working together on the same project or content."
          marginBottom={8}
        />

        <OptionSelector
          label="CALL TO ACTION"
          placeHolder="Please Select"
          value={callToAction ?? undefined}
          onPress={() => openSelectionModal("cta")}
        />

        <OptionSelector
          label="REDIRECT TO"
          placeHolder="Please Select"
          value={redirectTo ?? undefined}
          onPress={() => openSelectionModal("redirectTo")}
        />

        <CustomInput
          color="#fff"
          value={urlLink}
          withLabel="PASTE URL LINK"
          onChangeText={setUrlLink}
          placeholder="E.g www.viral.app"
        />

        <Border marginTop={20} marginBottom={25} />

        {/* Audience & Reach */}
        <OptionSelector
          label="Available to"
          placeHolder="Select Available"
          value={visibleTo ?? undefined}
          onPress={() => openSelectionModal("visibleTo")}
          textTransform={"capitalize"}
        />
        <OptionSelector
          label="AUDIENCE"
          placeHolder="Select audience"
          value={audience ?? undefined}
          onPress={() => openSelectionModal("audience")}
          textTransform={"capitalize"}
        />
        <OptionSelector
          label="Age rating"
          placeHolder="Select age rating"
          value={ageRating ?? undefined}
          onPress={() => openSelectionModal("age")}
        />

        <Border marginTop={20} marginBottom={10} />

        {/* Location Radius */}
        <Text style={styles.sectionTitle}>Location Radius</Text>
        <OptionSelector
          label="Location"
          placeHolder="Select location"
          value={location ?? undefined}
          onPress={() => setIsLocationModalVisible(true)}
        />

        <View style={styles.radiusContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {radiusOptions.map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  {
                    backgroundColor:
                      locationRadius === radius
                        ? theme.text
                        : theme.cardBackground,
                  },
                ]}
                onPress={() => setLocationRadius(radius)}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    {
                      color:
                        locationRadius === radius ? theme.surface : "#FFFFFFA3",
                    },
                  ]}
                >
                  {radius} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Border marginVertical={8} marginTop={8} />

        {/* Campaign Duration */}
        <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
          Campaign Duration
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {durationOptions.map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.radiusButton,
                {
                  backgroundColor:
                    campaignDays === days ? theme.text : theme.cardBackground,
                },
              ]}
              onPress={() => handleCampaignDaysChange(days)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  {
                    color: campaignDays === days ? theme.surface : "#FFFFFFA3",
                  },
                ]}
              >
                {days} days
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <DateRange
          endDate={endDate}
          endTime={endTime}
          startTime={startTime}
          startDate={startDate}
          setEndDate={setEndDate}
          setEndTime={setEndTime}
          setStartDate={setStartDate}
          setStartTime={setStartTime}
        />

        <Border marginTop={20} marginBottom={25} />

        {/* Pricing */}
        <CustomInput
          value={pricePerDay}
          placeholder="E.g 40"
          withLabel="PRICE PER DAY"
          onChangeText={setPricePerDay}
          cardInfo="Default currency is US Dollar."
        />

        <View
          style={[
            styles.summaryContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={styles.summaryTitle}>CAMPAIGN SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Reach</Text>
            <Text style={styles.summaryValue}>
              {(getEstimatedReach() / 1000).toFixed(1)}K people
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{campaignDays} days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>{location || "Not set"}</Text>
          </View>
          <Border marginVertical={12} />
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              $ {calculateTotalCost().toFixed(2)}
            </Text>
          </View>
        </View>

        <Border marginTop={15} marginBottom={27} />

        {/* Content Flags */}
        <SwitchOption
          errorMarginBottom={15}
          label="does it contain AI"
          value={containsAI}
          setValue={setContainsAI}
          error="If your ad was alternated or enhanced with AI."
        />

        <SwitchOption
          errorMarginBottom={15}
          label="CONFIRM ALL ABOVE INFORMATIONS"
          value={canReact}
          setValue={setCanReact}
          error="Posting a fair product will avoid further complaints."
        />

        <SwitchOption
          errorMarginBottom={15}
          label="I accept the TOS"
          value={tosConfirmed}
          setValue={setTosConfirmed}
          error="By publishing this Ad Campaign you agree with Viral’s Terms of Service. Any violation may get your account banned and you may be subject to further legal actions depending on the severity of the violation."
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Publish Button */}
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: insets.bottom + 5,
          marginTop: 12,
        }}
      >
        <CustomButton
          title="Publish Campaign"
          backgroundColor={theme.text}
          color={isDarkMode ? "#121212" : "#fff"}
          onPress={handlePublishStory}
          disabled={isPublishDisabled}
        />
      </View>

      {/* Selection Modal */}
      <SelectionModal
        isVisible={isSelectionModalVisible}
        type={selectionType ?? "topic"}
        options={
          selectionType && selectionOptions[selectionType]
            ? selectionOptions[selectionType]
            : []
        }
        selected={
          selectionType === "topic"
            ? topic ?? undefined
            : selectionType === "age"
            ? ageRating ?? undefined
            : selectionType === "cta"
            ? callToAction ?? undefined
            : selectionType === "redirectTo"
            ? redirectTo ?? undefined
            : selectionType === "audience"
            ? audience ?? undefined
            : visibleTo ?? undefined
        }
        onSelection={handleSelection}
        onModalClose={closeSelectionModal}
      />

      {/* Hashtag Modal */}
      <HashtagModal
        isVisible={isHashtagModalVisible}
        selectedTags={hashtags}
        onChange={setHashtags}
        onClose={() => setIsHashtagModalVisible(false)}
      />

      {/* Location Modal */}
      <CustomModalGooglePlaces
        isVisible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onLocationSelect={(place) => {
          setLocationDetail(place);
          setLocation(place?.name || place?.address || "");
          setIsLocationModalVisible(false);
        }}
      />
    </View>
  );
};

export default CreateAdScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionSubTitle: {
    fontSize: 14,
    color: "#FFFFFFA3",
    fontFamily: "Poppins_500Medium",
    marginBottom: 16,
  },
  radiusContainer: {
    marginVertical: 12,
  },
  radiusLabel: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  radiusButtonText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },

  durationButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  durationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  durationButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationButtonText: {
    fontSize: 12,

    fontFamily: "Poppins_500Medium",
  },
  durationButtonTextActive: {
    color: Colors.white,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  dateInputWrapper: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,

    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  timeInputWrapper: {
    flex: 0.6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,

    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  dateLabel: {
    fontSize: 11,

    fontFamily: "Poppins_500Medium",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Poppins_600SemiBold",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,

    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,

    fontFamily: "Poppins_500Medium",
  },
  priceValue: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: "Poppins_600SemiBold",
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginTop: 15,
  },
  summaryTitle: {
    fontSize: 14,
    color: Colors.success,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#FFFFFFA3",
    fontFamily: "Poppins_500Medium",
  },
  summaryValue: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: "Poppins_600SemiBold",
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Poppins_600SemiBold",
  },
  totalValue: {
    fontSize: 18,
    color: Colors.success,
    fontFamily: "Poppins_700Bold",
  },
});
