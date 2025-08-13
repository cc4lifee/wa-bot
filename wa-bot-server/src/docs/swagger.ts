/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique message identifier
 *         from:
 *           type: string
 *           description: Sender phone number
 *         to:
 *           type: string
 *           description: Recipient phone number
 *         text:
 *           type: string
 *           description: Message content
 *         timestamp:
 *           type: number
 *           description: Unix timestamp
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user identifier
 *         name:
 *           type: string
 *           description: User display name
 *         phoneNumber:
 *           type: string
 *           description: User phone number
 *         isActive:
 *           type: boolean
 *           description: Whether user is active
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the request was successful
 *         data:
 *           type: object
 *           description: Response data
 *         error:
 *           type: string
 *           description: Error message if applicable
 *         code:
 *           type: string
 *           description: Error code if applicable
 */

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get server status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: number
 *                   example: 1691234567890
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get paginated messages
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 50
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /api/send-message:
 *   post:
 *     summary: Send a message via API
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - text
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number
 *                 example: "+1234567890"
 *               text:
 *                 type: string
 *                 description: Message content
 *                 example: "Hello from API!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request data
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of users to return
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   
 *   post:
 *     summary: Create or update a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       200:
 *         description: User created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
