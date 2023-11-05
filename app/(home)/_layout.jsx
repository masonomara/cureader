import Feather from "@expo/vector-icons/Feather";
import { Link, Tabs } from "expo-router";
import { Pressable, useColorScheme } from "react-native";

import Colors from "../../constants/Colors";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props) {
  return <Feather size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme || "light"].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme || "light"].tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/addChannel" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Feather
                    name="plus"
                    size={25}
                    color={Colors[colorScheme || "light"].colorPrimary}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bookmark" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
