import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

const debug = Debug('wya-api:etl/firebase/create-new-user');

type CreateNewUserParams = {
  email: string;
  password: string;
};

type CreateNewUserContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseCreateNewUser = async (
  params: CreateNewUserParams,
  context: CreateNewUserContext
) => {
  const { email, password } = params;

  assert(email);
  assert(password);

  debug(`Creating a new user: ${email}`);

  try {
    const { firebase } = context;
    const firebaseAuth = firebase.auth();
    const { uid } = await firebaseAuth.createUser({ email, password });
    assert(uid);

    return {
      data: {
        uid,
      },
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewUser:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
