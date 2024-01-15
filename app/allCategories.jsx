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

export default function TabOneScreen() {
  const { feedCategories, feeds } = useContext(FeedContext);

  const CARD_WIDTH = Dimensions.get("window").width - 32;

  const colorScheme = useColorScheme();

  console.log(feedCategories);

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
      paddingVertical: 12,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      height: 86,
    },
    titleWrapper: {
      width: "100%",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    headerSubtitle: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 24,
      lineHeight: 31,
      letterSpacing: -0.24,
    },
    categoriesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      marginBottom: 20,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      overflow: "hidden",
      marginTop: 4,
    },
    categoryWrapper: {
      width: CARD_WIDTH / 2 - 4,
      borderWidth: 1,

      borderColor: `${Colors[colorScheme || "light"].border}`,
      // backgroundColor: Colors[colorScheme || "light"].surfaceOne,
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
      padding: 12,
      paddingVertical: 12,
    },
    categoryTitle: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      textAlign: "left",
      width: "100%",
    },
    categorySubtitle: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 15,
      letterSpacing: -0.15,
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
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>Categories</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Browse popular feeds and categories.
            </Text>
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
                    <Pressable
                      key={category.id}
                      style={styles.categoryWrapper}
                      onPress={() =>
                        router.push({
                          pathname: "/categoryView",
                          params: {
                            title: category.title,
                            channels: category.channels,
                            id: category.id,
                            feeds: filteredFeeds,
                          },
                        })
                      }
                    >
                      <View style={styles.categoryImagesWrapper}>
                        {filteredFeeds.slice(0, 1).map((feed, index) => (
                          <View
                            key={feed.id}
                            style={styles.categoryImageWrapperSingle}
                          >
                            <Image
                              style={{
                                flex: 1,
                              }}
                              contentFit="cover"
                              source={{ uri: feed.channel_image_url }}
                            />
                          </View>
                        ))}
                      </View>
                      <View style={styles.categoryTitleWrapper}>
                        <Text
                          style={styles.categoryTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {category.title}
                        </Text>
                      </View>
                    </Pressable>
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
