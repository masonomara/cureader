import { supabase } from "../config/supabase";

export const updateChannelSubscribers = async (
  channelId,
  userId,
  subscribe = true,
  feeds
) => {
  try {
    const channelIndex = feeds.findIndex((feed) => feed.id === channelId);

    if (channelIndex !== -1) {
      const updatedFeeds = [...feeds];
      const channelSubscribers =
        updatedFeeds[channelIndex].channel_subscribers || [];

      updatedFeeds[channelIndex].channel_subscribers = subscribe
        ? [...channelSubscribers, userId]
        : channelSubscribers.filter((sub) => sub !== userId);

      await supabase
        .from("channels")
        .update({
          channel_subscribers: updatedFeeds[channelIndex].channel_subscribers,
        })
        .eq("id", channelId);
    } else {
      console.error("Channel not found in the feeds prop");
    }
  } catch (error) {
    console.error("Error updating channel subscribers:", error);
    throw error;
  }
};

export const updateUserSubscriptions = async (
  updatedIds,
  updatedUrls,
  userId
) => {
  try {
    await supabase
      .from("profiles")
      .update({
        channel_subscriptions: updatedIds.map((id, index) => ({
          channelId: id,
          channelUrl: updatedUrls[index],
        })),
      })
      .eq("id", userId);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
