import assert from 'assert';
import Debug from 'debug';

import { firebaseAuth } from '../firebase';

const debug = Debug('wya-api:etl/firebase/createNewUser');

type CreateNewUserParams = {
  email: string;
  password: string;
};

export const etlFirebaseCreateNewUser = async (
  params: CreateNewUserParams,
  { firebaseAuthInjection = firebaseAuth } = {}
) => {
  const { email, password } = params;

  assert(email);
  assert(password);

  debug(`Creating a new user: ${email}`);

  try {
    const { uid } = await firebaseAuthInjection.createUser({ email, password });
    assert(uid);

    return {
      data: {
        uid,
      },
    };
  } catch (err) {
    return {
      errors: [
        {
          status: '500',
          code: 'etlFirebaseCreateNewUser',
        },
      ],
    };
  }
};
