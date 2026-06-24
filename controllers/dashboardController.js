import { getDashboardStatsData } from "../services/analyticsServices.js";
import { Parcel } from "../models/Parcel.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsData();

    // Status distribution in {name, value} format
    const statusDistribution = (stats.statusData || []).map((s) => ({
      name: s._id,
      value: s.count,
    }));

    // Monthly parcels in {month, parcels} format
    const monthlyParcels = (stats.monthlyData || []).map((m) => ({
      month: m.month,
      parcels: m.parcels,
    }));

    // Monthly revenue in {month, revenue} format
    const monthlyRevenue = (stats.monthlyData || []).map((m) => ({
      month: m.month,
      revenue: m.revenue,
    }));

    // Weight distribution
    const weightDistribution = await Parcel.aggregate([
      {
        $bucket: {
          groupBy: "$weight",
          boundaries: [0, 1, 5, 10, 20, 50],
          default: "50+",
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-1 kg" },
                { case: { $eq: ["$_id", 1] }, then: "1-5 kg" },
                { case: { $eq: ["$_id", 5] }, then: "5-10 kg" },
                { case: { $eq: ["$_id", 10] }, then: "10-20 kg" },
                { case: { $eq: ["$_id", 20] }, then: "20-50 kg" },
              ],
              default: "50+ kg",
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      totals: {
        parcels: stats.totalParcels,
        revenue: stats.totalRevenue,
        revenueFormatted: stats.totalRevenueFormatted,
      },
      statusDistribution,
      monthlyParcels,
      monthlyRevenue,
      weightDistribution,
    });
  } catch (error) {
    next(error);
  }
};