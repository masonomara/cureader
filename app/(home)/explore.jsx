import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import { AuthContext } from "../_layout";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import {
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ChannelCardFeatured from "../../components/ChannelCardFeatured";
import ChannelCard from "../../components/ChannelCard";
import { supabase } from "../../config/initSupabase";
import Colors from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import * as rssParser from "react-native-rss-parser";
import ChannelCardSearchPreview from "../../components/ChannelCardSearchPreview";

function SearchIcon({ size, ...props }) {
  return <Feather size={size || 24} {...props} />;
}

function CloseIcon({ size, ...props }) {
  return <Feather size={size || 24} {...props} />;
}

export default function Explore() {
  const colorScheme = useColorScheme();
  const CARD_WIDTH = Dimensions.get("window").width - 32;
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [focusEffectCompleted, setFocusEffectCompleted] = useState(false); // Track if useFocusEffect has completed

  const { session, user } = useContext(AuthContext);
  const [userChannelIds, setUserChannelIds] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [randomFeeds, setRandomFeeds] = useState([]);

  const textInputRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");
  const [parserInput, setParserInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchInputSelected, setIsSearchInputSelected] = useState(false);

  const [channelUrl, setChannelUrl] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelImageUrl, setChannelImageUrl] = useState("");

  const [channelTitleWait, setChannelTitleWait] = useState(false);
  const [channelUrlError, setChannelUrlError] = useState(null);

  // Function for handling search input focus
  const handleFocus = () => {
    setIsSearchInputSelected(true);
  };

  // Function for handling seach input blur
  const handleBlur = () => {
    setIsSearchInputSelected(false);
  };

  // Function for clearing the search input
  const handleClearInput = () => {
    setSearchInput("");
    setParserInput("");
  };

  // Function for handling when there is search input change
  const handleSearchInput = (searchInput) => {
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

    setChannelTitleWait(true);
    setParserInput(moddedSearchInput);
    setSearchInput(searchInput);
  };

  // Handles API request for channel information
  useEffect(() => {
    const delayTimer = setTimeout(async () => {
      try {
        const response = await Promise.race([
          fetch(parserInput), //change: parserInput
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request Timeout")), 10000)
          ),
        ]);
        if (!response.ok) {
          throw new Error("API Request - Network response was not ok");
        }
        const responseData = await response.text();
        const parsedRss = await rssParser.parse(responseData);
        setChannelTitle(parsedRss.title);
        console.log("channelTitle:", channelTitle);
        setChannelUrl(parserInput);
        setChannelDescription(parsedRss.description);
        setChannelImageUrl(parsedRss.image.url);
        setChannelTitleWait(false);
      } catch (error) {
        console.log(error);
        setChannelTitle(null);
        setChannelTitleWait(false);
        setChannelDescription(null);
        setChannelImageUrl(null);
      }
    }, 150);

    return () => clearTimeout(delayTimer);
  }, [parserInput]);

  // Submit channel URL to Supabase
  const handleSubmitUrl = async (e) => {
    e.preventDefault();

    if (!channelUrl) {
      showErrorAlert("Please fill in the field correctly");
      return;
    }

    try {
      // Fetch the channel title
      const response = await fetch(channelUrl);

      if (!response.ok) {
        throw new Error(
          "Network response was not ok, could not fetch channelUrl"
        );
      }

      // Check if the channel already exists
      const { data: existingChannelData, error: existingChannelError } =
        await supabase.from("channels").select().eq("channel_url", channelUrl);

      if (existingChannelError) {
        showErrorAlert("Error checking channel data. Please try again.");
        return;
      }

      if (existingChannelData.length > 0) {
        const existingChannel = existingChannelData[0];
        if (!existingChannel.channel_subscribers) {
          existingChannel.channel_subscribers = []; // Create an empty subscribers array
        }

        if (existingChannel.channel_subscribers.includes(user.id)) {
          showErrorAlert("You are already subscribed to this channel.");
        } else {
          const newSubscribers = [
            ...existingChannel.channel_subscribers,
            user.id,
          ];
          const { data: updateData, error: updateError } = await supabase
            .from("channels")
            .upsert([
              {
                id: existingChannel.id,
                channel_subscribers: newSubscribers,
              },
            ]);

          if (updateError) {
            showErrorAlert("Error updating channel data. Please try again.");
          } else {
            //showErrorAlert("Success", "You have subscribed to the channel.");

            const channelId = existingChannel.id;
            const channelUrl = existingChannel.channel_url;

            // Fetch the user's existing channel subscriptions

            const { data: userProfileData, error: userProfileError } =
              await supabase
                .from("profiles")
                .select("channel_subscriptions")
                .eq("id", user.id);

            if (userProfileError) {
              showErrorAlert(
                "Error fetching user profile data. Please try again."
              );
            } else {
              const existingSubscriptions =
                userProfileData[0].channel_subscriptions || [];

              // Create a new subscription object with channelId and channelUrl
              const newSubscription = { channelId, channelUrl };

              // Add the new subscription to the existing subscriptions
              const newSubscriptions = [
                ...existingSubscriptions,
                newSubscription,
              ];

              // Update the user profile with the updated subscriptions
              const { data: updatedProfileData, error: updatedProfileError } =
                await supabase.from("profiles").upsert([
                  {
                    id: user.id,
                    channel_subscriptions: newSubscriptions,
                  },
                ]);

              if (updatedProfileError) {
                showErrorAlert(
                  "Error updating user profile. Please try again."
                );
              } else {
                //showErrorAlert("Success", "Profile subscription successfully updated");
              }
            }
          }
        }
      } else {
        // Create a new channel entry
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .upsert([
            {
              channel_url: channelUrl,
              channel_title: channelTitle,
              channel_subscribers: [user.id], // Create an array with the user's ID
              channel_image_url: channelImageUrl,
              channel_description: channelDescription,
            },
          ])
          .select()
          .single();

        if (channelError) {
          showErrorAlert("Error uploading channel data. Please try again.");
        } else {
          // showErrorAlert("Success", "Channel data uploaded successfully.");

          const channelId = channelData.id;
          const channelUrl = channelData.channel_url;

          // Fetch the user's existing channel subscriptions

          const { data: userProfileData, error: userProfileError } =
            await supabase
              .from("profiles")
              .select("channel_subscriptions")
              .eq("id", user.id);

          if (userProfileError) {
            showErrorAlert(
              "Error fetching user profile data. Please try again."
            );
          } else {
            const existingSubscriptions =
              userProfileData[0].channel_subscriptions || [];

            // Create a new subscription object with channelId and channelUrl
            const newSubscription = { channelId, channelUrl };

            // Add the new subscription to the existing subscriptions
            const newSubscriptions = [
              ...existingSubscriptions,
              newSubscription,
            ];

            // Update the user profile with the updated subscriptions
            const { data: updatedProfileData, error: updatedProfileError } =
              await supabase.from("profiles").upsert([
                {
                  id: user.id,
                  channel_subscriptions: newSubscriptions,
                },
              ]);

            if (updatedProfileError) {
              showErrorAlert("Error updating user profile. Please try again.");
            } else {
              // showErrorAlert("Success", "Profile subscription successfully updated");
            }
          }
        }
      }

      setChannelUrl("");
      setChannelTitle("");
      setChannelDescription("");
      setChannelImageUrl("");
      setParserInput("");
      setSearchInput("");
      setChannelTitleWait(false);
      setChannelUrlError(null);
    } catch (error) {
      console.error("Error fetching or uploading channel data:", error);

      if (error.message.includes("suitable URL request handler found")) {
        console.log(
          "Ignoring the 'no suitable URL request handler found' error."
        );
        // Optionally display a user-friendly message to the user or take appropriate action.
      } else {
        showErrorAlert(
          "Error fetching or uploading channel data. Please try again."
        );
      }
    }
  };

  // Fetches user information and all feed channels — sets [feeds]
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: channelsData, error } = await supabase
          .from("channels")
          .select("*")
          .order("channel_subscribers", { ascending: false });

        if (error) {
          console.error("Error fetching channels:", error);
          // You might want to show a user-friendly error message here.
          return;
        }

        setFeeds(channelsData);
        console.log(feeds);

        if (user) {
          const channelIds = await fetchUserChannels(user);
          setUserChannelIds(channelIds);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle unexpected errors here, e.g., show a generic error message.
      }
    }

    fetchData();
  }, []);

  // Creates search results that match the user's search input — sets [searchResults]
  useEffect(() => {
    const filterResults = () => {
      if (searchInput !== "") {
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

        setSearchResults(filteredFeeds.slice(0, 3));
      } else {
        setSearchResults([]);
      }
    };

    filterResults();
  }, [searchInput, feeds]);

  // Creates random feeds — sets [randomFeeds]
  useEffect(() => {
    if (feeds.length > 33) {
      const randomFeedsSlice = shuffleArray(feeds.slice(33));
      setRandomFeeds(randomFeedsSlice.slice(0, 34));
    }
  }, [feeds]);

  // Fetches user channels when the screen comes into focus and marks useFocusEffect as completed — sets [userChannelIds]
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserChannels(user).then((channelIds) => {
          setUserChannelIds(channelIds);
          setFocusEffectCompleted(true);
        });
      }
    }, [user])
  );

  // Function to fetch user channels
  const fetchUserChannels = async (user) => {
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

      if (userProfileError) {
        console.error("Error fetching user profile data:", userProfileError);
        // Handle specific error cases, show user-friendly messages.
        return [];
      }

      const channelSubscriptions =
        userProfileData[0].channel_subscriptions || [];
      const channelIds = channelSubscriptions.map(
        (subscription) => subscription.channelId
      );
      return channelIds;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      // Handle unexpected errors here, e.g., show a generic error message.
      return [];
    }
  };

  // Function to chunk an array
  const chunkArray = (arr, chunkSize) => {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunkedArray.push(arr.slice(i, i + chunkSize));
    }
    return chunkedArray;
  };

  // Function to shuffle an array randomly
  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex,
      temporaryValue;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  const styles = {
    container: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      flexDirection: "column",
      width: "100%",
    },
    randomChannelList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 24,
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
      paddingBottom: 16,
      marginTop: -3,
    },
    searchIcon: {
      position: "absolute",
      left: 32,
      top: 16,
      zIndex: 2,
      pointerEvents: "none",
    },
    closeIconWrapper: {
      position: "absolute",
      right: 24,
      zIndex: 2,
      height: 56,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      flex: 1,
      borderRadius: 20,
      height: 56,
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
    },

    searchHeader: {
      borderBottomWidth: 1,
      paddingBottom: 7,
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
      paddingTop: 20,
      paddingHorizontal: 16,
    },
    noResultsHeader: {
      paddingBottom: 3,
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
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.22,
    },
    textButton: {
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    textButtonText: {
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      color: `${Colors[colorScheme || "light"].colorPrimary}`,
    },
    loadingContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Conditionally render content based on focusEffectCompleted */}
      {focusEffectCompleted ? (
        <>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Feed Search</Text>
          </View>
          <View style={styles.inputWrapper}>
            <SearchIcon
              name="search"
              color={`${Colors[colorScheme || "light"].textPlaceholder}`}
              style={styles.searchIcon}
            />
            <TextInput
              ref={textInputRef}
              style={[
                styles.input,
                isSearchInputSelected && styles.inputSelected,
              ]}
              value={searchInput}
              label="Channel Url Text"
              placeholder="Search for feed"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={handleSearchInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <TouchableOpacity
              style={[
                styles.closeIconWrapper,
                isSearchInputSelected ? { opacity: 1 } : { opacity: 0 },
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
          {/* <Text>Search Input: {searchInput}</Text>
                          <Text>Parser Input: {parserInput}</Text>
                          <Text>Channel Url: {channelUrl}</Text>
                          <Text>Channel Title: {channelTitle}</Text>
                          <Text numberOfLines={1}>
                            Channel Description: {channelDescription}
                          </Text>
                          <Text numberOfLines={1}>
                            Channel Image URL: {channelImageUrl}
                          </Text> */}
          {isSearchInputSelected && searchInput !== "" && (
            <View style={styles.searchContainer}>
              <View style={styles.searchHeader}>
                <Text style={styles.searchHeaderText}>
                  {searchResults.length > 0 || channelTitle
                    ? "Search Results"
                    : searchResults.length === 0 && channelTitleWait
                    ? "Searching..."
                    : "No Search Results Found"}
                </Text>
              </View>

              {searchResults.length > 0 && (
                <View
                  showsHorizontalScrollIndicator={false}
                  style={[styles.searchResultsList]}
                  decelerationRate={0}
                  snapToInterval={CARD_WIDTH + 8}
                  snapToAlignment={"left"}
                >
                  {searchResults.map((item) => (
                    <ChannelCard
                      key={item.id}
                      item={item}
                      user={user}
                      feeds={feeds}
                      userChannelIds={userChannelIds}
                    />
                  ))}
                </View>
              )}

              <View style={!channelTitle ? styles.noResultsWrapper : undefined}>
                {!channelTitle && (
                  <>
                    {searchResults.length === 0 && channelTitleWait ? (
                      <ActivityIndicator
                        color={`${Colors[colorScheme || "light"].buttonActive}`}
                      />
                    ) : (
                      <>
                        <View style={styles.noResultsHeader}>
                          <Text style={styles.noResultsHeaderText}>
                            Can't find your feed?
                          </Text>
                        </View>
                        <View style={styles.noResultsTextWrapper}>
                          <Text style={styles.noResultsText}>
                            Simply enter your RSS Feed's URL to add it. For
                            example:{" "}
                            <Text style={styles.noResultsTextBold}>
                              nasa.gov/rss/breaking_news.rss
                            </Text>
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {searchResults.length === 0 &&
                  !channelTitleWait &&
                  channelTitle && (
                    <ChannelCardSearchPreview
                      channelUrl={channelUrl}
                      channelTitle={channelTitle}
                      channelDescription={channelDescription}
                      channelImageUrl={channelImageUrl}
                      user={user}
                    />
                  )}
              </View>
            </View>
          )}

          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Random Feeds</Text>
            <TouchableOpacity
              style={styles.textButton}
              onPress={() => {
                router.push({
                  pathname: "/allRandomFeeds",
                  params: {
                    feed: randomFeeds,
                    user: user,
                  },
                });
              }}
            >
              <Text style={styles.textButtonText}>View more</Text>
            </TouchableOpacity>
          </View>

          {randomFeeds.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.randomChannelList}
              decelerationRate={0}
              snapToInterval={CARD_WIDTH + 8} //your element width
              snapToAlignment={"left"}
            >
              {randomFeeds.map((item) => (
                <ChannelCardFeatured
                  key={item.id}
                  item={item}
                  user={user}
                  subscribed={userChannelIds.includes(item.id)}
                  feeds={feeds}
                  userChannelIds={userChannelIds}
                />
              ))}
            </ScrollView>
          ) : (
            <Text>Loading...</Text>
          )}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Popular Feeds</Text>
            <TouchableOpacity style={styles.textButton}>
              <Text style={styles.textButtonText}>View more</Text>
            </TouchableOpacity>
          </View>

          {feeds ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.randomChannelList]}
              decelerationRate={0}
              snapToInterval={CARD_WIDTH + 8}
              snapToAlignment={"left"}
            >
              {chunkArray(feeds.slice(0, 33), 3).map((chunk, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    borderTopWidth: 1,
                    borderColor: `${Colors[colorScheme || "light"].border}`,
                  }}
                >
                  {chunk.map((item) => (
                    <ChannelCard
                      key={item.id}
                      item={item}
                      user={user}
                      feeds={feeds}
                      userChannelIds={userChannelIds}
                    />
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
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme || "light"].colorPrimary}
          />
        </View>
      )}
    </ScrollView>
  );
}
