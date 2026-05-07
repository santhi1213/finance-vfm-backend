// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   role: {
//     type: String,
//     required: true,
//     enum: ['admin', 'agent', 'customer'],
//     default: 'customer'
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     pincode: String,
//     country: String
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   agentDetails: {
//     employeeId: String,
//     department: String,
//     joinDate: Date,
//     commission: String,
//     supervisor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }
//   },
//   customerDetails: {
//     dateOfBirth: Date,
//     occupation: String,
//     annualIncome: String,
//     panCard: String,
//     aadharCard: String
//   },
//   resetPasswordOTP: String,
//   resetPasswordExpires: Date,
//   lastLogin: Date,
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: Date
// }, {
//   timestamps: true
// });

// // No middleware - we'll hash passwords in the controller

// // Simple method to compare password (keep this)
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   const bcrypt = require('bcryptjs');
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Check if account is locked
// userSchema.methods.isLocked = function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'agent', 'customer'],
    default: 'customer'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  agentDetails: {
    employeeId: String,
    department: String,
    joinDate: Date,
    commission: String,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  customerDetails: {
    dateOfBirth: Date,
    occupation: String,
    annualIncome: String,
    panCard: String,
    aadharCard: String
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);

