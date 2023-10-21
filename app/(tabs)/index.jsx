import { StyleSheet, FlatList } from "react-native";
import { Text, View } from "../../components/Themed";
import * as rssParser from "react-native-rss-parser";
import { useState, useEffect } from "react";
import ArticleCard from "../../components/ArticleCard";

export default function TabOneScreen() {
  const [rss, setRss] = useState([]);

  useEffect(() => {
    fetch("http://www.nasa.gov/rss/dyn/breaking_news.rss")
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((parsedRss) => {
        setRss(parsedRss.items);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={rss}
        style={styles.articleList}
        renderItem={({ item }) => {
          return <ArticleCard item={item} />;
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
