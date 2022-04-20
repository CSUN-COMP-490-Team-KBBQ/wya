import { validate } from '../validate';

it('throws on empty schema', () => {
  expect(() => {
    validate({}, {});
  }).toThrow();
});

it('throws given error', () => {
  const ERROR = 'Test Error';
  const testError = new Error(ERROR);

  expect(() => {
    validate(
      {
        type: 'object',
        required: ['key'],
        properties: { key: { type: 'string' } },
      },
      {},
      testError
    );
  }).toThrow(ERROR);

  expect(() => {
    validate({}, {}, testError);
  }).toThrow(ERROR);
});

it(`does not throw with emtpy string`, () => {
  validate(
    {
      type: 'object',
      properties: { 'g-recaptcha-response': { type: 'string' } },
    },
    {
      'g-recaptcha-response': '',
    }
  );

  expect(true).toBeTruthy();
});
