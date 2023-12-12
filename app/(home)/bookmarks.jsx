import React, { useContext } from "react";
import { Alert, useColorScheme } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AuthContext } from "../_layout";
import { View } from "../../components/Themed";
import ArticleCard from "../../components/ArticleCard";
import Colors from "../../constants/Colors";

export default function Bookmarks() {
  const { user, userBookmarks } =
    useContext(AuthContext);

  const colorScheme = useColorScheme();


  const styles = {
    noFeedsHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
      paddingBottom: 48,
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
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    articleList: {
      //backgroundColor: `${Colors[colorScheme || "light"].background}`,
      width: "100%",
      flex: 1,
    },
    feedList: {
      width: "100%",
      flex: 1,
      paddingHorizontal: 16,
    },
    feedListFooter: {
      height: 16,
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
      marginTop: 0,
      width: "100%",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
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
    dailyQuoteContainer: {
      padding: 16,
      paddingVertical: 24,
      paddingBottom: 12,
      marginBottom: 0,
      alignContent: "center",
      justifyContent: "center",
      flex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    dailyQuoteContainerLoading: {
      padding: 16,
      paddingVertical: 24,
      paddingBottom: 12,
      marginBottom: 0,
      alignContent: "center",
      justifyContent: "center",
      flex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      position: "absolute",
      zIndex: -1,
    },
    dailyQuoteWrapper: {
      gap: 7,
      alignContent: "center",
      justifyContent: "center",
    },
    dailyQuoteQuote: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.1425,
    },
    dailyQuoteAuthor: {
      textAlign: "center",
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.articleList}>
        <FlashList
          data={userBookmarks}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
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
