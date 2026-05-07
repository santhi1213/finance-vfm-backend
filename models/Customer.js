// const mongoose = require('mongoose');

// const customerSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Customer name is required'],
//     trim: true
//   },
//   aadharNo: {
//     type: String,
//     required: [true, 'Aadhar number is required'],
//     unique: true,
//     trim: true,
//     match: [/^\d{12}$/, 'Aadhar number must be 12 digits']
//   },
//   panNo: {
//     type: String,
//     required: [true, 'PAN number is required'],
//     unique: true,
//     trim: true,
//     uppercase: true,
//     match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
//   },
//   address: {
//     street: {
//       type: String,
//       required: [true, 'Street address is required'],
//       trim: true
//     },
//     city: {
//       type: String,
//       required: [true, 'City is required'],
//       trim: true
//     },
//     state: {
//       type: String,
//       required: [true, 'State is required'],
//       trim: true
//     },
//     pincode: {
//       type: String,
//       required: [true, 'Pincode is required'],
//       trim: true,
//       match: [/^\d{6}$/, 'Pincode must be 6 digits']
//     },
//     country: {
//       type: String,
//       default: 'India',
//       trim: true
//     }
//   },
//   phone: {
//     type: String,
//     required: [true, 'Phone number is required'],
//     trim: true,
//     match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
//   },
//   alternatePhone: {
//     type: String,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     trim: true,
//     lowercase: true,
//     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   assignedAgent: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Agent',
//     default: null
//   },
//   dateOfBirth: {
//     type: Date
//   },
//   occupation: {
//     type: String,
//     trim: true
//   },
//   annualIncome: {
//     type: String,
//     trim: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// customerSchema.index({ name: 'text', email: 'text' });
// customerSchema.index({ aadharNo: 1 }, { unique: true });
// customerSchema.index({ panNo: 1 }, { unique: true });
// customerSchema.index({ email: 1 }, { unique: true });
// customerSchema.index({ userId: 1 }, { unique: true });
// customerSchema.index({ assignedAgent: 1 });
// customerSchema.index({ isActive: 1 });

// module.exports = mongoose.model('Customer', customerSchema);


const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  aadharNo: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    trim: true,
    match: [/^\d{12}$/, 'Aadhar number must be 12 digits']
  },
  panNo: {
    type: String,
    required: [true, 'PAN number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  // ADDRESS - NO userId inside here
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be 6 digits']
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
    // ⚠️ NO userId HERE ⚠️
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  // ✅ userId at ROOT level - CORRECT
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  dateOfBirth: Date,
  occupation: String,
  annualIncome: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ aadharNo: 1 }, { unique: true });
customerSchema.index({ panNo: 1 }, { unique: true });
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);

