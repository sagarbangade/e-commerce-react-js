export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const calculateDiscountPercentage = (originalPrice: number, discountPrice: number | null) => {
  if (!discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};
