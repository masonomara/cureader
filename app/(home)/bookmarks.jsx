import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { Text, TouchableOpacity, useColorScheme } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AuthContext } from "../_layout";
import { View } from "../../components/Themed";
import ArticleCard from "../../components/ArticleCard";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import { useScrollToTop } from "@react-navigation/native";
import ArticleCardSkeleton from "../../components/skeletons/ArticleCardSkeleton";

export default function Bookmarks() {
  const colorScheme = useColorScheme();
  const { user, userBookmarks } = useContext(AuthContext);
  const [userInitialBookmarks, setUserInitialBookmarks] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const ref = useRef(null);

  useScrollToTop(
    useRef({
      scrollToTop: () =>
        ref.current?.scrollToOffset({ animated: true, offset: 0 }),
    })
  );

  const fetchUserBookmarks = useCallback(async () => {
    if (userBookmarks) {
      const sortedBookmarks = [...userBookmarks].sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
      });

      setUserInitialBookmarks(sortedBookmarks);
    }
  }, []);

  useEffect(() => {
    fetchUserBookmarks();
  }, [fetchUserBookmarks]);

  const onRefresh = async () => {
    setRefreshing(true);
    const sortedBookmarks = [...userBookmarks].sort((a, b) => {
      return new Date(b.published) - new Date(a.published);
    });

    setUserInitialBookmarks(sortedBookmarks);
    setRefreshing(false);
  };

  const styles = {
    noFeedsHeader: {
      width: "100%",
      alignItems: "center",
      padding: 24,
      paddingHorizontal: 16,
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
    username: {
      marginBottom: 3,
      marginTop: 3,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 28,
      lineHeight: 28,
      letterSpacing: -0.28,
    },
    subtitle: {
      marginBottom: 36,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 17,
      textAlign: "center",
      lineHeight: 22,
      letterSpacing: -0.17,
      paddingHorizontal: 8,
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
      {userBookmarks != null ? (
        <View style={styles.articleList}>
          <FlashList
            ref={ref}
            ListEmptyComponent={() => (
              <View style={styles.noFeedsHeader}>
                <Text style={styles.username}>Bookmarks Page</Text>
                <Text style={styles.subtitle}>
                  Save any articles you find interesting or haven't had a chance
                  to read yet and view them here.
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
      ) : (
        <View style={styles.articleList}>
          <FlashList
            ref={ref}
            data={Array(4).fill(null)}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={200}
            onRefresh={onRefresh}
            refreshing={refreshing}
            renderItem={() => <ArticleCardSkeleton />}
          />
        </View>
      )}
    </View>
  );
}
