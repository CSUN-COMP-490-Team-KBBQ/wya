import assert from 'assert';

export default function (name: string) {
  assert(name, 'Component name is required.');

  return `import React from 'react';
import './${name}.css';

type ${name}Props = {};

const ${name}: React.FC<${name}Props> = () => {
  return <></>;
};

export default ${name};
  `;
}
