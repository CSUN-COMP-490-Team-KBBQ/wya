import React from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="min-h-full flex items-center justify-center py-40 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </div>
  );
}
