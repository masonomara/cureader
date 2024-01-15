// Importing necessary modules and components
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase.js";
import { useColorScheme } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import Colors from "../constants/Colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Creating contexts for sharing state between components
export const FeedContext = createContext({
  feeds: null,
  popularFeeds: null,
  randomFeeds: null,
  feedsFetched: false,
  userFetched: false,
  feedsParsed: false,
  feedCategories: [],
  setFeedCategories: () => {},
  setFeeds: () => {},
  setFeedsParsed: () => {},
});

export const AuthContext = createContext({
  session: null,
  user: null,
  userAdmin: false,
  userSubscriptionIds: null,
  userSubscriptionUrls: null,
  userSubscriptionUrlsFetched: false,
  userBookmarks: [],
  setUserSubscriptionIds: () => {},
  setUserSubscriptionUrls: () => {},
  setUserBookmarks: () => {},
});

// Unstable settings for the root navigation
export const unstable_settings = {
  initialRouteName: "(home)",
};

// Preventing the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Creating a new instance of the QueryClient
const queryClient = new QueryClient();

// RootLayout component
export default function RootLayout() {
  // Loading fonts using useFonts hook
  const [loaded, error] = useFonts({
    InterRegular: require("../assets/fonts/Inter/Inter-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter/Inter-Medium.ttf"),
    InterMediumItalic: require("../assets/fonts/Inter/Inter-MediumItalic.ttf"),
    InterSemiBold: require("../assets/fonts/Inter/Inter-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter/Inter-Bold.ttf"),
    NotoSerifRegular: require("../assets/fonts/NotoSerif/NotoSerif-Regular.ttf"),
    NotoSerifMedium: require("../assets/fonts/NotoSerif/NotoSerif-Medium.ttf"),
    ...FontAwesome.font,
  });

  // Handling errors during font loading
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // If fonts are not loaded, return null
  if (!loaded) {
    return null;
  }

  // Returning the QueryClientProvider with the RootLayoutNav component
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

// RootLayoutNav component
function RootLayoutNav() {
  // State variables for various data
  const [feeds, setFeeds] = useState(null);
  const [popularFeeds, setPopularFeeds] = useState(null);
  const [randomFeeds, setRandomFeeds] = useState(null);
  const [user, setUser] = useState(null);
  const [userAdmin, setUserAdmin] = useState(false);
  const [userSubscriptionIds, setUserSubscriptionIds] = useState(null);
  const [userSubscriptionUrls, setUserSubscriptionUrls] = useState(null);
  const [userSubscriptionUrlsFetched, setUserSubscriptionUrlsFetched] =
    useState(false);
  const [feedCategories, setFeedCategories] = useState(null);
  const [userBookmarks, setUserBookmarks] = useState(null);
  const [userFetched, setUserFetched] = useState(false);
  const [feedsFetched, setFeedsFetched] = useState(false);
  const [feedsParsed, setFeedsParsed] = useState(false);
  const [session, setSession] = useState(null);
  const colorScheme = useColorScheme();

  // Sorting feeds by subscribers when feeds state changes
  const sortFeedsBySubscribers = (feeds) => {
    return feeds.slice().sort((a, b) => {
      const subscribersA = a.channel_subscribers
        ? a.channel_subscribers.length
        : 0;
      const subscribersB = b.channel_subscribers
        ? b.channel_subscribers.length
        : 0;

      return subscribersB - subscribersA;
    });
  };

  // Sorting feeds and updating popularFeeds and randomFeeds state
  useEffect(() => {
    if (feeds) {
      const sortedFeeds = sortFeedsBySubscribers(feeds);
      const popularFeeds = sortedFeeds.slice(0, 24);
      setPopularFeeds(popularFeeds);

      const remainingFeeds = sortedFeeds.slice(24);
      const remainingFeedsExcludingPopular = remainingFeeds.filter(
        (feed) =>
          !popularFeeds.some((popularFeed) => popularFeed.id === feed.id)
      );

      const shuffleArray = (array) => {
        let currentIndex = array.length,
          randomIndex,
          temporaryValue;

        while (currentIndex !== 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }

        return array;
      };

      const randomFeeds = shuffleArray(remainingFeedsExcludingPopular).slice(
        0,
        25
      );

      setRandomFeeds(randomFeeds);
    }
  }, [feeds]);

  // Handling authentication state changes
  const handleAuthStateChange = async (event, session) => {
    if (session) {
      setSession(session);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        setUserFetched(true);

        // console.log("setUserFetched:", userFetched);
        const { channelIds, channelUrls, bookmarks } =
          await fetchUserSubscriptions(user);
        setUserSubscriptionIds(channelIds);
        setUserSubscriptionUrls(channelUrls);
        setUserSubscriptionUrlsFetched(true);

        // console.log(
        //   "setUserSubscriptionUrlsFetched:",
        //   userSubscriptionUrlsFetched
        // );
        setUserBookmarks(bookmarks);

        // console.log("[LAYOUT 1.1] prepping fetchFeeds");
        async function fetchFeeds() {
          try {
            // console.log("[LAYOUT 1.3] running fetchFeeds");
            const { data: categoriesData, error } = await supabase
              .from("categories")
              .select("*");
            if (error) {
              console.error("Error fetching feeds:", error);
              return;
            }
            // console.log(
            //   "[LAYOUT 1.4] collected feedsData:",
            //   feedsData.toString().slice(0, 30)
            // );
            setFeedCategories(categoriesData);
            console.log("feedCategories:", categoriesData);
            try {
              // console.log("[LAYOUT 1.3] running fetchFeeds");
              const { data: feedsData, error } = await supabase
                .from("channels")
                .select("*");
              if (error) {
                console.error("Error fetching feeds:", error);
                return;
              }
              // console.log(
              //   "[LAYOUT 1.4] collected feedsData:",
              //   feedsData.toString().slice(0, 30)
              // );
              setFeeds(feedsData);
              setFeedsFetched(true);
              SplashScreen.hideAsync();
            } catch (error) {
              console.error("Error fetching feeds:", error);
            }
          } catch (error) {
            console.error("Error fetching categories:", error);
          }
          // console.log("[LAYOUT 1.2] about to run fetchFeeds");
        }
        fetchFeeds();
        router.replace("(home)");
      } else {
        router.replace("(login)");
        SplashScreen.hideAsync();
        return null;
      }
    } else {
      router.replace("(login)");
      SplashScreen.hideAsync();
      setSession(null);
      setUser(null);
      setUserSubscriptionIds(null);
      setUserSubscriptionUrls(null);
      setUserBookmarks(null);
    }
  };

  // Fetching user and subscriptions on component mount
  useEffect(() => {
    // console.log("[LAYOUT 2.1] prepping fetchUserAndSubscriptions");
    const fetchUserAndSubscriptions = async () => {
      // console.log("[LAYOUT 2.2] about to run fetchUserAndSubscriptions");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // console.log("[LAYOUT 2.3] about to run setSession");
      setSession(session);

      if (session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        setUserFetched(true);
        // console.log("setUserFetched:", userFetched);
        const { channelIds, channelUrls, bookmarks } =
          await fetchUserSubscriptions(user);
        setUserSubscriptionIds(channelIds);
        setUserSubscriptionUrls(channelUrls);
        setUserSubscriptionUrlsFetched(true);
        // console.log(
        //   "setUserSubscriptionUrlsFetched:",
        //   userSubscriptionUrlsFetched
        // );
        setUserBookmarks(bookmarks);

        if (feedsFetched) {
          //router.replace("(home)");
        }
      } else {
        router.replace("(login)");
      }
    };

    // Adding and removing auth state change listener
    supabase.auth.onAuthStateChange(handleAuthStateChange);
    fetchUserAndSubscriptions();

    return () => {
      // Check if removeAuthStateListener is available before calling it
      if (supabase.auth.removeAuthStateListener) {
        supabase.auth.removeAuthStateListener(handleAuthStateChange);
      }
    };
  }, [feedsFetched]);

  // Fetching user subscriptions from Supabase
  const fetchUserSubscriptions = async (user) => {
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

      if (userProfileError) {
        console.error("Error fetching user profile data:", userProfileError);
        return { channelIds: [], channelUrls: [], bookmarks: [] };
      }
      setUserAdmin(userProfileData[0].admin);
      const channelSubscriptions =
        userProfileData[0]?.channel_subscriptions || [];

      const articleBookmarks = userProfileData[0]?.bookmarks || [];

      const { channelIds, channelUrls } = channelSubscriptions.reduce(
        (acc, subscription) => {
          acc.channelIds.push(subscription.channelId);
          acc.channelUrls.push(subscription.channelUrl);
          return acc;
        },
        { channelIds: [], channelUrls: [] }
      );

      const bookmarks = articleBookmarks;

      return { channelIds, channelUrls, bookmarks };
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return { channelIds: [], channelUrls: [], bookmarks: [] };
    }
  };

  // Returning the main layout wrapped in ThemeProvider and MenuProvider
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <MenuProvider
        customStyles={{
          backdrop: {
            backgroundColor: "#181818",
            opacity: 0.8,
          },
        }}
      >
        <FeedContext.Provider
          value={{
            feeds,
            popularFeeds,
            randomFeeds,
            feedsFetched,
            userFetched,
            feedsParsed,
            feedCategories,
            setFeedCategories,
            setFeeds,
            setFeedsParsed,
          }}
        >
          <AuthContext.Provider
            value={{
              session,
              user,
              userAdmin,
              userSubscriptionIds,
              userSubscriptionUrls,
              userBookmarks,
              setUserSubscriptionIds,
              setUserSubscriptionUrls,
              userSubscriptionUrlsFetched,
              setUserBookmarks,
            }}
          >
            <Stack>
              <Stack.Screen name="(home)" options={{ headerShown: false }} />
              <Stack.Screen name="(login)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(removeAccount)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(signup)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />

              <Stack.Screen
                name="addChannel"
                options={{ presentation: "modal", title: "Add Channel" }}
              />
              <Stack.Screen
                name="feedView"
                options={({ route }) => ({
                  title: route.params.title || "RSS Feed",
                  headerStyle: {
                    headerTransparent: true,
                    shadowColor: "transparent",
                    backgroundColor: Colors[colorScheme || "light"].background,
                  },
                  headerTintColor: Colors[colorScheme || "light"].colorPrimary,
                  headerBackTitle: "Explore",
                  headerTitleStyle: {
                    color: Colors[colorScheme || "light"].textHigh,
                  },
                })}
              />
              <Stack.Screen
                name="editFeedView"
                options={({ route }) => ({
                  title: `Edit ${route.params.title}` || "Edit Feed",
                  headerStyle: {
                    headerTransparent: true,
                    shadowColor: "transparent",
                    backgroundColor: Colors[colorScheme || "light"].background,
                  },
                  headerTintColor: Colors[colorScheme || "light"].colorPrimary,
                  headerBackTitle: "Back",
                  headerTitleStyle: {
                    color: Colors[colorScheme || "light"].textHigh,
                  },
                })}
              />
              <Stack.Screen
                name="allPopularFeeds"
                options={{
                  title: "Popular Feeds",
                  headerStyle: {
                    headerTransparent: true,
                    shadowColor: "transparent",
                    backgroundColor: Colors[colorScheme || "light"].background,
                  },
                  headerTintColor: Colors[colorScheme || "light"].colorPrimary,
                  headerBackTitle: "Explore",
                  headerTitleStyle: {
                    color: Colors[colorScheme || "light"].textHigh,
                  },
                }}
              />
              <Stack.Screen
                name="allRandomFeeds"
                options={{
                  title: "Random Feeds",
                  headerStyle: {
                    headerTransparent: true,
                    shadowColor: "transparent",
                    backgroundColor: Colors[colorScheme || "light"].background,
                  },
                  headerTintColor: Colors[colorScheme || "light"].colorPrimary,
                  headerBackTitle: "Explore",
                  headerTitleStyle: {
                    color: Colors[colorScheme || "light"].textHigh,
                  },
                }}
              />
            </Stack>
          </AuthContext.Provider>
        </FeedContext.Provider>
      </MenuProvider>
    </ThemeProvider>
  );
}
