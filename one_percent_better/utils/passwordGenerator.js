// File: utils/passwordGenerator.js

import bcrypt from 'react-native-bcrypt';

/**
 * Hashes a password using bcrypt
 * @param {string} password - The password to hash
 * @param {number} saltRounds - The number of salt rounds (default: 10)
 * @returns {Promise<string>} A promise that resolves with the hashed password
 */
export function hashPassword(password, saltRounds = 10) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        reject(err);
        return;
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  });
}

/**
 * Compares a password with a hash
 * @param {string} password - The password to check
 * @param {string} hash - The hash to compare against
 * @returns {Promise<boolean>} A promise that resolves with true if the password matches, false otherwise
 */
export function comparePassword(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
