import React from 'react';
import UserData from '../interfaces/User';
import { getDocSnapshot$ } from '../lib/firestore';
import { useUserContext } from './UserContext';

type UserRecordState = {
    pending: boolean;
    userRecord: UserData | null;
};

const UserRecordContext = React.createContext<UserRecordState>({
    pending: false,
    userRecord: null,
});

export const UserRecordProvider: React.FC = ({ children }) => {
    const [pending, setPending] = React.useState<boolean>(false);
    const [userRecord, setUserRecord] = React.useState<UserData | null>(null);

    const { user } = useUserContext();

    React.useEffect(() => {
        if (user) {
            setPending(true);
            return getDocSnapshot$(`/users/${user.uid}`, {
                next: (snapshot) => {
                    if (snapshot.exists()) {
                        setUserRecord(snapshot.data() as UserData);
                    }
                    setPending(false);
                },
            });
        }
        setUserRecord(null);
        setPending(false);
        return void 0;
    }, [user]);

    return (
        <UserRecordContext.Provider value={{ pending, userRecord }}>
            {children}
        </UserRecordContext.Provider>
    );
};

export const useUserRecordContext = (): UserRecordState => {
    const userRecord = React.useContext(UserRecordContext);
    if (userRecord === undefined) {
        throw new Error(
            'useUserRecordContext hook must be used within an UserRecordProvider'
        );
    }
    return userRecord;
};
