import React from 'react';

const Card = ({ children, className = "" }) => {
  return (
    // Merges default card styles with any extra classes you pass in
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;