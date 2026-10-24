import React from 'react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-brand-gray border-t-brand-red animate-spin`}
      />
      {text && <p className="text-sm font-medium text-brand-muted tracking-wide uppercase">{text}</p>}
    </div>
  );
};

export default Loader;
