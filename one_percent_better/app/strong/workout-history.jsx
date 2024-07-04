import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { formatTime } from '../../utils/helpers';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching workouts:', error);
    else setWorkouts(data);
  };

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded mb-4">
            <Text className="text-lg font-bold">{new Date(item.date).toLocaleDateString()}</Text>
            <Text>Duration: {formatTime(item.duration)}</Text>
            <Text className="font-bold mt-2">Exercises:</Text>
            {item.exercises.map((exercise, index) => (
              <View key={index} className="ml-4">
                <Text>{exercise.name}</Text>
                {exercise.sets.map((set, setIndex) => (
                  <Text key={setIndex} className="ml-4">
                    Set {setIndex + 1}: {set.reps} reps @ {set.weight} lbs
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default WorkoutHistory;
