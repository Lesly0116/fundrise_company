import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin ${className}`} />
  );
};

export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

export const ProgressBar = ({ percentage, className = '' }) => {
  const clamped = Math.min(100, Math.max(0, percentage || 0));
  return (
    <div className={`progress-bar ${className}`}>
      <div
        className="progress-fill"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export const Avatar = ({ src, name, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return src ? (
    <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    primary: 'bg-primary-100 text-primary-700',
  };
  return (
    <span className={`badge ${variants[variant]}`}>{children}</span>
  );
};

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4">{icon || '📭'}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>}
    {action}
  </div>
);

export const ErrorMessage = ({ message }) => (
  message ? (
    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  ) : null
);

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    return start + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors ${
            page === currentPage
              ? 'bg-primary-500 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
