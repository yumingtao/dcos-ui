/*
  Generates configuration for jest.
 */
var fs = require('fs');
var path = require('path');
var roots = ['../src', '../plugins', '../tests', '../packages'];

if (process.env.npm_config_externalplugins) {
  roots.push(process.env.npm_config_externalplugins);
}

var config = {
  'automock': true,
  'roots': roots,
  'globals': {
    '__DEV__': true
  },
  'transform': { ".*": './preprocessor.js'},
  'setupTestFrameworkScriptFile': './setupTestFramework.js',
  'setupFiles': ['./setupEnv.js'],
  'testRegex': '/__tests__/.*\\-test\\.(es6|js)$',
  'moduleFileExtensions': [
    'js',
    'json',
    'es6'
  ],
  'modulePathIgnorePatterns': [
    '/tmp/',
    '/node_modules/',
    '/.module-cache/'
  ],
  'timers': 'fake',
  'coverageReporters': ["json", "lcov", "cobertura", "text"],
  // We need this to override jest's default ['/node_modules/']
  'transformIgnorePatterns' : [],
  'unmockedModulePathPatterns': [
    'babel-polyfill',
    'babel-runtime',
    'browser-info',
    'classnames',
    'd3',
    'deep-equal',
    'events',
    'flux',
    'jasmine-reporters',
    'localStorage',
    'mesosphere-shared-reactjs',
    'moment',
    'md5',
    'mixins/index',
    'src/js/config/',
    'src/js/constants',
    'src/js/plugin-bridge/AppReducer',
    'src/js/plugin-bridge/Hooks',
    'src/js/plugin-bridge/Loader',
    'src/js/plugin-bridge/middleware',
    'src/js/plugin-bridge/PluginSDK',
    'src/js/plugin-bridge/PluginTestUtils',
    'src/js/stores/BaseStore',
    'src/js/stores/GetSetBaseStore',
    'src/js/structs',
    'src/js/utils',
    'plugins',
    'react',
    'reactjs-components',
    'reactjs-mixin',
    'react-router',
    'redux',
    'tests',
    'underscore'
  ],
  'testPathIgnorePatterns': [
    '/tmp/',
    '/node_modules/'
  ]
};

fs.writeFileSync(
  path.resolve(__dirname, 'config.json'), JSON.stringify(config, null, 2)
);
