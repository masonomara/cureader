import React, { useContext } from "react";
import { useColorScheme, View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Colors from "../constants/Colors";
import FeedCardListItem from "../components/FeedCardListItem";
import { AuthContext, FeedContext } from "./_layout";

export default function TabOneScreen() {
  const { popularFeeds } = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();

  const createStyles = (additionalStyles) => ({
    ...additionalStyles,
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme || "light"].background,
    },
  });

  const styles = createStyles({
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    feedList: {
      width: "100%",
      maxWidth: "100%",
      minWidth: "100%",
      flex: 1,
    },
    headerWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      paddingTop: 41,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
    },
    flashListFooter: {
      height: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.feedList}>
        <FlashList
          data={popularFeeds}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <Text style={styles.title}>Popular Feeds</Text>
            </View>
          }
          ListFooterComponent={() => <View style={styles.flashListFooter} />}
          renderItem={({ item }) => {
            return (
              <FeedCardListItem
                key={item.id}
                item={item}
                user={user}
                extraPadding={true}
              />
            );
          }}
        />
      </View>
    </View>
  );
}
