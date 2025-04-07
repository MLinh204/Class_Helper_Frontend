'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentById, getStudentByUserId, updateStudent } from '@/utils/api';
import NavigationBar from '@/components/NavigationBar';
import { isAxiosError } from '@/utils/errorUtils';

interface Student {
  id: number;
  userFullName: string;
  age: number;
  address: string;
  gender: string;
  nickname: string;
  level: number;
  point: number;
  heart: number;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/login');
          return;
        }
        const user = JSON.parse(userStr);
        const userId: number = user.id;
        const res = await getStudentByUserId(userId);
        const studentId: number = res.data.id;
        const response = await getStudentById(studentId);
        const studentData = response.data;
        setStudent(studentData);
        setFormData({
          userFullName: studentData.userFullName,
          age: studentData.age,
          address: studentData.address,
          nickname: studentData.nickname
        });
        setLoading(false);
      } catch (error: unknown) {
        console.error("Error: ", error);
        if (isAxiosError(error) && error.response.data.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert("Failed to load student data. Please try again.");
        }
      }
    };

    fetchStudentData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!student) return;
    try {
      setLoading(true);
      await updateStudent(student.id, formData);
      setSuccess('Profile updated successfully');
      setStudent({
        ...student,
        ...formData
      });
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      console.error("Error: ", error);
      if (isAxiosError(error) && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-center">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-[110vh] bg-gray-50">
      <NavigationBar />

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        {/* Profile Picture */}
        <div className="flex justify-center mb-8">
          <img
            src={student.gender === 'Boy' ? '/boy-profile.png' : '/girl-profile.png'}
            alt="Profile"
            className="h-32 w-32 rounded-full border-4 border-blue-200"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* My Profile Section */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">My Profile</h1>
            {success && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-center">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userFullName" className="block text-sm font-medium text-black">
                  Full Name
                </label>
                <input
                  type="text"
                  id="userFullName"
                  name="userFullName"
                  value={formData.userFullName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-black">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-black">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-black">
                  Nickname
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Information Section */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Account Information</h3>
            <div className="space-y-4">
              {[
                { label: "Gender", value: student.gender },
                { label: "Level", value: student.level },
                { label: "Points", value: student.point },
                { label: "Hearts", value: student.heart },
                { label: "Student ID", value: student.id },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-lg font-semibold text-sky-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
