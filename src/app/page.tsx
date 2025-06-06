'use client';
import React, { useEffect, useState } from 'react';
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
    <div data-id="home-page-container">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4 " data-id="home-main-content">
        <h1 className="text-2xl font-bold mb-4 text-gray-600" data-id="home-page-title">Student Status</h1>
        <form onSubmit={handleSearch} className="mb-4" data-id="home-search-form">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            data-id="home-search-input"
          />
        </form>
        {error && (
          <div className="text-red-500 text-lg font-semibold text-center mb-4" data-id="home-error-message">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-id="home-students-grid">
          {students.length > 0 ? (
            students.map((student) => <StudentCard key={student.id} student={student} />)
          ) : (
            <div className="text-gray-500 text-center col-span-full" data-id="home-empty-state">No students available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
