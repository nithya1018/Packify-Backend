import express from "express";
import {
  createParcel,
  getAllParcels,
  getParcelById,
  trackParcel,
  updateParcel,
  deleteParcel,
  addCheckpoint,
  getAnalytics,
  calculateShippingCost,
} from "../controllers/parcelController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parcels
 *   description: Parcel management and tracking
 */

/**
 * @swagger
 * /api/parcels/calculate-cost:
 *   post:
 *     summary: Calculate shipping cost
 *     tags: [Parcels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originCity
 *               - destinationCity
 *               - shipmentType
 *               - deliveryType
 *               - parcelCategory
 *               - weight
 *             properties:
 *               originCity:
 *                 type: string
 *               destinationCity:
 *                 type: string
 *               shipmentType:
 *                 type: string
 *                 enum: [national, international]
 *               deliveryType:
 *                 type: string
 *                 enum: [sameDay, overnight, standard]
 *               parcelCategory:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cost calculated successfully
 */
router.post("/calculate-cost", calculateShippingCost);

/**
 * @swagger
 * /api/parcels/track/{trackingId}:
 *   get:
 *     summary: Track parcel by tracking ID
 *     tags: [Parcels]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parcel found
 *       404:
 *         description: Parcel not found
 */
router.get("/track/:trackingId", trackParcel);

/**
 * @swagger
 * /api/parcels/analytics:
 *   get:
 *     summary: Get parcel analytics
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 */
router.get("/analytics", protect, getAnalytics);

/**
 * @swagger
 * /api/parcels:
 *   get:
 *     summary: Get all parcels
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shipmentType
 *         schema:
 *           type: string
 *           enum: [national, international]
 *       - in: query
 *         name: deliveryType
 *         schema:
 *           type: string
 *           enum: [sameDay, overnight, standard]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [arrived, in_transit, out_for_delivery, delivered]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of parcels
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getAllParcels);

/**
 * @swagger
 * /api/parcels:
 *   post:
 *     summary: Create a new parcel
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderName
 *               - senderPhone
 *               - senderAddress
 *               - receiverName
 *               - receiverPhone
 *               - receiverAddress
 *               - shipmentType
 *               - originCity
 *               - destinationCity
 *               - deliveryType
 *               - parcelCategory
 *               - weight
 *             properties:
 *               senderName:
 *                 type: string
 *               senderPhone:
 *                 type: string
 *               senderAddress:
 *                 type: string
 *               receiverName:
 *                 type: string
 *               receiverPhone:
 *                 type: string
 *               receiverAddress:
 *                 type: string
 *               shipmentType:
 *                 type: string
 *                 enum: [national, international]
 *               originCity:
 *                 type: string
 *               destinationCity:
 *                 type: string
 *               deliveryType:
 *                 type: string
 *                 enum: [sameDay, overnight, standard]
 *               parcelCategory:
 *                 type: string
 *                 enum: [documents, electronics, fragile, clothing, food, medicine, cosmetics, books, small package, large package]
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Parcel created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, createParcel);

/**
 * @swagger
 * /api/parcels/{id}:
 *   get:
 *     summary: Get parcel by ID
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parcel found
 *       404:
 *         description: Parcel not found
 */
router.get("/:id", protect, getParcelById);

/**
 * @swagger
 * /api/parcels/{id}:
 *   put:
 *     summary: Update parcel
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Parcel updated successfully
 *       404:
 *         description: Parcel not found
 */
router.put("/:id", protect, updateParcel);

/**
 * @swagger
 * /api/parcels/{id}:
 *   delete:
 *     summary: Delete parcel
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parcel deleted successfully
 *       404:
 *         description: Parcel not found
 */
router.delete("/:id", protect, deleteParcel);

/**
 * @swagger
 * /api/parcels/{id}/checkpoints:
 *   post:
 *     summary: Add checkpoint to parcel
 *     tags: [Parcels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - title
 *               - status
 *               - updatedBy
 *             properties:
 *               location:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [arrived, in_transit, out_for_delivery, delivered]
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkpoint added successfully
 *       404:
 *         description: Parcel not found
 */

router.post("/:id/checkpoints", protect, addCheckpoint);
router.post("/:id/checkpoint", protect, addCheckpoint);

export default router;