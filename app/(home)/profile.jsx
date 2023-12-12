import React, { useContext } from "react";
import { TouchableOpacity, Text, View, useColorScheme } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import { FeedContext, AuthContext } from "../_layout";
import FeedCard from "../../components/FeedCard";

export default function Profile() {
  const colorScheme = useColorScheme();
  const { feeds, popularFeeds } = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const userFeeds = feeds.filter((feed) =>
    feed.channel_subscribers.includes(user.id)
  );

  const renderHeaderText = () => (
    <>
      <View style={styles.profileHeader}>
        <Text style={styles.username}>
          Hello {user.user_metadata.displayName}
        </Text>
        <Text style={styles.subtitle}>
          {userFeeds.length > 0
            ? `You are currently subscribed to ${userFeeds.length} feeds.`
            : "It looks like you aren't subscribed to any feeds yet!"}
        </Text>
        {userFeeds.length === 0 && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push({ pathname: "/explore" })}
          >
            <Text style={styles.buttonText}>View Explore Page</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.headerWrapper}>
        <View
          style={
            userFeeds.length > 0
              ? styles.titleWrapperUserFeeds
              : styles.titleWrapper
          }
        >
          <Text style={styles.title}>
            {userFeeds.length > 0 ? "Your Feeds" : "Popular Feeds"}
          </Text>
          {userFeeds.length === 0 && (
            <TouchableOpacity
              style={styles.textButton}
              onPress={() => router.push({ pathname: "/allPopularFeeds" })}
            >
              <Text style={styles.textButtonText}>View more</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          {userFeeds.length > 0
            ? "Manage all your favorite feeds."
            : "Get started with our most popular feeds."}
        </Text>
      </View>
    </>
  );

  // Styles
  const styles = {
    profileHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
      paddingBottom: userFeeds.length > 0 ? 0 : 48,
    },
    profileHeaderNoFeeds: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
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

    feedList: {
      width: "100%",
      maxWidth: "100%",
      minWidth: "100%",
      flex: 1,
      paddingHorizontal: 16,
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
      <View style={styles.feedList}>
        <FlashList
          data={userFeeds.length > 0 ? userFeeds : popularFeeds}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          renderItem={({ item }) => (
            <FeedCard key={item.id} item={item} user={user} />
          )}
          ListHeaderComponent={renderHeaderText}
          ListFooterComponent={() => <View style={styles.feedListFooter} />}
        />
      </View>
    </View>
  );
}
