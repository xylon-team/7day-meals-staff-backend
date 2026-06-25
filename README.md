<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Folder structure

Below is a recommended and commonly used NestJS project layout with explanations for each folder and key file. This project follows the default Nest starter layout with additions to support testing, configuration and build artifacts.

```
./
├─ node_modules/           # installed packages
├─ src/                   # application source (TypeScript)
│  ├─ main.ts             # application entry (bootstraps Nest app)
│  ├─ app.module.ts       # root application module (imports modules/providers)
│  ├─ app.controller.ts   # example controller (route handlers)
│  ├─ app.service.ts      # example service (business logic)
│  ├─ modules/            # feature modules (group related controllers/services)
│  │  └─ users/           # example feature module
│  │     ├─ users.module.ts
│  │     ├─ users.controller.ts
│  │     ├─ users.service.ts
│  │     ├─ dto/          # Data Transfer Objects (validation shapes)
│  │     └─ entities/     # persistence/entities/models
│  ├─ common/             # shared utilities, pipes, guards, interceptors, filters
│  ├─ config/             # configuration (env loaders, config modules)
│  ├─ database/           # database setup (ORM config, migrations, seeds)
│  └─ interfaces/         # shared TypeScript interfaces and types
├─ test/                  # e2e and integration tests
│  ├─ app.e2e-spec.ts
│  └─ jest-e2e.json
├─ dist/                  # compiled output (after build)
├─ .env                   # environment variables (not committed)
├─ package.json           # scripts and dependencies
├─ tsconfig.json          # TypeScript config for development
├─ tsconfig.build.json    # TypeScript config for building production bundle
└─ README.md
```

Notes on responsibilities and conventions

- `src/main.ts`: bootstraps the Nest application and sets up global pipes, filters, interceptors, and CORS. Keep bootstrapping small — move heavy initialization into modules/providers.
- `app.module.ts`: root module; assemble and import feature modules, global providers and configuration modules here.
- Feature modules (`src/modules/...`): encapsulate controllers, providers, DTOs and entities for a bounded context. Use modules to group functionality and enable lazy loading or re-use.
- `dto/`: use DTO classes with class-validator decorators to enforce incoming request shapes. Register `ValidationPipe` globally in `main.ts` for automatic validation.
- `common/`: place reusable guards, pipes, interceptors, exception filters, and helper functions here. Export shared providers from an index so feature modules can import them easily.
- `config/`: keep environment-specific configuration and a `ConfigModule` (e.g., `@nestjs/config`) to centralize access to env variables and typed config.
- `database/`: keep ORM initialization (TypeORM / Prisma / Sequelize), repository setup, and migrations/seeds here.

Best practices and commands

- Development: `npm run start:dev` (watch mode using `ts-node-dev` or `nest start --watch`)
- Build for production: `npm run build` -> emits compiled JS to `dist/`
- Run production build: `npm run start:prod` (executes compiled code from `dist/`)
- Tests:
  - Unit: `npm run test`
  - E2E: `npm run test:e2e`
  - Coverage: `npm run test:cov`

If you want, I can adapt this section to match your repository's exact modules and files (for example: listing `src/modules/auth`, `src/modules/meals`, or any domain-specific folders). Tell me which areas you'd like expanded.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
