import React, { useContext, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Share,
} from "react-native";
import { Image } from "expo-image";
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

  const imageUrl =
    (item.description?.match(/<img.*?src=['"](.*?)['"].*?>/)?.[1] ?? "") || "";

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

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type of:", result.activityType);
        } else {
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Dismissed");
      }
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
      setIsBookmarked(!isBookmarked); // Revert the state if there's an error
    }
  };

  const updateUserBookmarks = async (updatedBookmarks) => {
    try {
      await supabase
        .from("profiles")
        .update({
          bookmarks: updatedBookmarks.map((bookmark) => bookmark), // Assuming 'id' is the unique identifier
        })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error updating user bookmarks:", error);
      throw error;
    }
  };

  const renderCardContent = () => (
    <View style={styles.cardContent}>
      <View style={styles.cardContentWrapper}>
        <Text style={styles.publicationWrapper}>
          {publication}&nbsp;&nbsp;
          <Text style={styles.articleDate}>
            {formatPublicationDate(item.published)}
          </Text>
        </Text>
        <Text style={styles.title}>{item.title || ""}</Text>
        <Text numberOfLines={4} style={styles.description}>
          {item.description ? formatDescription(item.description, 300) : ""}
        </Text>
      </View>
    </View>
  );

  const renderImage = () => (
    <View
      style={{
        aspectRatio: "4/3",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <Image
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
  );

  const renderNoImageContainer = () => (
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
  );

  const renderCardControls = () => (
    <View style={styles.cardControls}>
      <View style={styles.cardButtons}>
        <TouchableOpacity style={styles.buttonWrapper} onPress={handleBookmark}>
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
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonWrapper} onPress={onShare}>
          <Share20
            style={styles.buttonImage}
            color={Colors[colorScheme || "light"].buttonActive}
          />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
      <FeedCardToolTip item={feed} />
    </View>
  );

  const styles = {
    card: {
      borderBottomWidth: 1,
      paddingTop: 28,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 8,
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
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 6,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    articleDate: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
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
      marginBottom: 3,
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
      marginBottom: 24,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "NotoSerifRegular",
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 25,
      letterSpacing: -0.225,
    },
    cardControls: {
      display: "flex",
      alignItems: "center",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      height: 52,
      paddingTop: 4,
    },
    cardButtons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "12px",
      alignSelf: "stretch",
      flexDirection: "row",
      flex: 1,
    },
    buttonWrapper: {
      height: 40,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 12,
      paddingLeft: 10,
      borderWidth: 0.5,
      borderColor: Colors[colorScheme || "light"].border,
      borderRadius: 100,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.065,
    },
    noImageContainer: {
      height: 80,
      width: 80,
      borderRadius: 12,
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
      {imageUrl ? (
        <>
          {renderImage()}
          {renderCardContent()}
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
              <Text style={styles.publicationWrapper}>
                {publication}&nbsp;&nbsp;
                <Text style={styles.articleDate}>
                  {formatPublicationDate(item.published)}
                </Text>
              </Text>
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
              <Image
                style={{
                  aspectRatio: 1 / 1,
                  flex: 1,
                  borderRadius: 12,
                  marginTop: 3,
                  marginBottom: 3,
                  maxWidth: 80,
                  width: 80,
                  borderWidth: 0.67,
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                }}
                contentFit="cover"
                source={{ uri: imageUrl || fallbackImage || item.image?.url }}
              />
            ) : (
              renderNoImageContainer()
            )}
          </View>
          {renderCardControls()}
        </>
      )}
    </Pressable>
  );
}
