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
import { useScrollToTop } from "@react-navigation/native";
import FeedCardListItem from "../../components/FeedCardListItem";

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
    if (feedsFetched && userFetched && userSubscriptionUrlsFetched) {
      initialFetchAndParseFeeds(userSubscriptionUrls).finally(() => {
        setIsRefreshing(false);

        setInitialParsingComplete(true);
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

              if (isNaN(publicationDate)) {
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
            .filter(Boolean)
        );
      } catch (error) {
        console.error(`Error parsing URL: ${url}`, error);
      }
    };

    await Promise.all(urls.map(parseAndSort));

    allItems.sort((a, b) => b.publicationDate - a.publicationDate);

    setPromisedAll(true);

    setRssItems(allItems);

    setFeedsParsed(true);
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

              if (isNaN(publicationDate)) {
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
            .filter(Boolean)
        );
      } catch (error) {
        console.error(`Error parsing URL: ${url}`, error);
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

                if (isNaN(publicationDate)) {
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
              .filter(Boolean)
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
      paddingHorizontal: 0,
      paddingBottom: 48,
    },
    username: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
      width: "100%",
    },
    subtitle: {
      marginBottom: 36,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 19,
      textAlign: "left",
      lineHeight: 24,
      letterSpacing: -0.19,
      width: "100%",
      paddingRight: 44,
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
    },
    articleList: {
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
      paddingVertical: 9,
      gap: 3,
      width: "100%",
      minWidth: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 25,
      lineHeight: 31,
      letterSpacing: -0.25,
    },
    textButton: {
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: -8,
      height: 44,
    },
    textButtonText: {
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: -0.16,
      color: `${Colors[colorScheme || "light"].colorPrimary}`,
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
      zIndex: 999,
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
                          <Text style={styles.username}>Welcome!</Text>
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
                          <Text style={styles.title}>Popular Feeds</Text>
                          <TouchableOpacity
                            style={styles.textButton}
                            onPress={() => {
                              router.push({
                                pathname: "/allPopularFeeds",
                              });
                            }}
                          >
                            <Text style={styles.textButtonText}>View More</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                    data={popularFeeds}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={200}
                    renderItem={({ item }) => (
                      <FeedCardListItem key={item.id} item={item} user={user} />
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
