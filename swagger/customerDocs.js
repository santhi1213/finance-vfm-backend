/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: Customer management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
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
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - aadharNo
 *         - panNo
 *         - address
 *         - phone
 *         - assignedAgent
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f2c3e4d5a6b7c8e9f0a1b2"
 *         name:
 *           type: string
 *           example: "Rajesh Kumar"
 *         aadharNo:
 *           type: string
 *           example: "123456789012"
 *         panNo:
 *           type: string
 *           example: "ABCDE1234F"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         phone:
 *           type: string
 *           example: "+91 9876543210"
 *         alternatePhone:
 *           type: string
 *           example: "+91 9876543211"
 *         email:
 *           type: string
 *           example: "rajesh@example.com"
 *         assignedAgent:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1985-06-15"
 *         occupation:
 *           type: string
 *           example: "Software Engineer"
 *         annualIncome:
 *           type: string
 *           example: "800000"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CustomerInput:
 *       type: object
 *       required:
 *         - name
 *         - aadharNo
 *         - panNo
 *         - address
 *         - phone
 *         - assignedAgent
 *       properties:
 *         name:
 *           type: string
 *           example: "Rajesh Kumar"
 *         aadharNo:
 *           type: string
 *           example: "123456789012"
 *         panNo:
 *           type: string
 *           example: "ABCDE1234F"
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
 *         phone:
 *           type: string
 *           example: "+91 9876543210"
 *         alternatePhone:
 *           type: string
 *           example: "+91 9876543211"
 *         email:
 *           type: string
 *           example: "rajesh@example.com"
 *         assignedAgent:
 *           type: string
 *           example: "65f2c3e4d5a6b7c8e9f0a1b2"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1985-06-15"
 *         occupation:
 *           type: string
 *           example: "Software Engineer"
 *         annualIncome:
 *           type: string
 *           example: "800000"
 */

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       201:
 *         description: Customer created successfully
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
 *                   example: Customer created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation error or duplicate entry
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
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
 *         description: Search by name, email, aadhar, PAN, or phone
 *       - in: query
 *         name: assignedAgent
 *         schema:
 *           type: string
 *         description: Filter by assigned agent ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of customers
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
 *                     $ref: '#/components/schemas/Customer'
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       200:
 *         description: Customer updated successfully
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
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Soft delete customer (deactivate)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deactivated successfully
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
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/customers/{id}/hard:
 *   delete:
 *     summary: Permanently delete customer (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer permanently deleted
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/customers/agent/{agentId}:
 *   get:
 *     summary: Get customers by assigned agent
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
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
 *         description: List of customers assigned to agent
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
 *                     $ref: '#/components/schemas/Customer'
 */

/**
 * @swagger
 * /api/customers/{id}/toggle-status:
 *   patch:
 *     summary: Toggle customer active status (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
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
 *                   $ref: '#/components/schemas/Customer'
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Customer not found
 */