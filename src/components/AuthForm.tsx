"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/utils/api';
import { isAxiosError } from '@/utils/errorUtils';

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
  const [error] = useState<string | null>(null);

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
    } catch (error: unknown) {
      console.error("Error: ", error);
      if (isAxiosError(error) && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-id={`auth-form-${mode}`}>
      {mode === 'register' && (
        <>
          <div data-id="auth-form-fullname-field">
            <label
              htmlFor="userFullName"
              className="block text-sm font-medium text-black"
              data-id="auth-form-fullname-label"
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
              data-id="auth-form-fullname-input"
            />
          </div>
          <div className="flex space-x-4" data-id="auth-form-gender-nickname-row">
            <div className="w-1/2" data-id="auth-form-gender-field">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-black"
                data-id="auth-form-gender-label"
              >
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                data-id="auth-form-gender-select"
              >
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
            <div className="w-1/2" data-id="auth-form-nickname-field">
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-black"
                data-id="auth-form-nickname-label"
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
                data-id="auth-form-nickname-input"
              />
            </div>
          </div>
          <div className="flex space-x-4" data-id="auth-form-age-address-row">
            <div className="w-1/2" data-id="auth-form-age-field">
              <label
                htmlFor="age"
                className="block text-sm font-medium text-black"
                data-id="auth-form-age-label"
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
                data-id="auth-form-age-input"
              />
            </div>
            <div className="w-1/2" data-id="auth-form-address-field">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-black"
                data-id="auth-form-address-label"
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
                data-id="auth-form-address-input"
              />
            </div>
          </div>
        </>
      )}

      <div data-id="auth-form-username-field">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-black"
          data-id="auth-form-username-label"
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
          data-id="auth-form-username-input"
        />
      </div>
      <div data-id="auth-form-password-field">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-black"
          data-id="auth-form-password-label"
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
          data-id="auth-form-password-input"
        />
      </div>
      {error && <p className="text-red-500 text-sm" data-id="auth-form-error-message">{error}</p>}
      <div data-id="auth-form-submit-section">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
          data-id={`auth-form-${mode}-button`}
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
