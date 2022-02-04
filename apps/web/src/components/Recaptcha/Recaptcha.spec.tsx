import React from 'react';
import { render } from '@testing-library/react';
import Recaptcha from './Recaptcha';

function RecaptchaStub(): JSX.Element {
    const recaptchaRef = React.useRef(null);
    return <Recaptcha recaptchaRef={recaptchaRef} />;
}

it('renders component', () => {
    const { queryByTestId } = render(<RecaptchaStub />);
    expect(queryByTestId('recaptcha')).toBeTruthy();
});
