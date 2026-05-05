const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['bike', 'car']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'sold out'],
    default: 'available'
  },
  // New field for images
  images: [{
    type: String,  // Store base64 encoded images
    required: false
  }],
  customerDetails: {
    name: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    contactDetails: {
      type: String,
      trim: true
    },
    customerProfessionDetails: {
      type: String,
      trim: true
    }
  },
  paymentDetails: {
    sellingPrice: {
      type: String
    },
    downpayment: {
      type: String
    },
    financeAmount: {
      type: String
    },
    interestRate: {
      type: String
    },
    tenure: {
      type: String
    },
    paymentType: {
      type: String,
      enum: ['full payment', 'finance', '']
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'online', '']
    },
    documentationCharges: {
      type: String
    },
    rtoCharges: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
vehicleSchema.index({ vehicleType: 1, status: 1 });
vehicleSchema.index({ name: 'text', model: 'text' });

module.exports = mongoose.model('Vehicle', vehicleSchema);