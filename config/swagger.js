import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Courier Delivery API",
    version: "1.0.0",
    description: "API documentation for the Courier Delivery Web Application",
  },
  servers: [
    {
      url: "http://localhost:" + (process.env.PORT || 5000),
      description: "Development server",
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
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: [
    "C:/Users/Nithyasri/OneDrive/Desktop/backend/routes/authRoutes.js",
    "C:/Users/Nithyasri/OneDrive/Desktop/backend/routes/parcelRoutes.js",
  ],
};
export const swaggerSpec = swaggerJSDoc(options);

// Debug log — remove after fixing
console.log("Swagger scanning:", path.join(__dirname, "../routes/*.js"));
console.log("Paths found:", Object.keys(swaggerSpec.paths || {}));
console.log("Scanning path:", path.join(__dirname, "../routes/*.js"));