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

export const FeedContext = createContext({
  feeds: null,
  popularFeeds: null,
  randomFeeds: null,
  dailyQuote: null,
  feedsFetched: false,
  userFetched: false,
});

export const AuthContext = createContext({
  session: null,
  user: null,
  userSubscriptionIds: null,
  userSubscriptionUrls: null,
  userSubscriptionUrlsFetched: false,
  userBookmarks: [],
  setUserSubscriptionIds: () => {},
  setUserSubscriptionUrls: () => {},
  setUserBookmarks: () => {},
});

export const unstable_settings = {
  // NOTE: initial route fake splash screen?
  initialRouteName: "(home)",
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const [feeds, setFeeds] = useState(null);
  const [popularFeeds, setPopularFeeds] = useState(null);
  const [randomFeeds, setRandomFeeds] = useState(null);
  const [user, setUser] = useState(null);
  const [userSubscriptionIds, setUserSubscriptionIds] = useState(null);
  const [userSubscriptionUrls, setUserSubscriptionUrls] = useState(null);
  const [userSubscriptionUrlsFetched, setUserSubscriptionUrlsFetched] =
    useState(false);
  const [userBookmarks, setUserBookmarks] = useState(null);
  const [userFetched, setUserFetched] = useState(false);
  const [feedsFetched, setFeedsFetched] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [session, setSession] = useState(null);

  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log("[1] initializing");
    fetchDailyQuote();
    SplashScreen.hideAsync();
  }, []);

  const fetchDailyQuote = async () => {
    console.log("[2-1] fetching daily quote");
    try {
      const response = await fetch("https://zenquotes.io/api/today");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch daily quote. Status: ${response.status}`
        );
      }

      const data = await response.json();
      setDailyQuote(data);
      console.log("[2-2] daily quote fetched");
    } catch (error) {
      console.error("Error fetching daily quote:", error.message);
    }
  };

  useEffect(() => {
    console.log("[3-1] fetching feeds");
    async function fetchFeeds() {
      try {
        const { data: feedsData, error } = await supabase
          .from("channels")
          .select("*");
        if (error) {
          console.error("Error fetching feeds:", error);
          return;
        }
        setFeeds(feedsData);
        setFeedsFetched(true);
        console.log("[3-2] feeds fetched");
      } catch (error) {
        console.error("Error fetching feeds:", error);
      }
    }

    fetchFeeds();
  }, []);

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

  useEffect(() => {
    if (feeds) {
      console.log("[4-1] sorting feeds");

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
      console.log("[4-2] feeds sorted");
    }
  }, [feeds]);

  const handleAuthStateChange = async (event, session) => {
    console.log("[5-1] fetching session");
    if (session) {
      setSession(session);
      console.log("[5-2] set session");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log("[6-1] initializing user");
        setUser(user);
        setUserFetched(true);
        const { channelIds, channelUrls, bookmarks } =
          await fetchUserSubscriptions(user);
        setUserSubscriptionIds(channelIds);
        setUserSubscriptionUrls(channelUrls);
        setUserSubscriptionUrlsFetched(true);
        setUserBookmarks(bookmarks);
        console.log("[6-2] set user");
        router.replace("(home)");
      } else {
        console.log("[6-1] initializing no-user");
        router.replace("(login)");
        SplashScreen.hideAsync();
        console.log("[6-2] set no-user");
        return null;
      }
    } else {
      console.log("[6-1] initializing no-user");

      router.replace("(login)");

      setSession(null);
      setUser(null);
      setUserSubscriptionIds(null);
      setUserSubscriptionUrls(null);
      setUserBookmarks(null);
      console.log("[6-2] set no-user");
    }
  };

  useEffect(() => {
    console.log("[7-1] fetching user subscriptions");

    const fetchUserAndSubscriptions = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        setUserFetched(true);
        const { channelIds, channelUrls, bookmarks } =
          await fetchUserSubscriptions(user);
        setUserSubscriptionIds(channelIds);
        setUserSubscriptionUrls(channelUrls);
        setUserSubscriptionUrlsFetched(true);
        setUserBookmarks(bookmarks);

        if (feedsFetched) {
          //router.replace("(home)");
        }
      } else {
        router.replace("(login)");
      }
    };

    supabase.auth.onAuthStateChange(handleAuthStateChange);
    fetchUserAndSubscriptions();

    return () => {
      // Check if removeAuthStateListener is available before calling it
      if (supabase.auth.removeAuthStateListener) {
        supabase.auth.removeAuthStateListener(handleAuthStateChange);
      }
    };
  }, [feedsFetched]);

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
            dailyQuote,
            feedsFetched,
            userFetched,
          }}
        >
          <AuthContext.Provider
            value={{
              session,
              user,
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
              <Stack.Screen name="quoteSplash" />
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
