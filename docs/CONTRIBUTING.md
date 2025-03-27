# Contributing to StoryTeller MVP

Thank you for your interest in contributing to StoryTeller! This document provides guidelines and instructions for contributing to this project.

## Code Style and Standards

We use ESLint and Prettier to maintain code quality and consistency:

- Run `npm run lint` to check your code for style issues
- Run `npm run format` to automatically format your code
- The CI pipeline will fail if linting errors are present

## Branching Strategy

- `main` branch contains production-ready code
- Feature branches should be created from `main` and named using the format: `feature/your-feature-name`
- Bug fix branches should be named: `fix/your-fix-name`

## Pull Request Process

1. Ensure all tests pass (`npm run test`)
2. Update documentation if necessary
3. Resolve any merge conflicts
4. Get at least one code review from a maintainer
5. Once approved, your PR will be merged

## Debugging

The project includes several debugging utilities to help during development:

- Refer to `docs/debugging.md` for detailed information on using these tools
- Use the debug panel (toggle with `Ctrl+Shift+D`) during development

## Testing

- Write tests for all new features
- Run `npm run test` to run all tests
- Run `npm run test:watch` to run tests in watch mode

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

## Development Environment

1. Follow the setup instructions in the README.md
2. Create a `.env` file with your API keys (based on `.env.example`)
3. Use Node.js LTS version for development

## Project Structure

Maintain the existing project structure when adding new files:

- Place components in `src/components/`
- Place hooks in `src/hooks/`
- Place services in `src/services/`
- Place utilities in `src/utils/`
- Place store modules in `src/store/`
- Place AI prompts in `src/prompts/`

## Code of Conduct

- Be respectful and inclusive in all communications
- Constructive criticism is welcome, but always focus on the code, not the person
- Help maintain a positive environment for all contributors
