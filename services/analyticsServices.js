import { Parcel } from "../models/Parcel.js";
import { formatCurrency } from "./calculateCost.js";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const toMonthKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const getLastMonths = (n) => {
  const now = new Date();
  const months = [];

  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: toMonthKey(date),
      month: MONTH_LABELS[date.getMonth()],
      monthKey: `${MONTH_LABELS[date.getMonth()]}-${date.getFullYear()}`,
      start: new Date(date.getFullYear(), date.getMonth(), 1),
    });
  }

  return months;
};

const monthKeyProject = (groupIdPath) => ({
  $concat: [
    { $toString: `${groupIdPath}.y` },
    "-",
    {
      $cond: [
        { $lt: [`${groupIdPath}.m`, 10] },
        { $concat: ["0", { $toString: `${groupIdPath}.m` }] },
        { $toString: `${groupIdPath}.m` },
      ],
    },
  ],
});

export const getDashboardStatsData = async () => {
  const months = getLastMonths(12);
  const startDate = months[0].start;

  const [
    totalParcels,
    totalRevenueData,
    shipmentTypeCounts,
    deliveryTypeCounts,
    categoryData,
    monthlyRawData,
    statusData,
  ] = await Promise.all([
    // Total parcels
    Parcel.countDocuments(),

    // Total revenue
    Parcel.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),

    // Shipment type counts
    Parcel.aggregate([
      {
        $group: {
          _id: "$shipmentType",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
    ]),

    // Delivery type counts
    Parcel.aggregate([
      {
        $group: {
          _id: "$deliveryType",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
    ]),

    // Parcel category counts
    Parcel.aggregate([
      {
        $group: {
          _id: "$parcelCategory",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // Monthly data for last 12 months
    Parcel.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
          },
          parcels: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      {
        $project: {
          _id: 0,
          key: monthKeyProject("$_id"),
          parcels: 1,
          revenue: 1,
        },
      },
    ]),

    // Status counts based on last checkpoint
    Parcel.aggregate([
      {
        $addFields: {
          lastCheckpoint: { $arrayElemAt: ["$checkpoints", -1] },
        },
      },
      {
        $group: {
          _id: "$lastCheckpoint.status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Map monthly raw data to last 12 months
  const monthlyDataMap = {};
  monthlyRawData.forEach((item) => {
    monthlyDataMap[item.key] = {
      parcels: item.parcels,
      revenue: item.revenue,
    };
  });

  const monthlyData = months.map((m) => ({
    month: m.month,
    key: m.key,
    monthKey: m.monthKey,
    parcels: monthlyDataMap[m.key]?.parcels || 0,
    revenue: monthlyDataMap[m.key]?.revenue || 0,
    revenueFormatted: formatCurrency(monthlyDataMap[m.key]?.revenue || 0),
  }));

  const totalRevenue = totalRevenueData[0]?.total || 0;

  return {
    totalParcels,
    totalRevenue,
    totalRevenueFormatted: formatCurrency(totalRevenue),
    shipmentTypeCounts,
    deliveryTypeCounts,
    categoryData,
    monthlyData,
    statusData,
  };
};