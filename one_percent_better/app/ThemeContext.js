import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({
      
primary: '#641f1f', // Tomato
secondary: '#f2f5ea', // LightSeaGreen
accent: '#d6dbd2', // Yellow
background: '#ffb5c6', // AliceBlue
text: '#2c363f'  // Dark text for light background
    });

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);