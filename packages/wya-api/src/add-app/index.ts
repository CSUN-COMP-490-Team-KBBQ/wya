import assert from 'assert';
import path from 'path';
import fp from 'lodash/fp';
import fs from 'fs-extra';

import lintConfig from './templates/lint-config';
import packageJson from './templates/package-json';
import tsconfigJson from './templates/tsconfig-json';

const addApp = (name: string, { fsInjection = fs } = {}) => {
  name = fp.kebabCase(name);
  console.log(`Adding [${name}] to apps workspace.`);

  assert(name, 'App name is required.');

  const cwd = process.cwd();
  const dir = path.join(cwd, 'apps', name);

  assert(!fsInjection.existsSync(dir), `[${name}] app already exists`);

  fsInjection.ensureDirSync(dir);

  fsInjection.writeFileSync(path.join(dir, '.eslintrc.js'), lintConfig());
  fsInjection.writeFileSync(path.join(dir, 'package.json'), packageJson(name));
  fsInjection.writeFileSync(path.join(dir, 'tsconfig.json'), tsconfigJson());

  fsInjection.ensureDirSync(path.join(dir, 'src'));
  fsInjection.writeFileSync(path.join(dir, 'src', 'index.ts'), '');

  console.log(`Added ${dir}`);
};

export default addApp;
