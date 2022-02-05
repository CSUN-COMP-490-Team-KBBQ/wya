import assert from 'assert';
import Debug from 'debug';

import { firebaseAuth } from '../firebase';

const debug = Debug('wya-api:etl/firebase/createNewUser');

type CreateNewUserParams = {
  email: string;
  password: string;
};

export const etlFirebaseCreateNewUser = (
  params: CreateNewUserParams,
  { firebaseAuthInjection = firebaseAuth } = {}
) => {
  const { email, password } = params;

  assert(email);
  assert(password);

  debug(`Creating a new user: ${email}`);
  return firebaseAuthInjection.createUser({ email, password });
};
