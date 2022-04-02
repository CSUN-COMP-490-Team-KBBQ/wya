import React from 'react';

import RegisterForm from '../../components/RegisterForm/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-full flex flex-col justify-center py-16 sm:px-6 lg:py-28 2xl:py-32">
        <RegisterForm />
      </div>
    </div>
  );
}
