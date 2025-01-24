// controllers/traineeController.js
const TrainingCode = require('../models/TrainingCode');
const Traineeship = require('../models/Traineeship');
const User = require('../models/User');

class TraineeController {
  // Join training program using code
  // Update this method in controllers/traineeController.js
static async joinTraining(req, res) {
  try {
    console.log('Join training request:', { body: req.body, user: req.user.id });
    const { code } = req.body;

    // Find and validate training code
    const trainingCode = await TrainingCode.findOne({ code, status: 'active' })
      .populate('createdBy', 'name email isAdmin');
    
    if (!trainingCode) {
      return res.status(400).json({ 
        message: 'Invalid training code' 
      });
    }

    // Get admin user
    const admin = trainingCode.createdBy;
    if (!admin || !admin.isAdmin) {
      return res.status(400).json({ 
        message: 'Invalid training program' 
      });
    }

    // Create traineeship
    const traineeship = await Traineeship.create({
      userId: req.user._id,
      adminId: admin._id,
      codeUsed: trainingCode._id,
      status: 'active',
      joinedAt: new Date()
    });

    // Update training code usage counter (just for tracking)
    trainingCode.timesUsed += 1;
    await trainingCode.save();

    // Update user's training history
    await User.findByIdAndUpdate(req.user._id, {
      currentTraineeship: traineeship._id,
      $push: {
        trainingHistory: {
          traineeship: traineeship._id,
          startDate: new Date(),
          status: 'ongoing'
        }
      }
    });

    res.status(201).json({
      message: 'Successfully joined training program',
      traineeship: {
        id: traineeship._id,
        admin: {
          name: admin.name,
          email: admin.email
        },
        joinedAt: traineeship.joinedAt,
        status: traineeship.status
      }
    });
  } catch (error) {
    console.error('Error joining training:', error);
    res.status(500).json({ message: 'Error joining training program' });
  }
}

  // Get training progress and assignments
  static async getTrainingProgress(req, res) {
    try {
      const traineeship = await Traineeship.findOne({
        userId: req.user._id,
        status: 'active'
      })
      .populate('adminId', 'name email')
      .populate({
        path: 'assignments.contentId',
        select: 'title description category difficulty'
      });

      if (!traineeship) {
        return res.status(404).json({ 
          message: 'No active training program found' 
        });
      }

      const stats = {
        totalAssignments: traineeship.assignments.length,
        completedAssignments: traineeship.assignments.filter(a => a.completedAt).length,
        averageScore: traineeship.assignments.length > 0 
          ? traineeship.assignments.reduce((acc, curr) => acc + (curr.score || 0), 0) / traineeship.assignments.length 
          : 0
      };

      res.json({
        traineeship,
        stats
      });
    } catch (error) {
      console.error('Error fetching training progress:', error);
      res.status(500).json({ message: 'Error fetching training progress' });
    }
  }

  // Complete an assignment
  static async completeAssignment(req, res) {
    try {
      const { assignmentId, score } = req.body;

      const traineeship = await Traineeship.findOne({
        userId: req.user._id,
        status: 'active',
        'assignments._id': assignmentId
      });

      if (!traineeship) {
        return res.status(404).json({ 
          message: 'Assignment not found' 
        });
      }

      // Update assignment completion
      const assignment = traineeship.assignments.id(assignmentId);
      assignment.completedAt = new Date();
      assignment.score = score;

      await traineeship.save();

      res.json({ 
        message: 'Assignment completed successfully',
        assignment 
      });
    } catch (error) {
      console.error('Error completing assignment:', error);
      res.status(500).json({ message: 'Error completing assignment' });
    }
  }

  // Leave training program
  static async leaveTraining(req, res) {
    try {
      const traineeship = await Traineeship.findOne({
        userId: req.user._id,
        status: 'active'
      });

      if (!traineeship) {
        return res.status(404).json({ 
          message: 'No active training program found' 
        });
      }

      // Update traineeship status
      traineeship.status = 'inactive';
      await traineeship.save();

      // Update user's training history
      await User.findByIdAndUpdate(req.user._id, {
        currentTraineeship: null,
        $set: {
          'trainingHistory.$[elem].endDate': new Date(),
          'trainingHistory.$[elem].status': 'terminated'
        }
      }, {
        arrayFilters: [{ 'elem.traineeship': traineeship._id }]
      });

      res.json({ message: 'Successfully left training program' });
    } catch (error) {
      console.error('Error leaving training:', error);
      res.status(500).json({ message: 'Error leaving training program' });
    }
  }
}

module.exports = TraineeController;