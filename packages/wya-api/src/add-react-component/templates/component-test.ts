export default function (name: string) {
  return `import React from 'react';
import { render } from '@testing-library/react';
import ${name} from './${name}';

it('renders', () => {
  render(<${name} />);
  expect(true).toBeTruthy();
});
  `;
}
