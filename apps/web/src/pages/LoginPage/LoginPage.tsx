import React from 'react';
import { useLocation } from 'react-router-dom';

import LoginForm from '../../components/LoginForm/LoginForm';

export default function LoginPage() {
  const { search } = useLocation();

  const nextURL = new URLSearchParams(search).get('nextURL') ?? undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-full flex items-center justify-center py-40 px-4 sm:px-6 lg:px-8">
        <LoginForm nextURL={nextURL} />
      </div>
    </div>
  );
}
