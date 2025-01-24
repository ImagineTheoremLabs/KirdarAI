// routes/traineeRoutes.js
const express = require('express');
const router = express.Router();
const TraineeController = require('../controllers/traineeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/join', TraineeController.joinTraining);
router.get('/progress', TraineeController.getTrainingProgress);
router.post('/assignments/:assignmentId/complete', TraineeController.completeAssignment);
router.post('/leave', TraineeController.leaveTraining);

module.exports = router;