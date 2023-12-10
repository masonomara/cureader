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

export const FeedContext = createContext({
  feeds: null,
});
export const AuthContext = createContext({
  session: null,
  user: null,
  userSubscriptionIds: null,
  userSubscriptionUrls: null,
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

  // Remove spash screen on font load
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
  const [feeds, setFeeds] = useState(null);
  const [user, setUser] = useState(null);
  const [userSubscriptionIds, setUserSubscriptionIds] = useState(null);
  const [userSubscriptionUrls, setUserSubscriptionUrls] = useState(null);
  const [feedsFetched, setFeedsFetched] = useState(false);

  const [session, setSession] = useState(null);

  const colorScheme = useColorScheme();

  // Fetches all feeds — sets [feeds]
  useEffect(() => {
    async function fetchFeeds() {
      try {
        const { data: feedsData, error } = await supabase
          .from("channels")
          .select("*");
        if (error) {
          console.error("Error fetching feeds:", error);
          // You might want to show a user-friendly error message here.
          return;
        }

        setFeeds(feedsData);
        setFeedsFetched(true);
      } catch (error) {
        console.error("Error fetching feeds:", error);
        // Handle unexpected errors here, e.g., show a generic error message.
      }
    }

    fetchFeeds();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("Starting scenario 1");
        setSession(session);
        // Fetch the user data
        supabase.auth
          .getUser()
          .then(({ data: { user } }) => {
            if (user) {
              setUser(user);
              // Fetch user subscriptions
              fetchUserSubscriptions(user).then(
                ({ channelIds, channelUrls }) => {
                  setUserSubscriptionIds(channelIds);
                  setUserSubscriptionUrls(channelUrls);
                }
              );
            }
          })
          .then(SplashScreen.hideAsync())
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
        console.log("Finished scenario 1");
      }

      // Listen for changes in the authentication state
      else
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            console.log("Starting scenario 2");
            setSession(session);
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                setUser(user);
              }
            });
            // Fetch user subscriptions in the background
            const { channelIds, channelUrls } = fetchUserSubscriptions(user);
            setUserSubscriptionIds(channelIds);
            setUserSubscriptionUrls(channelUrls);
            // If a session is present, navigate to the main screen
            router.replace("(home)");
            SplashScreen.hideAsync();
            console.log("Finished scenario 2");
          } else {
            console.log("Starting scenario 3");
            // If a session is not present, navigate to the login screen
            setTimeout(() => {
              SplashScreen.hideAsync();
            }, 500);
            console.log("Finished scenario 3");
          }
        });
    });
  }, [feedsFetched]);

  // Listen for changes in the authentication state
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        console.log("Starting scenario 4");
        setSession(session);
        // Fetch the user data
        supabase.auth
          .getUser()
          .then(({ data: { user } }) => {
            if (user) {
              setUser(user);
              // Fetch user subscriptions
              fetchUserSubscriptions(user).then(
                ({ channelIds, channelUrls }) => {
                  setUserSubscriptionIds(channelIds);
                  setUserSubscriptionUrls(channelUrls);
                }
              );
            }
          })
          .then(router.replace("(home)"))
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });

        console.log("Finished scenario 4");
      } else {
        console.log("Finished scenario 5");
        router.replace("(login)");
        setSession(null);
        setUser(null);
        setUserSubscriptionIds(null);
        setUserSubscriptionUrls(null);
        console.log("Finished scenario 5");
      }
    });
  }, []);

  // fetch user subscriptions
  const fetchUserSubscriptions = async (user) => {
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

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

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <FeedContext.Provider
        value={{
          feeds,
        }}
      >
        <AuthContext.Provider
          value={{
            session,
            user,
            userSubscriptionIds,
            userSubscriptionUrls,
            setUserSubscriptionIds,
            setUserSubscriptionUrls,
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
              name="feedChannel"
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
      </FeedContext.Provider>
    </ThemeProvider>
  );
}
