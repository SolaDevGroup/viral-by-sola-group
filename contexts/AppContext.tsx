import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { MOCK_CURRENT_USER } from '@/constants/mockData';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  unreadNotifications: number;
  isDarkMode: boolean;
  accentColor: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string, age: number) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: () => Promise<void>;
  setUnreadNotifications: (count: number) => void;
  toggleDarkMode: () => void;
  setAccentColor: (color: string) => void;
}

export const [AppProvider, useApp] = createContextHook<AppState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [accentColor, setAccentColorState] = useState<string>('#014D3A');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [authData, onboardingData, userData, colorData] = await Promise.all([
        AsyncStorage.getItem('viral_auth'),
        AsyncStorage.getItem('viral_onboarding'),
        AsyncStorage.getItem('viral_user'),
        AsyncStorage.getItem('viral_accent_color'),
      ]);

      console.log('Loading app data...', { hasAuth: !!authData, hasOnboarding: !!onboardingData, hasUser: !!userData, hasColor: !!colorData });

      if (colorData) {
        setAccentColorState(colorData);
      }

      if (authData === 'true') {
        setIsAuthenticated(true);
      }

      if (onboardingData === 'true') {
        setHasCompletedOnboarding(true);
      }

      if (userData) {
        try {
          const trimmedData = userData.trim();
          
          if (!trimmedData || trimmedData.length === 0) {
            console.log('Empty user data, clearing');
            await AsyncStorage.removeItem('viral_user');
            return;
          }
          
          if (trimmedData === 'true' || trimmedData === 'false' || trimmedData === 'null' || trimmedData === 'undefined') {
            console.log('Invalid primitive value in user data, clearing:', trimmedData);
            await AsyncStorage.removeItem('viral_user');
            return;
          }
          
          if (!trimmedData.startsWith('{') && !trimmedData.startsWith('[')) {
            console.error('Invalid user data format (not JSON), clearing. First 50 chars:', trimmedData.substring(0, 50));
            await AsyncStorage.removeItem('viral_user');
            return;
          }
          
          let parsed;
          try {
            parsed = JSON.parse(trimmedData);
          } catch (jsonError) {
            console.error('JSON parse failed:', jsonError);
            console.error('Attempted to parse:', trimmedData.substring(0, 200));
            await AsyncStorage.removeItem('viral_user');
            return;
          }
          
          if (typeof parsed === 'object' && parsed !== null && parsed.id) {
            setUser(parsed);
            console.log('User data loaded successfully');
          } else {
            console.error('Parsed data is not a valid user object, clearing');
            await AsyncStorage.removeItem('viral_user');
          }
        } catch (parseError) {
          console.error('Failed to load user data, clearing corrupted data:', parseError);
          console.error('Raw data:', userData?.substring(0, 100) || 'undefined');
          await AsyncStorage.removeItem('viral_user');
        }
      }
    } catch (error) {
      console.error('Critical error loading user data, clearing all storage:', error);
      try {
        await AsyncStorage.multiRemove(['viral_auth', 'viral_user', 'viral_onboarding', 'viral_is_minor']);
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        setUser(null);
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', email);
    const mockUser = { ...MOCK_CURRENT_USER, email };
    setUser(mockUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('viral_auth', 'true');
    await AsyncStorage.setItem('viral_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    console.log('Logout');
    setUser(null);
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    await AsyncStorage.multiRemove(['viral_auth', 'viral_user', 'viral_onboarding']);
  };

  const signup = async (username: string, email: string, password: string, age: number) => {
    console.log('Signup:', username, email, age);
    const isMinor = age < 18;
    const newUser: User = {
      ...MOCK_CURRENT_USER,
      username,
      email,
      isMinor,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('viral_auth', 'true');
    await AsyncStorage.setItem('viral_user', JSON.stringify(newUser));
    await AsyncStorage.setItem('viral_is_minor', isMinor.toString());
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      AsyncStorage.setItem('viral_user', JSON.stringify(updatedUser)).catch(err => {
        console.error('Failed to save user data:', err);
      });
    }
  };

  const completeOnboarding = async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('viral_onboarding', 'true');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const setAccentColor = async (color: string) => {
    setAccentColorState(color);
    await AsyncStorage.setItem('viral_accent_color', color);
  };

  return {
    user,
    isAuthenticated,
    hasCompletedOnboarding,
    unreadNotifications,
    isDarkMode,
    accentColor,
    login,
    logout,
    signup,
    updateUser,
    completeOnboarding,
    setUnreadNotifications,
    toggleDarkMode,
    setAccentColor,
  };
});
