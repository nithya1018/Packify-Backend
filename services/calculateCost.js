const DELIVERY_TYPE_CHARGES = {
  sameDay: 150,
  overnight: 80,
  standard: 0,
};

const NATIONAL_CATEGORY_CHARGES = {
  documents: -100,
  electronics: 150,
  fragile: 250,
  clothing: 0,
  food: 120,
  medicine: 150,
  cosmetics: 100,
  books: -20,
  "small package": 100,
  "large package": 250,
};

const INTERNATIONAL_CATEGORY_CHARGES = {
  documents: 0,
  electronics: 500,
  fragile: 600,
  clothing: 100,
  food: 400,
  medicine: 450,
  cosmetics: 300,
  books: 50,
  "small package": 200,
  "large package": 600,
};

const NATIONAL_BASE_RATE = 500;
const NATIONAL_SAME_CITY_BASE_RATE = 300;
const WEIGHT_CHARGE_PER_KG = 50;

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateCost = ({
  originCity,
  destinationCity,
  shipmentType,
  parcelCategory,
  weight,
  deliveryType,
}) => {
  const isSameCity =
    originCity.trim().toLowerCase() === destinationCity.trim().toLowerCase();

  const deliveryTypeCharge = DELIVERY_TYPE_CHARGES[deliveryType] || 0;

  // NATIONAL SHIPMENT COST CALCULATION
  if (shipmentType === "national") {
    const categoryCharge = NATIONAL_CATEGORY_CHARGES[parcelCategory] || 0;

    if (weight <= 0) {
      throw new Error("Weight must be greater than 0");
    }

    const baseRate = isSameCity
      ? NATIONAL_SAME_CITY_BASE_RATE
      : NATIONAL_BASE_RATE;

    const weightCharge = weight * WEIGHT_CHARGE_PER_KG;
    const total = baseRate + weightCharge + deliveryTypeCharge + categoryCharge;

    return {
      price: parseFloat(total.toFixed(2)),
      priceFormatted: formatCurrency(total),
      breakdown: {
        baseRate,
        weightCharge: parseFloat(weightCharge.toFixed(2)),
        deliveryTypeCharge,
        categoryCharge,
        isSameCity,
        total: parseFloat(total.toFixed(2)),
        totalFormatted: formatCurrency(total),
      },
    };
  }

  // INTERNATIONAL SHIPMENT COST CALCULATION
  if (shipmentType === "international") {
    const categoryCharge = INTERNATIONAL_CATEGORY_CHARGES[parcelCategory] || 0;

    if (weight <= 0) {
      throw new Error("Weight must be greater than 0");
    }

    let basePrice;

    if (weight <= 0.5) {
      basePrice = 750;
    } else if (weight <= 1) {
      basePrice = 1200;
    } else if (weight <= 2) {
      basePrice = 1800;
    } else if (weight <= 5) {
      basePrice = 2500;
    } else if (weight <= 10) {
      basePrice = 4000;
    } else if (weight <= 20) {
      basePrice = 7000;
    } else {
      basePrice = 7000 + (weight - 20) * 300;
    }

    const total = basePrice + deliveryTypeCharge + categoryCharge;

    return {
      price: parseFloat(total.toFixed(2)),
      priceFormatted: formatCurrency(total),
      breakdown: {
        baseRate: basePrice,
        weightCharge: 0,
        deliveryTypeCharge,
        categoryCharge,
        isSameCity: false,
        total: parseFloat(total.toFixed(2)),
        totalFormatted: formatCurrency(total),
      },
    };
  }

  throw new Error("Invalid shipment type");
};