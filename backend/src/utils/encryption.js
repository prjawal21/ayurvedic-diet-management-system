const crypto = require('crypto');

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!'; // Must be 32 chars
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt a password for storage
 * @param {string} password - Plain text password
 * @returns {string} Encrypted password in format: iv:encryptedData
 */
const encryptPassword = (password) => {
    try {
        // Generate a random initialization vector
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
            iv
        );

        // Encrypt the password
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return IV and encrypted data separated by ':'
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt password');
    }
};

/**
 * Decrypt a password
 * @param {string} encryptedPassword - Encrypted password in format: iv:encryptedData
 * @returns {string} Decrypted plain text password
 */
const decryptPassword = (encryptedPassword) => {
    try {
        // Split IV and encrypted data
        const parts = encryptedPassword.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted password format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = parts[1];

        // Create decipher
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
            iv
        );

        // Decrypt the password
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt password');
    }
};

/**
 * Mask a string for display (show first 2 and last 2 chars)
 * @param {string} str - String to mask
 * @returns {string} Masked string
 */
const maskString = (str) => {
    if (!str || str.length <= 4) {
        return '••••••';
    }
    const start = str.substring(0, 2);
    const end = str.substring(str.length - 2);
    const middle = '•'.repeat(Math.min(str.length - 4, 6));
    return start + middle + end;
};

module.exports = {
    encryptPassword,
    decryptPassword,
    maskString
};
