export default function (name: string) {
  return `{
  "name": "${name}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist",
    "test": "echo testing ${name}",
    "deploy": "echo deploying ${name}",
    "lint": "echo linting ${name}",
    "dev": "echo dev ${name}"
  },
  "devDependencies": {
    "config": "*",
    "tsconfig": "*",
    "typescript": "^4.5.4"
  }
}`;
}
