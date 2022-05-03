import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import './FriendsPage.css';
import { Email, UserId, FRIEND_REQUEST_STATUS } from '../../interfaces';
import api from '../../modules/api';
import { getAllSubCollDocsSnapshot$ } from '../../lib/firestore';

type Friend = {
  friendFirstName: string;
  friendLastName: string;
  friendUid: UserId;
  uid: UserId;
};

type ReceiveFriend = {
  fromFirstName: string;
  fromLastName: string;
  fromUid: UserId;
  status: FRIEND_REQUEST_STATUS;
  uid: UserId;
};

type SendFriend = {
  status: FRIEND_REQUEST_STATUS;
  toFirstName: string;
  toLastName: string;
  toUid: UserId;
  uid: UserId;
};

export default function FriendsPage(): JSX.Element {
  const { userRecord } = useUserRecordContext();
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [receivedFriendRequests, setReceivedFriendRequests] = React.useState<
    ReceiveFriend[]
  >([]);
  const [sentFriendRequests, setSentFriendRequests] = React.useState<
    SendFriend[]
  >([]);

  const onAddFriendHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const formValues: {
      email: Email;
    } = Object.fromEntries(formData.entries()) as unknown as {
      email: Email;
    };

    const data = await api.post(
      '/users/send-friend-requests/create',
      JSON.stringify({ sendToUsersByEmail: [formValues.email] })
    );
    console.log(data);
  };

  const onAcceptFriendRequestHandler = async (fromUid: UserId) => {
    const data = await api.post(
      '/users/receive-friend-requests/update-status',
      JSON.stringify({ status: FRIEND_REQUEST_STATUS.ACCEPTED, fromUid })
    );
    console.log(data);
  };

  const onDeclineFriendRequestHandler = async (fromUid: UserId) => {
    const data = await api.post(
      '/users/receive-friend-requests/update-status',
      JSON.stringify({ status: FRIEND_REQUEST_STATUS.DECLINED, fromUid })
    );
    console.log(data);
  };

  const onDeleteFriendRequestHandler = async (friendUid: UserId) => {
    const data = await api.post(
      '/users/friends/delete',
      JSON.stringify({ friendByUserId: friendUid })
    );
    console.log(data);
  };

  React.useEffect(() => {
    if (userRecord) {
      const { uid } = userRecord;

      // Get friends
      const unsubscribeFriendSnapshot = getAllSubCollDocsSnapshot$(
        `/users/${uid}/friends/`,
        {
          next: (friendsSnapshot) => {
            setFriends(friendsSnapshot.docs.map((doc) => doc.data() as Friend));
          },
        }
      );

      // Get received friend requests
      const unsubscribeReceiveFriendRequestSnapshot =
        getAllSubCollDocsSnapshot$(`/users/${uid}/receive-friend-requests/`, {
          next: (receiveFriendRequestsSnapshot) => {
            setReceivedFriendRequests(
              receiveFriendRequestsSnapshot.docs.map(
                (doc) => doc.data() as ReceiveFriend
              )
            );
          },
        });

      // Get sent friend requests
      const unsubscribeSendFriendRequestSnapshot = getAllSubCollDocsSnapshot$(
        `/users/${uid}/send-friend-requests/`,
        {
          next: (sendFriendRequestsSnapshot) => {
            setSentFriendRequests(
              sendFriendRequestsSnapshot.docs.map(
                (doc) => doc.data() as SendFriend
              )
            );
          },
        }
      );

      // Not sure about this
      return () => {
        unsubscribeFriendSnapshot();
        unsubscribeReceiveFriendRequestSnapshot();
        unsubscribeSendFriendRequestSnapshot();
      };
    }
  }, [userRecord]);

  return (
    <Sidebar>
 <div className="flex-1 relative z-0 flex overflow-y-auto">
      <main className="flex-1 relative z-0 overflow-y-auto xl:order-last">
        {/* Start left column area */}
        <div className="relative inset-0 py-6 px-4 sm:px-6 lg:px-8">
          <div className="h-full">
          {/* Start left column data */}
          <h1 className="pt-4 flex justify-center">Friends List</h1>
                  <div className="w-96 mx-auto sm:px-6 lg:px-8">
                                                  {/* Begin line breaker */}
                                                  <br></br>
                              <br></br>
                              <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="w-full border-t border-gray-300"></div>
                                      </div>
                                      </div>
                                      {/* End line breaker */}
                    <div className="flow-root mt-6">

                      {friends.map(
                        ({ friendUid, friendFirstName, friendLastName }) => {
                          return (
                            <div className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {friendFirstName} {friendLastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Friend<br></br>
                                  </p>
                                  <button
                                    onClick={() =>
                                      onDeleteFriendRequestHandler(friendUid)
                                    }
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                                  >
                                    Delete
                                  </button>
                                </div>
                                {/* Keeping for reference to edit friends
                                <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div> */}
                              </div>
                              {/* Begin line breaker */}
                              <br></br>
                              <br></br>
                              <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="w-full border-t border-gray-300"></div>
                                      </div>
                                      </div>
                                      {/* End line breaker */}
                            </div>
                          );
                        }
                      )}
                      {receivedFriendRequests.map(
                        ({ fromUid, fromFirstName, fromLastName, status }) => {
                          return (
                            <div className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {fromFirstName} {fromLastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Recieved Friend Request<br></br>Status:{' '}
                                    {status}
                                  </p>
                                  <button
                                    onClick={() =>
                                      onAcceptFriendRequestHandler(fromUid)
                                    }
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      onDeclineFriendRequestHandler(fromUid)
                                    }
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                                  >
                                    Decline
                                  </button>
                                </div>
                                
                                {/* Keeping for reference to edit friends
                                <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div> */}
                              </div>
                              {/* Begin line breaker */}
                              <br></br>
                              <br></br>
                              <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="w-full border-t border-gray-300"></div>
                                      </div>
                                      </div>
                                      {/* End line breaker */}
                            </div>
                          );
                        }
                      )}
                      {sentFriendRequests.map(
                        ({ toFirstName, toLastName, status }) => {
                          return (
                            <div className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {toFirstName} {toLastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Sent Friend Request<br></br>Status: {status}
                                  </p>
                                </div>
                                {/* Keeping for reference to edit friends
                                <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div> */}
                              </div>
                              {/* Begin line breaker */}
                              <br></br>
                              <br></br>
                              <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="w-full border-t border-gray-300"></div>
                                      </div>
                                      </div>
                                      {/* End line breaker */}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                  {/* End left column data */}
          </div>
        </div>
        {/* End left column area */}
      </main>
      <aside className="flex-1 relative xl:order-last flex-col">
        {/* Start right column */}
        <div className="relative inset-0 py-6 px-4 sm:px-6 lg:px-8">
          <div className="h-full">
            {/* Start right column data */}
            <h1 className="pt-4 flex justify-center">Add a Friend</h1>
                                          {/* Begin line breaker */}
                                          <br></br>
                              <br></br>
                              <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="w-full border-t border-gray-300"></div>
                                      </div>
                                      </div>
                                      {/* End line breaker */}
              <br></br>
              <form onSubmit={onAddFriendHandler}>
                <label htmlFor="email-addres" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                <br></br>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <div
                      className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                      aria-hidden="true"
                    />
                  </span>
                  Add
                </button>
              </form>
          {/* End right column data */}
          </div>
        </div>
        {/* End right column */}
      </aside>
    </div>




{/* 
      <div className="flex-grow w-full max-w-full mx-auto xl:px-8 lg:flex bg-white">
        <div className="flex-1 min-w-0 bg-white lg:flex">
          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8 bg-white">
              <div style={{ minHeight: '36rem' }}>
                <div
                  style={{ width: '20rem' }}
                  className="h-full pl-6 py-6 bg-white"
                >
                  <h1 className="pt-4 flex justify-center">Friends List</h1>
                  <div className="w-96 mx-auto sm:px-6 lg:px-8">
                    <div className="flow-root mt-6">
                      {friends.map(
                        ({ friendUid, friendFirstName, friendLastName }) => {
                          return (
                            <li className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {friendFirstName} {friendLastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Friend<br></br>
                                  </p>
                                  <button
                                    onClick={() =>
                                      onDeleteFriendRequestHandler(friendUid)
                                    }
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                                  >
                                    Delete
                                  </button>
                                </div>
                                Keeping for reference to edit friends
                                <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div>
                              </div>
                            </li>
                          );
                        }
                      )}
                      {receivedFriendRequests.map(
                        ({ fromUid, fromFirstName, fromLastName, status }) => {
                          return (
                            <li className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {fromFirstName} {fromLastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Recieved Friend Request<br></br>Status:{' '}
                                    {status}
                                  </p>
                                  <button
                                    onClick={() =>
                                      onAcceptFriendRequestHandler(fromUid)
                                    }
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      onDeclineFriendRequestHandler(fromUid)
                                    }
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                                  >
                                    Decline
                                  </button>
                                </div>
                                Keeping for reference to edit friends
                                <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div>
                              </div>
                            </li>
                          );
                        }
                      )}
                      {sentFriendRequests.map(
                        ({ toFirstName, toLastName, status }) => {
                          return (
                            <li className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {toFirstName} {toLastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Sent Friend Request<br></br>Status: {status}
                                  </p>
                                </div>
                                Keeping for reference to edit friends
                                <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div>
                              </div>
                            </li>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: '40rem' }} className="h-full pl-6 py-6 bg-white">
          <div style={{ minHeight: '36rem' }}>
            <div
              style={{ width: '30rem' }}
              className="h-full pl-6 py-6 bg-white"
            >
              <h1 className="pt-4 flex justify-center">Add a Friend</h1>
              <br></br>
              <form onSubmit={onAddFriendHandler}>
                <label htmlFor="email-addres" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                <br></br>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <div
                      className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                      aria-hidden="true"
                    />
                  </span>
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      </div> */}
    </Sidebar>
  );
}