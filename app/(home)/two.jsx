import { StyleSheet, FlatList } from "react-native";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import { useState, useEffect } from "react";
import ChannelCard from "../../components/ChannelCard";

export default function TabOneScreen() {
  const [rssFeeds, setRssFeeds] = useState([]);

  useEffect(() => {

    const feedUrls = [
      "https://feeds.megaphone.fm/newheights",
      "https://podcastfeeds.nbcnews.com/RPWEjhKq",
      // Add more RSS feed URLs here
    ];

    const fetchAndParseFeeds = async () => {
      const allParsedFeeds = [];
      for (const url of feedUrls) {

        try {
          const response = await fetch(url);

          const responseData = await response.text();

          const parsedRss = await rssParser.parse(responseData);


          allParsedFeeds.push(parsedRss);
          // console.log("success:", allParsedFeeds)
        } catch (error) {
          console.error(error);
        }
      }
      setRssFeeds(allParsedFeeds);
    };

    fetchAndParseFeeds();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={rssFeeds}
        style={styles.articleList}
        renderItem={({ item }) => {
          return <ChannelCard item={item} publication={"NASA"} />;
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});