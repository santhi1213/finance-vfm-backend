// services/reminderService.js - NEW FILE
const EMI = require('../models/EMI');
const emailService = require('./emailService');

// Send reminders for EMIs due in next 3 days
async function sendUpcomingReminders() {
  console.log('Checking for upcoming EMI reminders...');
  
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  
  // Find EMIs that are due in next 3 days and reminder not sent
  const upcomingEmis = await EMI.find({
    dueDate: {
      $gte: today,
      $lte: threeDaysLater
    },
    status: { $ne: 'Paid' },
    reminderSent: false
  }).populate('customerId', 'name phone email')
    .populate({
      path: 'saleId',
      populate: { path: 'vehicleId', select: 'name model' }
    });
  
  console.log(`Found ${upcomingEmis.length} EMIs due in next 3 days`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const emi of upcomingEmis) {
    try {
      const customerEmail = emi.customerId?.email;
      if (!customerEmail) {
        console.log(`No email for customer: ${emi.customerId?.name}`);
        failCount++;
        continue;
      }
      
      const result = await emailService.sendPaymentReminder(
        customerEmail,
        emi.customerId.name,
        parseFloat(emi.amount),
        emi.dueDate,
        emi.saleId?.vehicleId?.name || 'Vehicle'
      );
      
      if (result.success) {
        emi.reminderSent = true;
        emi.reminderDate = new Date();
        await emi.save();
        successCount++;
        console.log(`Reminder sent to ${customerEmail}`);
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`Failed to send reminder for EMI ${emi._id}:`, error);
      failCount++;
    }
  }
  
  console.log(`Reminders sent: ${successCount} success, ${failCount} failed`);
  return { successCount, failCount };
}

// Run reminders every day at 9 AM
function startReminderScheduler() {
  // Run immediately on start
  setTimeout(() => {
    sendUpcomingReminders();
  }, 5000);
  
  // Then run every day at 9 AM
  const scheduleDaily = () => {
    const now = new Date();
    const next9AM = new Date();
    next9AM.setHours(9, 0, 0, 0);
    
    if (now > next9AM) {
      next9AM.setDate(next9AM.getDate() + 1);
    }
    
    const timeUntil9AM = next9AM - now;
    
    setTimeout(() => {
      sendUpcomingReminders();
      // Schedule next day
      setInterval(() => {
        sendUpcomingReminders();
      }, 24 * 60 * 60 * 1000);
    }, timeUntil9AM);
  };
  
  scheduleDaily();
}

module.exports = {
  sendUpcomingReminders,
  startReminderScheduler
};