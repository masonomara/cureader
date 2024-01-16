import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  useColorScheme,
} from "react-native";
import Colors from "../constants/Colors.js";

function CategoriesContainer({ category, feeds, router }) {
  const colorScheme = useColorScheme();
  const CARD_WIDTH = Dimensions.get("window").width - 32;

  const styles = {
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
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
      minHeight: 36,
    },
  };

  const filteredFeeds = feeds
    .filter(
      (feed) =>
        feed.channel_categories &&
        feed.channel_categories.includes(category.title) &&
        feed.channel_image_url
    )
    .sort(
      (a, b) => b.channel_subscribers.length - a.channel_subscribers.length
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
            <View key={feed.id} style={styles.categoryImageWrapperSingle}>
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
          <Text
            style={styles.categorySubTitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {filteredFeeds
              .slice(0, 4)
              .map((feed) => feed.channel_title)
              .join(", ")}
          </Text>
        </View>
      </Pressable>
    );
  } else {
    return null;
  }
}

export default CategoriesContainer;
