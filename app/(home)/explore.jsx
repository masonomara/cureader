import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
  Dimensions,
} from "react-native";
import ChannelCardFeatured from "../../components/ChannelCardFeatured";
import ChannelCard from "../../components/ChannelCard";
import { supabase } from "../../config/initSupabase";
import Colors from "../../constants/Colors";

export default function Explore() {
  const colorScheme = useColorScheme();
  const CARD_WIDTH = Dimensions.get("window").width - 32;
  const [user, setUser] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [randomFeeds, setRandomFeeds] = useState([]);
  const [userChannelIds, setUserChannelIds] = useState([]);

  // Function to fetch all entries in the "channels" table
  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("channel_subscribers", { ascending: false });

      if (error) {
        console.error("Error fetching channels:", error);
        return [];
      } else {
        return data;
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      return [];
    }
  };

  // Function to fetch all channels user is subscribed to
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
      console.log("CHANNEL IDS:", channelIds);
      return channelIds;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return [];
    }
  };

  // Fetch user information and user's channel subscriptions
  useEffect(() => {
    // Fetch user information
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  // Fetch channels and user's channel subscriptions
  useEffect(() => {
    const fetchData = async () => {
      const channelsData = await fetchChannels();
      setfeeds(channelsData);

      if (user) {
        const channelIds = await fetchUserChannels(user);
        setUserChannelIds(channelIds);
      }
    };

    fetchData();
  }, [user]);

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

  useEffect(() => {
    if (feeds.length > 4) {
      const randomFeedsSlice = shuffleArray(feeds.slice(4));
      setRandomFeeds(randomFeedsSlice.slice(0, 5));
    }
  }, [feeds]);


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
      flex: 1,
      width: "100%",
    },
    inputWrapper: {
      flex: 1,
      padding: 16,
      width: "100%",
    },
    input: {
      flex: 1,
      borderRadius: 20,
      height: 56,
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
    titleWrapper: {
      marginTop: 0,
      flex: 1,
      padding: 16,
      paddingBottom: 16,
      width: "100%",
      marginTop: 8,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.22,
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          label="Channel Url Text"
          placeholder="Search for channel placeholder"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Random Channels</Text>
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
              isSubscribed={userChannelIds.includes(item.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text>
      )}
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Popular Channels</Text>
      </View>

      {feeds ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.randomChannelList}
          decelerationRate={0}
          snapToInterval={CARD_WIDTH + 8} //your element width
          snapToAlignment={"left"}
        >
          {chunkArray(feeds.slice(0, 4), 3).map((chunk, index) => (
            <View
              key={index}
              style={{ flexDirection: "column", justifyContent: "flex-start" }}
            >
              {chunk.map((item) => (
                <ChannelCard
                  key={item.id}
                  item={item}
                  user={user}
                  isSubscribed={userChannelIds.includes(item.id)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
}
