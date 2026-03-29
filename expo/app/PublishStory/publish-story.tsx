import Border from "@/components/Border";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import CustomModalGooglePlaces from "@/components/CustomModalGooglePlaces";
import Header from "@/components/Header";
import InfoComponent from "@/components/InfoComponent";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { post } from "@/services/ApiRequest";
import { uploadAndGetUrl, uploadFileGetUrl } from "@/utils/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HashtagModal from "../../components/HashtagModal";
import OptionSelector from "../../components/OptionSelector";
import SelectionModal from "../../components/SelectionModal";
import StoryPreview from "../../components/StoryPreview";
import SwitchOption from "../../components/SwitchOption";

// import StoryPreview from "./molecules/StoryPreview.tsx";
type SelectionType = "age" | "topic" | "visibleTo" | null;

const PublishStory: React.FC = () => {
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
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [locationDetail, setLocationDeatil] = useState({});
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isHashtagModalVisible, setIsHashtagModalVisible] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [ageRating, setAgeRating] = useState<string | null>(null);
  const [visibleTo, setVisibleTo] = useState<string | null>(null);
  const [containsAI, setContainsAI] = useState(false);
  const [canReact, setCanReact] = useState(true);
  const [canShare, setCanShare] = useState(true);
  const [tosConfirmed, setTosConfirmed] = useState(false);
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
    }
  };

  const handlePublishStory = useCallback(async () => {
    setIsStoryUploading(true);
    router.replace("/(tabs)/home");

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

      const payload = {
        ...(hashtags?.length ? { hashtags } : {}),
        ...(location ? { location } : {}),
        ...(topic ? { topic } : {}),
        ...(ageRating ? { ageRating: Number(ageRating.replace("+", "")) } : {}),
        ...(visibleTo ? { availableTo: visibleTo } : {}),
        ...(selectedCollaborators?.length
          ? { collaberation: selectedCollaborators }
          : {}),
        ...(selectedSponsor?.length ? { sponsoredBy: selectedSponsor } : {}),
        canReact: canReact,
        canShare: canShare,
        canComment: containsAI,
        caption: storyText,
        media: {
          url: uploadedUrl,
          type: mediaType,
          ...(mediaType === "video" && duration
            ? { duration: Number(duration) }
            : {}),
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
      // 🔹 Upload finished
      setIsStoryUploading(false);
    }
  }, [
    mediaUri,
    mediaType,
    storyText,
    hashtags,
    location,
    topic,
    ageRating,
    visibleTo,
    canReact,
    selectedCollaborators,
    selectedSponsor,
  ]);
  const isPublishDisabled =
    !tosConfirmed || storyText.trim().length === 0 || !topic;
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Publish a story" />

      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
      >
        <StoryPreview
          mediaUri={mediaUri!}
          mediaType={mediaType!}
          aspectRatio={aspectRatio}
          onAspectChange={setAspectRatio}
        />
        <Border marginVertical={16} marginTop={8} />
        <CustomInput
          withLabel="WHAT’S HAPPENING"
          height={150}
          multiline
          value={storyText}
          onChangeText={setStoryText}
          placeholder="Devenez hôte sur @Airbnb — Demandez "
          cardInfo={`${storyText.length}/500 characters`}
        />

        <Border marginVertical={16} marginTop={8} />

        <OptionSelector
          label="Location"
          placeHolder="Select location"
          value={location ?? undefined}
          onPress={() => setIsLocationModalVisible(true)}
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

        <InfoComponent text="Helps you get more reach." marginBottom={8} />
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
          label="Sponsored by"
          placeHolder="Select sponsor"
          value={
            selectedSponsor?.length ? selectedSponsor?.join(", ") : undefined
          }
          onPress={() =>
            router.push({
              pathname: "/select-people",
              params: { type: "sponsor" },
            })
          }
        />

        <InfoComponent text="Organization supporting financially or with resources in exchange for promotion." />

        <Border marginVertical={16} />

        <SwitchOption
          label="does it contain AI"
          value={containsAI}
          setValue={setContainsAI}
        />

        <SwitchOption
          label="can react"
          value={canReact}
          setValue={setCanReact}
        />

        <SwitchOption
          label="can share"
          value={canShare}
          setValue={setCanShare}
        />

        <OptionSelector
          label="Age rating"
          placeHolder="Select age rating"
          value={ageRating ?? undefined}
          onPress={() => openSelectionModal("age")}
        />

        <OptionSelector
          label="Available to"
          placeHolder="Select audience"
          value={visibleTo ?? undefined}
          onPress={() => openSelectionModal("visibleTo")}
          textTransform={"capitalize"}
        />

        <Border marginTop={8} marginBottom={16} />
        <SwitchOption
          label="I HEREBY CONFIRM THE POST IS WITHIN TOS"
          value={tosConfirmed}
          setValue={setTosConfirmed}
        />
      </ScrollView>

      <View
        style={{
          marginHorizontal: 16,
          marginBottom: insets.bottom + 5,
          marginTop: 12,
        }}
      >
        <CustomButton
          title="Publish"
          backgroundColor={theme.text}
          color={isDarkMode ? "#121212" : "#fff"}
          onPress={handlePublishStory}
          disabled={isPublishDisabled}
        />
      </View>

      <SelectionModal
        isVisible={isSelectionModalVisible}
        type={selectionType ?? "topic"}
        selected={
          selectionType === "topic"
            ? topic ?? undefined
            : selectionType === "age"
            ? ageRating ?? undefined
            : visibleTo ?? undefined
        }
        onSelection={handleSelection}
        onModalClose={closeSelectionModal}
      />
      <HashtagModal
        isVisible={isHashtagModalVisible}
        selectedTags={hashtags}
        onChange={setHashtags}
        onClose={() => setIsHashtagModalVisible(false)}
      />
      <CustomModalGooglePlaces
        isVisible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onLocationSelect={(place) => {
          setLocationDeatil(place);
          setLocation(place?.name || place?.address || "");
          setIsLocationModalVisible(false);
        }}
      />
    </View>
  );
};

export default PublishStory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
