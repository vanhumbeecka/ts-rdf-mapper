module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    '<rootDir>/src/**/*',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/types/',
    '<rootDir>/src/index\.ts',
  ],
};
