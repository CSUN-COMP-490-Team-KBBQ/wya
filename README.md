# wya

## Principles / Guidelines

1. Git
   1. Commit messages must follow these rules:
      - Message is proper grammar (no need for period at the end)
      - Imperative mood (act as if you are telling Git to do something)
        Examples:
        - `Update package`
        - `Fix bug where input is not being read`
        - `Refactor with better function names`
   2. **Do not** commit directly to main
   3. Open pull requests (PR) to merge changes into `staging`
   4. Try to keep PRs small
   5. Once a PR has been merged, please delete your branch -- this will help keep our repo branches clean.
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

1. Make sure your code editor has prettier installed. Each app and package has its own ts, eslint, and prettier config.
   - For vscode:
     - prettier - esbenp.prettier-vscode
2. `npm install` at the root of this directory
3. At the root of this directory run `npm run dev` to run the dev environments across all apps

## Usage

npm commands should be executed at the root of this repository (ie. same level as this README)

### Installing packages

We use [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) in tandem with turbo repo to either run npm commands across all `apps` and `packages` or on singular `workspaces`.

For example if you wanted to install a package that should be accessible for all `workspaces`, like `typescript`, you would run the command

`npm install typescript --save-dev`

This will save typescript as a dev dependency across all `workspaces`. If you wanted to install a certain package on a particular workspace, like the `web` app, then you would run the command

`npm install react --workspace=web`

This command will only be installed on the for the `web` app, you can verify this by checking that directory's `package.json`.

### Executing npm scripts

Similar to `npm install` executing npm scripts like build, test, lint, can all be executed at the root level in order to run the npm script across all `apps` and `packages`, ie., running `npm run build` will build all `apps` and `packages`.

In addition to this you can also execute commands within the scope of a workspace with a flag similar to the `--workspace` flag. If you made changes to `apps/web` and wanted to build all the related `packages` then you would execute the command: `npm run build -- --scope=web`. This will build all `packages` that `apps/web` relies on first before building `apps/web`.
