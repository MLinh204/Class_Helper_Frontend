'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import AttendanceCard from '@/components/AttendanceCard';
import { getAllAttendance, searchAttendanceList } from '@/utils/api';

interface Attendance {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

const AttendancePage = () => {
  const router = useRouter();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch all attendance lists from the backend
  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const res = await getAllAttendance();
      setAttendances(res.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching attendance lists:', error);
      setError('Failed to load attendance lists. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchAttendances();
  }, [router]);
  const handleSearch= async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await searchAttendanceList(searchQuery);
      if (res.data.length === 0) {
        setError('No attendance lists found matching the query.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error searching attendance lists:', err);
      setError('An error occurred while searching for attendance lists.');
    }
  }

  // Filter attendance list based on search query
  const filteredAttendances = attendances.filter(attendance => 
    attendance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendance.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Lists</h1>
          <form onSubmit={handleSearch} className='mb-4'>
          <input
            type="text"
            placeholder="Search attendance lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          </form>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-lg font-semibold text-center my-8">
            {error}
          </div>
        ) : filteredAttendances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttendances.map((attendance) => (
              <AttendanceCard key={attendance.id} attendance={attendance} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center my-16 text-lg">
            {searchQuery ? 'No attendance lists match your search' : 'No attendance lists available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;