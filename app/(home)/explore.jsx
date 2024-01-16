import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Pressable,
  Image,
} from "react-native";
import { AuthContext, FeedContext } from "../_layout";
import FeedCardFeatured from "../../components/FeedCardFeatured";
import * as WebBrowser from "expo-web-browser";
import FeedCard from "../../components/FeedCard";
import Colors from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import * as rssParser from "react-native-rss-parser";
import FeedCardSearchPreview from "../../components/FeedCardSearchPreview";
import { useScrollToTop } from "@react-navigation/native";
import { chunkArray } from "../utils/Formatting";
import FeedCardFeaturedSkeleton from "../../components/skeletons/FeedCardFeaturedSkeleton";
import FeedCardSkeleton from "../../components/skeletons/FeedCardSkeleton";
import FeedCardListItem from "../../components/FeedCardListItem";

function SearchIcon({ size, ...props }) {
  return <Feather size={size || 24} {...props} />;
}

function CloseIcon({ size, ...props }) {
  return <Feather size={size || 24} {...props} />;
}

export default function Explore() {
  const { feeds, popularFeeds, randomFeeds, feedCategories } =
    useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const CARD_WIDTH = Dimensions.get("window").width - 32;

  const [searchInput, setSearchInput] = useState("");
  const [parserInput, setParserInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchInputSelected, setIsSearchInputSelected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [textInputFocused, setTextInputFocused] = useState(false);

  const [channelData, setChannelData] = useState({
    title: "",
    url: "",
    description: "",
    imageUrl: "",
    wait: false,
    error: null,
  });

  const ref = useRef(null);

  useScrollToTop(
    React.useRef({
      scrollToTop: () => ref.current?.scrollTo({ y: 0 }),
    })
  );

  const handleClearInput = useCallback(() => {
    setSearchInput("");
    setParserInput("");
    setIsSearchInputSelected(false);
    setIsSearching(false);
    setTextInputFocused(false);
    Keyboard.dismiss();
  }, []);

  const handleFocus = useCallback(() => {
    setTextInputFocused(true);
  }, []);

  const handleSearchInput = (searchInput) => {
    setIsSearching(true);
    searchInput = searchInput.trim();
    let moddedSearchInput = "";

    if (
      searchInput === "" ||
      searchInput.startsWith("https://") ||
      searchInput.startsWith("http://")
    ) {
      moddedSearchInput = searchInput;
    } else if (searchInput.startsWith("http://")) {
      moddedSearchInput = "https://" + searchInput.slice(7);
    } else if (!searchInput.startsWith("https://")) {
      moddedSearchInput = "https://" + searchInput;
    }

    setChannelData((prevData) => ({
      ...prevData,
      wait: true,
    }));

    setParserInput(moddedSearchInput);
    setSearchInput(searchInput);
  };

  const _handlePressButtonAsync = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  useEffect(() => {
    const delayTimer = setTimeout(async () => {
      try {
        const response = await Promise.race([
          fetch(parserInput),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request Timeout")), 10000)
          ),
        ]);
        if (!response.ok) {
          throw new Error("API Request - Network response was not ok");
        }
        const responseData = await response.text();
        const parsedRss = await rssParser.parse(responseData);
        setChannelData({
          title: parsedRss.title,
          url: parserInput,
          description: parsedRss.description,
          imageUrl: parsedRss.image.url,
          wait: false,
          error: null,
        });
      } catch (error) {
        setChannelData({
          title: null,
          url: parserInput,
          description: null,
          imageUrl: null,
          wait: false,
          error: error.message,
        });
      }
    }, 150);

    return () => clearTimeout(delayTimer);
  }, [parserInput]);

  useEffect(() => {
    if (feeds != null) {
      const filterResults = () => {
        if (searchInput !== null) {
          const lowercasedInput = searchInput.toLowerCase();

          const filteredFeeds = feeds.filter((feed) => {
            const titleMatch = feed.channel_title
              .toLowerCase()
              .includes(lowercasedInput);
            const urlMatch = feed.channel_url
              .toLowerCase()
              .includes(lowercasedInput);
            const descriptionMatch = feed.channel_description
              ? feed.channel_description.toLowerCase().includes(lowercasedInput)
              : "";

            const categoryMatch = feed.channel_categories
              ? feed.channel_categories?.some((category) =>
                  category.toLowerCase().includes(lowercasedInput)
                )
              : false;

            return titleMatch || urlMatch || descriptionMatch || categoryMatch;
          });

          setSearchResults(filteredFeeds);
        } else {
          setSearchResults([]);
        }
      };

      filterResults();
    }
  }, [searchInput, feeds]);

  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    scrollViewContainer: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      flexDirection: "column",
      width: "100%",
      maxWidth: "100%",
    },
    randomChannelList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 38,
    },
    popularChannelList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
    },

    inputWrapper: {
      paddingHorizontal: 16,
      width: "100%",
      paddingBottom: 12,
      paddingTop: 8,

      height: 76,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    searchIcon: {
      position: "absolute",
      left: 32,
      top: 24,
      zIndex: 2,
      pointerEvents: "none",
    },
    closeIconWrapper: {
      position: "absolute",
      right: 24,
      zIndex: 2,
      height: 56,
      width: 44,
      top: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      flex: 1,
      borderRadius: 20,
      height: 56,
      minHeight: 56,
      paddingLeft: 52,
      paddingRight: 52,
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
    inputSelected: {
      flex: 1,
      borderRadius: 20,
      height: 56,
      paddingLeft: 52,
      paddingRight: 52,
      minHeight: 56,
      borderWidth: 1,
      flexDirection: "row",
      borderColor: `${Colors[colorScheme || "light"].buttonMuted}`,
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
    searchContainer: {
      paddingHorizontal: 16,
      width: "100%",
      zIndex: 1,

      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      flex: 1,
    },
    searchHeader: {
      borderBottomWidth: 1,
      paddingBottom: 7,
      paddingTop: 8,
      borderBottomColor: `${Colors[colorScheme || "light"].border}`,
    },
    searchHeaderText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    searchTextWrapper: {
      paddingTop: 8,
      width: "100%",
      marginBottom: 16,
    },
    searchText: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    noResultsWrapper: {
      width: "100%",
      alignItems: "center",
      marginBottom: 19,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      borderBottomWidth: 1,
      paddingBottom: 24,
      paddingHorizontal: 0,
      gap: 19,
      marginTop: 19,
    },
    noResultsHeader: {
      paddingBottom: 3,
      paddingTop: 20,
      width: "100%",
      maxWidth: 304,
    },
    noResultsHeaderText: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      textAlign: "center",
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.19,
    },
    noResultsTextWrapper: {
      width: "100%",
      maxWidth: 304,
    },
    noResultsText: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      textAlign: "center",
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    noResultsTextBold: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    headerWrapper: {
      paddingHorizontal: 16,
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
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.28,
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
    loadingContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: "red",
    },
    searchResultsList: {
      alignItems: "center",
      justifyContent: "center",
    },
    feedsLoadingScreen: {},
    feedsLoadingContainer: {
      gap: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      width: CARD_WIDTH,
    },
    feedsLoadingText: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },

    searchPreviewTextContainer: {
      width: "100%",
    },

    searchPreviewTextWrapperContainer: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: 0,
      display: "flex",
      paddingHorizontal: 16,
    },
    searchPreviewHeader: {
      color: Colors[colorScheme || "light"].textHigh,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      width: "100%",
      textAlign: "left",
      marginBottom: 3,

      textAlign: "center",
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.19,
    },
    searchPreviewTextWrapper: {
      color: Colors[colorScheme || "light"].textHigh,
      textAlign: "left",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      maxWidth: 450,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      flex: 1,
      flexWrap: "wrap",
      width: "100%",
    },
    searchPreviewText: {
      color: Colors[colorScheme || "light"].textMedium,
      textAlign: "center",
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    searchPreviewTextPressableWrapper: {
      height: 32,
      marginVertical: -5,
      alignItems: "center",
      justifyContent: "center",
    },
    searchPreviewTextPressable: {
      color: Colors[colorScheme || "light"].textMedium,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    categoriesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      marginBottom: 38,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      rowGap: 8,
      overflow: "hidden",
    },
    categoryWrapper: {
      width: CARD_WIDTH / 2 - 4,
      borderWidth: 1,

      borderColor: `${Colors[colorScheme || "light"].border}`,
      // backgroundColor: Colors[colorScheme || "light"].surfaceOne,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      flexDirection: "column",

      overflow: "hidden",
    },
    categoryImagesWrapper: {
      aspectRatio: 5 / 3,
      width: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      backgroundColor: "white",
    },
    categoryImageWrapperSingle: {
      aspectRatio: 5 / 3,
      width: "100%",
      overflow: "hidden",
    },

    categoryTitleWrapper: {
      overflow: "hidden",
      flex: 1,
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 12,
      paddingVertical: 12,
    },
    categoryTitle: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      textAlign: "left",
      width: "100%",
    },
    categorySubtitle: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 15,
      letterSpacing: -0.15,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <SearchIcon
          name="search"
          color={`${Colors[colorScheme || "light"].textPlaceholder}`}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, textInputFocused && styles.inputSelected]}
          value={searchInput}
          label="Channel Url Text"
          placeholder="Search for feed"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onChangeText={handleSearchInput}
        />
        <TouchableOpacity
          style={[
            styles.closeIconWrapper,
            textInputFocused || searchInput.length > 0
              ? { opacity: 1 }
              : { opacity: 0 },
          ]}
          onPress={handleClearInput}
        >
          <CloseIcon
            name="x-circle"
            color={`${Colors[colorScheme || "light"].buttonActive}`}
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      </View>
      {textInputFocused || searchInput.length > 0 ? (
        <ScrollView style={styles.searchContainer}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchHeaderText}>
              {searchInput.length > 0
                ? searchResults.length == 0 &&
                  !channelData.wait &&
                  channelData.title
                  ? "RSS Feed found from URL"
                  : searchResults.length > 0 || channelData.title
                  ? `Search Results (${searchResults.length})`
                  : searchResults.length === 0 && channelData.wait
                  ? "Searching..."
                  : "No Search Results Found"
                : "Search Results"}
            </Text>
          </View>

          {searchInput.length > 0 && (
            <View
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              style={[styles.searchResultsList]}
              decelerationRate={0}
              snapToInterval={CARD_WIDTH + 8}
              snapToAlignment={"left"}
            >
              {searchResults.map((item) => (
                <FeedCardListItem key={item.id} item={item} user={user} />
              ))}
            </View>
          )}

          <View style={styles.noResultsWrapper}>
            {searchResults.length == 0 &&
              !channelData.wait &&
              channelData.title && (
                <FeedCardSearchPreview
                  channelUrl={channelData.url}
                  channelTitle={channelData.title}
                  channelDescription={channelData.description}
                  channelImageUrl={channelData.imageUrl}
                />
              )}
            <View style={styles.searchPreviewTextContainer}>
              <Text style={styles.searchPreviewHeader}>
                Subscribing to RSS Feeds
              </Text>
              <View style={styles.searchPreviewTextWrapperContainer}>
                <View style={styles.searchPreviewTextWrapper}>
                  <Text style={styles.searchPreviewText}>
                    Search for a feed using a title or keywords. Can't find it?
                    Add a new one by entering the RSS Feed URL.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.searchPreviewTextContainer}>
              <Text style={styles.searchPreviewHeader}>Finding RSS Feeds</Text>
              <View style={styles.searchPreviewTextWrapperContainer}>
                <Text style={styles.searchPreviewTextWrapper}>
                  <Text style={styles.searchPreviewText}>
                    Looking for feeds? Add a new one! Use directories like{" "}
                  </Text>
                  <Pressable
                    style={styles.searchPreviewTextPressableWrapper}
                    onPress={() =>
                      _handlePressButtonAsync(
                        "https://rss.feedspot.com/best_rss_feeds/"
                      )
                    }
                  >
                    <Text style={styles.searchPreviewTextPressable}>
                      Feedspot
                    </Text>
                  </Pressable>
                  <Text style={styles.searchPreviewText}>
                    {" "}
                    or check for the RSS icon on favorite websites.
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.searchPreviewTextContainer}>
              <Text style={styles.searchPreviewHeader}>What is RSS?</Text>
              <View style={styles.searchPreviewTextWrapperContainer}>
                <Text style={styles.searchPreviewTextWrapper}>
                  <Text style={styles.searchPreviewText}>
                    Stay updated on your favorite sites in one spot. New to RSS?
                    Learn more on our website:{" "}
                  </Text>
                  <Pressable
                    style={styles.searchPreviewTextPressableWrapper}
                    onPress={() =>
                      _handlePressButtonAsync(
                        "https://www.cureader.app/what-is-rss"
                      )
                    }
                  >
                    <Text style={styles.searchPreviewTextPressable}>
                      “What Is RSS?”
                    </Text>
                  </Pressable>
                  <Text style={styles.searchPreviewText}>.</Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.searchContainer}></View>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={
          textInputFocused || searchInput.length > 0 ? { display: "none" } : {}
        }
        ref={ref}
      >
        <View style={styles.headerWrapper}>
          <Text style={styles.title}>Categories</Text>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => {
              router.push({
                pathname: "/allCategories",
              });
            }}
          >
            <Text style={styles.textButtonText}>View More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          {feedCategories
            .sort((a, b) => b.channels.length - a.channels.length)
            .slice(0, 4)
            .map((category) => {
              const filteredFeeds = feeds
                .filter(
                  (feed) =>
                    feed.channel_categories &&
                    feed.channel_categories.includes(category.title) &&
                    feed.channel_image_url
                )
                .sort(
                  (a, b) =>
                    b.channel_subscribers.length - a.channel_subscribers.length
                );

              if (category.channels && category.channels.length > 0) {
                return (
                  <Pressable
                    key={category.id}
                    style={styles.categoryWrapper}
                    onPress={() =>
                      router.push({
                        pathname: "/categoryView",
                        params: {
                          title: category.title,
                          channels: category.channels,
                          id: category.id,
                          feeds: filteredFeeds,
                        },
                      })
                    }
                  >
                    <View style={styles.categoryImagesWrapper}>
                      {filteredFeeds.slice(0, 1).map((feed, index) => (
                        <View
                          key={feed.id}
                          style={styles.categoryImageWrapperSingle}
                        >
                          <Image
                            style={{
                              flex: 1,
                            }}
                            contentFit="cover"
                            source={{ uri: feed.channel_image_url }}
                          />
                        </View>
                      ))}
                    </View>
                    <View style={styles.categoryTitleWrapper}>
                      <Text
                        style={styles.categoryTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {category.title}
                      </Text>
                    </View>
                  </Pressable>
                );
              } else {
                return null;
              }
            })}
        </View>

        <View style={styles.headerWrapper}>
          <Text style={styles.title}>Random Feeds</Text>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => {
              router.push({
                pathname: "/allRandomFeeds",
              });
            }}
          >
            <Text style={styles.textButtonText}>View More</Text>
          </TouchableOpacity>
        </View>
        {randomFeeds != null ? (
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.randomChannelList}
            decelerationRate={0}
            snapToInterval={CARD_WIDTH + 8}
            snapToAlignment={"left"}
          >
            {randomFeeds.slice(0, 8).map((item) => (
              <FeedCardFeatured key={item.id} item={item} user={user} />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.randomChannelList}
            decelerationRate={0}
            snapToInterval={CARD_WIDTH + 8}
            snapToAlignment={"left"}
          >
            <FeedCardFeaturedSkeleton />
            <FeedCardFeaturedSkeleton />
            <FeedCardFeaturedSkeleton />
          </ScrollView>
        )}
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
        {popularFeeds != null ? (
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.popularChannelList]}
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
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                }}
              >
                {chunk.map((item) => (
                  <FeedCardListItem key={item.id} item={item} user={user} />
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.popularChannelList]}
            decelerationRate={0}
            snapToInterval={CARD_WIDTH + 8}
            snapToAlignment={"left"}
          >
            {chunkArray(new Array(12).fill(null), 4).map((chunk, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                }}
              >
                {chunk.map((_, skeletonIndex) => (
                  <FeedCardSkeleton key={skeletonIndex} />
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}
