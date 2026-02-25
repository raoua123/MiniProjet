const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const EtudiantController = require('../controllers/EtudiantController');

router.use(authMiddleware, roleMiddleware('ETUDIANT'));

router.get('/emploi-du-temps', EtudiantController.getEmploiDuTemps);
router.get('/groupes', EtudiantController.getGroupes);
router.get('/absences', EtudiantController.getAbsences);
router.get('/cours/:coursId/supports', EtudiantController.getSupportsCours);
router.get('/forums', EtudiantController.getForums);
router.post('/forums/:forumId/messages', EtudiantController.postMessage);

module.exports = router;