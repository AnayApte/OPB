import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { calculateOneRepMax } from '../../utils/helpers';

const ExerciseHistory = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        personal_records (one_rep_max, date),
        workouts (
          date,
          exercises
        )
      `)
      .order('name');

    if (error) console.error('Error fetching exercises:', error);
    else setExercises(data);
  };

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded mb-4">
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text className="font-bold mt-2">Personal Record:</Text>
            <Text>
              {item.personal_records[0]?.one_rep_max} lbs (
              {new Date(item.personal_records[0]?.date).toLocaleDateString()})
            </Text>
            <Text className="font-bold mt-2">History:</Text>
            {item.workouts.map((workout, index) => (
              <View key={index} className="ml-4">
                <Text>{new Date(workout.date).toLocaleDateString()}</Text>
                {workout.exercises
                  .filter((e) => e.name === item.name)
                  .map((exercise, exerciseIndex) => (
                    <View key={exerciseIndex} className="ml-4">
                      {exercise.sets.map((set, setIndex) => (
                        <Text key={setIndex}>
                          Set {setIndex + 1}: {set.reps} reps @ {set.weight} lbs
                          (1RM: {calculateOneRepMax(set.weight, set.reps).toFixed(2)} lbs)
                        </Text>
                      ))}
                    </View>
                  ))}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default ExerciseHistory;
