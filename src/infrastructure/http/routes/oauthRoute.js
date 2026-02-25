// interfaces/http/routes/oauthRoutes.js
const express = require('express');
const router = express.Router();
const OAuthController = require('../controllers/OAuthController');
const { oauthMiddleware, oauthRoleMiddleware } = require('../middlewares/oauthMiddleware');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Routes OAuth standard
router.post('/token', OAuthController.token);
router.get('/authorize', OAuthController.authorize);
router.post('/authorize', OAuthController.authorize);

// Routes simplifiées pour le frontend
router.post('/login', OAuthController.login);
router.post('/refresh', OAuthController.refresh);
router.post('/revoke', OAuthController.revoke);
router.get('/me', oauthMiddleware, OAuthController.me);

// Gestion des clients OAuth (admin uniquement)
router.post('/clients', 
  authMiddleware, 
  roleMiddleware('ADMIN'), 
  OAuthController.createClient
);

router.get('/clients', 
  authMiddleware, 
  roleMiddleware('ADMIN'), 
  OAuthController.getClients
);

router.delete('/clients/:clientId', 
  authMiddleware, 
  roleMiddleware('ADMIN'), 
  OAuthController.deleteClient
);

module.exports = router;