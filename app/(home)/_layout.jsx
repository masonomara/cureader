import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../config/supabase";

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

  const _handlePressButtonAsync = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening browser:", error);
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
    logoWrapper: {
      paddingVertical: 18,
      paddingTop: 14,
    },
    optionWrapper: {
      margin: 5,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: 0,
      height: 44,
    },
    optionText: {
      color: Colors[colorScheme || "light"].buttonActive,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    optionWrapperCredit: {
      margin: 5,
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: 0,
      paddingVertical: 10,
      display: "flex",
      gap: 7,
    },
    optionTextCreditWrapper: {
      color: Colors[colorScheme || "light"].textLow,
      textAlign: "center",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
      maxWidth: 450,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      flex: 1,
      flexWrap: "wrap",
      width: "100%",
    },
    optionTextCredit: {
      color: Colors[colorScheme || "light"].textLow,
      textAlign: "center",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
    },
    optionTextCreditPressableWrapper: {
      height: 32,
      marginVertical: -7,
      alignItems: "center",
      justifyContent: "center",
    },
    optionTextCreditPressable: {
      color: Colors[colorScheme || "light"].textLow,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
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
                <View style={styles.logoWrapper}>
                  {colorScheme === "dark" ? (
                    <Image
                      style={{ width: 141, height: 24 }}
                      source={require("../../assets/images/wordmark--dark.png")}
                      contentFit="contain"
                    />
                  ) : (
                    <Image
                      style={{ width: 141, height: 24 }}
                      source={require("../../assets/images/wordmark--light.png")}
                      contentFit="contain"
                    />
                  )}
                </View>
                <View style={styles.tooltipDivider}></View>

                <Pressable
                  style={styles.optionWrapper}
                  onPress={() =>
                    _handlePressButtonAsync("https://www.cureader.app/contact")
                  }
                >
                  <Text style={styles.optionText}>Contact Us</Text>
                </Pressable>
                <View style={styles.tooltipDivider}></View>
                <Pressable
                  style={styles.optionWrapper}
                  onPress={() =>
                    _handlePressButtonAsync(
                      "https://www.cureader.app/what-is-rss"
                    )
                  }
                >
                  <Text style={styles.optionText}>What is RSS?</Text>
                </Pressable>
                <View style={styles.tooltipDivider}></View>
                <MenuOption
                  onSelect={() => {
                    doLogout();
                  }}
                  text="Log Out"
                />
                <View style={styles.tooltipDivider}></View>
                <View style={styles.optionWrapperCredit}>
                  <View style={styles.optionTextCreditWrapper}>
                    <Text style={styles.optionTextCredit}>
                      Cureader is designed, developed, and produced by{" "}
                    </Text>
                    <Pressable
                      style={styles.optionTextCreditPressableWrapper}
                      onPress={() =>
                        _handlePressButtonAsync("https://masonomara.com/")
                      }
                    >
                      <Text style={styles.optionTextCreditPressable}>
                        Mason O'Mara
                      </Text>
                    </Pressable>
                    <Text style={styles.optionTextCredit}>.</Text>
                  </View>
                  <View style={styles.optionTextCreditWrapper}>
                    <Text style={styles.optionTextCredit}>
                      Inspirational quotes provided by{" "}
                    </Text>
                    <Pressable
                      style={styles.optionTextCreditPressableWrapper}
                      onPress={() =>
                        _handlePressButtonAsync("https://zenquotes.io/")
                      }
                    >
                      <Text style={styles.optionTextCreditPressable}>
                        ZenQuotes API
                      </Text>
                    </Pressable>
                    <Text style={styles.optionTextCredit}>.</Text>
                  </View>
                </View>
              </MenuOptions>
            </Menu>
          ),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
