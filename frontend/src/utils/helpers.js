export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateDaysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate) => {
  const days = calculateDaysUntil(expiryDate);
  if (days < 0) return { label: 'Expired', color: 'bg-gray-100 text-gray-800' };
  if (days <= 7) return { label: 'Critical', color: 'bg-red-100 text-red-800' };
  if (days <= 30) return { label: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Good', color: 'bg-green-100 text-green-800' };
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};