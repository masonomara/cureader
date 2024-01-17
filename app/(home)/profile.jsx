import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  TouchableOpacity,
  Text,
  View,
  useColorScheme,
  ScrollView,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import { FeedContext, AuthContext } from "../_layout";
import { useScrollToTop } from "@react-navigation/native";
import FeedCardSkeleton from "../../components/skeletons/FeedCardSkeleton";
import FeedCardListItem from "../../components/FeedCardListItem";
import { chunkArray, formatPublicationDateProper } from "../utils/Formatting";
import CategoriesContainer from "../../components/CategoriesContainer";

export default function Profile() {
  const colorScheme = useColorScheme();
  const { feeds, feedCategories, popularFeeds } = useContext(FeedContext);
  const { user, userSubscriptionUrls, userSubscriptionIds } =
    useContext(AuthContext);
  const [userInitialFeeds, setUserInitialFeeds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const ref = useRef(null);

  const filteredCategories = feedCategories
    .filter((category) =>
      category.channels
        .flat()
        .some((channel) => userSubscriptionIds.includes(parseInt(channel)))
    )
    .sort((a, b) => {
      // Sort categories based on the number of matching channels/ids
      const aMatchingChannels = a.channels
        .flat()
        .filter((channel) =>
          userSubscriptionIds.includes(parseInt(channel))
        ).length;

      const bMatchingChannels = b.channels
        .flat()
        .filter((channel) =>
          userSubscriptionIds.includes(parseInt(channel))
        ).length;

      return bMatchingChannels - aMatchingChannels;
    });

  const chunkedCategories = chunkArray(filteredCategories, 2);

  const CARD_WIDTH = Dimensions.get("window").width - 32;

  useScrollToTop(
    useRef({
      scrollToTop: () =>
        ref.current?.scrollToOffset({ animated: true, offset: 0 }),
    })
  );

  const fetchUserFeeds = useCallback(async () => {
    if (userSubscriptionUrls) {
      const fetchedFeeds = feeds.filter((feed) =>
        userSubscriptionUrls.includes(feed.channel_url)
      );
      fetchedFeeds.sort(
        (a, b) => b.channel_subscribers.length - a.channel_subscribers.length
      );
      setUserInitialFeeds(fetchedFeeds);
    }
  }, []);

  useEffect(() => {
    fetchUserFeeds();
  }, [fetchUserFeeds]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserFeeds();
    setRefreshing(false);
  };

  const renderHeaderText = () => (
    <>
      <View style={styles.profileHeader}>
        <Text style={styles.userTitle} numberOfLines={1}>
          Hello {user?.user_metadata?.displayName || null}
        </Text>

        <View style={styles.userInfoContainer}>
          <View style={styles.userInfoWrapper}>
            <Text style={styles.userInfoTitle}>
              {userSubscriptionIds.length}
            </Text>
            <Text style={styles.userInfoSubtitle}>Feeds</Text>
          </View>
          <View style={styles.userInfoDivider} />
          <View style={styles.userInfoWrapper}>
            <Text style={styles.userInfoTitle}>
              {filteredCategories.length}
            </Text>
            <Text style={styles.userInfoSubtitle}>Categories</Text>
          </View>
          <View style={styles.userInfoDivider} />
          <View style={styles.userInfoWrapper}>
            {formatPublicationDateProper(user.created_at)
              .split(" ")
              .map((part, index) => (
                <Text
                  key={index}
                  style={
                    index % 2 === 0
                      ? styles.userInfoTitle
                      : styles.userInfoSubtitle
                  }
                >
                  {part}
                </Text>
              ))}
          </View>
        </View>

        {userInitialFeeds.length === 0 && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push({ pathname: "/explore" })}
          >
            <Text style={styles.buttonText}>View Explore Page</Text>
          </TouchableOpacity>
        )}
      </View>
      {userInitialFeeds.length > 0 && (
        <>
          <View style={styles.headerWrapper}>
            <Text style={styles.title}>Your Categories</Text>
          </View>
          <ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoriesList]}
            decelerationRate={0}
            snapToInterval={CARD_WIDTH + 8}
            snapToAlignment={"left"}
          >
            {chunkedCategories.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  flexWrap: "wrap",
                  width: CARD_WIDTH,
                }}
              >
                {row.map((category) => (
                  <CategoriesContainer
                    key={category.id}
                    category={category}
                    profile={true}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}
      <View style={styles.headerWrapper}>
        <Text style={styles.title}>
          {userInitialFeeds.length > 0 ? "Your Feeds" : "Popular Feeds"}
        </Text>
      </View>
    </>
  );

  const styles = {
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
    profileHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 16,
      paddingBottom: userInitialFeeds.length > 0 ? 0 : 48,
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
    userTitle: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
      width: "100%",
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
      paddingHorizontal: 16,
      paddingVertical: 9,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.28,
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
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
      width: "100%",
    },
    subtitle: {
      marginBottom: 36,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 19,
      textAlign: "left",
      lineHeight: 24,
      letterSpacing: -0.19,
      width: "100%",
      paddingRight: 44,
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
    flashListFooter: {
      height: 16,
    },
    categoriesList: {
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 38,
    },
    userInfoContainer: {
      flex: 1,
      marginTop: 10,
      width: "100%",
      flexDirection: "row",
      marginBottom: 38,
    },
    userInfoWrapper: {
      flexDirection: "column",
      width: 77,
    },
    userInfoTitle: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 20,
      lineHeight: 25,
      letterSpacing: -0.2,
    },
    userInfoSubtitle: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    userInfoDivider: {
      height: "100%",
      width: 1,
      marginHorizontal: 16,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
  };

  return (
    <View style={styles.container}>
      {userSubscriptionUrls != null ? (
        <View style={styles.feedList}>
          <FlashList
            data={userInitialFeeds.length > 0 ? userInitialFeeds : popularFeeds}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={200}
            ref={ref}
            renderItem={({ item }) => (
              <FeedCardListItem
                key={item.id}
                item={item}
                user={user}
                extraPadding={true}
              />
            )}
            ListHeaderComponent={renderHeaderText}
            ListFooterComponent={() => <View style={styles.flashListFooter} />}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </View>
      ) : (
        <View style={styles.feedList}>
          <FlashList
            data={Array(4).fill(null)}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={200}
            ref={ref}
            renderItem={() => <FeedCardSkeleton />}
            ListHeaderComponent={renderHeaderText}
            ListFooterComponent={() => <View style={styles.flashListFooter} />}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </View>
      )}
    </View>
  );
}
