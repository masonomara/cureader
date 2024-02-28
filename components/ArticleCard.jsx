import React, { useContext, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Share,
  Image as RNImage,
  ScrollView,
  Dimensions,
} from "react-native";
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
import * as WebBrowser from "expo-web-browser";
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
    userBookmarks.some((bookmark) => bookmark.title === item.title)
  );

  const CARD_WIDTH = Dimensions.get("window").width - 32;

  useLayoutEffect(() => {
    setIsBookmarked(
      userBookmarks.some((bookmark) => bookmark.title === item.title)
    );
  }, [userBookmarks, item]);

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);

    try {
      const updatedUserBookmarks = isBookmarked
        ? userBookmarks.filter((bookmark) => bookmark.title !== item.title)
        : [...userBookmarks, item];

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

  const [imageWidth, setImageWidth] = useState(0);

  const imageUrl =
    (item.description?.match(/<img.*?src=['"](.*?)['"].*?>/)?.[1] ?? "") || "";

  const getImageSize = () => {
    RNImage.getSize(imageUrl, (width, height) => {
      setImageWidth(width);
    });
  };

  const imageUrls = [];
  const regex = /<img.*?src=['"](.*?)['"].*?>/g;

  let match;
  while ((match = regex.exec(item.description)) !== null) {
    imageUrls.push(match[1]);
  }

  useLayoutEffect(() => {
    if (imageUrl) {
      getImageSize();
    }
  }, [imageUrl]);

  const _handlePressButtonAsync = async () => {
    try {
      await WebBrowser.openBrowserAsync(item.links[0].url, {
        controlsColor: `${Colors[colorScheme || "light"].colorPrimary}`,
        dismissButtonStyle: "close",
        enableBarCollapsing: true,
        presentationStyle: "fullScreen",
        readerMode: false,
        toolbarColor: `${Colors[colorScheme || "light"].background}`,
      });
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

  const renderCardControls = () => (
    <Pressable style={styles.cardControls} onPress={_handlePressButtonAsync}>
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
      {feed && <FeedCardToolTip item={feed} />}
    </Pressable>
  );

  const styles = {
    card: {
      borderBottomWidth: 1,
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
      paddingHorizontal: 16,
      paddingTop: 12,
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
      borderWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
    },
    publicationWrapperNoImage: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "flex-start",

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
      overflow: "hidden",
      marginBottom: 3,
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
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.14,
    },
    cardControls: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      height: 64,
      paddingTop: 16,
      paddingHorizontal: 16,
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
      borderWidth: 0.5,
      paddingLeft: 10,
      gap: 5,
      paddingRight: 12,
      borderColor: Colors[colorScheme || "light"].border,
      borderRadius: 100,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    noImageContainer: {
      aspectRatio: 1 / 1,
      flex: 1,
      borderRadius: 12,
      maxWidth: 68,
      width: 68,
      marginTop: 19,
      borderWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      backgroundColor: getColorForLetter(publication),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 25,
      lineHeight: 25,
      letterSpacing: -0.187,
      color: getTextColorForLetter(publication),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
    categoriesList: {
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  };

  return (
    <View style={styles.card}>
      {imageUrl && imageWidth > 200 ? (
        <>
          {imageUrls.length > 1 ? (
            <ScrollView
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.categoriesList]}
              decelerationRate={0}
              snapToInterval={CARD_WIDTH + 8}
              snapToAlignment={"left"}
            >
              {imageUrls.map((url, index) => (
                <View
                  key={index}
                  style={{
                    aspectRatio: "4/3",
                    width: CARD_WIDTH,
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 0.5,
                    borderColor: `${Colors[colorScheme || "light"].border}`,
                    backgroundColor: `white`,
                  }}
                >
                  <RNImage
                    style={{
                      flex: 1,
                    }}
                    contentFit="cover"
                    source={{ uri: url }}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Pressable
              style={{
                paddingTop: 16,
                width: CARD_WIDTH,
              }}
              onPress={_handlePressButtonAsync}
            >
              <RNImage
                style={{
                  flex: 1,
                  aspectRatio: "4/3",
                  width: CARD_WIDTH,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 0.5,
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                  backgroundColor: `white`,
                  marginHorizontal: 16,
                }}
                contentFit="cover"
                source={{ uri: imageUrl || fallbackImage || item.image?.url }}
              />
            </Pressable>
          )}

          <Pressable
            style={styles.cardContent}
            onPress={_handlePressButtonAsync}
          >
            <View style={styles.cardContentWrapper}>
              <Text style={styles.publicationWrapper}>
                <Text style={styles.publicationText}>{publication}&nbsp;</Text>
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
          </Pressable>
          {renderCardControls()}
        </>
      ) : (
        <>
          <Pressable
            onPress={_handlePressButtonAsync}
            style={{
              width: "100%",
              gap: 16,
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingTop: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
              }}
            >
              <View style={styles.publicationWrapper}>
                <Text style={styles.publicationText}>{publication}&nbsp;</Text>
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
                  marginTop: 19,
                  maxWidth: 68,
                  width: 68,
                  borderWidth: 0.5,
                  borderColor: `${Colors[colorScheme || "light"].border}`,
                  backgroundColor: `white`,
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
          </Pressable>
          {renderCardControls()}
        </>
      )}
    </View>
  );
}
