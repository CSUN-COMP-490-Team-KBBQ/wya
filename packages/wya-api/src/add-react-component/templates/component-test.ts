import assert from 'assert';

export default function (name: string) {
  assert(name, 'Component name is required.');

  return `import React from 'react';
import { render } from '@testing-library/react';
import ${name} from './${name}';

it('renders', () => {
  render(<${name} />);
  expect(true).toBeTruthy();
});
  `;
}
