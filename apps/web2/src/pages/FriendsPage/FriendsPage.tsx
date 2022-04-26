import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './FriendsPage.css';

export default function FriendsPage(): JSX.Element {
    return (
      <Sidebar>
        <Container fluid>
        <div className="flex-grow w-full max-w-full mx-auto xl:px-8 lg:flex bg-white">
            <div className="flex-1 min-w-0 bg-white lg:flex">
              <div className="bg-white lg:min-w-0 lg:flex-1">
                <div className="h-full py-6 px-4 sm:px-6 lg:px-8 bg-white">
                  <div style={{ minHeight: '36rem' }}>
                    <div style={{width: '20rem'}} className="h-full pl-6 py-6 bg-white">
                      <h1 className="pt-4 flex justify-center">Friends List</h1>
                        <div className="w-96 mx-auto sm:px-6 lg:px-8">
                            <div className="flow-root mt-6">
                                <ul role="list" className="-my-5 divide-y divide-gray-200">
                                <li className="py-4">
                                    <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                    </div>
                                    <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Leonard Krasner</p>
                                    <p className="text-sm text-gray-500 truncate">LeonardKrasner@gmail.com</p>
                                    </div>
                                    {/* Keeping for reference to edit friends */}
                                    {/* <div>
                                        <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                    </div> */}
                                </div>
                                </li>
                                <li className="py-4">
                                <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                </div>
                                <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">Emily Selman</p>
                                <p className="text-sm text-gray-500 truncate">EmilySelman@gmail.com</p>
                            </div>
                                {/* Keeping for reference to edit friends */}
                                {/* <div>
                                    <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                </div> */}
                                </div>
                            </li>

                            <li className="py-4">
                                <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">Kristin Watson</p>
                                    <p className="text-sm text-gray-500 truncate">KristinWatson@gmail.com</p>
                                </div>
                                {/* Keeping for reference to edit friends */}
                                {/* <div>
                                    <a href="#" className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"> View </a>
                                </div> */}
                            </div>
                        </li>
                        </ul>
                    </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
             <div style={{width: '40rem'}} className="h-full pl-6 py-6 bg-white">
                 <div style={{ minHeight: '36rem' }}>
                    <div style={{width: '30rem'}} className="h-full pl-6 py-6 bg-white">
                      <h1 className="pt-4 flex justify-center">Search for Friends</h1>
                      <br></br>
                      <div>
                <label htmlFor="email-addres" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <br></br>
              <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                    aria-hidden="true"
                  />
                </span>
                Search
              </button>
            </div>
                    </div>
                  </div>
              </div>
          </div>
        </Container>
      </Sidebar>
    );
  }