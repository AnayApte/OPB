module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // plugins: ['expo-router/babel'], -> APPARENTLY THIS ISN'T NEEDED SDK 50+
  };
};
