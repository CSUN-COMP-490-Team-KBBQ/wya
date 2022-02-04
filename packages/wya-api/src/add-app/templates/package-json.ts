import assert from 'assert';

export default function (name: string) {
  assert(name, 'App name is required.');

  return `{
  "name": "${name}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist",
    "test": "echo testing ${name}",
    "deploy": "echo deploying ${name}",
    "lint": "eslint src --fix",
    "dev": "echo dev ${name}"
  },
  "devDependencies": {
    "config": "*",
    "tsconfig": "*",
    "typescript": "^4.5.4"
  }
}`;
}
