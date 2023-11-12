import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  Image,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { supabase } from "../config/initSupabase";
import { Text, View } from "../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../components/ArticleCard";
import Colors from "../constants/Colors";

export default function TabOneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [rssItems, setRssItems] = useState([]);
  const [userChannelIds, setUserChannelIds] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(params.subscribed);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(
    params.subscribed
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    isOptimisticSubscribed
  );
  const [isLoading, setIsLoading] = useState(true); // Add a loading state
  const [subscribeButtonLoading, setSubscribeButtonLoading] = useState(true);
  const [focusEffectCompleted, setFocusEffectCompleted] = useState(false); // Track if useFocusEffect has completed

  useEffect(() => {
    // Fetch user information and channels
    async function fetchData() {
      try {
        const { data: userResponse } = await supabase.auth.getUser();
        const user = userResponse ? userResponse.user : null;
        setUser(user);

        const { data: channelsData, error } = await supabase
          .from("channels")
          .select("*")
          .order("channel_subscribers", { ascending: false });

        if (error) {
          console.error("Error fetching channels:", error);
          return;
        }

        setFeeds(channelsData);

        if (user) {
          const channelIds = await fetchUserChannels(user);
          setUserChannelIds(channelIds);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Add the useFocusEffect hook
  useFocusEffect(
    useCallback(() => {
      // Fetch user channels again when the screen comes into focus
      if (user) {
        fetchUserChannels(user).then((channelIds) => {
          setUserChannelIds(channelIds);
          setFocusEffectCompleted(true); // Mark useFocusEffect as completed
        });
      }
    }, [user])
  );

  const fetchUserChannels = async (user) => {
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

      if (userProfileError) {
        console.error("Error fetching user profile data:", userProfileError);
        return [];
      }

      const channelSubscriptions =
        userProfileData[0].channel_subscriptions || [];
      const channelIds = channelSubscriptions.map(
        (subscription) => subscription.channelId
      );
      return channelIds;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return [];
    }
  };

  useEffect(() => {
    // Update state when the subscribed prop changes
    setIsSubscribed(userChannelIds.includes(params.id));
    setIsOptimisticSubscribed(userChannelIds.includes(params.id));
    setSubscribeButtonLoading(false);
  }, [feeds]);

  const paramsId = params.id;

  const handleSubscribe = async () => {
    setIsOptimisticSubscribed(!isOptimisticSubscribed);
    console.log(
      "(handleSubscribe) 1 isOptimisticSubscribed:",
      isOptimisticSubscribed
    );
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

      console.log("(handleSubscribe) 2 userProfileData:", userProfileData);

      if (userProfileError) {
        console.log("Error fetching user profile data:", userProfileError);
        return;
      }

      const channelSubscriptions =
        userProfileData[0].channel_subscriptions || [];

      console.log(
        "(handleSubscribe) 3 channelSubscriptions:",
        channelSubscriptions
      );

      const itemChannelId = parseInt(paramsId, 10); // Ensure channelId is a number

      const isAlreadySubscribed = channelSubscriptions.some(
        (subscription) => subscription.channelId === itemChannelId
      );

      console.log(
        "(handleSubscribe) 4 isAlreadySubscribed:",
        isAlreadySubscribed
      );

      if (isSubscribed && isAlreadySubscribed) {
        // Unsubscribe
        const updatedSubscriptions = channelSubscriptions.filter(
          (subscription) => subscription.channelId !== itemChannelId
        );

        console.log(
          "(handleSubscribe) 5 updatedSubscriptions:",
          updatedSubscriptions
        );

        await updateSubscriptions(user.id, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", paramsId);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = channel.channel_subscribers.filter(
            (subscriber) => subscriber !== user.id
          );
          await updateChannelSubscribers(paramsId, updatedSubscribers);
        }
      } else {
        // Subscribe

        console.log(
          "(handleSubscribe) 6 updatedSubscriptions:",
          updatedSubscriptions
        );

        const newSubscription = {
          channelId: itemChannelId,
          channelUrl: params.url,
        };
        const updatedSubscriptions = [...channelSubscriptions, newSubscription];
        await updateSubscriptions(user.id, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", paramsId);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = [...channel.channel_subscribers, user.id];
          await updateChannelSubscribers(paramsId, updatedSubscribers);
        }
      }

      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsOptimisticSubscribed(!isOptimisticSubscribed);
    }
  };

  const updateSubscriptions = async (userId, updatedSubscriptions) => {
    await supabase
      .from("profiles")
      .update({ channel_subscriptions: updatedSubscriptions })
      .eq("id", userId);
  };

  const updateChannelSubscribers = async (channelId, updatedSubscribers) => {
    await supabase.from("channels").upsert([
      {
        id: channelId,
        channel_subscribers: updatedSubscribers,
      },
    ]);
  };

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  useEffect(() => {
    const parseFeed = async () => {
      if (params.url) {
        try {
          const response = await fetch(params.url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const responseData = await response.text();
          const parsedRss = await rssParser.parse(responseData);

          const allItems = parsedRss.items.map((item) => ({
            ...item,
            publicationDate: new Date(item.published),
            channel: parsedRss.title,
            image: parsedRss.image,
            channelUrl: parsedRss.links[0].url,
          }));

          allItems.sort((a, b) => b.publicationDate - a.publicationDate);

          setRssItems(allItems);
        } catch (error) {
          console.error(error);
          showErrorAlert(
            "Error fetching or parsing the RSS feed. Please try again."
          );
        } finally {
          setIsLoading(false); // Set loading to false after the effect is done firing
        }
      }
    };

    parseFeed();
  }, [params.url]);

  // Styles
  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    articleList: {
      width: "100%",
    },
    input: {
      width: "100%",
      borderRadius: 20,
      height: 56,
      marginBottom: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      flexDirection: "row",
      borderColor: `${Colors[colorScheme || "light"].border}`,
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      alignContent: "center",
      justifyContent: "space-between",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    inputText: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    button: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonDisabled: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].buttonMuted}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    card: {
      // Your existing card styles
    },
    subscriptionText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0,
      marginTop: 10,
    },
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      flexDirection: "row",
      display: "flex",
      width: "100%",
      gap: 10,
      padding: 16,
      marginBottom: -1,
    },
    cardContent: {
      display: "flex",
      flexDirection: "column",
      gap: 0,
      flex: 1,
    },
    title: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
      marginBottom: 2,
    },
    description: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      marginBottom: 10,
    },
    subscribeButton: {
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 100,
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 34,
    },
    subscribedButton: {
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      borderRadius: 100,
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 34,
      opacity: 0.87,
    },
    subscribeButtonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    subscribedButtonText: {
      color: `${Colors[colorScheme || "light"].colorPrimary}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={Colors[colorScheme || "light"].colorPrimary}
      />
    </View>
  ) : (
    <>
      <View style={styles.card}>
        {!params.image ? (
          <View
            style={{
              height: 104,
              width: 104,
              overflow: "hidden",
              backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
              borderRadius: 15,
            }}
          ></View>
        ) : (
          <View
            style={{
              aspectRatio: "1/1",
              width: 104,
              overflow: "hidden",
              borderRadius: 15,
            }}
          >
            <Image
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
              }}
              source={{ uri: params.image }}
            />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {params.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {params.description}
          </Text>
          <TouchableOpacity
            style={
              isOptimisticSubscribed.toString() === "true"
                ? styles.subscribedButton
                : styles.subscribeButton
            }
            onPress={handleSubscribe}
          >
            {subscribeButtonLoading === true ? (
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme || "light"].colorOn}
              />
            ) : (
              <Text
                style={
                  isOptimisticSubscribed.toString() === "true"
                    ? styles.subscribedButtonText
                    : styles.subscribeButtonText
                }
              >
                {isOptimisticSubscribed.toString() === "true"
                  ? "Following"
                  : "Follow"}
              </Text>
            )}
          </TouchableOpacity>
          <Text>{isOptimisticSubscribed.toString()}</Text>
        </View>
      </View>
      <FlatList
        data={rssItems}
        keyExtractor={(item, index) => index.toString()}
        style={styles.articleList}
        renderItem={({ item }) => (
          <ArticleCard
            item={item}
            publication={item.channel}
            image={item.image}
            channelUrl={item.channelUrl}
            user={user}
          />
        )}
      />
    </>
  );
}
