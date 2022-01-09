import * as fp from 'lodash/fp';
import * as fs from 'fs-extra';
import * as nodePath from 'path';
import component from './templates/component';
import componentCss from './templates/component-css';
import componentTest from './templates/component-test';

type addReactComponentParams = {
  name: string;
  path?: string;
  web?: boolean;
  mobile?: boolean;
  ui?: boolean;
};

const addReactComponent = (
  params: addReactComponentParams,
  { fsInjection = fs } = {}
) => {
  let { name, path, web, mobile, ui } = params;
  name = fp.pipe(fp.camelCase, fp.upperFirst)(name);

  const cwd = process.cwd();
  let dir;

  if (path) {
    dir = nodePath.resolve(cwd, path);
    console.log(`Adding react component [${name}] to ${dir}`);

    console.log(`Added ${dir}`);
    return;
  }

  if (web) {
    console.log(`Adding react component [${name}] to web app`);
    dir = nodePath.join(cwd, 'apps', 'web', 'src', 'components', name);

    if (fsInjection.existsSync(dir)) {
      console.error(`[${name}] component already exists.`);
      return;
    }

    fsInjection.ensureDirSync(dir);

    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.tsx`),
      component(name)
    );
    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.spec.tsx`),
      componentTest(name)
    );
    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.css`),
      componentCss()
    );

    console.log(`Added ${dir}`);
  }

  if (mobile) {
    console.log(`Adding react component [${name}] to mobile app`);
    dir = nodePath.join(cwd, 'apps', 'mobile', 'src', 'components', name);

    if (fsInjection.existsSync(dir)) {
      console.error(`[${name}] component already exists.`);
      return;
    }

    fsInjection.ensureDirSync(dir);

    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.tsx`),
      component(name)
    );
    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.spec.tsx`),
      componentTest(name)
    );
    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.css`),
      componentCss()
    );

    console.log(`Added ${dir}`);
  }

  if (ui) {
    console.log(`Adding react component [${name}] to ui package`);
    dir = nodePath.join(cwd, 'packages', 'ui', 'src', 'components', name);

    if (fsInjection.existsSync(dir)) {
      console.error(`[${name}] component already exists.`);
      return;
    }

    fsInjection.ensureDirSync(dir);

    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.tsx`),
      component(name)
    );
    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.spec.tsx`),
      componentTest(name)
    );
    fsInjection.writeFileSync(
      nodePath.join(dir, `${name}.css`),
      componentCss()
    );

    console.log(`Added ${dir}`);
  }
};

export default addReactComponent;
