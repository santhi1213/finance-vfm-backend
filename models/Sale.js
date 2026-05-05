// const mongoose = require('mongoose');

// const saleSchema = new mongoose.Schema({
//   // Unique sale ID
//   saleId: {
//     type: String,
//     required: true,
//     unique: true
//   },
  
//   // References
//   vehicleId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vehicle',
//     required: true
//   },
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true
//   },
//   agentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Agent'
//   },
  
//   // Sale details
//   sellingPrice: {
//     type: String,
//     required: true
//   },
//   paymentType: {
//     type: String,
//     required: true,
//     enum: ['Full Payment', 'Finance']
//   },
//   paymentMode: {
//     type: String,
//     enum: ['Cash', 'Online', '']
//   },
  
//   // Finance details (for Finance payment type)
//   downPayment: {
//     type: String
//   },
//   financeAmount: {
//     type: String
//   },
//   interestRate: {
//     type: String
//   },
//   tenure: {
//     type: Number // in months
//   },
//   emi: {
//     type: String
//   },
  
//   // Charges
//   documentationCharges: {
//     type: String,
//     required: true
//   },
//   rtoCharges: {
//     type: String,
//     required: true
//   },
  
//   // Status
//   status: {
//     type: String,
//     enum: ['Active', 'Completed', 'Defaulted'],
//     default: 'Active'
//   },
  
//   // Dates
//   saleDate: {
//     type: Date,
//     required: true,
//     default: Date.now
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// saleSchema.index({ saleId: 1 }, { unique: true });
// saleSchema.index({ vehicleId: 1 });
// saleSchema.index({ customerId: 1 });
// saleSchema.index({ agentId: 1 });
// saleSchema.index({ status: 1 });

// module.exports = mongoose.model('Sale', saleSchema);



const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  // Unique sale ID
  saleId: {
    type: String,
    required: true,
    unique: true
  },
  
  // References
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  
  // Sale details
  sellingPrice: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['Full Payment', 'Finance']
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', '']
  },
  
  // Finance details (for Finance payment type)
  downPayment: {
    type: String
  },
  financeAmount: {
    type: String
  },
  interestRate: {
    type: String
  },
  tenure: {
    type: Number // in months
  },
  emi: {
    type: String
  },
  
  // Additional charges for finance
  charges1: {
    type: String,
    default: '0'
  },
  charges2: {
    type: String,
    default: '0'
  },
  
  // Charges
  documentationCharges: {
    type: String,
    required: true
  },
  rtoCharges: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Defaulted'],
    default: 'Active'
  },
  
  // Dates
  saleDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
saleSchema.index({ saleId: 1 }, { unique: true });
saleSchema.index({ vehicleId: 1 });
saleSchema.index({ customerId: 1 });
saleSchema.index({ agentId: 1 });
saleSchema.index({ status: 1 });

module.exports = mongoose.model('Sale', saleSchema);

