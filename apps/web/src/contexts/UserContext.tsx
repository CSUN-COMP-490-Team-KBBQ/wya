import React from 'react';
import { User } from 'firebase/auth';

import firebaseAuth from '../modules/firebase/auth';

const UserContext = React.createContext<User | null>(null);

export const UserAuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => firebaseAuth.onAuthStateChanged(setUser), []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserContext = (): { user: User | null } => {
  const user = React.useContext(UserContext);
  if (user === undefined) {
    throw new Error(
      'useUserContext hook must be used within an UserAuthProvider'
    );
  }
  return { user };
};
