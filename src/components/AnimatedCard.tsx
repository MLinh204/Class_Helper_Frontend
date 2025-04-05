// components/AnimatedCard.tsx
import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children }) => {
  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 transform transition duration-500 hover:scale-105 animate-fadeIn">
      {children}
    </div>
  );
};

export default AnimatedCard;
