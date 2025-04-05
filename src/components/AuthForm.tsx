"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/utils/api';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    // Only for register mode
    userFullName: '',
    gender: 'Boy',
    nickname: '',
    age: '',
    address: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (mode === 'login') {
        // Call the login endpoint with username and password
        res = await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        // Call the register endpoint with full form data
        res = await register(formData);
      }
      // If the response includes a token, store it locally
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      // Redirect to the home page on success
      router.push('/');
    } catch (err: any) {
      // Handle error and display a message to the user
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'register' && (
        <>
          <div>
            <label
              htmlFor="userFullName"
              className="block text-sm font-medium text-black"
            >
              Full Name
            </label>
            <input
              type="text"
              name="userFullName"
              id="userFullName"
              value={formData.userFullName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-black"
              >
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
              >
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
            <div className="w-1/2">
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-black"
              >
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                id="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="age"
                className="block text-sm font-medium text-black"
              >
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-black"
              >
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-black"
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-black"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
