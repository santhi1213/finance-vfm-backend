// const Sale = require('../models/Sale');
// const EMI = require('../models/EMI');
// const Vehicle = require('../models/Vehicle');
// const Customer = require('../models/Customer');
// const Agent = require('../models/Agent');

// // Helper function to generate unique sale ID
// const generateSaleId = async () => {
//   try {
//     const count = await Sale.countDocuments();
//     return `S${(count + 1).toString().padStart(4, '0')}`;
//   } catch (error) {
//     console.error('Error generating sale ID:', error);
//     return `S${Date.now()}`;
//   }
// };

// // Helper function to generate EMI ID
// const generateEmiId = (saleId, installmentNo) => {
//   return `EMI-${saleId}-${installmentNo.toString().padStart(3, '0')}`;
// };

// // Helper function to generate EMI due dates (always 5th of month)
// const generateEmiDueDates = (startDate, tenure) => {
//   const dueDates = [];
//   const date = new Date(startDate);
  
//   // Get next month's 5th as first EMI
//   let currentDate = new Date(date.getFullYear(), date.getMonth() + 1, 5);
  
//   for (let i = 1; i <= tenure; i++) {
//     dueDates.push(new Date(currentDate));
//     currentDate.setMonth(currentDate.getMonth() + 1);
//   }
  
//   return dueDates;
// };

// // @desc    Create a new sale
// // @route   POST /api/sales
// exports.createSale = async (req, res) => {
//   try {
//     console.log('Creating sale with data:', req.body);

//     const {
//       vehicleId,
//       customerId,
//       agentId,
//       sellingPrice,
//       paymentType,
//       paymentMode,
//       downPayment,
//       financeAmount,
//       interestRate,
//       tenure,
//       emi,
//       documentationCharges,
//       rtoCharges,
//       saleDate
//     } = req.body;

//     // Validate required fields
//     if (!vehicleId || !customerId || !sellingPrice || !paymentType || !documentationCharges || !rtoCharges) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields'
//       });
//     }

//     // Validate vehicle exists and is available
//     const vehicle = await Vehicle.findById(vehicleId);
//     if (!vehicle) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vehicle not found'
//       });
//     }

//     if (vehicle.status !== 'available') {
//       return res.status(400).json({
//         success: false,
//         message: 'Vehicle is not available for sale'
//       });
//     }

//     // Validate customer exists
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found'
//       });
//     }

//     // Validate agent if provided
//     if (agentId) {
//       const agent = await Agent.findById(agentId);
//       if (!agent) {
//         return res.status(404).json({
//           success: false,
//           message: 'Agent not found'
//         });
//       }
//     }

//     // Validate finance details if payment type is Finance
//     if (paymentType === 'Finance') {
//       if (!downPayment || !financeAmount || !interestRate || !tenure || !emi) {
//         return res.status(400).json({
//           success: false,
//           message: 'Please provide all finance details: downPayment, financeAmount, interestRate, tenure, emi'
//         });
//       }
//     }

//     // Generate unique sale ID
//     const saleId = await generateSaleId();

//     // Create sale
//     const saleData = {
//       saleId,
//       vehicleId,
//       customerId,
//       agentId,
//       sellingPrice: sellingPrice.toString(),
//       paymentType,
//       paymentMode: paymentMode || '',
//       downPayment: downPayment ? downPayment.toString() : undefined,
//       financeAmount: financeAmount ? financeAmount.toString() : undefined,
//       interestRate: interestRate ? interestRate.toString() : undefined,
//       tenure: tenure || undefined,
//       emi: emi ? emi.toString() : undefined,
//       documentationCharges: documentationCharges.toString(),
//       rtoCharges: rtoCharges.toString(),
//       saleDate: saleDate || new Date(),
//       status: 'Active'
//     };

//     const sale = new Sale(saleData);
//     await sale.save();

//     // Update vehicle status to 'sold out'
//     vehicle.status = 'sold out';
//     await vehicle.save();

//     // Update customer's assigned agent's customer count if agent exists
//     if (agentId) {
//       await Agent.findByIdAndUpdate(agentId, {
//         $inc: { customerCount: 1 }
//       });
//     }

//     // Create EMI records if payment type is Finance
//     if (paymentType === 'Finance' && tenure && tenure > 0) {
//       const emiRecords = [];
      
//       // Generate EMI due dates (always 5th of each month)
//       const purchaseDate = sale.saleDate || new Date();
//       const dueDates = generateEmiDueDates(purchaseDate, tenure);
      
//       console.log(`Generating ${tenure} EMIs due on 5th of each month`);
//       console.log(`First EMI due date: ${dueDates[0].toISOString()}`);

//       for (let i = 0; i < tenure; i++) {
//         const emiRecord = new EMI({
//           emiId: generateEmiId(saleId, i + 1),
//           saleId: sale._id,
//           customerId,
//           installmentNo: i + 1,
//           dueDate: dueDates[i],
//           amount: emi.toString(),
//           status: 'Pending',
//           lateFee: '0',
//           reminderSent: false
//         });

//         await emiRecord.save();
//         emiRecords.push(emiRecord);
//       }

//       console.log(`Created ${emiRecords.length} EMI records for sale ${saleId}`);
//     }

//     // Populate references for response
//     await sale.populate('vehicleId', 'name model vehicleType');
//     await sale.populate('customerId', 'name phone email');
//     if (agentId) {
//       await sale.populate('agentId', 'name phone');
//     }

//     console.log('Sale created successfully:', sale._id);

//     res.status(201).json({
//       success: true,
//       message: 'Sale created successfully',
//       data: sale
//     });
//   } catch (error) {
//     console.error('Error creating sale:', error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Duplicate sale ID generated. Please try again.'
//       });
//     }
    
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get all sales
// // @route   GET /api/sales
// exports.getAllSales = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       customerId,
//       vehicleId,
//       agentId,
//       status,
//       startDate,
//       endDate,
//       sortBy = 'saleDate',
//       sortOrder = 'desc'
//     } = req.query;

//     // Build query
//     let query = {};

//     if (customerId) query.customerId = customerId;
//     if (vehicleId) query.vehicleId = vehicleId;
//     if (agentId) query.agentId = agentId;
//     if (status) query.status = status;

//     // Date range filter
//     if (startDate || endDate) {
//       query.saleDate = {};
//       if (startDate) query.saleDate.$gte = new Date(startDate);
//       if (endDate) query.saleDate.$lte = new Date(endDate);
//     }

//     // Build sort options
//     const sort = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     // Execute query with pagination
//     const sales = await Sale.find(query)
//       .populate('vehicleId', 'name model vehicleType price images')
//       .populate('customerId', 'name phone email address aadharNo')
//       .populate('agentId', 'name phone email')
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     // Get total count
//     const total = await Sale.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       count: sales.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / parseInt(limit)),
//       data: sales
//     });
//   } catch (error) {
//     console.error('Error fetching sales:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get single sale by ID
// // @route   GET /api/sales/:id
// exports.getSaleById = async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id)
//       .populate('vehicleId', 'name model vehicleType price images')
//       .populate('customerId', 'name phone email address aadharNo panNo')
//       .populate('agentId', 'name phone email employmentDetails');

//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sale not found'
//       });
//     }

//     // Get all EMI records for this sale
//     const emis = await EMI.find({ saleId: sale._id })
//       .sort({ installmentNo: 1 });

//     const responseData = {
//       ...sale.toObject(),
//       emis
//     };

//     res.status(200).json({
//       success: true,
//       data: responseData
//     });
//   } catch (error) {
//     console.error('Error fetching sale:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Update sale
// // @route   PUT /api/sales/:id
// exports.updateSale = async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id);

//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sale not found'
//       });
//     }

//     // Only allow updating certain fields
//     const allowedUpdates = [
//       'paymentMode',
//       'documentationCharges',
//       'rtoCharges',
//       'status',
//       'agentId'
//     ];

//     const updates = {};
//     Object.keys(req.body).forEach(key => {
//       if (allowedUpdates.includes(key)) {
//         updates[key] = req.body[key];
//       }
//     });

//     // Update the sale
//     Object.assign(sale, updates);
//     await sale.save();

//     // Populate for response
//     await sale.populate('vehicleId', 'name model vehicleType');
//     await sale.populate('customerId', 'name phone');
//     await sale.populate('agentId', 'name phone');

//     res.status(200).json({
//       success: true,
//       message: 'Sale updated successfully',
//       data: sale
//     });
//   } catch (error) {
//     console.error('Error updating sale:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Delete sale (soft delete by changing status)
// // @route   DELETE /api/sales/:id
// exports.deleteSale = async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id);

//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sale not found'
//       });
//     }

//     // Soft delete - mark as cancelled/completed
//     sale.status = 'Completed';
//     await sale.save();

//     console.log('Sale deactivated successfully:', sale._id);

//     res.status(200).json({
//       success: true,
//       message: 'Sale deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting sale:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get sales by customer
// // @route   GET /api/sales/customer/:customerId
// exports.getSalesByCustomer = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     const sales = await Sale.find({ customerId })
//       .populate('vehicleId', 'name model vehicleType price images')
//       .populate('agentId', 'name phone')
//       .sort({ saleDate: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Sale.countDocuments({ customerId });

//     res.status(200).json({
//       success: true,
//       count: sales.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / parseInt(limit)),
//       data: sales
//     });
//   } catch (error) {
//     console.error('Error fetching customer sales:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get sales by agent
// // @route   GET /api/sales/agent/:agentId
// exports.getSalesByAgent = async (req, res) => {
//   try {
//     const { agentId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     const sales = await Sale.find({ agentId })
//       .populate('vehicleId', 'name model vehicleType')
//       .populate('customerId', 'name phone')
//       .sort({ saleDate: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Sale.countDocuments({ agentId });

//     res.status(200).json({
//       success: true,
//       count: sales.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / parseInt(limit)),
//       data: sales
//     });
//   } catch (error) {
//     console.error('Error fetching agent sales:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get sales statistics
// // @route   GET /api/sales/stats
// exports.getSalesStats = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     let dateFilter = {};
//     if (startDate || endDate) {
//       dateFilter.saleDate = {};
//       if (startDate) dateFilter.saleDate.$gte = new Date(startDate);
//       if (endDate) dateFilter.saleDate.$lte = new Date(endDate);
//     }

//     // Total sales count and revenue
//     const salesStats = await Sale.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: null,
//           totalSales: { $sum: 1 },
//           totalRevenue: { 
//             $sum: { 
//               $add: [
//                 { $toDouble: '$sellingPrice' },
//                 { $toDouble: '$documentationCharges' },
//                 { $toDouble: '$rtoCharges' }
//               ]
//             }
//           },
//           financeSales: {
//             $sum: { $cond: [{ $eq: ['$paymentType', 'Finance'] }, 1, 0] }
//           },
//           fullPaymentSales: {
//             $sum: { $cond: [{ $eq: ['$paymentType', 'Full Payment'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Sales by payment type
//     const salesByPaymentType = await Sale.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: '$paymentType',
//           count: { $sum: 1 },
//           totalValue: { 
//             $sum: { $toDouble: '$sellingPrice' }
//           }
//         }
//       }
//     ]);

//     // Sales by status
//     const salesByStatus = await Sale.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         summary: salesStats[0] || {
//           totalSales: 0,
//           totalRevenue: 0,
//           financeSales: 0,
//           fullPaymentSales: 0
//         },
//         byPaymentType: salesByPaymentType,
//         byStatus: salesByStatus
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching sales stats:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


const Sale = require('../models/Sale');
const EMI = require('../models/EMI');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');

// Helper function to generate unique sale ID
const generateSaleId = async () => {
  try {
    const count = await Sale.countDocuments();
    return `S${(count + 1).toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating sale ID:', error);
    return `S${Date.now()}`;
  }
};

// Helper function to generate EMI ID
const generateEmiId = (saleId, installmentNo) => {
  return `EMI-${saleId}-${installmentNo.toString().padStart(3, '0')}`;
};

// Helper function to generate EMI due dates (always 5th of month)
const generateEmiDueDates = (startDate, tenure) => {
  const dueDates = [];
  const date = new Date(startDate);
  
  // Get next month's 5th as first EMI
  let currentDate = new Date(date.getFullYear(), date.getMonth() + 1, 5);
  
  for (let i = 1; i <= tenure; i++) {
    dueDates.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return dueDates;
};

// @desc    Create a new sale
// @route   POST /api/sales
exports.createSale = async (req, res) => {
  try {
    console.log('Creating sale with data:', req.body);

    const {
      vehicleId,
      customerId,
      agentId,
      sellingPrice,
      paymentType,
      paymentMode,
      downPayment,
      financeAmount,
      interestRate,
      tenure,
      emi,
      charges1,
      charges2,
      documentationCharges,
      rtoCharges,
      saleDate
    } = req.body;

    // Validate required fields
    if (!vehicleId || !customerId || !sellingPrice || !paymentType || !documentationCharges || !rtoCharges) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for sale'
      });
    }

    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate agent if provided
    if (agentId) {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }
    }

    // Validate finance details if payment type is Finance
    if (paymentType === 'Finance') {
      if (!downPayment || !financeAmount || !interestRate || !tenure || !emi) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all finance details: downPayment, financeAmount, interestRate, tenure, emi'
        });
      }
    }

    // Generate unique sale ID
    const saleId = await generateSaleId();

    // Create sale
    const saleData = {
      saleId,
      vehicleId,
      customerId,
      agentId,
      sellingPrice: sellingPrice.toString(),
      paymentType,
      paymentMode: paymentMode || '',
      downPayment: downPayment ? downPayment.toString() : undefined,
      financeAmount: financeAmount ? financeAmount.toString() : undefined,
      interestRate: interestRate ? interestRate.toString() : undefined,
      tenure: tenure || undefined,
      emi: emi ? emi.toString() : undefined,
      charges1: charges1 ? charges1.toString() : '0',
      charges2: charges2 ? charges2.toString() : '0',
      documentationCharges: documentationCharges.toString(),
      rtoCharges: rtoCharges.toString(),
      saleDate: saleDate || new Date(),
      status: 'Active'
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Update vehicle status to 'sold out'
    vehicle.status = 'sold out';
    await vehicle.save();

    // Update customer's assigned agent's customer count if agent exists
    if (agentId) {
      await Agent.findByIdAndUpdate(agentId, {
        $inc: { customerCount: 1 }
      });
    }

    // Create EMI records if payment type is Finance
    if (paymentType === 'Finance' && tenure && tenure > 0) {
      const emiRecords = [];
      
      // Generate EMI due dates (always 5th of each month)
      const purchaseDate = sale.saleDate || new Date();
      const dueDates = generateEmiDueDates(purchaseDate, tenure);
      
      console.log(`Generating ${tenure} EMIs due on 5th of each month`);
      console.log(`First EMI due date: ${dueDates[0].toISOString()}`);

      for (let i = 0; i < tenure; i++) {
        const emiRecord = new EMI({
          emiId: generateEmiId(saleId, i + 1),
          saleId: sale._id,
          customerId,
          installmentNo: i + 1,
          dueDate: dueDates[i],
          amount: emi.toString(),
          status: 'Pending',
          lateFee: '0',
          reminderSent: false
        });

        await emiRecord.save();
        emiRecords.push(emiRecord);
      }

      console.log(`Created ${emiRecords.length} EMI records for sale ${saleId}`);
    }

    // Populate references for response
    await sale.populate('vehicleId', 'name model vehicleType');
    await sale.populate('customerId', 'name phone email');
    if (agentId) {
      await sale.populate('agentId', 'name phone');
    }

    console.log('Sale created successfully:', sale._id);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate sale ID generated. Please try again.'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
exports.getAllSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customerId,
      vehicleId,
      agentId,
      status,
      startDate,
      endDate,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    if (customerId) query.customerId = customerId;
    if (vehicleId) query.vehicleId = vehicleId;
    if (agentId) query.agentId = agentId;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    // Build sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const sales = await Sale.find(query)
      .populate('vehicleId', 'name model vehicleType price images')
      .populate('customerId', 'name phone email address aadharNo')
      .populate('agentId', 'name phone email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: sales
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('vehicleId', 'name model vehicleType price images')
      .populate('customerId', 'name phone email address aadharNo panNo')
      .populate('agentId', 'name phone email employmentDetails');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Get all EMI records for this sale
    const emis = await EMI.find({ saleId: sale._id })
      .sort({ installmentNo: 1 });

    const responseData = {
      ...sale.toObject(),
      emis
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Only allow updating certain fields
    const allowedUpdates = [
      'paymentMode',
      'charges1',
      'charges2',
      'documentationCharges',
      'rtoCharges',
      'status',
      'agentId'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update the sale
    Object.assign(sale, updates);
    await sale.save();

    // Populate for response
    await sale.populate('vehicleId', 'name model vehicleType');
    await sale.populate('customerId', 'name phone');
    await sale.populate('agentId', 'name phone');

    res.status(200).json({
      success: true,
      message: 'Sale updated successfully',
      data: sale
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete sale (soft delete by changing status)
// @route   DELETE /api/sales/:id
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Soft delete - mark as cancelled/completed
    sale.status = 'Completed';
    await sale.save();

    console.log('Sale deactivated successfully:', sale._id);

    res.status(200).json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales by customer
// @route   GET /api/sales/customer/:customerId
exports.getSalesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const sales = await Sale.find({ customerId })
      .populate('vehicleId', 'name model vehicleType price images')
      .populate('agentId', 'name phone')
      .sort({ saleDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Sale.countDocuments({ customerId });

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: sales
    });
  } catch (error) {
    console.error('Error fetching customer sales:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales by agent
// @route   GET /api/sales/agent/:agentId
exports.getSalesByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const sales = await Sale.find({ agentId })
      .populate('vehicleId', 'name model vehicleType')
      .populate('customerId', 'name phone')
      .sort({ saleDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Sale.countDocuments({ agentId });

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: sales
    });
  } catch (error) {
    console.error('Error fetching agent sales:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
exports.getSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.saleDate = {};
      if (startDate) dateFilter.saleDate.$gte = new Date(startDate);
      if (endDate) dateFilter.saleDate.$lte = new Date(endDate);
    }

    // Total sales count and revenue
    const salesStats = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { 
            $sum: { 
              $add: [
                { $toDouble: '$sellingPrice' },
                { $toDouble: '$documentationCharges' },
                { $toDouble: '$rtoCharges' },
                { $toDouble: '$charges1' },
                { $toDouble: '$charges2' }
              ]
            }
          },
          financeSales: {
            $sum: { $cond: [{ $eq: ['$paymentType', 'Finance'] }, 1, 0] }
          },
          fullPaymentSales: {
            $sum: { $cond: [{ $eq: ['$paymentType', 'Full Payment'] }, 1, 0] }
          }
        }
      }
    ]);

    // Sales by payment type
    const salesByPaymentType = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          totalValue: { 
            $sum: { $toDouble: '$sellingPrice' }
          }
        }
      }
    ]);

    // Sales by status
    const salesByStatus = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: salesStats[0] || {
          totalSales: 0,
          totalRevenue: 0,
          financeSales: 0,
          fullPaymentSales: 0
        },
        byPaymentType: salesByPaymentType,
        byStatus: salesByStatus
      }
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

