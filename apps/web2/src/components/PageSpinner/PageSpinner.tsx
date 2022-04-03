import React from 'react';

export default function PageSpinner(): JSX.Element {
  return (
    <div className="h-screen flex items-center justify-center">
      <div
        className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
