/**
 * Copied from turborepo kitchen-sink example
 * https://github.com/vercel/turborepo/blob/main/examples/kitchen-sink/packages/scripts/jest/root/jest-preset.js
 */
module.exports = {
  transform: {
    '.(ts|tsx)$': 'ts-jest',
    '.(js|jsx)$': 'babel-jest', // jest's default
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  projects: ['<rootDir>/packages/*', '<rootDir>/apps/*'],
  coverageDirectory: '<rootDir>/coverage/',
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,tsx}'],
  testURL: 'http://localhost/',
  moduleNameMapper: {
    '.json$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules'],
};
