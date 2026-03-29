import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Alert,
  Linking,
} from "react-native";
import {
  ChevronLeft,
  Play,
  Pause,
  ChevronDown,
  SlidersHorizontal,
  ChevronRight,
  Mic,
  Camera,
  ImageIcon,
} from "lucide-react-native";
import { Audio, ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useState, useRef, useEffect } from "react";
import { useRouter, Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import colors from "@/constants/colors";
import ExpoIcons from "@/components/ExpoIcons";
import { Images } from "@/assets/images";
import { useSocket } from "@/contexts/SocketProvider";
import { useLocalSearchParams } from "expo-router";
import { styles } from "./styles";
import { get } from "@/services/ApiRequest";

type MessageType = "text" | "voice" | "image" | "video";
interface ChatMessage {
  type?: MessageType;
  id: string;
  text?: string;
  imageUrl?: string;
  isVoice?: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  voiceDuration?: string;
  isMine: boolean;
  timestamp: string;
  date: string;
  isRead?: boolean;
  isLocked?: boolean;
  senderName?: string;
  isOnline?: boolean;
  voiceUri?: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "system-1",
    text: "Initiated by Display Name on 12 Mar 2025",
    isMine: false,
    timestamp: "",
    date: "system",
  },
  {
    id: "1",
    text: "The Romans, who adopted many Greek beliefs, associated owls with Minerva",
    isMine: true,
    timestamp: "04:45 pm - Mar 12, 2025",
    date: "MAR 12, 2025",
    isRead: true,
    isLocked: true,
  },
  {
    id: "2",
    text: "The Romans, who adopted many Greek beliefs, associated owls with Minerva",
    isMine: false,
    timestamp: "",
    date: "MAR 12, 2025",
    senderName: "Marcus",
    isOnline: true,
  },
  {
    id: "3",
    text: "The Romans, who adopted many Greek beliefs, associated owls with Minerva",
    isMine: true,
    timestamp: "04:45 pm - Mar 12, 2025",
    date: "TODAY",
    isRead: true,
    isLocked: true,
  },
  {
    id: "4",
    isVoice: true,
    voiceDuration: "0:45",
    isMine: true,
    timestamp: "04:45 pm - Mar 12, 2025",
    date: "TODAY",
    isRead: true,
    isLocked: true,
  },
  {
    id: "5",
    text: "The Romans, who adopted many Greek beliefs, associated owls with Minerva",
    isMine: false,
    timestamp: "",
    date: "TODAY",
    senderName: "Marcus",
    isOnline: true,
  },
  {
    id: "status-1",
    text: "Catia is not available at the moment",
    isMine: false,
    timestamp: "",
    date: "status",
  },
  {
    id: "6",
    isVoice: true,
    voiceDuration: "0:32",
    isMine: false,
    timestamp: "",
    date: "TODAY",
    senderName: "Marcus",
    isOnline: true,
  },
];

export default function ConversationScreen() {
  const router = useRouter();
  const { socket }: any = useSocket();
  const { accentColor } = useApp();
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const videoRefs = useRef<Record<string, Video | null>>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSpeeds, setVoiceSpeeds] = useState<Record<string, number>>({});
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const otherUser = {
    name: "Display Name",
    username: "username",
    avatar: "https://i.pravatar.cc/150?img=11",
    isOnline: true,
  };

  //  const fetchMessages = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await get(`conversations/${conversationId}/messages`);

  //     if (res?.data?.success) {
  //       setMessages(res?.data.messages);
  //     } else {
  //       setMessages([]);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching messages:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (!socket) return;

    socket.on("new:message", (data: any) => {
      if (data?.message) {
        // setMessages((prev = []) => [data.message, ...prev]);
      }
    });

    socket.on("message:error", (err: any) => {
      console.log("Send failed:", err);
    });

    return () => {
      socket.off("new:message");
      socket.off("send:message");
      socket.off("message:error");
    };
  }, [socket, conversationId]);
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (showSettings) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSettings, fadeAnim, slideAnim]);
  const sendMsg = ({ type }: any) => {
    if (!socket) return;

    const payload: object | null = {
      participant_id: conversationId,
      content: inputText || "",
      type: type,
    };
    socket.emit("send:message", payload, (res: any) => {
      console.log(res);
    });
  };
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleViewProfile = () => {
    setShowSettings(false);
    router.push("/profile/user1" as Href);
  };

  const handleMuteNotifications = () => {
    console.log("Mute notifications");
    setShowSettings(false);
  };

  const handleClearChat = () => {
    console.log("Clear chat");
    setMessages([]);
    setShowSettings(false);
  };

  const handleBlockUser = () => {
    console.log("Block user");
    setShowSettings(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isMine: true,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      date: "TODAY",
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMsg("text");
    setInputText("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLike = (messageId: string) => {
    console.log("Like message:", messageId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Alert.alert("Liked", "Message liked!");
  };

  const handleReply = (messageId: string) => {
    console.log("Reply to message:", messageId);
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyingTo(message);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCopy = async (text: string) => {
    console.log("Copy text:", text);
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Alert.alert("Copied", "Message copied to clipboard");
    } catch (error) {
      console.log("Failed to copy:", error);
    }
  };

  const handleTranslate = (messageId: string) => {
    console.log("Translate message:", messageId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Translate", "Translation feature coming soon!");
  };

  const handleShowTimestamp = (messageId: string) => {
    console.log("Show timestamp for message:", messageId);
    const message = messages.find((m) => m.id === messageId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (message) {
      Alert.alert("Message Info", `Sent: ${message.timestamp || "Unknown"}`);
    }
  };

  const handleOpenCamera = async () => {
    console.log("Opening camera");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take photos or videos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // optional
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];

      const isImage = asset.type === "image";
      const isVideo = asset.type === "video";

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        imageUrl: asset.uri,
        isImage,
        isVideo,
        isMine: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        date: "TODAY",
        isRead: false,
      };

      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handlePickImage = async () => {
    console.log("Opening image picker");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is needed to select images or videos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      const isImage = asset.type === "image";
      const isVideo = asset.type === "video";

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        imageUrl: asset.uri,
        isImage,
        isVideo,
        isMine: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        date: "TODAY",
        isRead: false,
      };
      console.log("---", newMessage);
      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleStartRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const { status, canAskAgain } = await Audio.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Microphone Permission Required",
          "We need access to your microphone to record voice messages.",
          canAskAgain
            ? [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Allow",
                  onPress: () => handleStartRecording(),
                },
              ]
            : [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
              ]
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.log("Start recording error:", err);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) return;

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        isVoice: true,
        voiceUri: uri,
        isMine: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        date: "TODAY",
      };

      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      console.log("Stop recording error:", err);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const toggleVoicePlay = async (message: ChatMessage) => {
    try {
      if (!message.voiceUri) return;

      // Stop currently playing audio
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // If tapping same message → stop
      if (playingVoiceId === message.id) {
        setPlayingVoiceId(null);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: message.voiceUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setPlayingVoiceId(message.id);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingVoiceId(null);
        }
      });
    } catch (err) {
      console.log("Playback error:", err);
    }
  };

  const cycleSpeed = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceSpeeds((prev) => {
      const currentSpeed = prev[messageId] || 1;
      let newSpeed: number;
      if (currentSpeed === 0.5) {
        newSpeed = 1;
      } else if (currentSpeed === 1) {
        newSpeed = 2;
      } else {
        newSpeed = 0.5;
      }
      return { ...prev, [messageId]: newSpeed };
    });
  };

  const getSpeedLabel = (messageId: string) => {
    const speed = voiceSpeeds[messageId] || 1;
    return speed === 0.5 ? "0.5x" : speed === 1 ? "1x" : "2x";
  };

  const renderWaveform = () => {
    const bars = [3, 6, 4, 8, 5, 9, 4, 7, 3, 8, 5, 4, 7, 3, 6];
    return (
      <View style={styles.waveformContainer}>
        {bars.map((height, index) => (
          <View
            key={index}
            style={[styles.waveformBar, { height: height * 3 }]}
          />
        ))}
      </View>
    );
  };

  const renderDateSeparator = (date: string) => {
    if (date === "system" || date === "status") return null;

    return (
      <View style={styles.dateSeparator}>
        <View style={styles.dateLine} />
        <TouchableOpacity style={styles.dateContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <ChevronDown size={14} color="rgba(255,255,255,0.48)" />
        </TouchableOpacity>
        <View style={styles.dateLine} />
      </View>
    );
  };

  const toggleVideo = async (id: string) => {
    const currentVideo = videoRefs.current[id];

    if (!currentVideo) return;

    // Stop previously playing video
    if (playingVideoId && playingVideoId !== id) {
      await videoRefs.current[playingVideoId]?.pauseAsync();
    }

    if (playingVideoId === id) {
      await currentVideo.pauseAsync();
      setPlayingVideoId(null);
    } else {
      await currentVideo.playAsync();
      setPlayingVideoId(id);
    }
  };

  const renderMedia = (item: ChatMessage, isMine: boolean) => {
    if (item.isImage && item.imageUrl) {
      return (
        <View
          style={[
            styles.videoContainer,
            isMine ? styles.myMedia : styles.theirMedia,
          ]}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={[
              styles.mediaImage,
              isMine ? styles.myMedia : styles.theirMedia,
            ]}
          />
        </View>
      );
    }

    if (item.isVideo && item.imageUrl) {
      const isPlaying = playingVideoId === item.id;
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleVideo(item.id)}
          style={[
            styles.videoContainer,
            {
              height: 164,
              width: 164,
            },
            isMine ? styles.myMedia : styles.theirMedia,
          ]}
        >
          <Video
            ref={(ref: any) => (videoRefs.current[item.id] = ref)}
            source={{ uri: item.imageUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={false}
          />

          <View style={styles.videoOverlay}>
            <View style={styles.playPauseButton}>
              {isPlaying ? (
                <Pause size={24} color="#FFF" fill="#FFF" />
              ) : (
                <Play size={24} color="#FFF" fill="#FFF" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !prevMessage || prevMessage.date !== item.date;

    if (item.date === "system") {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemLine} />
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <View style={styles.systemLine} />
        </View>
      );
    }

    if (item.date === "status") {
      return (
        <View style={styles.statusMessageContainer}>
          <View style={styles.statusLine} />
          <Text style={styles.statusMessageText}>{item.text}</Text>
          <View style={styles.statusLine} />
        </View>
      );
    }

    if (item.isMine) {
      return (
        <View>
          {showDateSeparator && renderDateSeparator(item.date)}
          <View style={styles.myMessageWrapper}>
            {item.isVoice ? (
              <View style={styles.voiceMessageBubble}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => toggleVoicePlay(item)}
                >
                  {playingVoiceId === item.id ? (
                    <Pause size={16} color="#FFF" fill="#FFF" />
                  ) : (
                    <Play size={16} color="#FFF" fill="#FFF" />
                  )}
                </TouchableOpacity>
                {renderWaveform()}
                <TouchableOpacity
                  style={styles.speedButton}
                  onPress={() => cycleSpeed(item.id)}
                >
                  <Text style={styles.speedText}>{getSpeedLabel(item.id)}</Text>
                </TouchableOpacity>
              </View>
            ) : item.isImage || item.isVideo ? (
              renderMedia(item, false)
            ) : (
              <View style={styles.myMessageBubble}>
                <Text style={styles.myMessageText}>{item.text}</Text>
              </View>
            )}
            <View style={styles.myTimestampRow}>
              <Image
                source={Images.ticks}
                style={{
                  height: 12,
                  width: 12,
                  tintColor: accentColor,
                }}
              />

              <Text style={styles.myTimestamp}>{item.timestamp}</Text>
              {item.isLocked && (
                <>
                  <Text style={styles.timestampDivider}>|</Text>
                  <ExpoIcons
                    family="MaterialIcons"
                    name="lock-outline"
                    size={12}
                    color="rgba(255,255,255,0.48)"
                  />
                </>
              )}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View>
        {showDateSeparator && renderDateSeparator(item.date)}
        <View style={styles.theirMessageWrapper}>
          {item.senderName && (
            <View style={styles.senderRow}>
              <View
                style={[
                  styles.senderOnlineDot,
                  { backgroundColor: accentColor },
                ]}
              />
              <Text style={styles.senderName}>{item.senderName}</Text>
            </View>
          )}
          {item.isVoice ? (
            <View style={styles.theirVoiceMessageBubble}>
              <TouchableOpacity
                style={styles.theirPlayButton}
                onPress={() => toggleVoicePlay(item)}
              >
                {playingVoiceId === item.id ? (
                  <Pause size={16} color="#FFF" fill="#FFF" />
                ) : (
                  <Play size={16} color="#FFF" fill="#FFF" />
                )}
              </TouchableOpacity>
              {renderWaveform()}
              <TouchableOpacity
                style={styles.theirSpeedButton}
                onPress={() => cycleSpeed(item.id)}
              >
                <Text style={styles.theirSpeedText}>
                  {getSpeedLabel(item.id)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : item.isImage || item.isVideo ? (
            renderMedia(item, false)
          ) : (
            <View style={styles.theirMessageBubble}>
              <Text style={styles.theirMessageText}>{item.text}</Text>
            </View>
          )}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Image
                source={Images.heart}
                style={{
                  height: 12,
                  width: 12,
                  tintColor: "rgba(255,255,255,0.64)",
                }}
              />

              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReply(item.id)}
            >
              <ExpoIcons
                family="MaterialCommunityIcons"
                name="reply"
                size={14}
                color="rgba(255,255,255,0.64)"
              />

              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
            {!item.isVoice && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCopy(item.text || "")}
              >
                <ExpoIcons
                  family="MaterialCommunityIcons"
                  name="content-copy"
                  size={14}
                  color="rgba(255,255,255,0.64)"
                />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleShowTimestamp(item.id)}
              style={{ marginLeft: 4 }}
            >
              <Image
                source={Images.disapear2}
                style={{
                  height: 16,
                  width: 16,
                  tintColor: accentColor,
                }}
              />
            </TouchableOpacity>
          </View>
          {!item.isVoice && (
            <TouchableOpacity onPress={() => handleTranslate(item.id)}>
              <Text style={[styles.translateText, { color: "#007BFF" }]}>
                Translate
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="dark" style={styles.headerBlur}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={20} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerOnlineDot} />
                <Image
                  source={Images.user}
                  style={{ height: 20, width: 20, borderRadius: 20 }}
                />
                <Text style={styles.headerName}>{otherUser.name}</Text>
              </View>
              <Text style={styles.headerUsername}>{otherUser.username}</Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenSettings}
              style={styles.settingsButton}
            >
              <SlidersHorizontal size={20} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
          <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
            <View style={styles.inputContainer}>
              {inputText.trim().length === 0 && !isRecording && (
                <>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleOpenCamera}
                  >
                    <Camera
                      size={20}
                      color="rgba(255,255,255,0.64)"
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handlePickImage}
                  >
                    <ImageIcon
                      size={20}
                      color="rgba(255,255,255,0.64)"
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.inputWrapperContainer}>
                {replyingTo && (
                  <View style={styles.replyPreview}>
                    <View style={styles.replyPreviewContent}>
                      <Text style={styles.replyPreviewLabel}>Replying to</Text>
                      <Text style={styles.replyPreviewText} numberOfLines={1}>
                        {replyingTo.isVoice ? "Voice message" : replyingTo.text}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleCancelReply}
                      style={styles.cancelReplyButton}
                    >
                      <Text style={styles.cancelReplyText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      isRecording ? "Recording..." : "Hey! Free this evening?"
                    }
                    placeholderTextColor={
                      isRecording ? colors.error : colors.whiteOpacity48
                    }
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    onSubmitEditing={handleSend}
                    editable={!isRecording}
                  />
                </View>
              </View>

              {inputText.trim().length === 0 && (
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    isRecording && styles.recordingButton,
                  ]}
                  onPress={
                    isRecording ? handleStopRecording : handleStartRecording
                  }
                >
                  <Mic
                    size={20}
                    color={isRecording ? colors.error : colors.whiteOpacity64}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}

              {inputText.trim().length > 0 && (
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: accentColor }]}
                  onPress={handleSend}
                >
                  <ChevronRight size={22} color="#FFF" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </BlurView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSettings}
        transparent
        animationType="none"
        onRequestClose={handleCloseSettings}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseSettings}
        >
          <Animated.View
            style={[styles.modalBackground, { opacity: fadeAnim }]}
          />
          <Animated.View
            style={[
              styles.settingsSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.settingsContent}>
                <View style={styles.settingsUserSection}>
                  <Image
                    source={{ uri: otherUser.avatar }}
                    style={styles.settingsAvatar}
                  />
                  <Text style={styles.settingsUserName}>{otherUser.name}</Text>
                  <Text style={styles.settingsUsername}>
                    @{otherUser.username}
                  </Text>
                </View>

                <View style={styles.settingsOptions}>
                  <TouchableOpacity
                    style={styles.settingsOption}
                    onPress={handleViewProfile}
                  >
                    <Text style={styles.settingsOptionText}>View Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsOption}
                    onPress={handleMuteNotifications}
                  >
                    <Text style={styles.settingsOptionText}>
                      Mute Notifications
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsOption}
                    onPress={handleClearChat}
                  >
                    <Text style={styles.settingsOptionText}>Clear Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsOption}
                    onPress={handleBlockUser}
                  >
                    <Text style={styles.settingsOptionTextDanger}>
                      Block User
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCloseSettings}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
