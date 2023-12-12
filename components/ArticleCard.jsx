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
import Share20 from "./icons/20/Share20";
import BookmarkOutline20 from "./icons/20/BookmarkOutline20";
import BookmarkFilled20 from "./icons/20/BookmarkFilled20";
import Colors from "../constants/Colors";
import FeedCardToolTip from "./FeedCardTooltip";
import { AuthContext } from "../app/_layout";
import { supabase } from "../config/initSupabase";

function formatPublicationDate(published) {
  const timeDifference = new Date() - new Date(published);
  const minutesAgo = Math.floor(timeDifference / (60 * 1000));
  const hoursAgo = Math.floor(timeDifference / (60 * 60 * 1000));
  const daysAgo = Math.floor(hoursAgo / 24);
  const yearsAgo = Math.floor(daysAgo / 365);

  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo}m`;
  if (hoursAgo < 24) return `${hoursAgo}h`;
  if (daysAgo < 365) return `${daysAgo}d`;
  return `${yearsAgo}y`;
}

export default function ArticleCard({
  fallbackImage,
  feed,
  item,
  publication,
  user,
}) {
  const colorScheme = useColorScheme();
  const [result, setResult] = useState(null);
  const { userBookmarks, setUserBookmarks } = useContext(AuthContext);

  console.log("type:", typeof item.links[0].url);
  console.log("comp:", userBookmarks[0]);

  const [isBookmarked, setIsBookmarked] = useState(
    userBookmarks.includes(item.links[0].url)
  );

  useLayoutEffect(() => {
    setIsBookmarked(userBookmarks.includes(item.links[0].url));
  }, [userBookmarks, item.links[0].url]);

  const descriptionWithoutTags = item.description || "";

  const match = descriptionWithoutTags.match(/<img.*?src=['"](.*?)['"].*?>/);

  const imageUrl = match ? match[1] : "";

  const _handlePressButtonAsync = async () => {
    try {
      let result = await WebBrowser.openBrowserAsync(item.links[0].url);
      setResult(result);
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
      await updateUserBookmarks(user.id, item.links[0].url, optimisticBookmark);
    } catch (error) {
      console.error("Error handling bookmark:", error);
      setIsBookmarked(!isBookmarked); // Revert the state if there's an error
    }
  };

  const updateUserBookmarks = async (userId, bookmarkUrl, isBookmarking) => {
    try {
      const userProfile = await supabase
        .from("profiles")
        .select("bookmarks")
        .eq("id", userId)
        .single();

      let updatedBookmarks = userProfile.data.bookmarks || [];

      if (isBookmarking) {
        // Add bookmarkUrl to the array if not already present
        if (!updatedBookmarks.includes(bookmarkUrl)) {
          updatedBookmarks.push(bookmarkUrl);
        }
      } else {
        // Remove bookmarkUrl from the array
        updatedBookmarks = updatedBookmarks.filter(
          (url) => url !== bookmarkUrl
        );
      }

      await supabase
        .from("profiles")
        .update({
          bookmarks: updatedBookmarks.map((bookmark) => String(bookmark)),
        })
        .eq("id", userId);
    } catch (error) {
      console.error("Error updating user bookmarks:", error);
      throw error;
    }
  };

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
  };

  return (
    <Pressable style={styles.card} onPress={_handlePressButtonAsync}>
      {(item.image?.url || imageUrl || fallbackImage) && (
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
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardContentWrapper}>
          <Text style={styles.publicationWrapper}>
            {publication}&nbsp;&nbsp;
            <Text style={styles.articleDate}>
              {formatPublicationDate(item.published)}
            </Text>
          </Text>
          <Text style={styles.title}>{item.title ? item.title : ""}</Text>
          <Text numberOfLines={4} style={styles.description}>
            {item.description ? (
              <Text numberOfLines={4} style={styles.description}>
                {item.description
                  .replace(/<[^>]*>/g, "")
                  .replace(/&#8216;/g, "‘")
                  .replace(/&#8217;/g, "’")
                  .replace(/&#160;/g, " ")
                  .replace(/&#8220;/g, "“")
                  .replace(/&#8221;/g, "”")
                  .trim()}
              </Text>
            ) : (
              <Text style={styles.description}></Text>
            )}
          </Text>
        </View>
      </View>
      <View style={styles.cardControls}>
        <View style={styles.cardButtons}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleBookmark}
          >
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
    </Pressable>
  );
}
