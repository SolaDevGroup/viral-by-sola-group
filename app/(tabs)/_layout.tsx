import { Tabs, router, usePathname } from "expo-router";
import React, { useEffect } from "react";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { Image } from "expo-image";
import { Images } from "@/assets/images";
import HomeIcon from "@/assets/images/tabsIcons/HomeIcon";
import SearchIcon from "@/assets/images/tabsIcons/SearchIcon";
import ShopIcon from "@/assets/images/tabsIcons/ShopIcon";
import ShopIconOutline from "@/assets/images/tabsIcons/ShopIconOutline";
import { View } from "react-native";
import { get } from "@/services/ApiRequest";
import { useDispatch } from "react-redux";
import { setUserData } from "@/store/slices/usersSlice";
//chevron-back-outline --> Ionicons

//chevron-right --> Feather
export default function TabLayout() {
  const { isDarkMode, accentColor, actualUser, setActualUser } = useApp();
  const dispatch = useDispatch();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const pathname = usePathname();

  const getUser = async () => {
    try {
      const res = await get("user/me");
      if (res?.data?.success) {
        const userData = res.data.data;
        dispatch(setUserData(userData));
      }
    } catch (err) {}
  };

  useEffect(() => {
    getUser();
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.textTertiary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Poppins_500Medium",
        },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            const isOnHomeTab = pathname.includes("/home");
            if (isOnHomeTab) {
              e.preventDefault();
              router.setParams({ showFeedSelector: "true" });
            }
          },
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) => <SearchIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ focused }) => (
            <Image
              source={Images.camera}
              style={{
                height: 28,
                width: 28,
                tintColor: focused
                  ? isDarkMode
                    ? Colors.white
                    : Colors.black
                  : isDarkMode
                  ? Colors.whiteOpacity48
                  : Colors.blackOpacity48,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ focused }) =>
            focused ? <ShopIcon focused={focused} /> : <ShopIconOutline />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", bottom: -8 }}>
              <Image
                source={Images.user}
                style={{
                  height: 28,
                  width: 28,
                }}
              />

              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: accentColor,
                  marginTop: 4,
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
