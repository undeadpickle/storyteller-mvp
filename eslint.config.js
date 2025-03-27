// eslint.config.js
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import jestPlugin from 'eslint-plugin-jest'; // Import the Jest plugin
import globals from 'globals'; // Import globals

export default [
  // Apply recommended JS rules globally
  js.configs.recommended,

  // Global ignores for common directories
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },

  // Configuration for TypeScript and React files (Main Application Code)
  {
    files: ['src/**/*.{ts,tsx}'], // Target main source files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser, // Define standard browser globals (window, document, fetch, URL, etc.)
        // Add any other specific globals needed ONLY for your main app code here
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Apply recommended rules from plugins
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Custom rule adjustments for app code
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/prop-types': 'off', // Prefer TypeScript for prop types
      'prettier/prettier': 'warn', // Show Prettier issues as warnings
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Optional: relax rule for inferred return types
      '@typescript-eslint/no-unused-vars': [
        'warn', // Warn about unused variables
        { argsIgnorePattern: '^_' }, // Allow unused args starting with _
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug', 'group', 'groupEnd'] }], // Allow specific console methods, especially for your logger

      // Disable rules specifically for non-test code if needed (usually not necessary)
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },

  // Configuration specifically for Test Files (Jest)
  {
    files: ['src/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'], // Target test files
    plugins: {
      jest: jestPlugin, // Enable the Jest plugin
    },
    languageOptions: {
      // Test files run in Node.js via Jest, often with JSDOM simulating a browser
      globals: {
        ...globals.node, // Add Node.js globals (e.g., process)
        ...globals.jest, // Add Jest globals (e.g., describe, it, expect, jest)
        ...globals.browser, // Add Browser globals if using JSDOM (e.g., fetch, URL, window)
      },
    },
    rules: {
      // Apply Jest recommended rules
      ...jestPlugin.configs.recommended.rules,

      // Optional: Relax or adjust certain rules ONLY for test files if necessary
      // e.g., allow more 'any' types, console logs, or specific patterns common in tests
      // "@typescript-eslint/no-explicit-any": "off",
      // "no-console": "off",
    },
  },
];
