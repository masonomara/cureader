import React, { useState, useEffect, useContext } from "react";
import {
  TouchableOpacity,
  Alert,
  useColorScheme,
  Text,
  View,
  ScrollView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

import { router } from "expo-router";
import { supabase } from "../../config/initSupabase";
import Colors from "../../constants/Colors";
import FeedCardListItem from "../../components/FeedCardListItem";
import { FeedContext, AuthContext } from "../_layout";
import FeedCard from "../../components/FeedCard";

export default function Profile() {
  const colorScheme = useColorScheme();

  const { feeds, popularFeeds } = useContext(FeedContext);
  const { user } = useContext(AuthContext);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  const userFeeds = feeds.filter((feed) =>
    feed.channel_subscribers.includes(user.id)
  );

  // Logout user
  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.replace("(login)");
    if (error) {
      showErrorAlert("Error signing out: " + error.message);
    }
  };

  // Styles
  const styles = {
    profileHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 8,
      paddingBottom: 0,
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
      {/* <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      > */}
      {/* User info and logout */}
      {/* <View>

          <TouchableOpacity onPress={doLogout}>
            <Text>Log out</Text>
          </TouchableOpacity>
        </View> */}

      {/* List of feeds */}
      {userFeeds.length > 0 ? (
        <View style={styles.feedList}>
          <FlashList
            data={userFeeds}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={200}
            renderItem={({ item }) => {
              return <FeedCard key={item.id} item={item} user={user} />;
            }}
            ListHeaderComponent={() => (
              <>
                <View style={styles.profileHeader}>
                  <Text style={styles.username}>
                    Hello {user.user_metadata.displayName}
                  </Text>
                  <Text style={styles.subtitle}>
                    You are currently subscribed to {userFeeds.length} feeds.
                  </Text>
                </View>
                <View style={styles.headerWrapper}>
                  <View style={styles.titleWrapperUserFeeds}>
                    <Text style={styles.title}>Your Feeds</Text>
                  </View>
                  <Text style={styles.headerSubtitle}>
                    Manage all your favorite feeds.
                  </Text>
                </View>
              </>
            )}
          />
        </View>
      ) : (
        <View style={styles.feedList}>
          <FlashList
            ListHeaderComponent={() => (
              <>
                <View style={styles.profileHeaderNoFeeds}>
                  <Text style={styles.username}>
                    Hello {user.user_metadata.displayName}
                  </Text>
                  <Text style={styles.subtitle}>
                    It looks like you aren't subscribed to any feeds yet!
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
                  <TouchableOpacity onPress={doLogout}>
                    <Text>Log out</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.headerWrapper}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.title}>Popular Feeds</Text>
                    <TouchableOpacity
                      style={styles.textButton}
                      onPress={() => {
                        router.push({
                          pathname: "/allPopularFeeds",
                        });
                      }}
                    >
                      <Text style={styles.textButtonText}>View more</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.headerSubtitle}>
                    Get started with our most popular feeds.
                  </Text>
                </View>
              </>
            )}
            data={popularFeeds}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={200}
            ListFooterComponent={() => <View style={styles.feedListFooter} />}
            renderItem={({ item }) => (
              <FeedCard key={item.id} item={item} user={user} />
            )}
          />
        </View>
      )}
    </View>
  );
}
