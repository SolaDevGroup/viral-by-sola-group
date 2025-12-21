import { Tabs, router, usePathname } from "expo-router";
import React from "react";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

const HomeOutline = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const HomeFilled = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="homeGradient" x1="50%" y1="0%" x2="50%" y2="100%" gradientTransform="rotate(-27)">
        <Stop offset="0%" stopColor="#37B874" />
        <Stop offset="100%" stopColor="#12FFAA" />
      </LinearGradient>
    </Defs>
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      fill="url(#homeGradient)"
    />
    <Path d="M9 22V12h6v10" fill="#FFFFFF" />
  </Svg>
);

const SearchOutline = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const SearchFilled = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="searchGradient" x1="50%" y1="0%" x2="50%" y2="100%" gradientTransform="rotate(-27)">
        <Stop offset="0%" stopColor="#37B874" />
        <Stop offset="100%" stopColor="#12FFAA" />
      </LinearGradient>
    </Defs>
    <Circle cx="11" cy="11" r="8" fill="url(#searchGradient)" />
    <Path d="M21 21l-4.35-4.35" stroke="url(#searchGradient)" strokeWidth={3} strokeLinecap="round" />
  </Svg>
);

const PlusCircleOutline = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 8v8" />
    <Path d="M8 12h8" />
  </Svg>
);

const PlusCircleFilled = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="plusGradient" x1="50%" y1="0%" x2="50%" y2="100%" gradientTransform="rotate(-27)">
        <Stop offset="0%" stopColor="#37B874" />
        <Stop offset="100%" stopColor="#12FFAA" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="10" fill="url(#plusGradient)" />
    <Path d="M12 8v8" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    <Path d="M8 12h8" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ShoppingBagOutline = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <Path d="M3 6h18" />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const ShoppingBagFilled = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="shopGradient" x1="50%" y1="0%" x2="50%" y2="100%" gradientTransform="rotate(-27)">
        <Stop offset="0%" stopColor="#37B874" />
        <Stop offset="100%" stopColor="#12FFAA" />
      </LinearGradient>
    </Defs>
    <Path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 0 1-8 0"
      fill="url(#shopGradient)"
      stroke="url(#shopGradient)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserOutline = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const UserFilled = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="userGradient" x1="50%" y1="0%" x2="50%" y2="100%" gradientTransform="rotate(-27)">
        <Stop offset="0%" stopColor="#37B874" />
        <Stop offset="100%" stopColor="#12FFAA" />
      </LinearGradient>
    </Defs>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="url(#userGradient)" />
    <Circle cx="12" cy="7" r="4" fill="url(#userGradient)" />
  </Svg>
);

export default function TabLayout() {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const pathname = usePathname();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: theme.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => 
            focused ? <HomeFilled size={size} /> : <HomeOutline size={size} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            const isOnHomeTab = pathname === '/home' || pathname === '/';
            if (isOnHomeTab) {
              e.preventDefault();
              router.setParams({ showFeedSelector: 'true' });
            }
          },
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size, focused }) => 
            focused ? <SearchFilled size={size} /> : <SearchOutline size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size, focused }) => 
            focused ? <PlusCircleFilled size={size} /> : <PlusCircleOutline size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size, focused }) => 
            focused ? (
              <ShoppingBagFilled size={size} />
            ) : (
              <ShoppingBagOutline size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => 
            focused ? <UserFilled size={size} /> : <UserOutline size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
