import { Tabs, usePathname, router } from "expo-router";
import { Image } from "expo-image";
import { useColorScheme, Text, TouchableOpacity } from "react-native";

import Colors from "../../constants/Colors";

export default function AuthLayout() {
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
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme || "light"].text,
        tabBarStyle: {
          display: usePathname() === "example" ? "none" : "flex",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerStyle: {
            shadowColor: "transparent",
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          tabBarStyle: {
            display: "none",
          },
          href: null,
          tabBarButton: null,
          title: "Log In",
          headerTitle: () => (
            <Image
              style={{ width: 200, height: 36 }}
              source={require("../../assets/images/pin.png")}
              contentFit="contain"
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.replace("(signup)")}
            >
              <Text style={styles.headerButtonText}>Sign up</Text>
            </TouchableOpacity>
          ),
          headerTitleStyle: { flex: 1, textAlign: "center" },
        }}
      />
    </Tabs>
  );
}
