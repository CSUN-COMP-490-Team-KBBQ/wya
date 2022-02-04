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
   - functions : our firebase cloud-functions
   - discord   : our discord integration
- packages
   - config   : shared configurations
   - tsconfig : typescript configurations
   - wya-api  : core / business logic
```

## Setup

1. `npm install` at the root of this directory
2. Navigate into the `apps/web` directory and run `npm install` (Annoying react-scripts webpack issue and firebase; easiest fix so far without having to stop using react-scripts)
3. At the root of this directory run `npm run dev` to run the dev environments across all apps
