import { formatDistanceToNow, format } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num == null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch { return ''; }
};

export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch { return ''; }
};

export const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-primary-500';
  if (percentage >= 50) return 'bg-blue-500';
  if (percentage >= 25) return 'bg-yellow-500';
  return 'bg-primary-500';
};

export const getCategoryColor = (category) => {
  const colors = {
    Medical: 'bg-red-100 text-red-700',
    Emergency: 'bg-orange-100 text-orange-700',
    Education: 'bg-blue-100 text-blue-700',
    Community: 'bg-purple-100 text-purple-700',
    Animals: 'bg-yellow-100 text-yellow-700',
    Environment: 'bg-green-100 text-green-700',
    Memorial: 'bg-gray-100 text-gray-700',
    Business: 'bg-indigo-100 text-indigo-700',
    Sports: 'bg-cyan-100 text-cyan-700',
    General: 'bg-gray-100 text-gray-600',
  };
  return colors[category] || colors.General;
};

export const CATEGORIES = [
  'General', 'Medical', 'Emergency', 'Education', 'Community',
  'Animals', 'Environment', 'Memorial', 'Business', 'Sports',
];

export const truncate = (str, len = 120) =>
  str && str.length > len ? str.substring(0, len) + '...' : str;

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors) {
    const errs = error.response.data.errors;
    return Object.values(errs).join(', ');
  }
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};
