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
} from "react-native";
import { AuthContext, FeedContext } from "../_layout";
import FeedCardFeatured from "../../components/FeedCardFeatured";
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

function SearchIcon({ size, ...props }) {
  return <Feather size={size || 24} {...props} />;
}

function CloseIcon({ size, ...props }) {
  return <Feather size={size || 24} {...props} />;
}

export default function Explore() {
  const { feeds, popularFeeds, randomFeeds } = useContext(FeedContext);
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

  // Function for handling search input focus
  const handleClearInput = useCallback(() => {
    setSearchInput("");
    setParserInput("");
    setIsSearchInputSelected(false);
    setIsSearching(false);
    Keyboard.dismiss();
  }, []);

  const handleFocus = useCallback(() => {
    setTextInputFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTextInputFocused(false);
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
        console.log(error);
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

            return titleMatch || urlMatch || descriptionMatch;
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
      marginBottom: 16,
    },
    popularChannelList: {
      paddingHorizontal: 16,
      display: "flex",
      flexDirection: "column",
      width: "100%",
    },

    inputWrapper: {
      paddingHorizontal: 16,
      width: "100%",
      paddingBottom: 12,
      paddingTop: 8,
      // borderWidth: 1,
      // borderColor: "green",
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
      // borderWidth: 1,
      // borderColor: "red",
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
      marginBottom: 16,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      borderBottomWidth: 1,
      paddingBottom: 24,
      paddingHorizontal: 16,
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
      paddingVertical: 12,
      gap: 3,
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
          onBlur={handleBlur}
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
                <FeedCard key={item.id} item={item} user={user} />
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
            <View style={[styles.searchResultsList]}>
              <View style={styles.noResultsHeader}>
                <Text style={styles.noResultsHeaderText}>
                  {isSearchInputSelected && searchInput == null
                    ? "Can't find your feed?"
                    : "Looking for a feed?"}
                </Text>
              </View>
              <View style={styles.noResultsTextWrapper}>
                <Text style={styles.noResultsText}>
                  Simply enter your RSS Feed's URL to add it. For example:{" "}
                  <Text style={styles.noResultsTextBold}>
                    nasa.gov/rss/breaking_news.rss
                  </Text>
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
        style={textInputFocused || searchInput.length > 0 ? { display: "none" } : {}}
        ref={ref}
      >
        <View style={styles.headerWrapper}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Random Feeds</Text>
            <TouchableOpacity
              style={styles.textButton}
              onPress={() => {
                router.push({
                  pathname: "/allRandomFeeds",
                });
              }}
            >
              <Text style={styles.textButtonText}>View more</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerSubtitle}>
            {randomFeeds != null
              ? "Explore some randomly selected feeds."
              : "Loading..."}
          </Text>
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
            {popularFeeds != null
              ? "Follow some of our most popular feeds."
              : "Loading..."}
          </Text>
        </View>
        {popularFeeds != null ? (
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
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                }}
              >
                {chunk.map((item) => (
                  <FeedCard key={item.id} item={item} user={user} />
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.randomChannelList]}
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
