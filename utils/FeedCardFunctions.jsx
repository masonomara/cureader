// subscriptionFunctions.js
import { supabase } from "../config/initSupabase";
import { Alert } from "react-native";

export const updateSubscriptions = async (userId, updatedSubscriptions) => {
  await supabase
    .from("profiles")
    .update({ channel_subscriptions: updatedSubscriptions })
    .eq("id", userId);
};

export const updateChannelSubscribers = async (
  channelId,
  updatedSubscribers
) => {
  await supabase.from("channels").upsert([
    {
      id: channelId,
      channel_subscribers: updatedSubscribers,
    },
  ]);
};


