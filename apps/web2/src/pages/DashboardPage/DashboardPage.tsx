import React from 'react';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import Sidebar from '../../components/Sidebar/Sidebar';
import PageSpinner from '../../components/PageSpinner/PageSpinner';

import LandingPage from '../LandingPage/LandingPage';

export default function DashboardPage() {
  const { pending, userRecord } = useUserRecordContext();

  if (pending) {
    return <PageSpinner />;
  }

  if (userRecord) {
    return (
      <Sidebar>
        <div className="flex-1 relative z-0 flex overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            {/* Start main area*/}
            <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
              <div className="h-full border-2 border-gray-200 border-dashed rounded-lg" />
            </div>
            {/* End main area */}
          </main>
          <aside className="relative xl:flex xl:flex-col flex-shrink-0 w-96 border-l border-gray-200 overflow-y-auto">
            {/* Start secondary column (hidden on smaller screens) */}
            <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
              <div className="h-full border-2 border-gray-200 border-dashed rounded-lg" />
            </div>
            {/* End secondary column */}
          </aside>
        </div>
      </Sidebar>
    );
  }

  return <LandingPage />;
}
