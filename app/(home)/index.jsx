import React, { useState, useEffect, useContext, useRef } from "react";
import {
  TouchableOpacity,
  Alert,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { AuthContext, FeedContext } from "../_layout";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";
import FeedCard from "../../components/FeedCard";
import { useScrollToTop } from "@react-navigation/native";

export default function Index() {
  const { feeds, popularFeeds, dailyQuote } = useContext(FeedContext);
  const { user, userSubscriptionUrls } = useContext(AuthContext);

  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedsParsed, setFeedsParsed] = useState(false);

  const ref = useRef(null);

  useScrollToTop(
    useRef({
      scrollToTop: () =>
        ref.current?.scrollToOffset({ animated: true, offset: 0 }),
    })
  );

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  useEffect(() => {
    if (user !== null && feeds !== null && userSubscriptionUrls !== null) {
      fetchAndParseFeeds(userSubscriptionUrls).finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [user, feeds, userSubscriptionUrls]);

  const fetchAndParseFeeds = async (urls) => {
    console.log("[1] ready to parse feeds:");
    const userFeeds = feeds.filter((feed) =>
      userSubscriptionUrls.includes(feed.channel_url)
    );
    console.log("[2] created userFeeds:");
    const fallbackImages = userFeeds.map((feed) => ({
      channel_url: feed.channel_url,
      channel_image_url: feed.channel_image_url,
    }));

    console.log("[3] fallbackImages:");
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

        console.log(responseData);
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
            fallbackImage: channelImage ? channelImage.channel_image_url : null,
            channelUrl: parsedRss.links[0].url,
          }))
        );
      } catch (error) {
        console.error(`Error parsing URL: ${url}`, error);
        showErrorAlert(
          `Error fetching RSS feed from ${url}. Please try again.`
        );
      }
    };

    await Promise.all(urls.map(parseAndSort));

    allItems.sort((a, b) => b.publicationDate - a.publicationDate);

    setRssItems(allItems);
    setFeedsParsed(true);
  };

  const fetchAndParseFeedsRefresh = async () => {
    if (user && feeds && userSubscriptionUrls) {
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
          console.log("[1] response data:", responseData)
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

      allItems.sort((a, b) => b.publicationDate - a.publicationDate);

      setRssChannels(allChannels);
      setRssItems(allItems);
      setFeedsParsed(true);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAndParseFeedsRefresh().finally(() => {
      setIsRefreshing(false);
    });
  };

  const styles = {
    noFeedsHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
      paddingBottom: 48,
    },
    username: {
      marginBottom: 4,
      marginTop: 4,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 29,
      lineHeight: 35,
      letterSpacing: -0.217,
    },
    subtitle: {
      marginBottom: 36,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "700",
      fontSize: 19,
      textAlign: "center",
      lineHeight: 24,
      letterSpacing: -0.19,
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
    buttonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      // backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    articleList: {
      //backgroundColor: `${Colors[colorScheme || "light"].background}`,
      width: "100%",
      flex: 1,
    },
    feedList: {
      width: "100%",
      flex: 1,
      paddingHorizontal: 16,
    },
    feedListFooter: {
      height: 16,
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
    headerWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 12,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      height: 86,
    },
    titleWrapper: {
      marginTop: 0,
      width: "100%",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
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
    dailyQuoteContainer: {
      padding: 16,
      paddingVertical: 24,
      paddingBottom: 12,
      marginBottom: 0,
      alignContent: "center",
      justifyContent: "center",
      flex: 1,
      height: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      position: "absolute",
    },
    dailyQuoteContainerLoading: {
      padding: 16,
      paddingVertical: 24,
      paddingBottom: 12,
      marginBottom: 0,
      alignContent: "center",
      justifyContent: "center",
      flex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      position: "absolute",
      zIndex: -1,
    },
    dailyQuoteWrapper: {
      gap: 12,
      alignContent: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    dailyQuoteQuote: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.18,
    },
    dailyQuoteAuthor: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    seeThrough: {
      opacity: 0,
    },
    feedsLoadingContainer: {
      gap: 9,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginTop: 64,
    },
    feedsLoadingText: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textPlaceholder}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.dailyQuoteContainer}>
        {dailyQuote && dailyQuote.length > 0 && (
          <View style={styles.dailyQuoteWrapper}>
            <Text style={styles.dailyQuoteQuote}>“{dailyQuote[0].q}”</Text>
            <Text style={styles.dailyQuoteAuthor}>
              — {dailyQuote[0].a}
              <Text style={styles.seeThrough}> —</Text>
            </Text>
            <View style={styles.feedsLoadingContainer}>
              <ActivityIndicator
                size="small"
                color={`${Colors[colorScheme || "light"].textPlaceholder}`}
              />

              <Text style={styles.feedsLoadingText}>
                Your RSS feeds are loading.
              </Text>
            </View>
          </View>
        )}
      </View>
      {feedsParsed ? (
        rssItems.length > 0 ? (
          <View style={styles.articleList}>
            <FlashList
              data={rssItems}
              ref={ref}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              estimatedItemSize={200}
              //onScroll={onScroll} // Add this line to handle scroll events
              renderItem={({ item }) => (
                <ArticleCard
                  fallbackImage={item.fallbackImage}
                  item={item}
                  feed={item.feed}
                  publication={item.feed.channel_title}
                  user={user}
                />
              )}
            />
          </View>
        ) : (
          <View style={styles.feedList}>
            <FlashList
              //onScroll={onScroll} // Add this line to handle scroll events
              ref={ref}
              ListHeaderComponent={() => (
                <>
                  <View style={styles.noFeedsHeader}>
                    <Text style={styles.username}>Welcome to Cureader!</Text>
                    <Text style={styles.subtitle}>
                      Feed free to view your Explore Page or see our most
                      popular feeds below.
                    </Text>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        router.push({
                          pathname: "/explore",
                        });
                      }}
                    >
                      <Text style={styles.buttonText}>View Explore Page</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.headerWrapper}>
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
                    <Text style={styles.headerSubtitle}>
                      Get started with our most popular feeds.
                    </Text>
                  </View>
                </>
              )}
              data={popularFeeds}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={200}
              renderItem={({ item }) => (
                <FeedCard key={item.id} item={item} user={user} />
              )}
              ListFooterComponent={() => <View style={styles.feedListFooter} />}
            />
          </View>
        )
      ) : (
        <></>
      )}
    </View>
  );
}
