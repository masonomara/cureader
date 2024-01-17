import { useContext } from "react";
import { FeedContext } from "./_layout";
import {
  Text,
  useColorScheme,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { View } from "../components/Themed";
import Colors from "../constants/Colors";
import { FlashList } from "@shopify/flash-list";
import { Image } from "react-native";
import CategoriesContainer from "../components/CategoriesContainer";

export default function TabOneScreen() {
  const { feedCategories, feeds } = useContext(FeedContext);

  const CARD_WIDTH = Dimensions.get("window").width - 32;

  const colorScheme = useColorScheme();



  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    feedList: {
      width: "100%",

      maxWidth: "100%",
      minWidth: "100%",
      flex: 1,
      paddingHorizontal: 0,
    },
    headerWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      paddingTop: 41,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
    },
    categoriesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      marginBottom: 38,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      rowGap: 8,
      overflow: "hidden",
    },
    categoryWrapper: {
      width: CARD_WIDTH / 2 - 4,
      borderWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      flexDirection: "column",
      overflow: "hidden",
    },
    categoryImagesWrapper: {
      aspectRatio: 5 / 3,
      width: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      backgroundColor: "white",
    },
    categoryImageWrapperSingle: {
      aspectRatio: 5 / 3,
      width: "100%",
      overflow: "hidden",
    },

    categoryTitleWrapper: {
      overflow: "hidden",
      flex: 1,
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 10,
      paddingVertical: 13,
    },
    categoryTitle: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
      textAlign: "left",
      width: "100%",
    },

    categorySubTitle: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
      minHeight: 36,
    },
    flashList: {
      display: "flex",
      flexDirection: "column",
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.feedList}>
        <ScrollView
          contentContainerStyle={styles.flashList}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.headerWrapper}>
            <Text style={styles.title}>Categories</Text>
          </View>

          <View style={styles.categoriesContainer}>
            {feedCategories
              .sort((a, b) => b.channels.length - a.channels.length)

              .map((category) => {
                const filteredFeeds = feeds
                  .filter(
                    (feed) =>
                      feed.channel_categories &&
                      feed.channel_categories.includes(category.title) &&
                      feed.channel_image_url
                  )
                  .sort(
                    (a, b) =>
                      b.channel_subscribers.length -
                      a.channel_subscribers.length
                  );
                if (category.channels && category.channels.length > 0) {
                  return (
                    <CategoriesContainer
                      key={category.id}
                      category={category}
                      feeds={feeds}
                      router={router}
                    />
                  );
                } else {
                  return null;
                }
              })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
