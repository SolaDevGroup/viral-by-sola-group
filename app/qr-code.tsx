import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { X, Download, Share2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

export default function QRCodeScreen() {
  const { user } = useApp();

  const handleDownload = () => {
    console.log('Download QR code');
  };

  const handleShare = () => {
    console.log('Share QR code');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#0a1f1f', '#0d5050', '#0a1f1f']}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={28} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=50' }}
              style={styles.avatar}
            />
            <Text style={styles.username}>@{user?.username || 'username'}</Text>
            <Text style={styles.subtitle}>Scan to follow me</Text>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrCode}>
              <View style={styles.qrPattern}>
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                  <View key={rowIndex} style={styles.qrRow}>
                    {Array.from({ length: 8 }).map((_, colIndex) => {
                      const shouldFill = (rowIndex + colIndex) % 2 === 0 || 
                                        (rowIndex === 0 && colIndex < 3) ||
                                        (rowIndex < 3 && colIndex === 0) ||
                                        (rowIndex === 7 && colIndex > 4) ||
                                        (rowIndex > 4 && colIndex === 7);
                      return (
                        <View
                          key={colIndex}
                          style={[
                            styles.qrPixel,
                            shouldFill && styles.qrPixelFilled,
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownload}
            >
              <View style={styles.actionIconCircle}>
                <Download size={24} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <View style={styles.actionIconCircle}>
                <Share2 size={24} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  qrCode: {
    width: QR_SIZE,
    height: QR_SIZE,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  qrPattern: {
    flex: 1,
    justifyContent: 'space-between',
  },
  qrRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  qrPixel: {
    flex: 1,
    margin: 1,
    backgroundColor: 'transparent',
    borderRadius: 2,
  },
  qrPixelFilled: {
    backgroundColor: '#000',
  },
  actions: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 48,
  },
  actionButton: {
    alignItems: 'center',
    gap: 12,
  },
  actionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
