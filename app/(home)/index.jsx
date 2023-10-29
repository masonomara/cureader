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

  const [channelUrl, setChannelUrl] = useState("");
  const [channelTitleWait, setChannelTitleWait] = useState(false);
  const [channelUrlError, setChannelUrlError] = useState(null);
  const [channelTitle, setChannelTitle] = useState(""); // State for the fetched title

  // Add a state to track the current input value
  const [currentInput, setCurrentInput] = useState("");

  // Redirect based on if user exists
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

  useEffect(() => {
    // Create a timer to delay the API request
    const delayTimer = setTimeout(async () => {
      try {
        const response = await Promise.race([
          fetch(currentInput), // Your fetch request
          new Promise(
            (_, reject) =>
              setTimeout(() => reject(new Error("Request Timeout")), 10000) // Timeout after 10 seconds
          ),
        ]);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.text();
        const parsedRss = await rssParser.parse(responseData);
        setChannelTitle(parsedRss.title);

        setChannelTitleWait(false);
      } catch (error) {
        console.log(error);
        setChannelTitle(null);
        setChannelTitleWait(false);
      }
    }, 150); // Adjust the delay as needed (e.g., 1000ms)

    // Clear the timer if the input changes again before the delay
    return () => clearTimeout(delayTimer);
  }, [currentInput]);

  // Modify the handleChangechannelUrl function
  const handleChangechannelUrl = (channelUrl) => {
    setChannelTitleWait(true);
    setChannelUrl(channelUrl);
    setCurrentInput(channelUrl); // Update the current input state
  };

  // Submit channel url to Supabase
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

      const responseData = await response.text();
      const parsedRss = await rssParser.parse(responseData);
      const fetchedChannelTitle = parsedRss.title;

      // Insert both channelUrl and channelTitle into the Supabase table
      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .upsert([
          {
            channelUrl: channelUrl,
            channelTitle: fetchedChannelTitle,
          },
        ]);

      if (channelError) {
        console.log("Channel Url error:", channelError);
        showErrorAlert("Error uploading channel data. Please try again.");
      } else {
        console.log("Channel Url data:", channelData);

        {
          /*
        showErrorAlert("Success", "Channel data uploaded successfully.");
        setChannelUrlError(null);
        setChannelUrl("");
        setCurrentInput("");
        setChannelTitle(null);
        setChannelTitleWait(false);
      */
        }

        // const { user } = supabase.auth.session();

        if (user) {
          // Add the user to the list of subscribers for this channel
          const { data: subscriberData, error: subscriberError } =
            await supabase.from("channel_subscribers").upsert([
              {
                channel_id: channelData[0].id, // Assuming the id of the inserted channel is channelData[0].id
                user_id: user.id,
                channel_subscribers: supabase
                  .from("channels")
                  .select("channel_subscribers")
                  .eq("channelUrl", channelUrl)
                  .single()
                  .then((res) => {
                    // Get the current subscribers array, or initialize an empty array
                    const currentSubscribers = res
                      ? res.channel_subscribers
                      : [];
                    // Add the user ID to the subscribers array
                    if (user) {
                      currentSubscribers.push(user.id);
                    }
                    return currentSubscribers;
                  }),
              },
            ]);

          if (subscriberError) {
            console.log("Subscriber error:", subscriberError);
            showErrorAlert(
              "Error subscribing to the channel. Please try again."
            );
          } else {
            console.log("Subscriber data:", subscriberData);

            // Add the channel URL to the list of subscribed channels for the user
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .upsert([
                {
                  user_id: user.id,
                  subscribed_channels: [channelUrl],
                },
              ]);

            if (profileError) {
              console.log("Profile error:", profileError);
              showErrorAlert("Error updating user profile. Please try again.");
            } else {
              console.log("Profile data:", profileData);
              showErrorAlert("Success", "Channel data uploaded successfully.");
              setChannelUrlError(null);
              setChannelUrl("");
              setCurrentInput("");
              setChannelTitle(null);
              setChannelTitleWait(false);
            }
          }
        }
      }
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
      <View>
        <Text numberOfLines={20}>{JSON.stringify(user, null, 2)}</Text>
        <TouchableOpacity onPress={doLogout}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        label="Channel Url Text"
        onChangeText={handleChangechannelUrl}
        value={channelUrl}
        placeholder="https://"
        autoCapitalize={"none"}
        autoCorrect={false}
      />

      {!channelTitleWait ? (
        <>
          {channelTitle ? (
            <Text>{channelTitle}</Text>
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
        disabled={!channelTitle} // Disable when channelTitle is falsy
        style={channelTitle ? styles.button : styles.buttonDisabled} // Apply styles conditionally
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
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
