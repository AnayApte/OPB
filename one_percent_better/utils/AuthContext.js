import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      let storedUserId = await SecureStore.getItemAsync('userId');
      
      if (!storedUserId) {
        const session = supabase.auth.session();
        if (session && session.user) {
          storedUserId = session.user.id;
          await SecureStore.setItemAsync('userId', storedUserId);
        }
      }

      if (storedUserId) {
        setUserId(storedUserId);
      }
    };

    loadUserId();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        const newUserId = session.user.id;
        setUserId(newUserId);
        SecureStore.setItemAsync('userId', newUserId);  
      } else {
        setUserId(null);
        SecureStore.deleteItemAsync('userId'); 
      }
    });

    return () => {
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
