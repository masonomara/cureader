import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { router } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../config/initSupabase.js";
import { useColorScheme } from "react-native";

export const AuthContext = createContext({
  authInitialized: false,
  feeds: null,
  session: null,
  user: null,
  userBookmarks: null,
  userSubscriptionIds: null,
  userSubscriptionUrls: null,
  updateUserSubscriptions: () => {},
});

import Colors from "../constants/Colors";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(home)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterRegular: require("../assets/fonts/Inter/Inter-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter/Inter-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter/Inter-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter/Inter-Bold.ttf"),
    NotoSerifRegular: require("../assets/fonts/NotoSerif/NotoSerif-Regular.ttf"),
    NotoSerifMedium: require("../assets/fonts/NotoSerif/NotoSerif-Medium.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Remove splash screen on font load
  useEffect(() => {
    if (loaded) {
    }
  }, [loaded]);

  // Error catcher
  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Global Values

  const [authInitialized, setAuthInitialized] = useState(false);
  const [feeds, setFeeds] = useState(null);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userBookmarks, setUserBookmarks] = useState(null);
  const [userSubscriptionIds, setUserSubscriptionIds] = useState(null);
  const [userSubscriptionUrls, setUserSubscriptionUrls] = useState(null);

  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setAuthInitialized(true);
          const currentUser = session.user;
          setUser(currentUser);
          setSession(session);

          // Fetch user subscriptions in the background
          const { channelIds, channelUrls } = await fetchUserSubscriptions(
            currentUser
          );
          setUserSubscriptionIds(channelIds);
          setUserSubscriptionUrls(channelUrls);

          SplashScreen.hideAsync();
        } else {
          // Listen for changes in the authentication state
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              setAuthInitialized(true);
              const currentUser = session.user;
              setUser(currentUser);
              setSession(session);

              // Fetch user subscriptions in the background
              fetchUserSubscriptions(currentUser).then(
                (channelIds, channelUrls) => {
                  setUserSubscriptionIds(channelIds);
                  setUserSubscriptionUrls(channelUrls);
                  SplashScreen.hideAsync();
                }
              );

              router.replace("(home)");
            } else {
              setTimeout(() => {
                SplashScreen.hideAsync();
              }, 500);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Listen for changes in the authentication state
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        // console.log("Session 5:" || "N/A 5");
        // If a session is present, navigate to the main screen
        router.replace("(home)");
      } else {
        // If a session is not present, navigate to the login screen
        // console.log("Session 6:" || "N/A 6");
        router.replace("(login)");
      }
    });
  }, []);

  const fetchUserSubscriptions = async (currentUser) => {
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", currentUser.id);
  
      if (userProfileError) {
        console.error("Error fetching user profile data:", userProfileError);
        return { channelIds: [], channelUrls: [] };
      }
  
      const channelSubscriptions =
        userProfileData[0]?.channel_subscriptions || [];
  
      if (!channelSubscriptions || channelSubscriptions.length === 0) {
        return { channelIds: [], channelUrls: [] };
      }
  
      const { channelIds, channelUrls } = channelSubscriptions.reduce(
        (acc, subscription) => {
          acc.channelIds.push(subscription.channelId);
          acc.channelUrls.push(subscription.channelUrl);
          return acc;
        },
        { channelIds: [], channelUrls: [] }
      );
  
      return { channelIds, channelUrls };
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return { channelIds: [], channelUrls: [] };
    }
  };
  

  const updateUserSubscriptions = async (updatedSubscriptions) => {
    try {
      const { channelIds, channelUrls } = await fetchUserSubscriptions(
        session.user
      );
      // Update local state
      setUserSubscriptionIds(channelIds);
      setUserSubscriptionUrls(channelUrls);

      // Update the user profile on Supabase
      await supabase
        .from("profiles")
        .update({
          channel_subscriptions: updatedSubscriptions,
        })
        .eq("id", session.user.id);
    } catch (error) {
      console.error("Error updating user subscriptions:", error);
    }
  };

  // Fetches user information and all feed channels — sets [feeds]
  useEffect(() => {
    async function fetchFeeds() {
      try {
        const { data: channelsData, error } = await supabase
          .from("channels")
          .select("*");

        if (error) {
          console.error("Error fetching channels:", error);
          // You might want to show a user-friendly error message here.
          return;
        }

        setFeeds(channelsData);
        console.log("FEEDS", channelsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle unexpected errors here, e.g., show a generic error message.
      }
    }

    fetchFeeds();
  }, []); // The empty dependency array ensures it runs only on mount

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthContext.Provider
        value={{
          authInitialized,
          feeds,
          session,
          user,
          userBookmarks,
          userSubscriptionIds,
          userSubscriptionUrls,
          updateUserSubscriptions,
        }}
      >
        <Stack>
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
          <Stack.Screen name="(signup)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="addChannel"
            options={{ presentation: "modal", title: "Add Channel" }}
          />
          <Stack.Screen
            name="feedView"
            options={({ route }) => ({
              title: route.params.title || "Default Title",
              headerStyle: {
                headerTransparent: true,
                shadowColor: "transparent", // Remove shadow on iOS
                backgroundColor: Colors[colorScheme || "light"].background,
              },
              headerTintColor: Colors[colorScheme || "light"].colorPrimary, // Set header tint color
              headerBackTitle: "Explore",
              headerTitleStyle: {
                color: Colors[colorScheme || "light"].textHigh, // Set header title color
              },
            })}
          />
        </Stack>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
