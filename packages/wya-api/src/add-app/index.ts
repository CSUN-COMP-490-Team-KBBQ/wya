import * as fp from 'lodash/fp';
import * as fs from 'fs-extra';
import * as path from 'path';
import lintConfig from './templates/lint-config';
import packageJson from './templates/package-json';
import tsconfigJson from './templates/tsconfig-json';

const addApp = (name: string, { fsInjection = fs } = {}) => {
  name = fp.kebabCase(name);
  console.log(`Adding [${name}] to apps workspace.`);

  const cwd = process.cwd();
  const dir = path.join(cwd, 'apps', name);

  if (fsInjection.existsSync(dir)) {
    console.error(`[${name}] app already exists.`);
    return;
  }

  fsInjection.ensureDirSync(dir);

  fsInjection.writeFileSync(path.join(dir, '.eslintrc.js'), lintConfig());
  fsInjection.writeFileSync(path.join(dir, 'package.json'), packageJson(name));
  fsInjection.writeFileSync(path.join(dir, 'tsconfig.json'), tsconfigJson());

  fsInjection.ensureDirSync(path.join(dir, 'src'));

  console.log(`Added ${dir}`);
};

export default addApp;
