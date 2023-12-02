import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { SearchBar } from "react-native-elements";

function SearchIcon(props) {
  return <Feather size={24} {...props} />;
}
function CloseIcon(props) {
  return <Feather size={24} {...props} />;
}

export default function Explore() {
  const colorScheme = useColorScheme();
  const CARD_WIDTH = Dimensions.get("window").width - 32;

  const [user, setUser] = useState(null);
  const [feeds, setFeeds] = useState([]);

  const [randomFeeds, setRandomFeeds] = useState([]);

  const [userChannelIds, setUserChannelIds] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [dbInput, setDbInput] = useState("");

  const [isSearchInputSelected, setIsSearchInputSelected] = useState(false);
  const textInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [focusEffectCompleted, setFocusEffectCompleted] = useState(false); // Track if useFocusEffect has completed

  const handleFocus = () => {
    setIsSearchInputSelected(true);
  };

  const handleBlur = () => {
    setIsSearchInputSelected(false);
  };

  const handleClearInput = () => {
    if (textInputRef.current) {
      textInputRef.current.clear();
      textInputRef.current.blur(); // Remove focus
    }
  };

    // Handle search input change
    const handleSearchInput = (searchInput) => {
      searchInput = searchInput.trim();
      let moddedSearchInput = "";
  
  
      setDbInput(moddedSearchInput);
      setSearchInput(searchInput);
    };

  // Fetch user information and all feed channels — setting [feeds] and [user]
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: userResponse } = await supabase.auth.getUser();
        const user = userResponse ? userResponse.user : null;
        setUser(user);

        const { data: channelsData, error } = await supabase
          .from("channels")
          .select("*")
          .order("channel_subscribers", { ascending: false });

        if (error) {
          console.error("Error fetching channels:", error);
          return;
        }

        setFeeds(channelsData);

        if (user) {
          const channelIds = await fetchUserChannels(user);
          setUserChannelIds(channelIds);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Creating random feeds — setting [randomFeeds]
  // NOTE: change from 4 to 33 later, change from 5 to 34 later
  useEffect(() => {
    if (feeds.length > 4) {
      const randomFeedsSlice = shuffleArray(feeds.slice(4));
      setRandomFeeds(randomFeedsSlice.slice(0, 5));
    }
  }, [feeds]);

  // Fetch user channels when the screen comes into focus and mark useFocusEffect as completed — setting [userChannelIds]
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
    inputText: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
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
              style={styles.input}
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

          {isSearchInputSelected ? (
            <View>
              <Text>Nut</Text>
            </View>
          ) : (
            ""
          )}

          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Random Feeds</Text>
            <TouchableOpacity style={styles.textButton}>
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
              {chunkArray(feeds.slice(0, 4), 3).map((chunk, index) => (
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
