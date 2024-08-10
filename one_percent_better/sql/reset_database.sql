-- Drop existing tables if they exist
DROP TABLE IF EXISTS personalRecords CASCADE;
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS workoutExercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    userId uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    hashedPassword text NOT NULL,
    username text,
    created_at timestamptz DEFAULT current_timestamp
);

-- Create exercises table
CREATE TABLE exercises (
    exerciseId uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL
);

-- Create personalRecords table
CREATE TABLE personalRecords (
    prId uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    userId uuid REFERENCES users(userId) ON DELETE CASCADE,
    exerciseId uuid REFERENCES exercises(exerciseId) ON DELETE CASCADE,
    setId uuid REFERENCES sets(setId) ON DELETE CASCADE,
    oneRepMax numeric,
    date timestamptz DEFAULT current_timestamp,
    isCurrent bool DEFAULT true
);

-- Create recipes table
CREATE TABLE recipes (
    id int8 PRIMARY KEY,
    "food name" text NOT NULL,
    ingredients text NOT NULL,
    highorlowcalories bool,
    directions text,
    image_address text,
    calories int2,
    "protein (grams)" int2
);

-- Create sets table
CREATE TABLE sets (
    setId uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workoutExerciseId uuid REFERENCES workoutExercises(workoutExerciseId) ON DELETE CASCADE,
    setNumber int4,
    reps int4,
    weight numeric
);

-- Create workoutExercises table
CREATE TABLE workoutExercises (
    workoutExerciseId uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workoutId uuid REFERENCES workouts(workoutId) ON DELETE CASCADE,
    exerciseId uuid REFERENCES exercises(exerciseId) ON DELETE CASCADE
);

-- Create workouts table
CREATE TABLE workouts (
    workoutId uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    userId uuid REFERENCES users(userId) ON DELETE CASCADE,
    date timestamptz,
    duration interval
);
