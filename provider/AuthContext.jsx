import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../config/initSupabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [channelSubscriptions, setChannelSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.user();
      if (!error) {
        setUser(data);
        // Fetch channel subscriptions here and set them to channelSubscriptions
        // You can use the getChannelSubscriptions function here
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, channelSubscriptions }}>
      {loading ? <LoadingIndicator /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);