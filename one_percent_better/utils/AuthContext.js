import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabaseClient'; // Adjust this import path as necessary

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        await SecureStore.setItemAsync('userId', session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        await SecureStore.deleteItemAsync('userId');
      }
    });

    return () => {
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, []);

  async function checkUser() {
    const userId = await SecureStore.getItemAsync('userId');
    if (userId) {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    await SecureStore.deleteItemAsync('userId');
  }

  const value = {
    user,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
