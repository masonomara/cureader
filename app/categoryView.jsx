import React, { useState, useEffect, useContext } from "react";
import { AuthContext, FeedContext } from "./_layout";
import { Alert, Text, useColorScheme } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { View } from "../components/Themed";
import * as rssParser from "react-native-rss-parser";
import Colors from "../constants/Colors";
import { FlashList } from "@shopify/flash-list";
import FeedCardListItem from "../components/FeedCardListItem";

export default function TabOneScreen() {
  const { feeds } = useContext(FeedContext);
  const { user, userSubscriptionUrls } = useContext(AuthContext);

  const params = useLocalSearchParams();

  const colorScheme = useColorScheme();
  const [rssItems, setRssItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedsEmpty, setFeedsEmpty] = useState(false);

  const filteredFeeds = feeds
    .filter(
      (feed) =>
        feed.channel_categories &&
        feed.channel_categories.includes(params.title) &&
        feed.channel_image_url
    )
    .sort(
      (a, b) => b.channel_subscribers.length - a.channel_subscribers.length
    );

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  useEffect(() => {
    const parseFeed = async () => {
      if (params.url && feeds && userSubscriptionUrls) {
        try {
          const fallbackImages = feeds.map((feed) => ({
            channel_url: feed.channel_url,
            channel_image_url: feed.channel_image_url,
          }));

          const response = await fetch(params.url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const responseData = await response.text();
          const parsedRss = await rssParser.parse(responseData);

          const channelImage = fallbackImages.find(
            (image) => image.channel_url === params.url
          );
          const feed = feeds.find((feed) => feed.channel_url === params.url);

          const allItems = parsedRss.items.map((item) => ({
            ...item,
            publicationDate: new Date(item.published),
            feed: feed,
            image: parsedRss.image,
            fallbackImage: channelImage ? channelImage.channel_image_url : null,
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
          setIsLoading(false);
        }
      }
    };

    parseFeed();
  }, [params.url]);

  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    feedList: {
      width: "100%",
      maxWidth: "100%",
      minWidth: "100%",
      flex: 1,
      paddingHorizontal: 0,
    },
    headerWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      height: 86,
    },
    titleWrapper: {
      width: "100%",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    headerSubtitle: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 24,
      lineHeight: 31,
      letterSpacing: -0.24,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.feedList}>
        <FlashList
          contentContainerStyle={styles.flashList}
          data={filteredFeeds}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          renderItem={({ item }) => {
            return <FeedCardListItem key={item.id} item={item} user={user} />;
          }}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <View style={styles.titleWrapper}>
                <Text style={styles.title}>{params.title}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Follow <Text style={{ textTransform: "lowercase"}}>our most popular {params.title} feeds.</Text>
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
