import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabaseClient';  // Import Supabase client

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      // Step 1: Try to retrieve userId from SecureStore
      let storedUserId = await SecureStore.getItemAsync('userId');
      
      // Step 2: If not found in SecureStore, check the Supabase session
      if (!storedUserId) {
        const session = supabase.auth.session();
        if (session && session.user) {
          storedUserId = session.user.id;
          await SecureStore.setItemAsync('userId', storedUserId);
        }
      }

      // Step 3: Set the userId in the state
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };

    loadUserId();

    // Step 4: Listen for changes in the auth state
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        const newUserId = session.user.id;
        setUserId(newUserId);
        SecureStore.setItemAsync('userId', newUserId);  // Store it securely
      } else {
        setUserId(null);
        SecureStore.deleteItemAsync('userId');  // Remove from storage
      }
    });

    // Cleanup the listener on unmount
    return () => {
      authListener.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
