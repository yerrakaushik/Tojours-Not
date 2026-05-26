/**
 * Utility for formatting currency values consistently across the application.
 */

export const CURRENCY_SYMBOL = '₹';

/**
 * Formats a number as a currency string.
 * @param {number|string} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeSymbol - Whether to include the currency symbol (default: true)
 * @param {number} options.decimals - Number of decimal places (default: auto)
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, { includeSymbol = true, decimals = null } = {}) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (amount === undefined || amount === null || isNaN(numAmount)) {
    return includeSymbol ? `${CURRENCY_SYMBOL}0` : '0';
  }

  const options = {
    minimumFractionDigits: decimals !== null ? decimals : (numAmount % 1 === 0 ? 0 : 2),
    maximumFractionDigits: decimals !== null ? decimals : 2,
  };

  const formatted = new Intl.NumberFormat('en-IN', options).format(numAmount);
  
  return includeSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted;
};
