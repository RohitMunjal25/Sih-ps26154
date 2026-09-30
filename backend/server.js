const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Auto-load environment variables
const connectDB = require("./config/db");

// Swagger Packages
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Routes Import
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// --- SWAGGER CONFIGURATION ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NTRO Gen AI Platform API",
      version: "1.0.0",
      description: "SIH 26154 - Automated Content Transformation API",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Ye routes folder ke andar sabhi files se comments read karega
  apis: ["./routes/*.js"], 
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);
// Docs Endpoint yaha define ho raha hai
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
// -----------------------------

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes); 

app.get("/", (req, res) => {
  res.send("NTRO Gen AI Platform API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});