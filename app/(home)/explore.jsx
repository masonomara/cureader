import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
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
} from "react-native";
import { AuthContext, FeedContext } from "../_layout";
import FeedCardFeatured from "../../components/FeedCardFeatured";
import FeedCardSearchPreview from "../../components/FeedCardSearchPreview";
import Colors from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import * as rssParser from "react-native-rss-parser";
import { useScrollToTop } from "@react-navigation/native";
import { chunkArray } from "../utils/Formatting";
import FeedCardFeaturedSkeleton from "../../components/skeletons/FeedCardFeaturedSkeleton";
import FeedCardSkeleton from "../../components/skeletons/FeedCardSkeleton";
import FeedCardListItem from "../../components/FeedCardListItem";
import CategoriesContainer from "../../components/CategoriesContainer";
import * as WebBrowser from "expo-web-browser";

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
  const [searchResultsCategories, setSearchResultsCategories] = useState([]);
  const [isSearchInputSelected, setIsSearchInputSelected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [textInputFocused, setTextInputFocused] = useState(false);

  const _handlePressButtonAsync = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  const [channelData, setChannelData] = useState({
    title: "",
    url: "",
    description: "",
    imageUrl: "",
    wait: false,
    error: null,
  });

  const ref = useRef(null);

  const chunkedCategories = chunkArray(
    feedCategories
      .filter((category) => category.channels.length > 0)
      .sort((a, b) => b.channels.length - a.channels.length)
      .slice(0, 20),
    4
  );

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

  const handleSearchInput = useCallback((searchInput) => {
    setSearchInput(searchInput);
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
  }, []);

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
  }, [searchInput]);

  useEffect(() => {
    if (feedCategories != null) {
      const filterResults = () => {
        if (searchInput !== null) {
          const lowercasedInput = searchInput.toLowerCase();

          const filteredCategories = feedCategories.filter((category) => {
            const titleMatch = category.title
              .toLowerCase()
              .includes(lowercasedInput);
            const hasChannels = category.channels.length > 0;

            return titleMatch && hasChannels;
          });

          setSearchResultsCategories(filteredCategories);
        } else {
          setSearchResultsCategories([]);
        }
      };

      filterResults();
    }
  }, [searchInput]);

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
      paddingTop: 16,
    },
    randomChannelList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 29,
    },
    popularChannelList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    categoriesList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 29,
    },
    inputWrapper: {
      paddingHorizontal: 16,
      width: "100%",
      paddingBottom: 8,
      paddingTop: 8,
      height: 76,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    searchIcon: {
      position: "absolute",
      left: 32,
      top: 26,
      zIndex: 2,
      pointerEvents: "none",
    },
    closeIconWrapper: {
      position: "absolute",
      right: 24,
      zIndex: 2,
      height: 60,
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
    searchContainer: {
      paddingHorizontal: 16,
      width: "100%",
      zIndex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      flex: 1,
    },
    searchHeader: {
      borderBottomWidth: 0.5,
      paddingBottom: 7,
      paddingTop: 8,
      borderBottomColor: `${Colors[colorScheme || "light"].border}`,
    },
    searchHeaderNoResults: {
      borderBottomWidth: 0.5,
      paddingBottom: 7,
      paddingTop: 8,
      borderBottomColor: `${Colors[colorScheme || "light"].border}`,
      width: "100%",
      marginTop: 24,
    },
    searchHeaderText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    noResultsWrapper: {
      width: "100%",
      alignItems: "flex-start",
      marginBottom: 19,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      borderBottomWidth: 1,
      paddingBottom: 24,
      paddingHorizontal: 0,
      gap: 19,
      marginTop: 19,
    },
    headerWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 10,
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
      alignItems: "flex-end",
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
    searchResultsList: {
      alignItems: "center",
      justifyContent: "center",
    },
    searchResultsListCategories: {
      flex: 1,
      marginBottom: 16,
      marginTop: 8,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      rowGap: 8,
      overflow: "hidden",
    },
    searchPreviewTextContainer: {
      width: "100%",
    },
    searchPreviewTextWrapperContainer: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      paddingHorizontal: 0,
      display: "flex",
    },
    searchPreviewHeader: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    searchPreviewTextWrapper: {
      color: Colors[colorScheme || "light"].textHigh,
      textAlign: "left",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    searchPreviewText: {
      color: Colors[colorScheme || "light"].textMedium,
      textAlign: "left",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    searchPreviewTextPressableWrapper: {
      height: 32,
      marginVertical: -5,
      alignItems: "center",
      justifyContent: "center",
      width: "auto",
    },
    searchPreviewTextPressable: {
      color: Colors[colorScheme || "light"].textMedium,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
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
          {searchInput.length === 0 && (
            <View style={styles.searchHeader}>
              <Text style={styles.searchHeaderText}>
                {searchInput.length > 0
                  ? searchResults.length == 0 &&
                    !channelData.wait &&
                    channelData.title
                    ? "Feed found from URL"
                    : searchResults.length > 0 || channelData.title
                    ? `Feeds (${searchResults.length})`
                    : searchResults.length === 0 && channelData.wait
                    ? "Searching..."
                    : "No Feeds Found"
                  : "Search Results (0)"}
              </Text>
            </View>
          )}

          {searchInput.length > 0 && (
            <>
              {searchResultsCategories.length > 0 ? (
                <>
                  <View style={styles.searchHeader}>
                    <Text style={styles.searchHeaderText}>
                      {searchInput.length > 0
                        ? searchResultsCategories.length === 0 &&
                          !channelData.wait &&
                          channelData.title
                          ? "Category found from URL"
                          : searchResultsCategories.length > 0 ||
                            channelData.title
                          ? `Categories (${searchResultsCategories.length})`
                          : searchResultsCategories.length === 0 &&
                            channelData.wait
                          ? "Searching..."
                          : "No Categories Found"
                        : "Search Results"}
                    </Text>
                  </View>
                  <View style={[styles.searchResultsListCategories]}>
                    {searchResultsCategories.map((item) => (
                      <CategoriesContainer key={item.id} category={item} />
                    ))}
                  </View>
                </>
              ) : (
                <></>
              )}

              <View style={styles.searchHeader}>
                <Text style={styles.searchHeaderText}>
                  {searchInput.length > 0
                    ? searchResults.length == 0 &&
                      !channelData.wait &&
                      channelData.title
                      ? "Feed found from URL"
                      : searchResults.length > 0 || channelData.title
                      ? `Feeds (${searchResults.length})`
                      : searchResults.length === 0 && channelData.wait
                      ? "Searching..."
                      : "No Feeds Found"
                    : "Search Results"}
                </Text>
              </View>
              <View style={[styles.searchResultsList]}>
                {searchResults.map((item) => (
                  <FeedCardListItem
                    key={item.id}
                    item={item}
                    user={user}
                    borderBottom={true}
                  />
                ))}
              </View>
            </>
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

            <View style={styles.searchHeaderNoResults}>
              <Text style={styles.searchHeaderText}>Need help?</Text>
            </View>

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
            <Text style={styles.textButtonText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoriesList]}
          decelerationRate={0}
          snapToInterval={CARD_WIDTH + 8}
          snapToAlignment={"left"}
        >
          {chunkedCategories.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
                width: CARD_WIDTH,
              }}
            >
              {row.map((category) => (
                <CategoriesContainer key={category.id} category={category} />
              ))}
            </View>
          ))}
        </ScrollView>

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
            {randomFeeds.slice(0, 12).map((item) => (
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
