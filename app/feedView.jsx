import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./_layout";
import {
  Alert,
  useColorScheme,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { View } from "../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../components/ArticleCard";
import Colors from "../constants/Colors";
import { FlashList } from "@shopify/flash-list";

import FeedCardFeedPreview from "../components/FeedCardFeedPreview";

export default function TabOneScreen() {
  const { session, user, userSubscriptions } = useContext(AuthContext);
  const params = useLocalSearchParams();

  const colorScheme = useColorScheme();
  const [rssItems, setRssItems] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(params.subscribed);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(
    params.subscribed
  );
  const [isLoading, setIsLoading] = useState(true); // Add a loading state
  const [subscribeButtonLoading, setSubscribeButtonLoading] = useState(true);

  useEffect(() => {
    // Update state when the subscribed prop changes
    setIsSubscribed(userSubscriptions.includes(user.id));
    setIsOptimisticSubscribed(userSubscriptions.includes(user.id));
    setSubscribeButtonLoading(false);
  }, [userSubscriptions]);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  // Parse feed channel for articles in the feed
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
      flex: 1,
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
    loadingContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
      <FeedCardFeedPreview params={params} />
      <View style={styles.articleList}>
        <FlashList
          data={rssItems}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          renderItem={({ item }) => (
            <ArticleCard
              item={item}
              publication={item.channel}
              fallbackImage={params.image}
              channelUrl={item.channelUrl}
              user={params.user}
            />
          )}
        />
      </View>
    </>
  );
}
