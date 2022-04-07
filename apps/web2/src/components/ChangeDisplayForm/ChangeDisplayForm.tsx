import React from 'react';
import Form from 'react-bootstrap/Form';

import './ChangeDisplayForm.css';

export default function ChangeDisplayForm(): JSX.Element {
  return (
    <Form.Group>
      <Form.Check type="checkbox" label="Use 12-Hour Clock" />
    </Form.Group>
  );
}
