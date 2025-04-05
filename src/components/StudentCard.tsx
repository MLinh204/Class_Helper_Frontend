// components/StudentCard.tsx
import React from 'react';

interface Student {
  id: number;
  userFullName: string;
  nickname: string;
  gender: string; // "Boy" or "Girl"
}

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  // Choose a default image based on gender.
  const profilePicture = student.gender === 'Girl' ? '/girl-profile.png' : '/boy-profile.png';

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 hover:shadow-lg transition duration-300">
      <img className="h-16 w-16 rounded-full object-cover" src={profilePicture} alt="Profile" />
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{student.userFullName}</h3>
        <p className="text-gray-600">{student.nickname}</p>
      </div>
    </div>
  );
};

export default StudentCard;
