module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(css|less|scss|sass)$': 'jest-transform-css',
    '^.+\\.(png|jpg|jpeg|gif|svg|ico|webp)$': 'jest-transform-file',
  },
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/test/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
  ],
  
  // Collect coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!src/test/**/*',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/main.{ts,tsx,js,jsx}',
    '!src/vite-env.d.ts',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary',
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage provider
  coverageProvider: 'v8',
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Maximum workers
  maxWorkers: '50%',
  
  // Force exit
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/src/test/global-setup.ts',
  globalTeardown: '<rootDir>/src/test/global-teardown.ts',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost',
    customExportConditions: ['node', 'node-addons'],
  },
  
  // Extensions to treat as ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
        '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/src/**/integration/**',
        '<rootDir>/src/**/e2e/**',
      ],
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/src/**/integration/**/*.(test|spec).(ts|tsx|js|jsx)',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/src/test/setup.ts',
        '<rootDir>/src/test/integration-setup.ts',
      ],
    },
    {
      displayName: 'e2e',
      testMatch: [
        '<rootDir>/src/**/e2e/**/*.(test|spec).(ts|tsx|js|jsx)',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/src/test/setup.ts',
        '<rootDir>/src/test/e2e-setup.ts',
      ],
    },
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Notify mode
  notify: true,
  notifyMode: 'change',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Cache key
  cacheKey: {
    'jest-transform-css': '1.0.0',
    'jest-transform-file': '1.0.0',
  },
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Inject globals
  injectGlobals: false,
  
  // Module resolution
  moduleDirectories: ['node_modules', 'src'],
  
  // Roots
  roots: ['<rootDir>/src', '<rootDir>/test'],
  
  // Snapshot serializers
  snapshotSerializers: [
    'jest-serializer-path',
    'jest-serializer-html',
  ],
  
  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Sonar reporter
  sonar: {
    testPath: 'src',
    testResultsPath: 'test-results.xml',
    coveragePath: 'coverage/lcov.info',
  },
  
  // Performance testing
  perf: {
    maxMemory: 512,
    maxTime: 5000,
  },
  
  // Accessibility testing
  accessibility: {
    rules: {
      'color-contrast': { enabled: true },
      'button-name': { enabled: true },
      'image-alt': { enabled: true },
      'link-name': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'heading-order': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'region': { enabled: true },
    },
  },
  
  // Security testing
  security: {
    rules: {
      'no-eval': { enabled: true },
      'no-implied-eval': { enabled: true },
      'no-new-func': { enabled: true },
      'no-script-url': { enabled: true },
      'no-unsafe-regex': { enabled: true },
    },
  },
  
  // Bundle analysis
  bundleAnalyzer: {
    analyzerMode: 'static',
    analyzerOutputDir: 'bundle-analysis',
    openAnalyzer: false,
  },
  
  // Performance budgets
  performance: {
    budgets: [
      {
        type: 'initial',
        maximumWarning: '500kb',
        maximumError: '1mb',
      },
      {
        type: 'anyComponentStyle',
        maximumWarning: '2kb',
        maximumError: '4kb',
      },
    ],
  },
};
