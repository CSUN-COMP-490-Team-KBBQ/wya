import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/wya-logo.png';
import './NotFoundPage.css';

export default function NotFoundPage(): JSX.Element {

  return (
    
    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
      <img className="mx-auto mb-5 mt-5 h-16 w-auto" src={logo} alt="wya? logo" />
    <div className="bg-white shadow sm:rounded-lg">
  <div className="px-4 text-center py-5 sm:p-6">
    <h3 className="text-lg leading-6 font-medium text-gray-900">ERROR: 404 - WYA?</h3>
    <div className="text-center mt-5 text-gray-500">
      No seriously, where you at?
    </div>
    <div className="mt-5">
      <Link to="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm">Back to Home</Link>
    </div>
  </div>
</div>
</div>


  );
}
