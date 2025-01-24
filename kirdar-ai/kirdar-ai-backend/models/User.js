// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  adminProfile: {
    organization: String,
    maxTrainees: {
      type: Number,
      default: 50
    },
    activeCodes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingCode'
    }]
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get active trainees count for admin
userSchema.methods.getActiveTraineesCount = async function() {
  if (!this.isAdmin) {
    return 0;
  }
  
  return await mongoose.model('Traineeship').countDocuments({
    adminId: this._id,
    status: 'active'
  });
};

// Check if admin can accept more trainees
userSchema.methods.canAcceptTrainees = async function() {
  if (!this.isAdmin) {
    return false;
  }
  
  const currentCount = await this.getActiveTraineesCount();
  return currentCount < this.adminProfile.maxTrainees;
};

// Get summary of admin's training program
userSchema.methods.getTrainingProgramSummary = async function() {
  if (!this.isAdmin) {
    return null;
  }

  const traineeships = await mongoose.model('Traineeship')
    .find({ adminId: this._id })
    .populate('userId', 'name email')
    .select('status joinedAt assignments');

  return {
    activeTrainees: traineeships.filter(t => t.status === 'active').length,
    totalTrainees: traineeships.length,
    activeCodes: this.adminProfile.activeCodes.length,
    traineeships: traineeships.map(t => ({
      trainee: t.userId,
      status: t.status,
      joinedAt: t.joinedAt,
      completedAssignments: t.assignments.filter(a => a.completedAt).length,
      totalAssignments: t.assignments.length
    }))
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;