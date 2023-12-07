import React, { createContext, useState, useEffect, useContext } from 'react';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme, useColorScheme } from '@react-navigation/native';
import AuthContext from './AuthContext';
import { supabase } from '../config/initSupabase.js';
import Colors from '../constants/Colors';

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthInitialized(true);
        setUser(session ? session.user : null);
        setSession(session);
        SplashScreen.hideAsync();
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setAuthInitialized(true);
          setUser(session ? session.user : null);
          setSession(session);
          router.replace('(home)');
          SplashScreen.hideAsync();
        } else {
          setTimeout(() => {
            SplashScreen.hideAsync();
          }, 500);
        }
      });
    });
  }, [router]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthInitialized(true);
        setUser(session ? session.user : null);
        setSession(session);
        router.replace('(home)');
      } else {
        router.replace('(login)');
      }
    });
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthContext.Provider value={{ session, user, authInitialized }}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default AuthProvider;