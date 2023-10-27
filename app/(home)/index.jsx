import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  TextInput,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";
import { Input } from "react-native-elements";
import Colors from "../../constants/Colors";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const [rssChannels, setRssChannels] = useState([]);
  const [channelUrl, setChannelUrl] = useState("");
  const [channelUrlError, setChannelUrlError] = useState(null);
  const [rssItems, setRssItems] = useState([]);
  const [user, setUser] = useState(null);
  const [channelTitle, setChannelTitle] = useState(""); // State for the fetched title
  const [channelTitleWait, setChannelTitleWait] = useState(null)

  const handleChangeText = async (channelUrl) => {
    setChannelUrl(channelUrl);
    try {
      const response = await fetch(channelUrl);
      const responseData = await response.text();
      const parsedRss = await rssParser.parse(responseData);
      setChannelTitle(parsedRss.title); // Update the channel title state
    } catch (error) {
      setChannelTitleWait(true); // Set channelTitleWait to true to indicate loading
      setTimeout(() => {
        setChannelTitleWait(false); // Set channelTitleWait to false after a delay
        console.error(error);
        setChannelTitle("Error fetching title"); // Set an error message after an error
      }, 750); // 500 milliseconds (0.5 seconds)
    }
  };

  const handleSubmitUrl = async (e) => {
    e.preventDefault();

    if (!channelUrl) {
      setChannelUrlError("Please fill in the field corectly");
      return;
    }

    console.log(channelUrl);
  };

  // redirect based on if user exists
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace("(login)");
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
  };

  // parse feeds
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
        label="ChannelUrl"
        onChangeText={handleChangeText}
        value={channelUrl}
        placeholder="channel url"
        autoCapitalize={"none"}
        autoCorrect={false}
      />

{
  !channelTitleWait ? (
    <>
      <Text>Channel Url title: {channelTitle}</Text>
      <TouchableOpacity onPress={handleSubmitUrl} disabled={!channelTitle}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </>
  ) : (
    <ActivityIndicator color={`${Colors[colorScheme || "light"].buttonActive}`}/>
  )
}




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
