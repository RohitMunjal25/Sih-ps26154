const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createProject,
  getProjectDetails,
  getProjects,
  downloadGeneratedFile,
} = require("../controllers/projectController");
const router = express.Router();

router.get("/", protect, getProjects);

/**
 * @swagger
 * /api/projects/generate:
 *   post:
 *     tags:
 *       - Projects (Gen AI)
 *     summary: Create a new generation project
 *     description: Upload a file or provide a URL/text to generate multiple outputs (LinkedIn, Advisory, Video script, etc.) based on the same source.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - inputType
 *               - outputTypes
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the project
 *                 example: "Cyber Threat Intel Report"
 *               inputType:
 *                 type: string
 *                 enum: [text, url, pdf, docx, image]
 *                 description: Format of the input source
 *                 example: "url"
 *               inputValue:
 *                 type: string
 *                 description: Required if inputType is 'text' or 'url'. The actual text or link.
 *                 example: "https://example.com/cyber-news"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Required if inputType is 'pdf', 'docx', or 'image'.
 *               outputTypes:
 *                 type: string
 *                 description: JSON stringified array of required outputs.
 *                 example: '["linkedin", "advisory", "twitter"]'
 *               params:
 *                 type: string
 *                 description: JSON stringified object of extra parameters like tone or audience.
 *                 example: '{"tone": "Urgent", "audience": "Executives"}'
 *     responses:
 *       201:
 *         description: Processing started successfully in background
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.post("/generate", protect, upload.single("file"), createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects (Gen AI)
 *     summary: Get project results
 *     description: Fetch the project details along with all its generated outputs and their current statuses.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Project ID
 *     responses:
 *       200:
 *         description: Project and outputs fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get(
  "/files/:fileName",
  protect,
  downloadGeneratedFile
);
router.get("/:id", protect, getProjectDetails);

module.exports = router;