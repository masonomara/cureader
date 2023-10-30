import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [user, setUser] = useState(null);

  // State for handling channel URL input
  const [userInput, setUserInput] = useState("");
  const [parserInput, setParserInput] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelTitle, setChannelTitle] = useState("");

  const [channelTitleWait, setChannelTitleWait] = useState(false);
  const [channelUrlError, setChannelUrlError] = useState(null);

  // Fetch user information
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  // Handle user input change
  const handleUserInput = (userInput) => {
    userInput = userInput.trim();
    if (userInput.startsWith("http://")) {
      moddedUserInput = "https://" + userInput.slice(7);
    } else if (!userInput.startsWith("https://")) {
      moddedUserInput = "https://" + userInput;
    }
    setChannelTitleWait(true);
    setParserInput(moddedUserInput);
    setUserInput(userInput);
  };

  // Handle API request for channel information
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
          throw new Error("Network response was not ok");
        }
        const responseData = await response.text();
        const parsedRss = await rssParser.parse(responseData);
        setChannelTitle(parsedRss.title);
        setChannelUrl(parsedRss.links[0].url);
        setChannelTitleWait(false);
      } catch (error) {
        console.log(error);
        setChannelTitle(null);
        setChannelTitleWait(false);
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
        throw new Error("Network response was not ok");
      }

      // Check if the channel already exists
      const { data: existingChannelData, error: existingChannelError } =
        await supabase.from("channels").select().eq("channel_url", channelUrl);

      if (existingChannelError) {
        console.log("Channel Url error:", existingChannelError);
        showErrorAlert("Error checking channel data. Please try again.");
        return;
      }

      if (existingChannelData.length > 0) {
        // Channel exists, check if the user is already subscribed
        const existingChannel = existingChannelData[0];
        if (existingChannel.channel_subscribers.includes(user.id)) {
          showErrorAlert("You are already subscribed to this channel.");
        } else {
          // User is not subscribed, add the user to the subscribers list
          const newSubscribers = [
            ...existingChannel.channel_subscribers,
            user.id,
          ];

          // Update the channel with the new subscribers
          const { data: updateData, error: updateError } = await supabase
            .from("channels")
            .upsert([
              {
                id: existingChannel.id,
                channel_subscribers: newSubscribers,
              },
            ]);

          if (updateError) {
            console.log("Channel Update Error:", updateError);
            showErrorAlert("Error updating channel data. Please try again.");
          } else {
            console.log("Channel Updated:", updateData);
            showErrorAlert("Success", "You have subscribed to the channel.");
          }
        }
      } else {
        // Channel doesn't exist, create a new entry
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .upsert([
            {
              channel_url: channelUrl,
              channel_title: channelTitle,
              channel_subscribers: [user.id], // Include the user's ID in the subscribers array
            },
          ]);

        if (channelError) {
          console.log("Channel Url error:", channelError);
          showErrorAlert("Error uploading channel data. Please try again.");
        } else {
          console.log("Channel Url data:", channelData);
          showErrorAlert("Success", "Channel data uploaded successfully.");
        }
      }

      setChannelUrl("");
      setChannelTitle("");
      setParserInput("");
      setUserInput("");
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

  // Logout user
  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace("(login)");
    if (error) {
      showErrorAlert("Error signing out: " + error.message);
    }
  };

  // Parse feeds
  useEffect(() => {
    const feedUrls = [
      "https://feeds.megaphone.fm/newheights",
      "http://www.nasa.gov/rss/dyn/breaking_news.rss",
      "https://podcastfeeds.nbcnews.com/RPWEjhKq",
      // Add more RSS feed URLs here
    ];

    const fetchAndParseFeeds = async () => {
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

          allChannels.push({
            title: parsedRss.title,
            description: parsedRss.description,
          });

          allItems.push(
            ...parsedRss.items.map((item) => ({
              ...item,
              publicationDate: new Date(item.published),
              channel: parsedRss.title, // Include the channel title in the item
              image: parsedRss.image,
              channelUrl: parsedRss.links[0].url,
            }))
          );
        } catch (error) {
          console.error(error);
          showErrorAlert("Error fetching RSS feeds. Please try again.");
        }
      };

      await Promise.all(feedUrls.map(parseAndSort));

      // Sort items by publication date in descending order (most recent first)
      allItems.sort((a, b) => b.publicationDate - a.publicationDate);

      setRssChannels(allChannels);
      setRssItems(allItems);
    };

    fetchAndParseFeeds();
  }, []);

  // Styles
  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    articleList: {
      width: "100%",
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
  };

  return (
    <View style={styles.container}>
      {/* User info and logout */}
      <View>
        <Text numberOfLines={4}>{JSON.stringify(user, null, 2)}</Text>
        <TouchableOpacity onPress={doLogout}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Input for channel URL */}
      <TextInput
        style={styles.input}
        label="Channel Url Text"
        onChangeText={handleUserInput}
        value={userInput}
        placeholder="https://"
        autoCapitalize={"none"}
        autoCorrect={false}
      />

      {/* Channel title and submit button */}
      {!channelTitleWait ? (
        <>
          {channelTitle ? (
            <>
              <Text>{channelTitle}</Text>
              <Text>{channelUrl}</Text>
            </>
          ) : channelUrl ? (
            <Text>Channel not found</Text>
          ) : (
            <></>
          )}
        </>
      ) : (
        <ActivityIndicator
          color={`${Colors[colorScheme || "light"].buttonActive}`}
        />
      )}
      <TouchableOpacity
        onPress={handleSubmitUrl}
        disabled={!channelTitle}
        style={channelTitle ? styles.button : styles.buttonDisabled}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <Text>User Input: {userInput}</Text>
      <Text>Parser Input: {parserInput}</Text>
      <Text>Channel Url: {channelUrl}</Text>
      <Text>Channel Title: {channelTitle}</Text>

      {/* List of articles */}
      <FlatList
        data={rssItems}
        keyExtractor={(item, index) => index.toString()}
        style={styles.articleList}
        renderItem={({ item }) => {
          return (
            <ArticleCard
              item={item}
              publication={item.channel}
              image={item.image}
              channelUrl={item.channelUrl}
              user={user}
            />
          );
        }}
      />
    </View>
  );
}
