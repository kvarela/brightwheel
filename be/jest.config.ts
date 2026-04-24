export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  maxWorkers: 1,
  moduleNameMapper: {
    '^@brightwheel/shared$': '<rootDir>/../../packages/shared/src',
  },
}
