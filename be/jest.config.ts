export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  moduleNameMapper: {
    '^@brightwheel/shared$': '<rootDir>/../../packages/shared/src',
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  maxWorkers: 1,
}
