import joi from "joi";

// Auth validations
export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

export const addUserSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

// Parcel validations
export const createParcelSchema = joi.object({
  senderName: joi.string().min(2).max(100).required(),
  senderPhone: joi.string().min(7).max(20).required(),
  senderAddress: joi.string().min(5).max(300).required(),
  receiverName: joi.string().min(2).max(100).required(),
  receiverPhone: joi.string().min(7).max(20).required(),
  receiverAddress: joi.string().min(5).max(300).required(),
  shipmentType: joi.string().valid("national", "international").required(),
  originCity: joi.string().min(2).max(100).required(),
  destinationCity: joi.string().min(2).max(100).required(),
  deliveryType: joi.string().valid("sameDay", "overnight", "standard").required(),
  parcelCategory: joi.string().valid(
    "documents",
    "electronics",
    "fragile",
    "clothing",
    "food",
    "medicine",
    "cosmetics",
    "books",
    "small package",
    "large package"
  ).required(),
  weight: joi.number().positive().required(),
});

export const updateParcelSchema = joi.object({
  senderName: joi.string().min(2).max(100).optional(),
  senderPhone: joi.string().min(7).max(20).optional(),
  senderAddress: joi.string().min(5).max(300).optional(),
  receiverName: joi.string().min(2).max(100).optional(),
  receiverPhone: joi.string().min(7).max(20).optional(),
  receiverAddress: joi.string().min(5).max(300).optional(),
  shipmentType: joi.string().valid("national", "international").optional(),
  originCity: joi.string().min(2).max(100).optional(),
  destinationCity: joi.string().min(2).max(100).optional(),
  deliveryType: joi.string().valid("sameDay", "overnight", "standard").optional(),
  parcelCategory: joi.string().valid(
    "documents",
    "electronics",
    "fragile",
    "clothing",
    "food",
    "medicine",
    "cosmetics",
    "books",
    "small package",
    "large package"
  ).optional(),
  weight: joi.number().positive().optional(),
}).min(1);

export const addCheckpointSchema = joi.object({
  location: joi.string().min(2).max(100).required(),
  title: joi.string().min(2).max(100).required(),
  description: joi.string().max(500).optional(),
  status: joi.string().valid(
    "arrived",
    "in_transit",
    "out_for_delivery",
    "delivered"
  ).required(),
  updatedBy: joi.string().min(2).max(100).required(),
});