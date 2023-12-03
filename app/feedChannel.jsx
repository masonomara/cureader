import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Image,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../config/initSupabase";
import { Text, View } from "../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../components/ArticleCard";
import Colors from "../constants/Colors";

const textColorArray = [
  "#E75450", // Red (Main Color)
  "#66C0A9", // Green
  "#FADA65", // Yellow
  "#7929B2", // Purple
  "#FF8C69", // Salmon
  "#00B3A9", // Teal
  "#E6532D", // Orange
  "#3CB8B2", // Teal
  "#FF7B00", // Orange
  "#1A9E95", // Teal
  "#E64400", // Red
  "#2DC82D", // Green
  "#FFD3A3", // Pale
  "#00EB8F", // Green
  "#E76E3F", // Orange
  "#00ADC4", // Blue
  "#FF9400", // Orange
  "#6D5DC8", // Purple
  "#FF8C69", // Salmon
  "#7AC3D4", // Blue
  "#C7132D", // Pink
  "#8FEB8D", // Green
  "#E64400", // Red
  "#8560C1", // Purple
  "#FFC800", // Gold
  "#6988EF", // Blue
];
const colorArray = [
  "#FF6961", // Red (Main Color)
  "#78D2B2", // Green
  "#FAEA96", // Yellow
  "#8A2BE2", // Purple
  "#FFA07A", // Salmon
  "#00CED1", // Teal
  "#FF6347", // Orange
  "#48D1CC", // Teal
  "#FF8C00", // Orange
  "#20B2AA", // Teal
  "#FF4500", // Red
  "#74D674", // Green
  "#FFDAB9", // Pale
  "#00FA9A", // Green
  "#FF7F50", // Orange
  "#00BFFF", // Blue
  "#FFA500", // Orange
  "#7B68EE", // Purple
  "#FFA07A", // Salmon
  "#87CEEB", // Blue
  "#DC143C", // Pink
  "#98FB98", // Green
  "#FF4500", // Red
  "#9370DB", // Purple
  "#FFD700", // Gold
  "#849BE9", // Blue
];

export default function TabOneScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [rssItems, setRssItems] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(params.subscribed);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(
    params.subscribed
  );
  const [isLoading, setIsLoading] = useState(true); // Add a loading state
  const [subscribeButtonLoading, setSubscribeButtonLoading] = useState(true);

  console.log("params.userChannelIds:", params.userChannelIds);
  console.log("params.id:", params.id);

  useEffect(() => {
    // Update state when the subscribed prop changes
    setIsSubscribed(params.userChannelIds.includes(params.id));
    setIsOptimisticSubscribed(params.userChannelIds.includes(params.id));
    setSubscribeButtonLoading(false);
  }, [params.userChannelIds]);

  console.log("isSubscribed:", isSubscribed);
  console.log("userId", params.userId);

  const paramsId = params.id;

  const handleSubscribe = async () => {
    setIsOptimisticSubscribed(!isOptimisticSubscribed);

    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", params.userId);

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

        await updateSubscriptions(params.userId, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", paramsId);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = channel.channel_subscribers.filter(
            (subscriber) => subscriber !== params.userId
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
        await updateSubscriptions(params.userId, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", paramsId);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = [
            ...channel.channel_subscribers,
            params.userId,
          ];
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

  // Function to get background color based on the first letter
  const getColorForLetter = (letter) => {
    const index = letter.toUpperCase().charCodeAt(0) % colorArray.length;
    return colorArray[index];
  };
  const getTextColorForLetter = (letter) => {
    const index = letter.toUpperCase().charCodeAt(0) % textColorArray.length;
    return textColorArray[index];
  };

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
      gap: 12,
      padding: 16,
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
    noImageContainer: {
      height: 96,
      width: 96,
      overflow: "hidden",
      backgroundColor: getColorForLetter(params.title[0]),
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 36,
      lineHeight: 39,
      letterSpacing: -0.27,
      height: 39,
      color: getTextColorForLetter(params.title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
    loadingContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
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
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageContainerText}>
              {params.title} {params.title} {params.title} {params.title}
            </Text>
            <Text style={styles.noImageContainerText}>
              {params.title} {params.title} {params.title} {params.title} {params.title}
            </Text>
            <Text style={styles.noImageContainerText}>
              {params.title} {params.title} {params.title} {params.title}
            </Text>
          </View>
        ) : (
          <View
            style={{
              aspectRatio: "1/1",
              width: 96,
              overflow: "hidden",
              borderRadius: 14,
            }}
          >
            <Image
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                borderRadius: 14,
                borderWidth: .67,
                borderColor: `${Colors[colorScheme || "light"].border}`
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
            user={params.user}
          />
        )}
      />
    </>
  );
}
