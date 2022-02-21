import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import './Recaptcha.css';

type RecaptchaProps = {
  recaptchaRef: React.MutableRefObject<ReCAPTCHA | null>;
};

export default function Recaptcha({
  recaptchaRef,
}: RecaptchaProps): JSX.Element {
  return (
    <ReCAPTCHA
      data-testid="recaptcha"
      sitekey={(process.env.RECAPTCHA_SITEKEY as string) || ''}
      ref={recaptchaRef}
      size="invisible"
    />
  );
}
