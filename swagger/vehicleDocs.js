/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       required:
 *         - vehicleType
 *         - name
 *         - model
 *         - price
 *       properties:
 *         uniqueId:
 *           type: string
 *           description: Auto-generated unique ID
 *         vehicleType:
 *           type: string
 *           enum: [bike, car]
 *           description: Type of vehicle
 *         name:
 *           type: string
 *           description: Vehicle name
 *         model:
 *           type: string
 *           description: Vehicle model
 *         price:
 *           type: string
 *           description: Vehicle price (as string)
 *         status:
 *           type: string
 *           enum: [available, sold out]
 *           default: available
 *           description: Vehicle status
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             description: Base64 encoded image starting with data:image
 *           description: Array of vehicle images in base64 format
 *         customerDetails:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             location:
 *               type: string
 *             contactDetails:
 *               type: string
 *             customerProfessionDetails:
 *               type: string
 *         paymentDetails:
 *           type: object
 *           properties:
 *             sellingPrice:
 *               type: string
 *             downpayment:
 *               type: string
 *             financeAmount:
 *               type: string
 *             interestRate:
 *               type: string
 *             tenure:
 *               type: string
 *             paymentType:
 *               type: string
 *               enum: [full payment, finance, '']
 *             paymentMode:
 *               type: string
 *               enum: [cash, online, '']
 *             documentationCharges:
 *               type: string
 *             rtoCharges:
 *               type: string
 */

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management API
 */

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle with images
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 enum: [bike, car]
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               price:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, sold out]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of base64 encoded images
 *               customerDetails:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   location:
 *                     type: string
 *                   contactDetails:
 *                     type: string
 *                   customerProfessionDetails:
 *                     type: string
 *               paymentDetails:
 *                 type: object
 *                 properties:
 *                   sellingPrice:
 *                     type: string
 *                   downpayment:
 *                     type: string
 *                   financeAmount:
 *                     type: string
 *                   interestRate:
 *                     type: string
 *                   tenure:
 *                     type: string
 *                   paymentType:
 *                     type: string
 *                     enum: [full payment, finance, '']
 *                   paymentMode:
 *                     type: string
 *                     enum: [cash, online, '']
 *                   documentationCharges:
 *                     type: string
 *                   rtoCharges:
 *                     type: string
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: vehicleType
 *         schema:
 *           type: string
 *           enum: [bike, car]
 *         description: Filter by vehicle type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold out]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or model
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 */

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle not found
 */

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update vehicle by ID (including images)
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 */

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 */

/**
 * @swagger
 * /api/vehicles/{id}/status:
 *   patch:
 *     summary: Update vehicle status
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, sold out]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Vehicle not found
 */

/**
 * @swagger
 * /api/vehicles/{id}/images:
 *   post:
 *     summary: Add images to existing vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of base64 encoded images
 *     responses:
 *       200:
 *         description: Images added successfully
 *       400:
 *         description: Invalid image format
 *       404:
 *         description: Vehicle not found
 */

/**
 * @swagger
 * /api/vehicles/{id}/images/{imageIndex}:
 *   delete:
 *     summary: Remove an image from vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the image to remove
 *     responses:
 *       200:
 *         description: Image removed successfully
 *       404:
 *         description: Vehicle or image not found
 */