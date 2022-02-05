import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import './Recaptcha.css';

type RecaptchaProps = {
  ref: React.MutableRefObject<ReCAPTCHA | null>;
};

export default function Recaptcha({ ref }: RecaptchaProps): JSX.Element {
  return (
    <ReCAPTCHA
      data-testid="recaptcha"
      sitekey={(process.env.REACT_APP_RECAPTCHA_SITEKEY as string) || ''}
      ref={ref}
      size="invisible"
    />
  );
}
