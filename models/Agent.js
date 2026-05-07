const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true
  },
  
  // Age
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18 years'],
    max: [100, 'Age must be less than 100 years']
  },
  
  // Aadhar Number
  aadharNo: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    trim: true,
    match: [/^\d{12}$/, 'Aadhar number must be 12 digits']
  },
  
  // Contact Details
  contactDetails: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Address Details
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
  },
  
  // Employment Details
  employmentDetails: {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    department: {
      type: String,
      enum: ['sales', 'service', 'management', 'collection'],
      default: 'collection'
    },
    designation: {
      type: String,
      trim: true
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    commission: {
      type: String,
      default: '0',
      trim: true
    }
  },
  
  // Bank Details (optional)
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branchName: {
      type: String,
      trim: true
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  customerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
agentSchema.index({ name: 'text', 'contactDetails.email': 'text' });
agentSchema.index({ aadharNo: 1 }, { unique: true });
agentSchema.index({ 'employmentDetails.employeeId': 1 }, { unique: true, sparse: true });
agentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Agent', agentSchema);