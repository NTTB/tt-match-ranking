module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/src/__tests__\.+\.test\.ts$',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
    }
  }
};