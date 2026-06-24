export const generateTrackingId = async (ParcelModel) => {
  const prefix = "CRR";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trackingId = `${prefix}-${timestamp}-${random}`;

  const existing = await ParcelModel.findOne({ trackingId });
  if (existing) return null;

  return trackingId;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};