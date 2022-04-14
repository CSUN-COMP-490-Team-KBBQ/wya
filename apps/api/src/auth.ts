import assert from 'assert';
import { Request } from 'express';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

import { firebaseClient } from './modules/firebase';
import { User } from './interfaces';
import { makeApiError } from '../lib/errors';

const _firebaseAuth = getFirebaseAuth(firebaseClient);

export type AuthContext = {
  token?: string;
  user?: Partial<User>;
};

const _capabilities = (context: AuthContext, document: any): string[] => {
  /** PLEASE KEEP CAPABILITIES IN ALPHABETICAL ORDER */

  const baseCapabilities = ['etl/event-plans/create', 'etl/users/create'];

  // Check that the document belongs to the user
  if (document && document.uid && context.user?.uid === document.uid) {
    return [
      ...baseCapabilities,
      'etl/events/guests/update',
      'etl/users/delete',
      'etl/users/update',
    ];
  }

  // Check that the document belongs to the host user
  if (document && document.hostId && context.user?.uid === document.hostId) {
    return [...baseCapabilities];
  }

  return [...baseCapabilities];
};

/**
 * Authorize a capability against a given context
 * @param capability
 * @param context
 */
export const authorize = (
  capability: string,
  context: AuthContext,
  document: any
) => {
  const authorized = _capabilities(context, document).includes(capability);
  if (!authorized) {
    throw makeApiError(401, 'Unauthorized');
  }
  return true;
};

/**
 * Authenticate a request and return a context
 * @param req
 * @returns
 */
export const authenticate = async (req: Request) => {
  const context: AuthContext = {};

  const [type, token] = (req.headers['authorization'] ?? '').split(' ');

  assert(type === 'Bearer', makeApiError(400, 'Bad request'));

  // Token may be empty string intended for new users
  assert(token || token === '', makeApiError(400, 'Bad request'));

  // Validate token
  try {
    const { uid, email } = await _firebaseAuth.verifyIdToken(token, true);
    context.token = token;
    context.user = { uid, email };
  } catch (err: any) {
    if (err?.code === 'auth/user-disabled') {
      throw makeApiError(422, 'User is disabled');
    }

    if (err?.code === 'auth/id-token-revoked') {
      throw makeApiError(422, 'User access has been revoked');
    }

    throw makeApiError(401, 'Unauthorized', err);
  }

  return context;
};
