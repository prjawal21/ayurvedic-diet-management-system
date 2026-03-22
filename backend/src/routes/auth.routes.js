const express = require('express');
const { login } = require('../controllers/auth.controller');

const router = express.Router();

// Public registration disabled - users must be created by admin
// router.post('/register', register);
router.post('/login', login);

module.exports = router;
