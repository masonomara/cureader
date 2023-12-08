import React, { useState, useEffect, useContext } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";
import { AuthContext } from "../_layout";

export default function Index() {
  const { session, user, userSubscriptions } = useContext(AuthContext);

  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  // Use the Supabase client to query the "profiles" table and get the channel_subscriptions array
  const getFeedSubscriptions = async () => {
    try {
      if (user) {
        // Check if user is defined and authenticated
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("channel_subscriptions")
          .eq("id", user.id);

        if (profileError) {
          console.error("Error fetching user profile data:", profileError);
          return [];
        } else {
          const channelSubscriptions =
            profileData[0]?.channel_subscriptions || [];
          const channelUrls = channelSubscriptions.map(
            (subscription) => subscription.channelUrl
          );
          return channelUrls;
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
      return [];
    }
  };

  // Use the Supabase client to query the "channels" table and get the channel_image_url items
  const getFallbackImages = async () => {
    try {
      if (user) {
        // Check if user is defined and authenticated
        const feedUrls = await getFeedSubscriptions();

        const { data: fallbackImageData, error: fallbackImageError } =
          await supabase
            .from("channels")
            .select("channel_url, channel_image_url")
            .in("channel_url", feedUrls);

        if (fallbackImageError) {
          console.error("Error fetching fallback images:", fallbackImageError);
          return [];
        } else {
          return fallbackImageData || [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching fallback images:", error);
      return [];
    }
  };

  // Parse feeds
  useEffect(() => {
    const fetchAndParseFeeds = async () => {
      if (user) {
        const feedUrls = await getFeedSubscriptions();
        const fallbackImages = await getFallbackImages();

        const allChannels = [];
        const allItems = [];

        const parseAndSort = async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const responseData = await response.text();
            const parsedRss = await rssParser.parse(responseData);

            const channelImage = fallbackImages.find(
              (image) => image.channel_url === url
            );

            allChannels.push({
              title: parsedRss.title,
              description: parsedRss.description,
            });

            allItems.push(
              ...parsedRss.items.map((item) => ({
                ...item,
                publicationDate: new Date(item.published),
                channel: parsedRss.title,
                image: parsedRss.image,
                fallbackImage: channelImage
                  ? channelImage.channel_image_url
                  : null,
                channelUrl: parsedRss.links[0].url,
              }))
            );
          } catch (error) {
            console.error(error);
            showErrorAlert("Error fetching RSS feeds. Please try again.");
          }
        };

        await Promise.all(feedUrls.map(parseAndSort));

        // Sort items by publication date in descending order (most recent first)
        allItems.sort((a, b) => b.publicationDate - a.publicationDate);

        setRssChannels(allChannels);
        setRssItems(allItems);
      }
    };

    fetchAndParseFeeds();
  }, [session]);

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
  };

  return (
    <View style={styles.container}>
      {/* User info and logout */}
      <View>
        <Text>{JSON.stringify(userSubscriptions)}</Text>
      </View>

      {/* List of articles */}
      <View style={styles.articleList}>
        <FlashList
          data={rssItems}
          estimatedItemSize={200}
          renderItem={({ item }) => {
            return (
              <ArticleCard
                item={item}
                publication={item.channel}
                fallbackImage={item.fallbackImage}
                channelUrl={item.channelUrl}
                user={user}
              />
            );
          }}
        />
      </View>
    </View>
  );
}
