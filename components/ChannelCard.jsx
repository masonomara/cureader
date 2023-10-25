import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from "react-native";

import React, { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import Dots20 from "./icons/20/Dots20";
import Share20 from "./icons/20/Share20";
import BookmarkOutline20 from "./icons/20/BookmarkOutline20";
import Colors from "../constants/Colors";


export default function ChannelCard({ publication, item }) {
  const colorScheme = useColorScheme()
  const [result, setResult] = useState(null);

  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync(item.links[0].url);
    setResult(result);
  };

  const styles = {
    card: {
      borderBottomWidth: 1,
      paddingLeft: 8,
      paddingTop: 28,
      paddingRight: 16,
      paddingBottom: 8,
      borderColor: "#E5E5E5",
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
      // borderWidth: 1,
      // borderColor: "blue",
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
      backgroundColor: "#FF3E39",
    },
    cardContentWrapper: {
      display: "flex",
      paddingBottom: 0,
      flexDirection: "column",
      alignItems: "flex-start",
      flex: 1,
      paddingRight: 16,
      // borderWidth: 1,
      // borderColor: 'red',
    },
    publicationWrapper: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      fontFamily: "InterMedium",
      fontWeight: "500",
      lineHeight: 16.25,
      letterSpacing: -0.039,
      fontSize: 13,
      color: "#181818",
      marginBottom: 10,
      // borderWidth: 1,
      // borderColor: 'green',
    },
    articleDate: {
      color: "#5D5D5D",
      fontFamily: "InterRegular",
    },
    title: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      fontFamily: "InterBold",
      fontWeight: "500",
      letterSpacing: -0.209,
      fontSize: 19,
      lineHeight: 23.75,
      color: "#181818",
      marginBottom: 5,
      // borderWidth: 1,
      // borderColor: 'green',
    },
    description: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      fontFamily: "BitterRegular",
      fontWeight: "500",
      letterSpacing: 0,
      fontSize: 15,
      lineHeight: 22.5,
      color: "#3A3A3A",
      marginBottom: 16,
      // borderWidth: 1,
      // borderColor: 'green',
    },
    cardControls: {
      // borderWidth: 1,
      // borderColor: "green",
      display: "flex",
      alignItems: "flex-start",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      paddingLeft: 40,
    },
    cardButtons: {
      // borderWidth: 1,
      // borderColor: "red",
      display: "flex",
      alignItems: "flex-start",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      flex: 1,
    },
    buttonWrapper: {
      // borderWidth: 1,
      // borderColor: "blue",
      height: 44,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
    },
    buttonImage: {
      // borderWidth: 1,
      // borderColor: "yellow",
    },
    buttonText: {
      color: "#666666",
      fontFamily: "InterRegular",
      letterSpacing: -0.036,
      lineHeight: 16,
      fontSize: 13,
    },
  };

  return (
    <Pressable style={styles.card} onPress={_handlePressButtonAsync}>
      <View style={styles.cardContent}>
        <View style={styles.iconWrapper}>
          <View style={styles.icon} />
        </View>
        <View style={styles.cardContentWrapper}>
          <Text style={styles.publicationWrapper}>
            {publication}&nbsp;&nbsp;
          </Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={4} style={styles.description}>
            {item.description}
          </Text>
        </View>
      </View>
      <View style={styles.cardControls}>
        <View style={styles.cardButtons}>
          <TouchableOpacity style={styles.buttonWrapper}>
            <BookmarkOutline20 style={styles.buttonImage} color={"#666666"} />
            <Text style={styles.buttonText}>Bookmark</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonWrapper}>
            <Share20 style={styles.buttonImage} color={"#666666"} />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonWrapper}>
          <Dots20 style={styles.buttonImage} color={"#666666"} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}
