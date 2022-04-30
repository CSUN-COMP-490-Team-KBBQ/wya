import { Request } from 'express';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

import { firebaseClient } from './modules/firebase';
import { UserId, Email } from './interfaces';
import { makeApiError } from '../lib/errors';

const _firebaseAuth = getFirebaseAuth(firebaseClient);

export type AuthContext = {
  token?: string;
  user?: { uid: UserId; email: Email | undefined };
};

const _capabilities = (context: AuthContext, document: any): string[] => {
  /** PLEASE KEEP CAPABILITIES IN ALPHABETICAL ORDER */

  // Anyone should have these capabilities
  const anyonesCapabilities = [
    'etl/event-plans/create',
    'etl/users/create',
    'etl/users/send-friend-requests/create',
  ];

  // Owner of the document should have these capabilities
  if (document && document.uid && context.user?.uid === document.uid) {
    const docOwnerCapabilities = [
      ...anyonesCapabilities,
      'etl/events/guests/delete',
      'etl/events/guests/update-status',
      'etl/event-plans/availabilities/update',
      'etl/users/delete',
      'etl/users/friends/delete',
      'etl/users/notifications/update-status',
      'etl/users/receive-friend-requests/update-status',
      'etl/users/update-time-format',
    ];

    return docOwnerCapabilities;
  }

  // Host of the document should have these capabilities
  if (document && document.hostId && context.user?.uid === document.hostId) {
    const docHostCapabilities = [
      ...anyonesCapabilities,
      'etl/events/create',
      'etl/events/delete',
      'etl/events/update',
      'etl/events/delete-guests',
      'etl/events/update-guests',
      'etl/event-plans/delete',
      'etl/event-plans/update',
      'etl/event-plans/delete-invitees',
      'etl/event-plans/update-invitees',
    ];

    return docHostCapabilities;
  }

  return anyonesCapabilities;
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

  const [_type, token] = (req.get('authorization') ?? ' ').split(' ');

  try {
    if (token) {
      const { uid, email } = await _firebaseAuth.verifyIdToken(token, true);
      context.user = { uid, email };
    }

    context.token = token;
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
