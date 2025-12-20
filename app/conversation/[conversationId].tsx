import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Modal, Animated, Alert } from "react-native";
import { ChevronLeft, Play, Pause, Heart, Reply, Copy, Clock, ChevronDown, SlidersHorizontal, Lock, CheckCheck, ChevronRight, Mic, Camera, ImageIcon } from "lucide-react-native";
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useState, useRef, useEffect } from "react";
import { useRouter, Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  isVoice?: boolean;
  voiceDuration?: string;
  isMine: boolean;
  timestamp: string;
  date: string;
  isRead?: boolean;
  isLocked?: boolean;
  senderName?: string;
  isOnline?: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'system-1',
    text: 'Initiated by Display Name on 12 Mar 2025',
    isMine: false,
    timestamp: '',
    date: 'system',
  },
  {
    id: '1',
    text: 'The Romans, who adopted many Greek beliefs, associated owls with Minerva',
    isMine: true,
    timestamp: '04:45 pm - Mar 12, 2025',
    date: 'MAR 12, 2025',
    isRead: true,
    isLocked: true,
  },
  {
    id: '2',
    text: 'The Romans, who adopted many Greek beliefs, associated owls with Minerva',
    isMine: false,
    timestamp: '',
    date: 'MAR 12, 2025',
    senderName: 'Marcus',
    isOnline: true,
  },
  {
    id: '3',
    text: 'The Romans, who adopted many Greek beliefs, associated owls with Minerva',
    isMine: true,
    timestamp: '04:45 pm - Mar 12, 2025',
    date: 'TODAY',
    isRead: true,
    isLocked: true,
  },
  {
    id: '4',
    isVoice: true,
    voiceDuration: '0:45',
    isMine: true,
    timestamp: '04:45 pm - Mar 12, 2025',
    date: 'TODAY',
    isRead: true,
    isLocked: true,
  },
  {
    id: '5',
    text: 'The Romans, who adopted many Greek beliefs, associated owls with Minerva',
    isMine: false,
    timestamp: '',
    date: 'TODAY',
    senderName: 'Marcus',
    isOnline: true,
  },
  {
    id: 'status-1',
    text: 'Catia is not available at the moment',
    isMine: false,
    timestamp: '',
    date: 'status',
  },
  {
    id: '6',
    isVoice: true,
    voiceDuration: '0:32',
    isMine: false,
    timestamp: '',
    date: 'TODAY',
    senderName: 'Marcus',
    isOnline: true,
  },
];

export default function ConversationScreen() {
  const router = useRouter();
  const { accentColor } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceSpeeds, setVoiceSpeeds] = useState<Record<string, number>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const otherUser = {
    name: 'Display Name',
    username: 'username',
    avatar: 'https://i.pravatar.cc/150?img=11',
    isOnline: true,
  };

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

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleViewProfile = () => {
    setShowSettings(false);
    router.push('/profile/user1' as Href);
  };

  const handleMuteNotifications = () => {
    console.log('Mute notifications');
    setShowSettings(false);
  };

  const handleClearChat = () => {
    console.log('Clear chat');
    setMessages([]);
    setShowSettings(false);
  };

  const handleBlockUser = () => {
    console.log('Block user');
    setShowSettings(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isMine: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      date: 'TODAY',
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLike = (messageId: string) => {
    console.log('Like message:', messageId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Liked', 'Message liked!');
  };

  const handleReply = (messageId: string) => {
    console.log('Reply to message:', messageId);
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyingTo(message);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCopy = async (text: string) => {
    console.log('Copy text:', text);
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied', 'Message copied to clipboard');
    } catch (error) {
      console.log('Failed to copy:', error);
    }
  };

  const handleTranslate = (messageId: string) => {
    console.log('Translate message:', messageId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Translate', 'Translation feature coming soon!');
  };

  const handleShowTimestamp = (messageId: string) => {
    console.log('Show timestamp for message:', messageId);
    const message = messages.find(m => m.id === messageId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (message) {
      Alert.alert('Message Info', `Sent: ${message.timestamp || 'Unknown'}`);
    }
  };

  const handleOpenCamera = async () => {
    console.log('Opening camera');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        imageUrl: result.assets[0].uri,
        isMine: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        date: 'TODAY',
        isRead: false,
      };
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handlePickImage = async () => {
    console.log('Opening image picker');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is needed to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        imageUrl: result.assets[0].uri,
        isMine: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        date: 'TODAY',
        isRead: false,
      };
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleStartRecording = () => {
    console.log('Start recording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);
    
    setTimeout(() => {
      handleStopRecording();
    }, 3000);
  };

  const handleStopRecording = () => {
    console.log('Stop recording');
    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      isVoice: true,
      voiceDuration: '0:03',
      isMine: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      date: 'TODAY',
      isRead: false,
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const toggleVoicePlay = (messageId: string) => {
    if (playingVoiceId === messageId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(messageId);
    }
  };

  const cycleSpeed = (messageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceSpeeds(prev => {
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
    return speed === 0.5 ? '0.5x' : speed === 1 ? '1x' : '2x';
  };

  const renderWaveform = () => {
    const bars = [3, 6, 4, 8, 5, 9, 4, 7, 3, 8, 5, 4, 7, 3, 6];
    return (
      <View style={styles.waveformContainer}>
        {bars.map((height, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              { height: height * 3 }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderDateSeparator = (date: string) => {
    if (date === 'system' || date === 'status') return null;
    
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

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !prevMessage || prevMessage.date !== item.date;

    if (item.date === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemLine} />
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <View style={styles.systemLine} />
        </View>
      );
    }

    if (item.date === 'status') {
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
                  onPress={() => toggleVoicePlay(item.id)}
                >
                  {playingVoiceId === item.id ? (
                    <Pause size={16} color="#FFF" fill="#FFF" />
                  ) : (
                    <Play size={16} color="#FFF" fill="#FFF" />
                  )}
                </TouchableOpacity>
                {renderWaveform()}
                <TouchableOpacity style={styles.speedButton} onPress={() => cycleSpeed(item.id)}>
                  <Text style={styles.speedText}>{getSpeedLabel(item.id)}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.myMessageBubble}>
                <Text style={styles.myMessageText}>{item.text}</Text>
              </View>
            )}
            <View style={styles.myTimestampRow}>
              <CheckCheck size={14} color="#00C853" strokeWidth={2.5} />
              <Text style={styles.myTimestamp}>{item.timestamp}</Text>
              {item.isLocked && (
                <>
                  <Text style={styles.timestampDivider}>|</Text>
                  <Lock size={12} color="rgba(255,255,255,0.48)" />
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
              <View style={styles.senderOnlineDot} />
              <Text style={styles.senderName}>{item.senderName}</Text>
            </View>
          )}
          {item.isVoice ? (
            <View style={styles.theirVoiceMessageBubble}>
              <TouchableOpacity 
                style={styles.theirPlayButton}
                onPress={() => toggleVoicePlay(item.id)}
              >
                {playingVoiceId === item.id ? (
                  <Pause size={16} color="#FFF" fill="#FFF" />
                ) : (
                  <Play size={16} color="#FFF" fill="#FFF" />
                )}
              </TouchableOpacity>
              {renderWaveform()}
              <TouchableOpacity style={styles.theirSpeedButton} onPress={() => cycleSpeed(item.id)}>
                <Text style={styles.theirSpeedText}>{getSpeedLabel(item.id)}</Text>
              </TouchableOpacity>
            </View>
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
              <Heart size={14} color="rgba(255,255,255,0.64)" />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleReply(item.id)}
            >
              <Reply size={14} color="rgba(255,255,255,0.64)" />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
            {!item.isVoice && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCopy(item.text || '')}
              >
                <Copy size={14} color="rgba(255,255,255,0.64)" />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionIconButton} onPress={() => handleShowTimestamp(item.id)}>
              <Clock size={14} color="rgba(255,255,255,0.64)" />
            </TouchableOpacity>
          </View>
          {!item.isVoice && (
            <TouchableOpacity onPress={() => handleTranslate(item.id)}>
              <Text style={[styles.translateText, { color: accentColor }]}>Translate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="dark" style={styles.headerBlur}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={20} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerOnlineDot} />
                <Text style={styles.headerName}>{otherUser.name}</Text>
              </View>
              <Text style={styles.headerUsername}>{otherUser.username}</Text>
            </View>

            <TouchableOpacity onPress={handleOpenSettings} style={styles.settingsButton}>
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
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
          <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
            <View style={styles.inputContainer}>
              {inputText.trim().length === 0 && (
                <>
                  <TouchableOpacity style={styles.iconButton} onPress={handleOpenCamera}>
                    <Camera size={20} color="rgba(255,255,255,0.64)" strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
                    <ImageIcon size={20} color="rgba(255,255,255,0.64)" strokeWidth={2} />
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.inputWrapperContainer}>
                {replyingTo && (
                  <View style={styles.replyPreview}>
                    <View style={styles.replyPreviewContent}>
                      <Text style={styles.replyPreviewLabel}>Replying to</Text>
                      <Text style={styles.replyPreviewText} numberOfLines={1}>
                        {replyingTo.isVoice ? 'Voice message' : replyingTo.text}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleCancelReply} style={styles.cancelReplyButton}>
                      <Text style={styles.cancelReplyText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder={isRecording ? "Recording..." : "Hey! Free this evening?"}
                    placeholderTextColor={isRecording ? "#EE1045" : "rgba(255,255,255,0.48)"}
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
                  style={[styles.iconButton, isRecording && styles.recordingButton]}
                  onPress={isRecording ? handleStopRecording : handleStartRecording}
                >
                  <Mic size={20} color={isRecording ? "#EE1045" : "rgba(255,255,255,0.64)"} strokeWidth={2} />
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
          <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]} />
          <Animated.View 
            style={[
              styles.settingsSheet,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.settingsContent}>
                <View style={styles.settingsUserSection}>
                  <Image source={{ uri: otherUser.avatar }} style={styles.settingsAvatar} />
                  <Text style={styles.settingsUserName}>{otherUser.name}</Text>
                  <Text style={styles.settingsUsername}>@{otherUser.username}</Text>
                </View>

                <View style={styles.settingsOptions}>
                  <TouchableOpacity style={styles.settingsOption} onPress={handleViewProfile}>
                    <Text style={styles.settingsOptionText}>View Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsOption} onPress={handleMuteNotifications}>
                    <Text style={styles.settingsOptionText}>Mute Notifications</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsOption} onPress={handleClearChat}>
                    <Text style={styles.settingsOptionText}>Clear Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingsOption} onPress={handleBlockUser}>
                    <Text style={styles.settingsOptionTextDanger}>Block User</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCloseSettings}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerBlur: {
    backgroundColor: 'rgba(38, 38, 38, 0.64)',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  headerOnlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C853',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  headerUsername: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.48)',
    marginTop: 2,
    marginLeft: 18,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  systemMessageContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 16,
    gap: 12,
  },
  systemLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  systemMessageText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.48)',
  },
  statusMessageContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 16,
    gap: 12,
  },
  statusLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statusMessageText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.48)',
  },
  dateSeparator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 16,
    gap: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dateContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.48)',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end' as const,
    maxWidth: '80%',
    marginBottom: 12,
  },
  myMessageBubble: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFF',
  },
  myTimestampRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    marginTop: 6,
    gap: 4,
  },
  myTimestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.48)',
  },
  timestampDivider: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.32)',
    marginHorizontal: 2,
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start' as const,
    maxWidth: '80%',
    marginBottom: 12,
  },
  senderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 6,
  },
  senderOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#FFF',
  },
  theirMessageBubble: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  theirMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFF',
  },
  actionsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.64)',
  },
  actionIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
  },
  translateText: {
    fontSize: 13,
    marginTop: 8,
  },
  voiceMessageBubble: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  waveformContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
    height: 24,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  speedButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  theirVoiceMessageBubble: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  theirPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  theirSpeedButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  theirSpeedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  inputBlur: {
    backgroundColor: 'rgba(38, 38, 38, 0.64)',
  },
  inputSafeArea: {
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
  },
  inputWrapperContainer: {
    flex: 1,
  },
  inputWrapper: {
    height: 44,
    backgroundColor: '#121212',
    borderRadius: 100,
    paddingHorizontal: 16,
    justifyContent: 'center' as const,
  },
  replyPreview: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.48)',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 13,
    color: '#FFF',
  },
  cancelReplyButton: {
    width: 24,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelReplyText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.48)',
  },
  recordingButton: {
    backgroundColor: 'rgba(238, 16, 69, 0.2)',
  },
  input: {
    fontSize: 14,
    color: '#FFF',
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  settingsSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  settingsContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  settingsUserSection: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  settingsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  settingsUserName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingsUsername: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  settingsOptions: {
    gap: 8,
    marginBottom: 16,
  },
  settingsOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  settingsOptionTextDanger: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#EE1045',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#D4AF37',
  },
});
