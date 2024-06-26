export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validateDateOfBirthFormat = (birthDate: string): boolean => {
  const dateOfBirthRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateOfBirthRegex.test(birthDate);
};
