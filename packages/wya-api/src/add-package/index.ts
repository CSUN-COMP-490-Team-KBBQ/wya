import * as fp from 'lodash/fp';
import * as fs from 'fs-extra';
import * as path from 'path';
import lintConfig from './templates/lint-config';
import packageJson from './templates/package-json';
import tsconfigJson from './templates/tsconfig-json';

const addPackage = (name: string) => {
  name = fp.kebabCase(name);
  console.log(`Adding [${name}] to packages workspace.`);

  const cwd = process.cwd();
  const dir = path.join(cwd, 'packages', name);

  if (fs.existsSync(dir)) {
    console.error(`[${name}] package already exists.`);
    return;
  }

  fs.ensureDirSync(dir);

  fs.writeFileSync(path.join(dir, '.eslintrc.js'), lintConfig());
  fs.writeFileSync(path.join(dir, 'package.json'), packageJson(name));
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), tsconfigJson());

  fs.ensureDirSync(path.join(dir, 'src'));

  console.log(`Added ${dir}`);
};

export default addPackage;
