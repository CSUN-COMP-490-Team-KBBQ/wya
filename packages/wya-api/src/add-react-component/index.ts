import assert from 'assert';
import path from 'path';
import fp from 'lodash/fp';
import fs from 'fs-extra';

import makeComponent from './templates/component';
import makeComponentCss from './templates/component-css';
import makeComponentTest from './templates/component-test';

type addReactComponentParams = {
  name: string;
  filepath?: string;
  web?: boolean;
  mobile?: boolean;
  ui?: boolean;
};

const addReactComponent = (
  params: addReactComponentParams,
  { fsInjection = fs } = {}
) => {
  const { filepath, web, mobile, ui } = params;
  let { name } = params;
  name = fp.pipe(fp.camelCase, fp.upperFirst)(name);

  assert(name, 'Component name is required.');

  const cwd = process.cwd();
  let dir;

  if (filepath) {
    dir = path.resolve(cwd, filepath);
    assert(!fsInjection.existsSync(dir), `[${dir}] does not exist.`);

    console.log(`Adding react component [${name}] to ${dir}`);
    console.log(`Added ${dir}`);
    return;
  }

  if (web) {
    console.log(`Adding react component [${name}] to web app`);
    dir = path.join(cwd, 'apps', 'web', 'src', 'components', name);

    assert(!fsInjection.existsSync(dir), `[${name}] component already exists.`);

    fsInjection.ensureDirSync(dir);
    assert(path.resolve(dir), `Cannot resolve [${dir}].`);

    fsInjection.writeFileSync(
      path.join(dir, `${name}.tsx`),
      makeComponent(name)
    );
    fsInjection.writeFileSync(
      path.join(dir, `${name}.spec.tsx`),
      makeComponentTest(name)
    );
    fsInjection.writeFileSync(
      path.join(dir, `${name}.css`),
      makeComponentCss()
    );

    console.log(`Added ${dir}`);
  }

  if (mobile) {
    console.log(`Adding react component [${name}] to mobile app`);
    dir = path.join(cwd, 'apps', 'mobile', 'src', 'components', name);

    assert(!fsInjection.existsSync(dir), `[${name}] component already exists.`);

    fsInjection.ensureDirSync(dir);
    assert(path.resolve(dir), `Cannot resolve [${dir}].`);

    fsInjection.writeFileSync(
      path.join(dir, `${name}.tsx`),
      makeComponent(name)
    );
    fsInjection.writeFileSync(
      path.join(dir, `${name}.spec.tsx`),
      makeComponentTest(name)
    );
    fsInjection.writeFileSync(
      path.join(dir, `${name}.css`),
      makeComponentCss()
    );

    console.log(`Added ${dir}`);
  }

  if (ui) {
    console.log(`Adding react component [${name}] to ui package`);
    dir = path.join(cwd, 'packages', 'ui', 'src', 'components', name);

    assert(!fsInjection.existsSync(dir), `[${name}] component already exists.`);

    fsInjection.ensureDirSync(dir);
    assert(path.resolve(dir), `Cannot resolve [${dir}].`);

    fsInjection.writeFileSync(
      path.join(dir, `${name}.tsx`),
      makeComponent(name)
    );
    fsInjection.writeFileSync(
      path.join(dir, `${name}.spec.tsx`),
      makeComponentTest(name)
    );
    fsInjection.writeFileSync(
      path.join(dir, `${name}.css`),
      makeComponentCss()
    );

    console.log(`Added ${dir}`);
  }
};

export default addReactComponent;
