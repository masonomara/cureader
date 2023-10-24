import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase-client";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../../components/ArticleCard";

export default function TabOneScreen() {
  const [rssChannels, setRssChannels] = useState([]);
  const [rssItems, setRssItems] = useState([]);
  const [user, setUser] = useState(null);


  // redirect based on if user exists
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const doLogout = async () => {
    const {error} = await supabase.auth.signOut();
    router.replace("(login)");
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
  }


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

  return (
    <View style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text numberOfLines={4} >{JSON.stringify(user, null, 2)}</Text>
        <TouchableOpacity onPress={doLogout}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 16, borderTopWidth: 1, borderColor: 'black' }}>
        <Text numberOfLines={4} >{JSON.stringify(user, null, 2)}</Text>
        <TouchableOpacity onPress={doLogout}>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>
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
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  articleList: {
    paddingLeft: 24,
    width: "100%",
  },
});
