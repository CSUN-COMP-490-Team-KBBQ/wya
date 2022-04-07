import React from 'react';
// import { Link } from 'react-router-dom';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import LandingPage from '../LandingPage/LandingPage';

import PageSpinner from '../../components/PageSpinner/PageSpinner';

export default function SettingsPage() {
  const { pending, userRecord } = useUserRecordContext();

  if (pending) {
    return <PageSpinner />;
  }

  if (userRecord) {
    return (
      <div className="flex-1 relative z-0 flex overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {/* Start main area*/}
          <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
            <div className="h-full border-2 border-gray-200 border-dashed rounded-lg" />
          </div>
          {/* End main area */}
        </main>
      </div>
    );
  }

  return <LandingPage />;
}
