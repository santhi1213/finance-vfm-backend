/**
 * @swagger
 * tags:
 *   - name: Agents
 *     description: Agent management endpoints (public - no authentication required)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactDetails:
 *       type: object
 *       required:
 *         - phone
 *       properties:
 *         phone:
 *           type: string
 *           example: "+91 9876543210"
 *         alternatePhone:
 *           type: string
 *           example: "+91 9876543211"
 *         email:
 *           type: string
 *           example: "agent@example.com"
 *     
 *     AgentAddress:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         street:
 *           type: string
 *           example: "123 Main Street"
 *         city:
 *           type: string
 *           example: "Mumbai"
 *         state:
 *           type: string
 *           example: "Maharashtra"
 *         pincode:
 *           type: string
 *           example: "400001"
 *         country:
 *           type: string
 *           example: "India"
 *     
 *     EmploymentDetails:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: string
 *           example: "EMP001"
 *         department:
 *           type: string
 *           enum: [sales, service, management, collection]
 *           example: "collection"
 *         designation:
 *           type: string
 *           example: "Senior Collection Agent"
 *         joinDate:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         commission:
 *           type: string
 *           example: "5"
 *     
 *     BankDetails:
 *       type: object
 *       properties:
 *         accountNumber:
 *           type: string
 *           example: "1234567890"
 *         ifscCode:
 *           type: string
 *           example: "SBIN0001234"
 *         bankName:
 *           type: string
 *           example: "State Bank of India"
 *         branchName:
 *           type: string
 *           example: "Main Branch"
 *     
 *     Agent:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - aadharNo
 *         - contactDetails
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f2c3e4d5a6b7c8e9f0a1b2"
 *         name:
 *           type: string
 *           example: "Rahul Sharma"
 *         age:
 *           type: number
 *           example: 32
 *         aadharNo:
 *           type: string
 *           example: "123456789012"
 *         contactDetails:
 *           $ref: '#/components/schemas/ContactDetails'
 *         address:
 *           $ref: '#/components/schemas/AgentAddress'
 *         employmentDetails:
 *           $ref: '#/components/schemas/EmploymentDetails'
 *         bankDetails:
 *           $ref: '#/components/schemas/BankDetails'
 *         isActive:
 *           type: boolean
 *           example: true
 *         customerCount:
 *           type: number
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     AgentInput:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - aadharNo
 *         - contactDetails
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           example: "Rahul Sharma"
 *         age:
 *           type: number
 *           example: 32
 *         aadharNo:
 *           type: string
 *           example: "123456789012"
 *         contactDetails:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *               example: "+91 9876543210"
 *             alternatePhone:
 *               type: string
 *               example: "+91 9876543211"
 *             email:
 *               type: string
 *               example: "rahul.sharma@example.com"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main Street"
 *             city:
 *               type: string
 *               example: "Mumbai"
 *             state:
 *               type: string
 *               example: "Maharashtra"
 *             pincode:
 *               type: string
 *               example: "400001"
 *             country:
 *               type: string
 *               example: "India"
 *         employmentDetails:
 *           type: object
 *           properties:
 *             employeeId:
 *               type: string
 *               example: "EMP001"
 *             department:
 *               type: string
 *               enum: [sales, service, management, collection]
 *               example: "collection"
 *             designation:
 *               type: string
 *               example: "Senior Collection Agent"
 *             joinDate:
 *               type: string
 *               format: date
 *               example: "2024-01-01"
 *             commission:
 *               type: string
 *               example: "5"
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountNumber:
 *               type: string
 *               example: "1234567890"
 *             ifscCode:
 *               type: string
 *               example: "SBIN0001234"
 *             bankName:
 *               type: string
 *               example: "State Bank of India"
 *             branchName:
 *               type: string
 *               example: "Main Branch"
 */

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Agents]
 *     description: Create a new agent (no authentication required)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentInput'
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Agent created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Validation error or duplicate entry
 */

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Agents]
 *     description: Retrieve list of all agents (no authentication required)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, phone, aadhar, or employee ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *           enum: [sales, service, management, collection]
 *         description: Filter by department
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, age, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 */

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Get agent by ID
 *     tags: [Agents]
 *     description: Retrieve agent details by ID (no authentication required)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 */

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Update agent
 *     tags: [Agents]
 *     description: Update agent details (no authentication required)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentInput'
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 */

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Soft delete agent
 *     tags: [Agents]
 *     description: Deactivate an agent (no authentication required)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Agent not found
 */

/**
 * @swagger
 * /api/agents/{id}/hard:
 *   delete:
 *     summary: Permanently delete agent
 *     tags: [Agents]
 *     description: Permanently delete an agent (no authentication required)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent permanently deleted
 *       404:
 *         description: Agent not found
 */

/**
 * @swagger
 * /api/agents/{id}/toggle-status:
 *   patch:
 *     summary: Toggle agent active status
 *     tags: [Agents]
 *     description: Activate or deactivate an agent (no authentication required)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 */

/**
 * @swagger
 * /api/agents/department/{department}:
 *   get:
 *     summary: Get agents by department
 *     tags: [Agents]
 *     description: Retrieve agents filtered by department (no authentication required)
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sales, service, management, collection]
 *         description: Department name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of agents in department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 */