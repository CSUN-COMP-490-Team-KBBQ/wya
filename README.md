# wya

## Principles / Guidelines

1. Git
   1. Commit messages must follow (TBD)
   2. **Do not** commit directly to main
   3. Open pull requests (prs) to merge changes into `staging`
   4. Try to keep prs small
2. General
   1. Follow linting rules (helps to install prettier / eslint plugins for your editor)

## Repository Structure

This repo is architeched as a monorepo with high modularity. The main motivation for high modularity is so that independent `packages` can be reused across many different `apps`. For example, a `package` that contains all fundamental business logic could not only be easily maintained within one module but, simply imported across many different applications such as a cli app, web app, mobile app, rest-api app, etc.

We use [turborepo](https://turborepo.org/) as the tool to manage our monorepo.

```
*root*
- apps
   - cli       : our cli tool that provides many useful functions for both dev and prod environments
   - web       : our web application
   - mobile    : our mobile application
   - functions : our firebase cloud-functions
- packages
   - config   : shared configurations
   - tsconfig : typescript configurations
   - wya-api  : core / business logic
```

## Installation

1. `npm install` on root of this repo
