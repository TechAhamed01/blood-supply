export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

export const validateBloodGroup = (bloodGroup) => {
  const validGroups = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'];
  return validGroups.includes(bloodGroup);
};

export const validateUnits = (units) => {
  return Number.isInteger(units) && units > 0 && units <= 1000;
};

export const validateLatitude = (lat) => {
  return lat >= -90 && lat <= 90;
};

export const validateLongitude = (lng) => {
  return lng >= -180 && lng <= 180;
};