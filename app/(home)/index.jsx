import React, { useState, useEffect, useContext } from "react";
import {
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { AuthContext, FeedContext } from "../_layout";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";
import FeedCard from "../../components/FeedCard";

export default function Index() {
  const CARD_WIDTH = Dimensions.get("window").width - 32;

  const { feeds, popularFeeds } = useContext(FeedContext);
  const {
    session,
    user,
    userSubscriptionIds,
    userSubscriptionUrls,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);

  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedsParsed, setFeedsParsed] = useState(false);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  // Function to chunk an array
  const chunkArray = (arr, chunkSize) => {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunkedArray.push(arr.slice(i, i + chunkSize));
    }
    return chunkedArray;
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
              const feed = feeds.find((feed) => feed.channel_url === url);

              allChannels.push({
                title: parsedRss.title,
                description: parsedRss.description,
              });

              allItems.push(
                ...parsedRss.items.map((item) => ({
                  ...item,
                  publicationDate: new Date(item.published),
                  feed: feed,
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

          setRssItems(allItems);
          setFeedsParsed(true);
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
          const feed = feeds.find((feed) => feed.channel_url === url);

          allChannels.push({
            title: parsedRss.title,
            description: parsedRss.description,
          });

          allItems.push(
            ...parsedRss.items.map((item) => ({
              ...item,
              publicationDate: new Date(item.published),
              feed: feed,
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
      setFeedsParsed(true);
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
    titleWrapper: {
      marginTop: 0,
      flex: 1,
      padding: 16,
      paddingVertical: 12,
      width: "100%",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 24,
      lineHeight: 31,
      letterSpacing: -0.24,
    },
    textButton: {
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    textButtonText: {
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      color: `${Colors[colorScheme || "light"].colorPrimary}`,
    },
    randomChannelList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
  };

  return (
    <View style={styles.container}>
      {feedsParsed ? (
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
                  fallbackImage={item.fallbackImage}
                  feeds={feeds}
                  item={item}
                  feed={item.feed}
                  publication={item.feed.channel_title}
                  user={user}
                  userSubscriptionIds={userSubscriptionIds}
                  userSubscriptionUrls={userSubscriptionUrls}
                />
              );
            }}
            ListEmptyComponent={() => (
              <>
                <View style={styles.titleWrapper}>
                  <Text style={styles.title}>Your Feeds are empty</Text>
                  <TouchableOpacity
                    style={styles.textButton}
                    onPress={() => {
                      router.push({
                        pathname: "/(home)/explore",
                      });
                    }}
                  >
                    <Text style={styles.textButtonText}>
                      Go to Explore Page
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.titleWrapper}>
                  <Text style={styles.title}>Popular Feeds</Text>
                  <TouchableOpacity
                    style={styles.textButton}
                    onPress={() => {
                      router.push({
                        pathname: "/allPopularFeeds",
                      });
                    }}
                  >
                    <Text style={styles.textButtonText}>View more</Text>
                  </TouchableOpacity>
                </View>

                {feeds ? (
                  <ScrollView
                    horizontal
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.randomChannelList]}
                    decelerationRate={0}
                    snapToInterval={CARD_WIDTH + 8}
                    snapToAlignment={"left"}
                  >
                    {chunkArray(popularFeeds, 4).map((chunk, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          borderTopWidth: 1,
                          borderColor: `${
                            Colors[colorScheme || "light"].border
                          }`,
                        }}
                      >
                        {chunk.map((item) => (
                          <FeedCard key={item.id} item={item} user={user} />
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={Colors[colorScheme || "light"].colorPrimary}
                    />
                  </View>
                )}
              </>
            )}
          />
        </View>
      ) : (
        <>
          <Text>Loading...</Text>
        </>
      )}
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
    </View>
  );
}
