// app/register/page.tsx
import React from 'react';
import AnimatedCard from '@/components/AnimatedCard';
import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center p-4" data-id="register-page-container">
      <AnimatedCard>
        <h2 className="text-3xl font-bold text-center mb-6 text-black" data-id="register-page-title">Register</h2>
        <AuthForm mode="register" />
        <p className="mt-4 text-center text-black" data-id="register-login-link-text">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline" data-id="register-login-link">
            Login here
          </Link>
        </p>
      </AnimatedCard>
    </div>
  );
};

export default RegisterPage;
