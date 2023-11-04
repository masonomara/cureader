import { ScrollView, useColorScheme, Text, TextInput } from "react-native";
import { View } from "../../components/Themed";
import { useState, useEffect } from "react";
import ChannelCardFeatured from "../../components/ChannelCardFeatured";
import ChannelCard from "../../components/ChannelCard";
import { supabase } from "../../config/initSupabase";
import Colors from "../../constants/Colors";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const [popularChannels, setPopularChannels] = useState([]);

  // Function to fetch all entries in the "channels" table
  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("channel_subscribers", { ascending: false }); // Sort by the "channel_subscribers" column in descending order

      if (error) {
        console.error("Error fetching channels:", error);
        return []; // Return an empty array in case of an error
      } else {
        console.log("List of channels sorted by subscribers:", data);
        return data; // Return the data if fetched successfully
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      return []; // Return an empty array in case of an error
    }
  };

  useEffect(() => {
    // Fetch channels when the component mounts
    const fetchData = async () => {
      const channelsData = await fetchChannels();
      setPopularChannels(channelsData); // Set the state with the fetched data
    };

    fetchData();
  }, []);

  const styles = {
    container: {},
    channelList: {
      gap: 12,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      borderRadius: 20,
      height: 56,
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
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        label="Channel Url Text"
        // onChangeText={handleUserInput}
        // value={userInput}
        placeholder="Search for channel placeholder"
        autoCapitalize={"none"}
        autoCorrect={false}
      />
      {popularChannels && popularChannels.length > 0 ? (
        <ScrollView horizontal contentContainerStyle={styles.channelList}>
          {popularChannels.map((item) => (
            <ChannelCardFeatured key={item.id} item={item} />
          ))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text> // You can display a loading message here
      )}
      {popularChannels && popularChannels.length > 0 ? (
        <View contentContainerStyle={styles.channelList}>
          {popularChannels.map((item) => (
            <ChannelCard key={item.id} item={item} />
          ))}
        </View>
      ) : (
        <Text>Loading...</Text> // You can display a loading message here
      )}
    </ScrollView>
  );
}
