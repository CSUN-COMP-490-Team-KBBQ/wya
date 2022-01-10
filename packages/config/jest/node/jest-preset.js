/**
 * Copied from turborepo kitchen-sink example
 * https://github.com/vercel/turborepo/blob/main/examples/kitchen-sink/packages/scripts/jest/node/jest-preset.js
 */
module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: [
    '<rootDir>/test/__fixtures__',
    '<rootDir>/node_modules',
    '<rootDir>/dist',
  ],
  preset: 'ts-jest',
};
