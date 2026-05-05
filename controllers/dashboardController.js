// controllers/dashboardController.js

const Sale = require('../models/Sale');
const EMI = require('../models/EMI');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats');

    // Get all vehicles
    const totalVehicles = await Vehicle.countDocuments();
    const soldVehicles = await Vehicle.countDocuments({ 
      status: { $in: ['sold out', 'soldout'] } 
    });

    // Get active loans (Finance payments with status Active)
    const activeLoans = await Sale.countDocuments({ 
      paymentType: 'Finance',
      status: 'Active'
    });

    // Get EMI statistics
    const allEmis = await EMI.find();
    const pendingEmis = await EMI.countDocuments({ 
      status: { $in: ['Pending', 'Overdue'] } 
    });
    
    const paidEmis = await EMI.countDocuments({ status: 'Paid' });
    const totalEmisCount = allEmis.length;
    
    const totalPendingAmount = await EMI.aggregate([
      { 
        $match: { 
          status: { $ne: 'Paid' } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]);

    const efficiency = totalEmisCount > 0 
      ? ((paidEmis / totalEmisCount) * 100).toFixed(1) 
      : '0';

    // Get recent overdue EMIs (last 5)
    const recentOverdue = await EMI.find({ 
      status: 'Overdue' 
    })
      .populate('customerId', 'name phone email')
      .sort({ dueDate: 1 })
      .limit(5);

    // Format overdue EMIs for response
    const formattedOverdueEmis = recentOverdue.map(emi => ({
      _id: emi._id,
      emiId: emi.emiId,
      installmentNo: emi.installmentNo,
      amount: emi.amount,
      dueDate: emi.dueDate,
      status: emi.status,
      customer: emi.customerId ? {
        _id: emi.customerId._id,
        name: emi.customerId.name,
        phone: emi.customerId.phone,
        email: emi.customerId.email
      } : null
    }));

    // Get additional stats for charts
    const monthlyCollection = await getMonthlyCollection();
    const vehicleTypeDistribution = await getVehicleTypeDistribution();
    const topAgents = await getTopAgents();

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalVehicles,
          soldVehicles,
          activeLoans,
          pendingEmis,
          totalPendingAmount: totalPendingAmount[0]?.total || 0,
          paidEmis,
          totalEmis: totalEmisCount,
          efficiency: parseFloat(efficiency)
        },
        recentOverdue: formattedOverdueEmis,
        charts: {
          monthlyCollection,
          vehicleTypeDistribution,
          topAgents
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get monthly collection
const getMonthlyCollection = async () => {
  const currentDate = new Date();
  const last6Months = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    last6Months.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
    });
  }

  const monthlyData = [];
  
  for (const period of last6Months) {
    const collections = await EMI.aggregate([
      {
        $match: {
          status: 'Paid',
          paidDate: {
            $gte: period.startDate,
            $lte: period.endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$paidAmount' } }
        }
      }
    ]);

    monthlyData.push({
      month: period.month,
      amount: collections[0]?.total || 0
    });
  }

  return monthlyData;
};

// Helper function to get vehicle type distribution
const getVehicleTypeDistribution = async () => {
  const distribution = await Vehicle.aggregate([
    {
      $group: {
        _id: '$vehicleType',
        count: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
          }
        },
        sold: {
          $sum: {
            $cond: [{ $in: ['$status', ['sold out', 'soldout']] }, 1, 0]
          }
        }
      }
    }
  ]);

  return distribution.map(item => ({
    type: item._id || 'Other',
    count: item.count,
    available: item.available,
    sold: item.sold
  }));
};

// Helper function to get top performing agents
const getTopAgents = async () => {
  const topAgents = await Sale.aggregate([
    {
      $match: {
        agentId: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$agentId',
        totalSales: { $sum: 1 },
        totalRevenue: { 
          $sum: { 
            $add: [
              { $toDouble: '$sellingPrice' },
              { $toDouble: '$documentationCharges' },
              { $toDouble: '$rtoCharges' }
            ]
          }
        }
      }
    },
    { $sort: { totalSales: -1 } },
    { $limit: 5 }
  ]);

  // Populate agent details
  const agentIds = topAgents.map(a => a._id);
  const agents = await Agent.find({ _id: { $in: agentIds } }).select('name phone email');

  return topAgents.map(agent => {
    const agentInfo = agents.find(a => a._id.toString() === agent._id.toString());
    return {
      _id: agent._id,
      name: agentInfo?.name || 'Unknown',
      phone: agentInfo?.phone || 'N/A',
      totalSales: agent.totalSales,
      totalRevenue: agent.totalRevenue
    };
  });
};

// @desc    Get recent activity feed
// @route   GET /api/dashboard/activity
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent sales
    const recentSales = await Sale.find()
      .populate('customerId', 'name')
      .populate('vehicleId', 'name model')
      .sort({ saleDate: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get recent EMI payments
    const recentPayments = await EMI.find({ status: 'Paid' })
      .populate('customerId', 'name')
      .sort({ paidDate: -1 })
      .limit(parseInt(limit))
      .lean();

    // Combine and format activities
    const activities = [];

    recentSales.forEach(sale => {
      activities.push({
        id: sale._id,
        type: 'sale',
        title: 'New Vehicle Sale',
        description: `${sale.customerId?.name || 'Customer'} purchased ${sale.vehicleId?.name || 'Vehicle'} ${sale.vehicleId?.model || ''}`,
        amount: sale.sellingPrice,
        date: sale.saleDate,
        status: sale.status
      });
    });

    recentPayments.forEach(payment => {
      activities.push({
        id: payment._id,
        type: 'payment',
        title: 'EMI Payment Received',
        description: `${payment.customerId?.name || 'Customer'} paid EMI #${payment.installmentNo}`,
        amount: payment.paidAmount || payment.amount,
        date: payment.paidDate,
        status: 'Completed'
      });
    });

    // Sort by date and limit
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales overview chart data
// @route   GET /api/dashboard/sales-overview
exports.getSalesOverview = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // daily, weekly, monthly, yearly

    let dateFormat;
    let groupBy;

    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
        break;
      case 'weekly':
        groupBy = { $week: '$saleDate' };
        break;
      case 'yearly':
        dateFormat = '%Y';
        groupBy = { $dateToString: { format: '%Y', date: '$saleDate' } };
        break;
      default: // monthly
        dateFormat = '%Y-%m';
        groupBy = { $dateToString: { format: '%Y-%m', date: '$saleDate' } };
    }

    const salesData = await Sale.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          totalAmount: { 
            $sum: { 
              $add: [
                { $toDouble: '$sellingPrice' },
                { $toDouble: '$documentationCharges' },
                { $toDouble: '$rtoCharges' }
              ]
            }
          }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};