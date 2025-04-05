// app/login/page.tsx
import React from 'react';
import AnimatedCard from '@/components/AnimatedCard';
import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center p-4">
      <AnimatedCard>
        <h2 className="text-3xl font-bold text-center mb-6 text-black">Login</h2>
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-black">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </AnimatedCard>
    </div>
  );
};

export default LoginPage;
