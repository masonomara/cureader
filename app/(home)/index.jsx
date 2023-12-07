import React, { useState, useEffect, useContext } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";
import { AuthContext } from "../_layout";

export default function Index() {
  const { session } = useContext(AuthContext);

  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [user, setUser] = useState(null);

  // State for handling channel URL input
  const [userInput, setUserInput] = useState("");
  const [parserInput, setParserInput] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelImageUrl, setChannelImageUrl] = useState("");

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

  // Function for handling user input change
  const handleUserInput = (userInput) => {
    userInput = userInput.trim();
    let moddedUserInput = "";

    if (
      userInput === "" ||
      userInput.startsWith("https://") ||
      userInput.startsWith("http://")
    ) {
      moddedUserInput = userInput;
    } else if (userInput.startsWith("http://")) {
      moddedUserInput = "https://" + userInput.slice(7);
    } else if (!userInput.startsWith("https://")) {
      moddedUserInput = "https://" + userInput;
    }

    setChannelTitleWait(true);
    setParserInput(moddedUserInput);
    setUserInput(userInput);
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
            showErrorAlert("Success", "You have subscribed to the channel.");

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
                showErrorAlert(
                  "Success",
                  "Profile subscription successfully updated"
                );
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
          showErrorAlert("Success", "Channel data uploaded successfully.");

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
              showErrorAlert(
                "Success",
                "Profile subscription successfully updated"
              );
            }
          }
        }
      }

      setChannelUrl("");
      setChannelTitle("");
      setChannelDescription("");
      setChannelImageUrl("");
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

  // Use the Supabase client to query the "profiles" table and get the channel_subscriptions array
  const getChannelSubscriptions = async () => {
    try {
      if (user) {
        // Check if user is defined and authenticated
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("channel_subscriptions")
          .eq("id", user.id);

        if (profileError) {
          console.error("Error fetching user profile data:", profileError);
          return [];
        } else {
          const channelSubscriptions =
            profileData[0]?.channel_subscriptions || [];
          const channelUrls = channelSubscriptions.map(
            (subscription) => subscription.channelUrl
          );
          return channelUrls;
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
      return [];
    }
  };

  // Use the Supabase client to query the "channels" table and get the channel_image_url items
  const getFallbackImages = async () => {
    try {
      if (user) {
        // Check if user is defined and authenticated
        const feedUrls = await getChannelSubscriptions();

        const { data: fallbackImageData, error: fallbackImageError } =
          await supabase
            .from("channels")
            .select("channel_url, channel_image_url")
            .in("channel_url", feedUrls);

        if (fallbackImageError) {
          console.error("Error fetching fallback images:", fallbackImageError);
          return [];
        } else {
          return fallbackImageData || [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching fallback images:", error);
      return [];
    }
  };

  // Parse feeds
  useEffect(() => {
    const fetchAndParseFeeds = async () => {
      if (user) {
        const feedUrls = await getChannelSubscriptions();
        const fallbackImages = await getFallbackImages();

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

            // console.log("FALLBACKIMAGES:", fallbackImages)
            // console.log("FEEDURLS:", feedUrls)

            const channelImage = fallbackImages.find(
              (image) => image.channel_url === url
            );

            allChannels.push({
              title: parsedRss.title,
              description: parsedRss.description,
            });

            allItems.push(
              ...parsedRss.items.map((item) => ({
                ...item,
                publicationDate: new Date(item.published),
                channel: parsedRss.title,
                image: parsedRss.image,
                fallbackImage: channelImage
                  ? channelImage.channel_image_url
                  : null,
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
      }
    };

    fetchAndParseFeeds();
  }, [user]);

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
        <Text numberOfLines={4}>{JSON.stringify(session, null, 2)}</Text>
        <TouchableOpacity onPress={doLogout}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Input for channel URL */}

      {/*<TextInput
        style={styles.input}
        label="Channel Url Text"
        onChangeText={handleUserInput}
        value={userInput}
        placeholder="https://"
        autoCapitalize={"none"}
        autoCorrect={false}
  /> */}

      {/* Channel title and submit button */}
      {/*
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
      <Text numberOfLines={1}>Channel Description: {channelDescription}</Text>
      <Text numberOfLines={1}>Channel Image URL: {channelImageUrl}</Text>
      */}

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
              fallbackImage={item.fallbackImage}
              channelUrl={item.channelUrl}
              user={user}
            />
          );
        }}
      />
    </View>
  );
}
