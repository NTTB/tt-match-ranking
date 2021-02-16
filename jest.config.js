module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/src/.+\.test\.ts$',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
    }
  }
};