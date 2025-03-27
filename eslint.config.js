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
    // Also ignore eslint.config.js globally if preferred, but better to ignore in specific block
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },

  // ****** MODIFIED BLOCK for CommonJS Config Files ******
  {
    // Target JS/CJS files typically used for config at the project root
    files: ['*.js', '*.cjs', '*.mjs'],
    // IMPORTANT: Ignore eslint.config.js within this specific block
    ignores: ['eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node, // Add Node.js globals like module, require, process
      },
      sourceType: 'commonjs', // Indicate these are CommonJS modules
    },
    // Optionally add specific rules or disable inherited ones for config files
    // rules: {
    //   '@typescript-eslint/...': 'off', // Turn off TS rules if they wrongly apply
    // }
  },
  // ****** END MODIFIED BLOCK ******

  // Configuration for TypeScript and React files (Main Application Code)
  {
    files: ['src/**/*.{ts,tsx}'], // Target main source files
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module', // This block is for ES Modules
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser, // Define standard browser globals (window, document, fetch, URL, etc.)
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
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'prettier/prettier': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'info', 'debug', 'group', 'groupEnd', 'log'] },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Configuration specifically for Test Files (Jest)
  {
    files: ['src/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
