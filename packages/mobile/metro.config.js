const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the workspace root (hoisted dependencies)
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Ensure Metro can find modules in the root node_modules
config.resolver.extraNodeModules = {
  'expo-router': path.resolve(workspaceRoot, 'node_modules/expo-router'),
  expo: path.resolve(workspaceRoot, 'node_modules/expo'),
  react: path.resolve(workspaceRoot, 'node_modules/react'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

// 4. Force Metro to resolve modules from the workspace root
config.resolver.disableHierarchicalLookup = true;

module.exports = config;