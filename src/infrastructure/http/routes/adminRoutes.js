const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Routes protégées (admin seulement)
router.get('/pending-requests', 
  authMiddleware, 
  roleMiddleware('ADMIN'), 
  AuthController.getPendingRequests
);

router.post('/validate/:userId', 
  authMiddleware, 
  roleMiddleware('ADMIN'), 
  AuthController.validateUser
);

router.post('/reject/:userId', 
  authMiddleware, 
  roleMiddleware('ADMIN'), 
  AuthController.rejectUser
);

module.exports = router;