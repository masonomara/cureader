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

  style ={
  card: {
    borderBottomWidth: 1,
    paddingTop: 40,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 8,
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
    // paddingRight: 16,
  },
  publicationWrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 10,
    color: `${Colors[colorScheme || "light"].textHigh}`,
    fontFamily: 'InterMedium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.14,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  articleDate: {
    color: `${Colors[colorScheme || "light"].textLow}`,
    fontFamily: 'InterMedium',
    fontWeight: '500',
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
    marginBottom: 5,
    color: `${Colors[colorScheme || "light"].textHigh}`,
    fontFamily: 'InterSemiBold',
    fontWeight: '600',
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
    marginBottom: 16,
    color: `${Colors[colorScheme || "light"].textMedium}`,
    fontFamily: 'NotoSerifRegular',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: -0.225,
  },
  cardControls: {
    display: "flex",
    alignItems: "flex-start",
    gap: "28px",
    alignSelf: "stretch",
    flexDirection: "row",
    width: "100%",
  },
  cardButtons: {
    display: "flex",
    alignItems: "flex-start",
    gap: "28px",
    alignSelf: "stretch",
    flexDirection: "row",
    flex: 1,
  },
  buttonWrapper: {
    height: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  buttonText: {
    color: `${Colors[colorScheme || "light"].buttonActive}`,
    fontFamily: 'InterRegular',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.065,
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
