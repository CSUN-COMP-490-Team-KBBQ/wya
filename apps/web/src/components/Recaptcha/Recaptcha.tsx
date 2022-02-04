import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import './Recaptcha.css';

type RecaptchaProps = {
  recaptchaRef: React.RefObject<ReCAPTCHA>;
  onChange?: (token: string | null) => void;
};

export default function Recaptcha({
  recaptchaRef,
  onChange,
}: RecaptchaProps): JSX.Element {
  return (
    <ReCAPTCHA
      data-testid="recaptcha"
      sitekey={(process.env.REACT_APP_RECAPTCHA_SITEKEY as string) || ''}
      ref={() => recaptchaRef}
      onChange={onChange}
      size="invisible"
    />
  );
}

Recaptcha.defaultProps = {
  onChange: undefined,
};
