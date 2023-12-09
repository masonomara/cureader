import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity, Alert, useColorScheme } from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { supabase } from "../../config/initSupabase";
import { Text, View } from "../../components/Themed";
import Colors from "../../constants/Colors";
import FeedCardListItem from "../../components/FeedCardListItem";
import { AuthContext } from "../_layout";

export default function Profile() {
  const colorScheme = useColorScheme();
  const { user, feeds, updateUserSubscriptions } = useContext(AuthContext);

  const [userFeeds, setUserFeeds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  useEffect(() => {
    // Filter channels on the client side
    const filteredChannels = feeds.filter((feed) =>
      feed.channel_subscribers.includes(user.id)
    );

    setUserFeeds(filteredChannels);
  }, [feeds]);

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
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    articleList: {
      width: "100%",
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
  };

  return (
    <View style={styles.container}>
      {/* User info and logout */}
      <View>
        <TouchableOpacity onPress={doLogout}>
          <Text>{JSON.stringify(user)}</Text>
          <Text>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* List of feeds */}
      <View style={styles.articleList}>
        <FlashList
          data={userFeeds}
          estimatedItemSize={64}

          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            return <FeedCardListItem key={item.id} item={item} />;
          }}
        />
      </View>
    </View>
  );
}
