import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { useColorScheme, View } from "react-native";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import { useContext } from "react";
import { AuthContext } from "../_layout";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import { supabase } from "../../config/initSupabase";

function TabBarIcon(props) {
  return <Feather size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace("(login)");
    if (error) {
      showErrorAlert("Error signing out: " + error.message);
    }
  };

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
    headerTitleText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,

      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    tooltipDivider: {
      height: 1,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
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
            // <TouchableOpacity style={styles.headerButton}>
            //   <Text style={styles.headerButtonText}>Settings</Text>
            // </TouchableOpacity>

            <Menu renderer={renderers.SlideInMenu}>
              <MenuTrigger
                text="Settings"
                customStyles={{
                  triggerTouchable: {
                    underlayColor: "transparent",
                    activeOpacity: 0.2,
                    style: {
                      marginRight: 16,
                      flexDirection: "row",
                      flexWrap: "nowrap",
                      color: `${Colors[colorScheme || "light"].buttonActive}`,
                      fontFamily: "InterMedium",
                      fontWeight: "500",
                      fontSize: 15,
                      lineHeight: 20,
                      letterSpacing: -0.15,
                    },
                  },
                  triggerText: {
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    color: `${Colors[colorScheme || "light"].buttonActive}`,
                    fontFamily: "InterMedium",
                    fontWeight: "500",
                    fontSize: 15,
                    lineHeight: 20,
                    letterSpacing: -0.15,
                  },
                }}
              />
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    backgroundColor: Colors[colorScheme || "light"].background,
                    borderWidth: 0.5,
                    borderColor: Colors[colorScheme || "light"].border,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    shadowColor: "none",
                    shadowOpacity: 0,
                    overflow: "hidden",
                    paddingTop: 8,
                    paddingBottom: 16,
                  },
                  optionsWrapper: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingHorizontal: 16,
                  },
                  optionWrapper: {
                    margin: 5,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingHorizontal: 0,
                    height: 44,
                    // borderWidth: 1,
                    // borderColor: "red",
                  },
                  optionTouchable: {
                    underlayColor: "transparent",
                    activeOpacity: 0.2,
                  },
                  optionText: {
                    color: Colors[colorScheme || "light"].buttonActive,
                    fontFamily: "InterMedium",
                    fontWeight: "500",
                    fontSize: 15,
                    lineHeight: 20,
                    letterSpacing: -0.15,
                  },
                }}
              >
                <MenuOption
                  onSelect={() => {
                    doLogout();
                  }}
                  text="Log Out"
                />
                <View style={styles.tooltipDivider}></View>
                {/* <MenuOption
                  
                  text="Turn off Daily Quote"
                /> */}
              </MenuOptions>
            </Menu>
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
