import { Parcel } from "../models/Parcel.js";
import { calculateCost, formatCurrency } from "../services/calculateCost.js";
import { generateTrackingId } from "../services/generateTrackingId.js";
import {
  createParcelSchema,
  updateParcelSchema,
  addCheckpointSchema,
} from "../validations/validations.js";

// @desc    Create a new parcel
// @route   POST /api/parcels
export const createParcel = async (req, res, next) => {
  try {
    const { error, value } = createParcelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const priceInfo = calculateCost({
      originCity: value.originCity,
      destinationCity: value.destinationCity,
      shipmentType: value.shipmentType,
      deliveryType: value.deliveryType,
      parcelCategory: value.parcelCategory,
      weight: value.weight,
    });

    const trackingId = await generateTrackingId(Parcel);

    if (!trackingId) {
      return res
        .status(500)
        .json({ message: "Failed to generate unique tracking ID" });
    }

    const parcel = await Parcel.create({
      ...value,
      trackingId,
      price: priceInfo.price,
      checkpoints: [
        {
          location: value.originCity,
          title: `Parcel arrived at ${value.originCity} Branch`,
          description: `Your parcel has arrived at our ${value.originCity} branch and is being processed for dispatch to ${value.destinationCity}`,
          status: "arrived",
          updatedBy: "system",
        },
      ],
    });

    res.status(201).json({
      trackingId: parcel.trackingId,
      _id: parcel._id,
      senderName: parcel.senderName,
      senderPhone: parcel.senderPhone,
      senderAddress: parcel.senderAddress,
      receiverName: parcel.receiverName,
      receiverPhone: parcel.receiverPhone,
      receiverAddress: parcel.receiverAddress,
      shipmentType: parcel.shipmentType,
      originCity: parcel.originCity,
      destinationCity: parcel.destinationCity,
      deliveryType: parcel.deliveryType,
      parcelCategory: parcel.parcelCategory,
      weight: parcel.weight,
      price: parcel.price,
      priceFormatted: priceInfo.priceFormatted,
      checkpoints: parcel.checkpoints,
      createdAt: parcel.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all parcels
// @route   GET /api/parcels
export const getAllParcels = async (req, res, next) => {
  try {
    const {
      shipmentType,
      deliveryType,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const matchStage = {};
    if (shipmentType) matchStage.shipmentType = shipmentType;
    if (deliveryType) matchStage.deliveryType = deliveryType;
    if (search) {
      matchStage.$or = [
        { trackingId: { $regex: search, $options: "i" } },
        { senderName: { $regex: search, $options: "i" } },
        { receiverName: { $regex: search, $options: "i" } },
        { originCity: { $regex: search, $options: "i" } },
        { destinationCity: { $regex: search, $options: "i" } },
      ];
    }
    if (status) matchStage["lastCheckpoint.status"] = status;

    const [parcels, total] = await Promise.all([
      Parcel.aggregate([
        {
          $addFields: {
            lastCheckpoint: { $arrayElemAt: ["$checkpoints", -1] },
          },
        },
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]),
      Parcel.aggregate([
        {
          $addFields: {
            lastCheckpoint: { $arrayElemAt: ["$checkpoints", -1] },
          },
        },
        { $match: matchStage },
        { $count: "total" },
      ]),
    ]);

    const totalCount = total[0]?.total || 0;

    res.status(200).json({
      data: parcels,
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single parcel by ID
// @route   GET /api/parcels/:id
export const getParcelById = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json(parcel);
  } catch (error) {
    next(error);
  }
};

// @desc    Track parcel by tracking ID
// @route   GET /api/parcels/track/:trackingId
export const trackParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne({
      trackingId: req.params.trackingId,
    });

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json(parcel);
  } catch (error) {
    next(error);
  }
};

// @desc    Update parcel
// @route   PUT /api/parcels/:id
export const updateParcel = async (req, res, next) => {
  try {
    const { error, value } = updateParcelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json(parcel);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete parcel
// @route   DELETE /api/parcels/:id
export const deleteParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findByIdAndDelete(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json({ message: "Parcel deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Add checkpoint to parcel
// @route   POST /api/parcels/:id/checkpoints
export const addCheckpoint = async (req, res, next) => {
  try {
    const { error, value } = addCheckpointSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { $push: { checkpoints: value } },
      { new: true, runValidators: true }
    );

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json(parcel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/parcels/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const { getDashboardStatsData } = await import("../services/analyticsServices.js");
    const analytics = await getDashboardStatsData();
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate shipping cost
// @route   POST /api/parcels/calculate-cost
export const calculateShippingCost = async (req, res, next) => {
  try {
    const {
      originCity,
      destinationCity,
      shipmentType,
      deliveryType,
      parcelCategory,
      weight,
    } = req.body;

    if (
      !originCity ||
      !destinationCity ||
      !shipmentType ||
      !deliveryType ||
      !parcelCategory ||
      !weight
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const priceInfo = calculateCost({
      originCity,
      destinationCity,
      shipmentType,
      deliveryType,
      parcelCategory,
      weight,
    });

    res.status(200).json({
      originCity,
      destinationCity,
      shipmentType,
      deliveryType,
      parcelCategory,
      weight,
      estimatedCost: priceInfo.price,
      estimatedCostFormatted: priceInfo.priceFormatted,
      breakdown: priceInfo.breakdown,
      currency: "INR",
    });
  } catch (error) {
    next(error);
  }
};