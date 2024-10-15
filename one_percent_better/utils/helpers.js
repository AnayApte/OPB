// one_percent_better/utils/helpers.js

export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  export const calculateOneRepMax = (weight, reps) => {
    return weight * (1 + reps / 30);
  };
  
  export const formatExerciseName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };
