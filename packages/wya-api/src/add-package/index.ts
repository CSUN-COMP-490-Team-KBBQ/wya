import assert from 'assert';
import path from 'path';
import fp from 'lodash/fp';
import fs from 'fs-extra';

import lintConfig from './templates/lint-config';
import packageJson from './templates/package-json';
import tsconfigJson from './templates/tsconfig-json';

const addPackage = (name: string, { fsInjection = fs } = {}) => {
  name = fp.kebabCase(name);
  console.log(`Adding [${name}] to packages workspace.`);

  assert(name, 'Package name is required.');

  const cwd = process.cwd();
  const dir = path.join(cwd, 'packages', name);

  assert(!fsInjection.existsSync(dir), `[${name}] package already exists`);

  fsInjection.ensureDirSync(dir);

  fsInjection.writeFileSync(path.join(dir, '.eslintrc.js'), lintConfig());
  fsInjection.writeFileSync(path.join(dir, 'package.json'), packageJson(name));
  fsInjection.writeFileSync(path.join(dir, 'tsconfig.json'), tsconfigJson());

  fsInjection.ensureDirSync(path.join(dir, 'src'));

  console.log(`Added ${dir}`);
};

export default addPackage;
