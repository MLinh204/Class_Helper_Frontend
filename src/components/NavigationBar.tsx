// components/NavigationBar.tsx
'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/utils/api';

const NavigationBar: React.FC = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Remove token or clear user state if needed
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Optionally, show error feedback to the user
    }
  };
  return (
    <nav className="bg-white shadow" data-id="navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="navigation-container">
        <div className="flex justify-between h-16" data-id="navigation-content">
          {/* Left side: Logo and navigation links */}
          <div className="flex" data-id="navigation-left-section">
            <div className="flex-shrink-0 flex items-center" data-id="navigation-logo-section">
              <Link href="/" className="text-xl font-bold text-blue-600" data-id="navigation-logo">
                Class Helper
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8" data-id="navigation-links">
              <Link
                href="/vocab-list"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                data-id="navigation-vocabulary-link"
              >
                Vocabulary
              </Link>
              <Link
                href="/attendance"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                data-id="navigation-attendance-link"
              >
                Attendance
              </Link>
            </div>
          </div>
          {/* Right side: Profile dropdown */}
          <div className="flex items-center" data-id="navigation-right-section">
            <div className="ml-3 relative" data-id="navigation-profile-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                id="user-menu"
                aria-haspopup="true"
                data-id="navigation-profile-button"
              >
                <img className="h-15 w-15 rounded-full" src="/default-profile.png" alt="User Profile" data-id="navigation-profile-image" />
              </button>
              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50" data-id="navigation-dropdown-menu">
                  <div className="py-1 bg-white ring-1 ring-black ring-opacity-5" data-id="navigation-dropdown-content">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      data-id="navigation-profile-link"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      data-id="navigation-settings-link"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      data-id="navigation-logout-button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
