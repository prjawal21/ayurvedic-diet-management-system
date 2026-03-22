/**
 * Utility functions for generating user credentials
 */

/**
 * Generate a unique username from user's name
 * Format: firstname.lastname{random3digits}
 * Example: john.smith847
 * 
 * @param {string} fullName - User's full name
 * @returns {string} Generated username
 */
const generateUsername = (fullName) => {
    // Remove titles and extra spaces
    const cleanName = fullName
        .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/i, '')
        .trim()
        .toLowerCase();

    // Split into parts and get first and last name
    const nameParts = cleanName.split(/\s+/);
    const firstName = nameParts[0] || 'user';
    const lastName = nameParts[nameParts.length - 1] || 'name';

    // Generate 3 random digits
    const randomDigits = Math.floor(100 + Math.random() * 900); // 100-999

    // Combine: firstname.lastname{digits}
    const username = `${firstName}.${lastName}${randomDigits}`;

    return username;
};

/**
 * Generate a secure random password
 * 12 characters with mix of uppercase, lowercase, numbers, and symbols
 * 
 * @returns {string} Generated password
 */
const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill remaining 8 characters randomly
    for (let i = 0; i < 8; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize position of guaranteed characters
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
};

module.exports = {
    generateUsername,
    generateSecurePassword
};
