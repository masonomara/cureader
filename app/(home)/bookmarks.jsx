import React, { useCallback, useState, useEffect, useContext } from "react";
import { Text, TouchableOpacity, useColorScheme } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AuthContext } from "../_layout";
import { View } from "../../components/Themed";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";

export default function Bookmarks() {
  const colorScheme = useColorScheme();
  const { user, userBookmarks } = useContext(AuthContext);
  const [userInitialBookmarks, setUserInitialBookmarks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Set userInitialBookmarks to userBookmarks on initial build
    setUserInitialBookmarks(userBookmarks);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setUserInitialBookmarks(userBookmarks);
    setRefreshing(false);
  };

  const styles = {
    noFeedsHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    articleList: {
      width: "100%",
      flex: 1,
    },
    profileHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
      paddingBottom: userInitialBookmarks.length > 0 ? 0 : 48,
    },
    profileHeaderNoFeeds: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
      paddingBottom: 48,
    },
    scrollViewContainer: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      flexDirection: "column",
      width: "100%",
      maxWidth: "100%",
      minWidth: "100%",
      flex: 1,
    },
    input: {
      width: "100%",
      borderRadius: 20,
      height: 56,
      marginBottom: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      flexDirection: "row",
      borderColor: `${Colors[colorScheme || "light"].border}`,
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      alignContent: "center",
      justifyContent: "space-between",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    inputText: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    button: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonDisabled: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].buttonMuted}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    headerWrapper: {
      paddingHorizontal: 0,
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
      justifyContent: "space-between",
      alignItems: "center",
    },
    titleWrapperUserFeeds: {
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
    textButton: {
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    textButtonText: {
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      color: `${Colors[colorScheme || "light"].colorPrimary}`,
    },
    username: {
      marginBottom: 4,
      marginTop: 4,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 29,
      lineHeight: 35,
      letterSpacing: -0.217,
    },
    subtitle: {
      marginBottom: 36,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "700",
      fontSize: 19,
      textAlign: "center",
      lineHeight: 24,
      letterSpacing: -0.19,
    },
    button: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    feedListFooter: {
      height: 16,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.articleList}>
        <FlashList
          ListEmptyComponent={() => (
            <View style={styles.noFeedsHeader}>
              <Text style={styles.username}>Like anything?</Text>
              <Text style={styles.subtitle}>
                Feel free to save any articles you find interesting or can't get to yet.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  router.push({
                    pathname: "/explore",
                  });
                }}
              >
                <Text style={styles.buttonText}>View Explore Page</Text>
              </TouchableOpacity>
            </View>
          )}
          data={userInitialBookmarks}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <ArticleCard
              fallbackImage={item.fallbackImage}
              item={item}
              feed={item.feed}
              publication={item.feed.channel_title}
              user={user}
            />
          )}
        />
      </View>
    </View>
  );
}
