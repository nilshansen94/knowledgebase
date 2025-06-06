/* eslint-disable */
export default {
  displayName: 'knowledgebase',
  preset: '../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../coverage/knowledgebase',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!crypto-hash)'
  ],
  modulePaths: [
    '<rootDir>'
  ],
  testPathIgnorePatterns: [
    //'e2e/tests/*',
    '/node_modules/',
    //'src/environments/*'
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
