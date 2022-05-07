import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import { Email, UserId, FRIEND_REQUEST_STATUS } from '../../interfaces';
import api from '../../modules/api';
import { getAllSubCollDocsSnapshot$ } from '../../lib/firestore';
import { XCircleIcon } from '@heroicons/react/solid';

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
  const [displayError, setDisplayError] = React.useState<string>('');

  const onAddFriendHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const formValues: {
      email: Email;
    } = Object.fromEntries(formData.entries()) as unknown as {
      email: Email;
    };
    const regex = new RegExp(
      // eslint-disable-next-line no-control-regex
      '(?:[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])',
      'gm'
    );

    if (regex.test(formValues.email)) {
      setDisplayError('');

      const data = await api.post(
        '/users/send-friend-requests/create',
        JSON.stringify({ sendToUsersByEmail: [formValues.email] })
      );
      if (data.data.errors) {
        if (
          data.data.errors.length !== 0 &&
          data.data.errors[0].status === 500
        ) {
          setDisplayError('Email does not exist');
        }
      }
    } else {
      setDisplayError('Please try again');
    }

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
      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex bg-white">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start left area*/}
              {/* Friends List data Start */}
              <h1 className="pt-4 flex justify-center">Friends List</h1>
              <div className="w-96 mx-auto sm:px-6 lg:px-8">
                {/* Begin line breaker */}
                <br></br>
                <br></br>
                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
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
                                className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
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
                            <div
                              className="absolute inset-0 flex items-center"
                              aria-hidden="true"
                            >
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
                                Recieved Friend Request<br></br>Status: {status}
                              </p>
                              <button
                                onClick={() =>
                                  onAcceptFriendRequestHandler(fromUid)
                                }
                                className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  onDeclineFriendRequestHandler(fromUid)
                                }
                                className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-bold py-2 px-4 rounded-full"
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
                            <div
                              className="absolute inset-0 flex items-center"
                              aria-hidden="true"
                            >
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
                            <div
                              className="absolute inset-0 flex items-center"
                              aria-hidden="true"
                            >
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

              {/* Friends List data End */}
              {/* End left area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start right area*/}
              {/* Add Friend data Start*/}
              <h1 className="pt-4 flex justify-center">Add a Friend</h1>
              <div className="w-96 mx-auto sm:px-6 lg:px-8">
                {/* Begin line breaker */}
                <br></br>
                <br></br>
                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                </div>
                {/* End line breaker */}
                <br></br>
                {/* Negative Alert Banner */}
                {displayError.length > 0 && (
                  <div className="rounded-md mb-4 bg-red-50 p-4 sm:mx-auto">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon
                          className="h-5 w-5 text-red-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error: Invalid Email Address
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          {displayError}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={onAddFriendHandler}>
                  <label htmlFor="email-addres" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="text"
                    autoComplete="email"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                  <br></br>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                {/* Add Friend data End*/}
                {/* End right area */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
