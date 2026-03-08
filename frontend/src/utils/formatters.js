export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatBloodGroup = (bg) => {
  return bg.replace('+', '➕').replace('-', '➖');
};

export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};