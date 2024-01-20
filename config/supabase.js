import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const ExpoSecureStoreAdapter = {
//   getItem: (key) => {
//     return SecureStore.getItemAsync(key);
//   },
//   setItem: (key, value) => {
//     SecureStore.setItemAsync(key, value);
//   },
//   removeItem: (key) => {
//     SecureStore.deleteItemAsync(key);
//   },
// };

console.log("connected!");

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      // storage: ExpoSecureStoreAdapter,
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
export const supabaseAuth = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE,
  {
    auth: {
      // storage: ExpoSecureStoreAdapter,
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
