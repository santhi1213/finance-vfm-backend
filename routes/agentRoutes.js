// const express = require('express');
// const router = express.Router();
// const {
//   createAgent,
//   getAllAgents,
//   getAgentById,
//   updateAgent,
//   deleteAgent,
//   hardDeleteAgent,
//   toggleAgentStatus,
//   getAgentsByDepartment
// } = require('../controllers/agentController');

// // Public routes - no authentication required
// router.route('/')
//   .get(getAllAgents)
//   .post(createAgent);

// router.route('/:id')
//   .get(getAgentById)
//   .put(updateAgent)
//   .delete(deleteAgent);

// // Hard delete
// router.delete('/:id/hard', hardDeleteAgent);

// // Toggle status
// router.patch('/:id/toggle-status', toggleAgentStatus);

// // Get by department
// router.get('/department/:department', getAgentsByDepartment);

// module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  hardDeleteAgent,
  toggleAgentStatus,
  getAgentsByDepartment
} = require('../controllers/agentController');

// Log all requests to this router
router.use((req, res, next) => {
  console.log(`[Agent Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes - no authentication required
router.route('/')
  .get(getAllAgents)
  .post(createAgent);

// ⭐⭐⭐ CRITICAL: Toggle status MUST be before /:id route ⭐⭐⭐
router.put('/toggle_status/:id', toggleAgentStatus);

// Get by department - also before /:id
router.get('/department/:department', getAgentsByDepartment);

// Generic ID routes - these should come LAST
router.route('/:id')
  .get(getAgentById)
  .put(updateAgent)
  .delete(deleteAgent);

// Hard delete
router.delete('/:id/hard', hardDeleteAgent);

// Add a test route to verify router is working
router.get('/test/hello', (req, res) => {
  res.json({ message: 'Agent router is working!' });
});

module.exports = router;
