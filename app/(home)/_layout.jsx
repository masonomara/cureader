import Feather from "@expo/vector-icons/Feather";
import { Link, Tabs } from "expo-router";
import {
  Pressable,
  useColorScheme,
  TouchableOpacity,
  Text,
} from "react-native";
import Colors from "../../constants/Colors";

function TabBarIcon(props) {
  return <Feather size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const styles = {
    headerButton: {
      height: 44,
      width: 80,
      flexDirection: "row",
      padding: 0,
      alignItems: "center",
      justifyContent: "flex-end",
      marginRight: 16,
      textAlign: "right",
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    headerButtonText: {
      flexDirection: "row",
      flexWrap: "nowrap",
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    headerTitleText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,

      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
  };

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
          title: "Feed",
          headerTitleStyle: styles.headerTitleText, // Set the style for the header title

          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
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
          headerTitleStyle: styles.headerTitleText, // Set the style for the header title

          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
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
          headerTitleStyle: styles.headerTitleText, // Set the style for the header title

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
          headerTitleStyle: styles.headerTitleText, // Set the style for the header title
          headerRight: () => (
            <Link href="/addChannel" asChild>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.replace("(signup)")}
              >
                <Text style={styles.headerButtonText}>Settings</Text>
              </TouchableOpacity>
            </Link>
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
