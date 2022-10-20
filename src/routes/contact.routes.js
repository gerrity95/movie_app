const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact.controller');

// GET method routes
router.get('/', contactController.contact);

// POST method routes
router.post('/', contactController.contact_post);

module.exports = router;
