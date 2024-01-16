import React, { useContext, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Share,
  Image as RNImage,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import Colors from "../constants/Colors";
import FeedCardToolTip from "./FeedCardTooltip";
import { AuthContext } from "../app/_layout";
import { supabase } from "../config/supabase";
import Share20 from "./icons/20/Share20";
import BookmarkOutline20 from "./icons/20/BookmarkOutline20";
import BookmarkFilled20 from "./icons/20/BookmarkFilled20";
import {
  formatPublicationDate,
  formatDescription,
} from "../app/utils/Formatting";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";

export default function ArticleCard({
  fallbackImage,
  feed,
  item,
  publication,
  user,
}) {
  const colorScheme = useColorScheme();

  const { userBookmarks, setUserBookmarks } = useContext(AuthContext);

  const [isBookmarked, setIsBookmarked] = useState(
    userBookmarks.some((bookmark) => bookmark.id === item.id)
  );

  useLayoutEffect(() => {
    setIsBookmarked(userBookmarks.some((bookmark) => bookmark.id === item.id));
  }, [userBookmarks, item]);

  const [imageWidth, setImageWidth] = useState(0);

  const imageUrl =
    (item.description?.match(/<img.*?src=['"](.*?)['"].*?>/)?.[1] ?? "") || "";

  const getImageSize = () => {
    RNImage.getSize(imageUrl, (width, height) => {
      setImageWidth(width);
    });
  };

  useLayoutEffect(() => {
    if (imageUrl) {
      getImageSize();
    }
  }, [imageUrl]);

  const _handlePressButtonAsync = async () => {
    try {
      await WebBrowser.openBrowserAsync(item.links[0].url);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  const onShare = () => {
    try {
      const result = Share.share({
        message: "I found this article on my Cureader app",
        url: item.links[0]?.url || "",
        tintColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      });
    } catch (error) {
      console.error("Error sharing:", error.message);
    }
  };

  const handleBookmark = async () => {
    const optimisticBookmark = !isBookmarked;
    setIsBookmarked(optimisticBookmark);

    try {
      const updatedUserBookmarks = optimisticBookmark
        ? [...userBookmarks, item]
        : userBookmarks.filter((bookmark) => bookmark !== item);

      setUserBookmarks(updatedUserBookmarks);

      await updateUserBookmarks(updatedUserBookmarks);
    } catch (error) {
      console.error("Error handling bookmark:", error);
      setIsBookmarked(!isBookmarked);
    }
  };

  const updateUserBookmarks = async (updatedBookmarks) => {
    try {
      await supabase
        .from("profiles")
        .update({
          bookmarks: updatedBookmarks.map((bookmark) => bookmark),
        })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error updating user bookmarks:", error);
      throw error;
    }
  };

  const renderCardControls = () => (
    <View style={styles.cardControls}>
      <View style={styles.cardButtons}>
        <TouchableOpacity style={styles.buttonWrapper} onPress={onShare}>
          <View style={styles.button}>
            <Share20
              style={styles.buttonImage}
              color={Colors[colorScheme || "light"].buttonActive}
            />
            <Text style={styles.buttonText}>Share</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonWrapper} onPress={handleBookmark}>
          <View style={styles.button}>
            {isBookmarked ? (
              <BookmarkFilled20
                style={styles.buttonImage}
                color={Colors[colorScheme || "light"].buttonActive}
              />
            ) : (
              <BookmarkOutline20
                style={styles.buttonImage}
                color={Colors[colorScheme || "light"].buttonActive}
              />
            )}
            <Text style={styles.buttonText}>Bookmark</Text>
          </View>
        </TouchableOpacity>
      </View>
      <FeedCardToolTip item={feed} />
    </View>
  );

  const styles = {
    card: {
      borderBottomWidth: 2,
      paddingTop: 24,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 11,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      maxwidth: 550,
    },
    iconWrapper: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    },

    icon: {
      height: 24,
      width: 24,
      borderRadius: 100,
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
    },
    cardContentWrapper: {
      display: "flex",
      paddingBottom: 0,
      flexDirection: "column",
      alignItems: "flex-start",
      flex: 1,
    },
    cardContentNoImage: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderWidth: 1,
      borderColor: "green",
    },
    cardContentWrapperNoImage: {
      display: "flex",
      flexDirection: "column",
      width: "66%",
      borderWidth: 1,
      borderColor: "blue",
    },
    publicationWrapperNoImage: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "flex-start",
      marginBottom: 6,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      borderWidth: 1,
      borderColor: "red",
    },
    publicationWrapper: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      marginBottom: 6,

      overflow: "hidden",
      height: 19,
      gap: 7,
    },
    publicationText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      maxWidth: "85%",
    },
    articleDate: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    title: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 2,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    description: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 27,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    cardControls: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      height: 44,
    },
    cardButtons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 8,
      alignSelf: "stretch",
      flexDirection: "row",
      flex: 1,
      height: 44,
    },
    buttonWrapper: {
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingRight: 12,
      paddingLeft: 10,
      borderColor: Colors[colorScheme || "light"].border,
      borderRadius: 100,
      backgroundColor: Colors[colorScheme || "light"].surfaceOne,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    noImageContainer: {
      height: 76,
      width: 76,
      borderRadius: 12,
      marginTop: 25.3,
      backgroundColor: getColorForLetter(publication),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 29,
      lineHeight: 33,
      letterSpacing: -0.173,
      height: 33,
      color: getTextColorForLetter(publication),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
  };

  return (
    <Pressable style={styles.card} onPress={_handlePressButtonAsync}>
      {imageUrl && imageWidth > 200 ? (
        <>
          <View
            style={{
              aspectRatio: "4/3",
              width: "100%",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <RNImage
              style={{
                flex: 1,
                borderRadius: 12,
                borderWidth: 0.67,
                borderColor: `${Colors[colorScheme || "light"].border}`,
              }}
              contentFit="cover"
              source={{ uri: imageUrl || fallbackImage || item.image?.url }}
            />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardContentWrapper}>
              <Text style={styles.publicationWrapper}>
                <Text style={styles.publicationText}>
                  {publication}&nbsp;&nbsp;
                </Text>
                <Text style={styles.articleDate}>
                  {formatPublicationDate(item.published)}
                </Text>
              </Text>
              <Text style={styles.title}>{item.title || ""}</Text>
              <Text numberOfLines={4} style={styles.description}>
                {item.description
                  ? formatDescription(item.description, 300)
                  : ""}
              </Text>
            </View>
          </View>
          {renderCardControls()}
        </>
      ) : (
        <>
          <View
            style={{
              width: "100%",
              gap: 10,
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
              }}
            >
              <View style={styles.publicationWrapper}>
                <Text style={styles.publicationText}>{publication}</Text>
                <Text style={styles.articleDate}>
                  {formatPublicationDate(item.published)}
                </Text>
              </View>
              <Text style={styles.title} numberOfLines={4}>
                {item.title || ""}
              </Text>
              <Text style={styles.description} numberOfLines={3}>
                {item.description
                  ? formatDescription(item.description, 300)
                  : ""}
              </Text>
            </View>

            {fallbackImage || item.image?.url ? (
              <RNImage
                style={{
                  aspectRatio: 1 / 1,
                  flex: 1,
                  borderRadius: 12,
                  marginTop: 25.3,
                  marginBottom: 3,
                  maxWidth: 76,
                  width: 76,
                  borderWidth: 0.67,
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                }}
                contentFit="cover"
                source={{ uri: fallbackImage || item.image?.url }}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageContainerText}>
                  {publication} {publication}
                </Text>
                <Text style={styles.noImageContainerText}>
                  {publication} {publication} {publication}
                </Text>
                <Text style={styles.noImageContainerText}>
                  {publication} {publication}
                </Text>
              </View>
            )}
          </View>
          {renderCardControls()}
        </>
      )}
    </Pressable>
  );
}
