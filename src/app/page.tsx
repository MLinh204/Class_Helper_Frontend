'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import StudentCard from '@/components/StudentCard';
import { getAllStudents, searchStudents } from '@/utils/api';

interface Student {
  id: number;
  userFullName: string;
  nickname: string;
  gender: string;
}

const HomePage = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all students from the backend using the API module
  const fetchStudents = async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again later.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Search students by query using the API module
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await searchStudents(searchQuery);
      setStudents(res.data);
      if (res.data.length === 0) {
        setError('No students found matching the query.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setError('An error occurred while searching for students.');
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4 ">
        <h1 className="text-2xl font-bold mb-4 text-gray-600">Student Status</h1>
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </form>
        {error && (
          <div className="text-red-500 text-lg font-semibold text-center mb-4">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.length > 0 ? (
            students.map((student) => <StudentCard key={student.id} student={student} />)
          ) : (
            <div className="text-gray-500 text-center col-span-full">No students available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
