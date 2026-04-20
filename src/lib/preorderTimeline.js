/**
 * Shared Pre-Order Timeline Utility
 * Used across ProductDetailModal, OrderConfirmed, TrackOrder, Checkout, StaffOrders, and emails.
 */

export function addBusinessDays(startDate, days) {
  let count = 0;
  let date = new Date(startDate);
  while (count < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return date;
}

export function addCalendarDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatMonthDay(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

/**
 * Returns production and arrival date ranges for a pre-order.
 * @param {Date|string} orderDate - When the order was (or will be) placed
 */
export function getPreOrderTimeline(orderDate) {
  const start = new Date(orderDate);
  const productionMin = addBusinessDays(start, 7);
  const productionMax = addBusinessDays(start, 10);
  const arrivalMin = addCalendarDays(productionMin, 3);
  const arrivalMax = addCalendarDays(productionMax, 7);

  return {
    productionMin,
    productionMax,
    arrivalMin,
    arrivalMax,
    productionRange: `${formatMonthDay(productionMin)} – ${formatMonthDay(productionMax)}, ${productionMax.getFullYear()}`,
    arrivalRange: `${formatMonthDay(arrivalMin)} – ${formatMonthDay(arrivalMax)}, ${arrivalMax.getFullYear()}`,
  };
}