// Utility functions for managing terms and conditions acceptance

export const TERMS_STORAGE_KEY = 'termsAccepted';
export const TERMS_DATE_KEY = 'termsAcceptedDate';

/**
 * Check if user has accepted terms and conditions
 * @returns {boolean}
 */
export const hasAcceptedTerms = () => {
  return localStorage.getItem(TERMS_STORAGE_KEY) === 'true';
};

/**
 * Get the date when terms were accepted
 * @returns {string|null}
 */
export const getTermsAcceptanceDate = () => {
  return localStorage.getItem(TERMS_DATE_KEY);
};

/**
 * Mark terms as accepted
 * @param {string} date - ISO date string (optional, defaults to current date)
 */
export const acceptTerms = (date = new Date().toISOString()) => {
  localStorage.setItem(TERMS_STORAGE_KEY, 'true');
  localStorage.setItem(TERMS_DATE_KEY, date);
};

/**
 * Revoke terms acceptance
 */
export const revokeTerms = () => {
  localStorage.removeItem(TERMS_STORAGE_KEY);
  localStorage.removeItem(TERMS_DATE_KEY);
};

/**
 * Check if terms acceptance is expired (optional feature)
 * @param {number} daysValid - Number of days terms acceptance is valid
 * @returns {boolean}
 */
export const isTermsExpired = (daysValid = 365) => {
  const acceptanceDate = getTermsAcceptanceDate();
  if (!acceptanceDate) return true;
  
  const acceptanceTime = new Date(acceptanceDate).getTime();
  const currentTime = new Date().getTime();
  const daysSinceAcceptance = (currentTime - acceptanceTime) / (1000 * 60 * 60 * 24);
  
  return daysSinceAcceptance > daysValid;
};

/**
 * Get terms acceptance status with details
 * @returns {object}
 */
export const getTermsStatus = () => {
  const accepted = hasAcceptedTerms();
  const date = getTermsAcceptanceDate();
  
  return {
    accepted,
    date,
    expired: accepted ? isTermsExpired() : false,
    daysSinceAcceptance: date ? 
      Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)) : 
      null
  };
};

/**
 * Clear all terms-related data (useful for logout)
 */
export const clearTermsData = () => {
  localStorage.removeItem(TERMS_STORAGE_KEY);
  localStorage.removeItem(TERMS_DATE_KEY);
};
