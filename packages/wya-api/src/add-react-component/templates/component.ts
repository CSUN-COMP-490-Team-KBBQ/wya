export default function (name: string) {
  return `import React from 'react';
import './${name}.css';

type ${name}Props = {};

const ${name}: React.FC<${name}Props> = () => {
  return <></>;
};

export default ${name};
  `;
}
