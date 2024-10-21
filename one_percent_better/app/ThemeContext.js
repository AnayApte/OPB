// app/ThemeContext.jsx

import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    background: '#FFFFFF',
    text: '#000000',
    primary: '#641f1f',
    secondary: '#f2f5ea',
    tertiary: '#a69998'
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};