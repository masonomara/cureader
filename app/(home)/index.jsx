import React, { useState, useEffect, useContext, useRef } from "react";
import {
  TouchableOpacity,
  Alert,
  useColorScheme,
  ActivityIndicator,
  Dimensions,
  Image,
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

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Index() {
  const {
    feeds,
    popularFeeds,
    feedsFetched,
    userFetched,
    feedsParsed,
    setFeedsParsed,
  } = useContext(FeedContext);
  const { user, userSubscriptionUrls, userSubscriptionUrlsFetched } =
    useContext(AuthContext);

  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [promisedAll, setPromisedAll] = useState(false);

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

  const [initialParsingComplete, setInitialParsingComplete] = useState(false);

  useEffect(() => {
    // console.log("[INDEX 0.1] feedsFetched:", feedsFetched);
    // console.log("[INDEX 0.2] userFetched:", userFetched);
    // console.log(
    //   "[0.3] userSubscriptionUrlsFetched:",
    //   userSubscriptionUrlsFetched
    // );
    if (feedsFetched && userFetched && userSubscriptionUrlsFetched) {
      // console.log(
      //   "[1.1] about to run initialFetchAndParseFeeds:",
      //   userSubscriptionUrls.toString().slice(0, 30)
      // );

      initialFetchAndParseFeeds(userSubscriptionUrls).finally(() => {
        setIsRefreshing(false);

        // console.log("[INDEX 1.2] isRefreshing set to false:", isRefreshing);
        setInitialParsingComplete(true);
        // console.log(
        //   "[INDEX 1.3] initialParsingComplete:",
        //   initialParsingComplete
        // );
      });
    }
  }, [userSubscriptionUrlsFetched, userFetched, feedsFetched]);

  useEffect(() => {
    if (
      feedsFetched &&
      userFetched &&
      userSubscriptionUrlsFetched &&
      initialParsingComplete
    ) {
      fetchAndParseFeeds(userSubscriptionUrls).finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [userSubscriptionUrls]);

  const initialFetchAndParseFeeds = async (urls) => {
    console.log(
      "[2.1] beginning initialFetchAndParseFeeds:",
      userSubscriptionUrls.toString().slice(0, 30)
    );

    const userFeeds = feeds.filter((feed) =>
      userSubscriptionUrls.includes(feed.channel_url)
    );

    console.log(
      "[2.2] fetched userFeeds:",
      userFeeds
        .map((feed) => feed.channel_title)
        .toString()
        .slice(0, 30)
    );

    const fallbackImages = userFeeds.map((feed) => ({
      channel_url: feed.channel_url,
      channel_image_url: feed.channel_image_url,
    }));

    console.log(
      "[2.3] fetched fallbackImages:",
      fallbackImages
        .map((image) => image)
        .toString()
        .slice(0, 30)
    );

    const allChannels = [];
    const allItems = [];

    console.log("[2.4] check allChannels:", allChannels);
    console.log("[2.5] check allItems:", allItems);

    const parseAndSort = async (url) => {
      // console.log("[INDEX 6] beginning parseAndSort:", url);
      try {
        const response = await fetch(url);

        // console.log(
        //   "[6.1] parseAndSort response:",
        //   response.toString().slice(0, 30)
        // );

        if (!response.ok) {
          throw new Error(
            `Network response not OK. Status: ${response.status}`
          );
        }

        const responseData = await response.text();

        // console.log(
        //   "[6.2] parseAndSort responseData:",
        //   responseData.toString().slice(0, 30)
        // );

        const parsedRss = await rssParser.parse(responseData);

        // console.log(
        //   "[6.3] parseAndSort parsedRss:",
        //   parsedRss.toString().slice(0, 30)
        // );

        const channelImage = fallbackImages.find(
          (image) => image.channel_url === url
        );

        // console.log(
        //   "[6.4] parseAndSort channelImage:",
        //   channelImage.toString().slice(0, 30)
        // );

        const feed = feeds.find((feed) => feed.channel_url === url);

        // console.log(
        //   "[6.5] parseAndSort channelImage:",
        //   channelImage.toString().slice(0, 30)
        // );

        allChannels.push({
          title: parsedRss.title,
          description: parsedRss.description,
        });

        // console.log(
        //   "[6.6] parseAndSort allChannels:",
        //   allChannels.toString().slice(0, 30)
        // );

        allItems.push(
          ...parsedRss.items
            .map((item) => {
              const publicationDate = new Date(item.published);

              // Check if the date is valid
              if (isNaN(publicationDate)) {
                // Ignore the item if the date is not readable
                return null;
              }

              return {
                ...item,
                publicationDate,
                feed: feed,
                image: parsedRss.image,
                fallbackImage: channelImage
                  ? channelImage.channel_image_url
                  : null,
                channelUrl: parsedRss.links[0].url,
              };
            })
            .filter(Boolean) // Remove null values from the array
        );

        // console.log(
        //   "[6.7] parseAndSort allItems:",
        //   allItems.toString().slice(0, 30)
        // );

        // console.log(
        //   "[7] completed parseAndSort:",
        //   allItems.toString().slice(0, 30)
        // );
      } catch (error) {
        console.error(`Error parsing URL: ${url}`, error);
        showErrorAlert(
          `Error fetching RSS feed from ${url}. Please try again.`
        );
      }
    };

    console.log(
      "[2.6] completed all parseAndSort:",
      allItems.toString().slice(0, 30)
    );

    await Promise.all(urls.map(parseAndSort));

    allItems.sort((a, b) => b.publicationDate - a.publicationDate);

    setPromisedAll(true);
    console.log(
      "[2.7] completed Promise.all:",
      allItems
        .sort((a, b) => b.publicationDate - a.publicationDate)
        .toString()
        .slice(0, 30)
    );

    setRssItems(allItems);

    console.log("[2.8] completed rssItems:", rssItems.toString().slice(0, 30));
    setFeedsParsed(true);
    console.log(
      "[2.9] completed feedsParsed:",
      feedsParsed.toString().slice(0, 30)
    );
  };

  const fetchAndParseFeeds = async (urls) => {
    const userFeeds = feeds.filter((feed) =>
      userSubscriptionUrls.includes(feed.channel_url)
    );
    const fallbackImages = userFeeds.map((feed) => ({
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
          ...parsedRss.items
            .map((item) => {
              const publicationDate = new Date(item.published);

              // Check if the date is valid
              if (isNaN(publicationDate)) {
                // Ignore the item if the date is not readable
                return null;
              }

              return {
                ...item,
                publicationDate,
                feed: feed,
                image: parsedRss.image,
                fallbackImage: channelImage
                  ? channelImage.channel_image_url
                  : null,
                channelUrl: parsedRss.links[0].url,
              };
            })
            .filter(Boolean) // Remove null values from the array
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
            ...parsedRss.items
              .map((item) => {
                const publicationDate = new Date(item.published);

                // Check if the date is valid
                if (isNaN(publicationDate)) {
                  // Ignore the item if the date is not readable
                  return null;
                }

                return {
                  ...item,
                  publicationDate,
                  feed: feed,
                  image: parsedRss.image,
                  fallbackImage: channelImage
                    ? channelImage.channel_image_url
                    : null,
                  channelUrl: parsedRss.links[0].url,
                };
              })
              .filter(Boolean) // Remove null values from the array
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
      position: "absolute",
      zIndex: -1,
    },
    dailyQuoteWrapper: {
      gap: 12,
      alignContent: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    dailyQuoteQuote: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 25,
      lineHeight: 31,
      letterSpacing: -0.187,
    },
    dailyQuoteAuthor: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterMediumItalic",
      fontWeight: "500",
      fontStyle: "italic",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    seeThrough: {
      opacity: 0,
    },
    fauxSplashScreen: {
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      position: "absolute",
      display: "flex",
      justifyContent: "flex-end",
      left: 0,
      right: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,

      zIndex: 999, // optional, use zIndex to control the stacking order of elements
    },
    feedsLoadingContainer: {
      gap: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginBottom: 48,
      backgroundColor: "transparent",
    },
    feedsLoadingText: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      opacity: 0.87,
    },
    fauxSplashimage: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
  };

  return (
    <>
      {/* <Text>feedsFetched: {feedsFetched && "true"}</Text>
      <Text>userFetched: {userFetched && "true"}</Text>
      <Text>
        userSubscriptionUrlsFetched: {userSubscriptionUrlsFetched && "true"}
      </Text> */}
      <View style={styles.container}>
        {feedsParsed ? (
          <>
            {promisedAll ? (
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
                    ref={ref}
                    ListHeaderComponent={() => (
                      <>
                        <View style={styles.noFeedsHeader}>
                          <Text style={styles.username}>
                            Welcome to Cureader!
                          </Text>
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
                            <Text style={styles.buttonText}>
                              View Explore Page
                            </Text>
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
                              <Text style={styles.textButtonText}>
                                View more
                              </Text>
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
                    ListFooterComponent={() => (
                      <View style={styles.feedListFooter} />
                    )}
                  />
                </View>
              )
            ) : (
              <></>
            )}
          </>
        ) : (
          <View style={styles.fauxSplashScreen}>
            <Image
              source={require("../../assets/images/splash.png")}
              style={styles.fauxSplashimage}
            />
            <View style={styles.feedsLoadingContainer}>
              <ActivityIndicator
                size="small"
                color={`${Colors[colorScheme || "light"].colorOn}`}
              />

              <Text style={styles.feedsLoadingText}>
                Loading your RSS Feeds...
              </Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
