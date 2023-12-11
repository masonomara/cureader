import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity, Alert, useColorScheme } from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { AuthContext, FeedContext } from "../_layout";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";

export default function Index() {
  const { feeds } = useContext(FeedContext);
  const { session, user, userSubscriptionIds, userSubscriptionUrls } =
    useContext(AuthContext);

  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for handling channel URL input
  const [userInput, setUserInput] = useState("");
  const [parserInput, setParserInput] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelImageUrl, setChannelImageUrl] = useState("");

  const [channelTitleWait, setChannelTitleWait] = useState(false);
  const [channelUrlError, setChannelUrlError] = useState(null);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  // Logout user
  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace("(login)");
    if (error) {
      showErrorAlert("Error signing out: " + error.message);
    }
  };

  // Parse feeds
  useEffect(() => {
    const fetchAndParseFeeds = async () => {
      try {
        if (feeds && userSubscriptionUrls) {
          const fallbackImages = feeds.map((feed) => ({
            channel_url: feed.channel_url,
            channel_image_url: feed.channel_image_url,
          }));

          const allChannels = [];
          const allItems = [];

          const parseAndSort = async (url) => {
            try {
              const response = await fetch(url);

              if (!response.ok) {
                throw new Error(
                  `Network response not OK. Status: ${response.status}`
                );
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
              console.error(`Error parsing URL: ${url}`, error);
              // Log or display more information about the error if needed
              showErrorAlert(
                `Error fetching RSS feed from ${url}. Please try again.`
              );
            }
          };

          await Promise.all(userSubscriptionUrls.map(parseAndSort));

          // Sort items by publication date in descending order (most recent first)
          allItems.sort((a, b) => b.publicationDate - a.publicationDate);

          setRssChannels(allChannels);
          setRssItems(allItems);
        }
      } catch (error) {
        console.error("Error in fetchAndParseFeeds:", error);
        // Log or display more information about the error if needed
        showErrorAlert(
          "Error fetching and parsing RSS feeds. Please try again."
        );
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchAndParseFeeds();
  }, [user]);

  // Refresh and parse feeds
  const fetchAndParseFeedsRefresh = async () => {
    if (feeds && userSubscriptionUrls) {
      const fallbackImages = feeds.map((feed) => ({
        channel_url: feed.channel_url,
        channel_image_url: feed.channel_image_url,
      }));

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
          showErrorAlert("Error refreshing RSS feeds. Please try again.");
        }
      };

      await Promise.all(userSubscriptionUrls.map(parseAndSort));

      // Sort items by publication date in descending order (most recent first)
      allItems.sort((a, b) => b.publicationDate - a.publicationDate);

      setRssChannels(allChannels);
      setRssItems(allItems);
    }
  };

  const onRefresh = () => {
    // set isRefreshing to true
    setIsRefreshing(true);
    fetchAndParseFeedsRefresh();
    // and set isRefreshing to false at the end of your callApiMethod()
    setIsRefreshing(false);
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
      {/* <View>
        <Text numberOfLines={4}>User: {JSON.stringify(user)}</Text>
        <Text numberOfLines={4}>
          userSubscriptionIds: {JSON.stringify(userSubscriptionIds)}
        </Text>
        <Text numberOfLines={4}>
          useerSubscriptionUrls: {JSON.stringify(userSubscriptionUrls)}
        </Text>
        <Text numberOfLines={4}>Feeds: {JSON.stringify(feeds)}</Text>
        <TouchableOpacity onPress={doLogout}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.articleList}>
        <FlashList
          data={rssItems}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={isRefreshing} // Add this line to pass the refreshing state
          onRefresh={onRefresh}
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
