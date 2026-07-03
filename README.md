# 7 Day Meals Staff Backend

Backend API for 7 Day Meals Staff application.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run start:dev
```

The application will typically be running on [http://localhost:3000](http://localhost:3000) (depending on the port configured).

## Folder Structure

```text
7day-meals-staff-backend/
+-- src/
|   +-- app.controller.spec.ts
|   +-- app.controller.ts
|   +-- app.module.ts
|   +-- app.service.ts
|   +-- main.ts
+-- test/
|   +-- app.e2e-spec.ts
|   +-- jest-e2e.json
+-- .gitignore
+-- .prettierrc
+-- eslint.config.mjs
+-- nest-cli.json
+-- package.json
+-- package-lock.json
+-- README.md
+-- tsconfig.build.json
+-- tsconfig.json
```

Generated folders such as `dist/` and `node_modules/` are not shown.

## Directory Notes

- `src/` contains the application source code (TypeScript).
  - `main.ts`: Application entry point which bootstraps the Nest application.
  - `app.module.ts`: The root application module.
- `test/` contains end-to-end and integration tests.

## Scripts

```bash
npm run start:dev   # Watch mode for development
npm run build       # Build the application
npm run start:prod  # Run production build
npm run test        # Run unit tests
npm run lint        # Run linter
```

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)

## Repository Rules for Staff

### Branching Strategy

- The repository has two primary branches: `main` and `dev`.
- **Development**: All new features, bug fixes, and changes must be implemented by creating a new branch based off the `dev` branch.
- **Merging**: Once your implementation is complete and tested, merge your branch back into the `dev` branch.
- **Deployment**: The `main` branch is strictly reserved for deployment. Merges into `main` are handled only after all features are completed and validated in `dev`.

### Branch Naming Conventions

Please use descriptive branch names that indicate the purpose of the branch. We recommend the following prefixes:
- `feat/` for new features (e.g., `feat/login-endpoint`)
- `fix/` for bug fixes (e.g., `fix/auth-middleware`)
- `chore/` for maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/` for documentation changes

### Commit Message Conventions

We follow conventional commits to maintain a readable and organized project history. Each commit message should start with a specific type:

- `feat:` A new feature
- `fix:` A bug fix
- `chore:` Changes to the build process or auxiliary tools and libraries (no production code change)
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests

Example: `feat: add user authentication`
