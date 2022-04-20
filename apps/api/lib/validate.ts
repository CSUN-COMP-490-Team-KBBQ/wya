import assert from 'assert';
import Ajv, { Schema } from 'ajv';
import { isEmpty } from 'lodash/fp';

const ajv = new Ajv();

export function validate<T>(schema: Schema, params: any, err?: any) {
  assert(!isEmpty(schema), err || new Error('Empty schema is not allowed'));

  const validator = ajv.compile<T>(schema);
  const valid = validator(params);

  if (!valid) {
    throw (
      err ||
      new Error(
        validator?.errors ? validator?.errors[0].message : 'Invalid params'
      )
    );
  }
}
