// DHL Express Philippines — CPX Outfitters Apparel Trading
// Zone mapping: country code → zone (1–9)
export const DHL_ZONES = {
  // Zone 1
  HK: 1, MO: 1, SG: 1, TW: 1,
  // Zone 2
  BN: 2, ID: 2, JP: 2, KR: 2, MY: 2, TH: 2,
  // Zone 3
  CN: 3, KH: 3, LA: 3, MM: 3, VN: 3,
  // Zone 4
  AU: 4, NZ: 4, PG: 4, FJ: 4, WS: 4, TO: 4, VU: 4,
  // Zone 5
  BD: 5, BT: 5, IN: 5, LK: 5, NP: 5, PK: 5, MV: 5, AF: 5,
  // Zone 6
  US: 6, CA: 6, MX: 6,
  // Zone 7
  GB: 7, DE: 7, FR: 7, IT: 7, ES: 7, NL: 7, BE: 7, CH: 7, AT: 7,
  PT: 7, SE: 7, NO: 7, DK: 7, FI: 7, IE: 7, PL: 7, CZ: 7, HU: 7,
  SK: 7, RO: 7, HR: 7, SI: 7, LU: 7, MT: 7, CY: 7, EE: 7, LV: 7,
  LT: 7, BG: 7, GR: 7,
  // Zone 8
  AE: 8, SA: 8, KW: 8, QA: 8, BH: 8, OM: 8, JO: 8, LB: 8, IL: 8,
  EG: 8, MA: 8, TN: 8, DZ: 8, NG: 8, KE: 8, GH: 8, ZA: 8, ET: 8,
  TZ: 8, UG: 8, SN: 8, CI: 8, CM: 8, MZ: 8, MG: 8, MU: 8,
  // Zone 9 (rest of world)
  RU: 9, UA: 9, BY: 9, KZ: 9, UZ: 9, GE: 9, AM: 9, AZ: 9,
  TR: 9, IR: 9, IQ: 9, SY: 9, YE: 9, LY: 9, SD: 9,
  BR: 9, AR: 9, CL: 9, CO: 9, PE: 9, VE: 9, EC: 9, BO: 9,
  PY: 9, UY: 9, CU: 9, DO: 9, GT: 9, HN: 9, SV: 9, NI: 9, CR: 9, PA: 9,
};

// Rate table: weight (kg) → { zone: price PHP }
// Non-documents rates
export const DHL_RATES = {
  0.5:  { 1: 780,  2: 1103, 3: 1142, 4: 1445, 5: 1519, 6: 1943, 7: 1705, 8: 1955, 9: 2055 },
  1.0:  { 1: 939,  2: 1248, 3: 1311, 4: 1676, 5: 1759, 6: 2226, 7: 2039, 8: 2414, 9: 2605 },
  1.5:  { 1: 1057, 2: 1380, 3: 1474, 4: 1907, 5: 2001, 6: 2503, 7: 2373, 8: 2873, 9: 3181 },
  2.0:  { 1: 1175, 2: 1512, 3: 1637, 4: 2138, 5: 2243, 6: 2780, 7: 2707, 8: 3332, 9: 3757 },
  2.5:  { 1: 1269, 2: 1633, 3: 1784, 4: 2342, 5: 2460, 6: 3018, 7: 2992, 8: 3755, 9: 4290 },
  3.0:  { 1: 1362, 2: 1754, 3: 1931, 4: 2546, 5: 2677, 6: 3256, 7: 3276, 8: 4178, 9: 4822 },
  3.5:  { 1: 1453, 2: 1870, 3: 2073, 4: 2744, 5: 2890, 6: 3493, 7: 3558, 8: 4597, 9: 5352 },
  4.0:  { 1: 1544, 2: 1985, 3: 2214, 4: 2941, 5: 3104, 6: 3730, 7: 3839, 8: 5016, 9: 5881 },
  4.5:  { 1: 1633, 2: 2100, 3: 2353, 4: 3137, 5: 3317, 6: 3965, 7: 4119, 8: 5435, 9: 6409 },
  5.0:  { 1: 1721, 2: 2214, 3: 2491, 4: 3332, 5: 3529, 6: 4199, 7: 4397, 8: 5853, 9: 6936 },
  5.5:  { 1: 1806, 2: 2325, 3: 2625, 4: 3523, 5: 3737, 6: 4430, 7: 4671, 8: 6265, 9: 7458 },
  6.0:  { 1: 1891, 2: 2436, 3: 2758, 4: 3713, 5: 3945, 6: 4660, 7: 4944, 8: 6676, 9: 7978 },
  6.5:  { 1: 1975, 2: 2545, 3: 2890, 4: 3902, 5: 4152, 6: 4888, 7: 5215, 8: 7085, 9: 8497 },
  7.0:  { 1: 2058, 2: 2654, 3: 3021, 4: 4090, 5: 4358, 6: 5115, 7: 5484, 8: 7493, 9: 9015 },
  7.5:  { 1: 2140, 2: 2762, 3: 3151, 4: 4277, 5: 4563, 6: 5340, 7: 5752, 8: 7899, 9: 9531 },
  8.0:  { 1: 2221, 2: 2869, 3: 3279, 4: 4462, 5: 4767, 6: 5564, 7: 6018, 8: 8304, 9: 10046 },
  8.5:  { 1: 2302, 2: 2974, 3: 3407, 4: 4646, 5: 4971, 6: 5786, 7: 6282, 8: 8708, 9: 10560 },
  9.0:  { 1: 2381, 2: 3079, 3: 3533, 4: 4829, 5: 5173, 6: 6008, 7: 6544, 8: 9111, 9: 11073 },
  9.5:  { 1: 2460, 2: 3183, 3: 3659, 4: 5012, 5: 5375, 6: 6228, 7: 6806, 8: 9513, 9: 11585 },
  10.0: { 1: 2538, 2: 3286, 3: 3783, 4: 5193, 5: 5576, 6: 6448, 7: 7066, 8: 9914, 9: 12096 },
  10.5: { 1: 2614, 2: 3387, 3: 3906, 4: 5373, 5: 5776, 6: 6667, 7: 7323, 8: 10314, 9: 12606 },
  11.0: { 1: 2690, 2: 3488, 3: 4029, 4: 5551, 5: 5975, 6: 6885, 7: 7579, 8: 10712, 9: 13114 },
  11.5: { 1: 2765, 2: 3588, 3: 4150, 4: 5730, 5: 6174, 6: 7102, 7: 7834, 8: 11109, 9: 13622 },
  12.0: { 1: 2840, 2: 3687, 3: 4271, 4: 5907, 5: 6372, 6: 7318, 7: 8087, 8: 11506, 9: 14128 },
  12.5: { 1: 2914, 2: 3786, 3: 4391, 4: 6083, 5: 6570, 6: 7533, 7: 8340, 8: 11901, 9: 14634 },
  13.0: { 1: 2987, 2: 3883, 3: 4510, 4: 6258, 5: 6767, 6: 7747, 7: 8591, 8: 12296, 9: 15139 },
  13.5: { 1: 3060, 2: 3980, 3: 4629, 4: 6433, 5: 6964, 6: 7961, 7: 8841, 8: 12690, 9: 15643 },
  14.0: { 1: 3132, 2: 4077, 3: 4747, 4: 6607, 5: 7160, 6: 8174, 7: 9090, 8: 13083, 9: 16146 },
  14.5: { 1: 3204, 2: 4173, 3: 4864, 4: 6780, 5: 7356, 6: 8386, 7: 9338, 8: 13475, 9: 16648 },
  15.0: { 1: 3275, 2: 4268, 3: 4981, 4: 6953, 5: 7551, 6: 8598, 7: 9585, 8: 13867, 9: 17149 },
  20.0: { 1: 3978, 2: 5205, 3: 6100, 4: 8579, 5: 9344, 6: 10594, 7: 11862, 8: 17282, 9: 21519 },
  25.0: { 1: 4680, 2: 6138, 3: 7213, 4: 10198, 5: 11130, 6: 12582, 7: 14131, 8: 20690, 9: 25882 },
  30.0: { 1: 5381, 2: 7069, 3: 8323, 4: 11815, 5: 12914, 6: 14569, 7: 16399, 8: 24097, 9: 30244 },
};

// Per-kg multiplier for 30+ kg (PHP per extra 0.5 kg above 30)
export const DHL_MULTIPLIER = { 1: 70, 2: 93, 3: 110, 4: 153, 5: 168, 6: 198, 7: 214, 8: 313, 9: 394 };

// Default weights per category/product type (kg)
export const PRODUCT_DEFAULT_WEIGHTS = {
  rashguard: { weight: 0.15, l: 26, w: 35, h: 2 },
  short: { weight: 0.15, l: 26, w: 35, h: 2 },
  nogi: { weight: 0.25, l: 26, w: 35, h: 3 },
  gi: { weight: 1.5, l: 40, w: 50, h: 10 },
  kimono: { weight: 1.5, l: 40, w: 50, h: 10 },
  handwraps: { weight: 0.20, l: 20, w: 15, h: 5 },
  mats: { weight: 10.0, l: 200, w: 20, h: 20 },
  default: { weight: 0.25, l: 30, w: 30, h: 10 },
};

export function getProductWeight(product) {
  if (product?.weight_kg) return product.weight_kg;
  const name = (product?.name || product?.product_name || '').toLowerCase();
  if (name.includes('mat')) return 10.0;
  if (name.includes('kimono')) return 1.5;
  if (name.includes('gi') && !name.includes('no')) return 1.5;
  // "set" = full no-gi set (rashguard + shorts); plain nogi = rashguard or shorts only
  if (name.includes('set')) return 0.5;
  if (name.includes('no-gi') || name.includes('nogi')) return 0.25;
  if (name.includes('rashguard') || name.includes('rash')) return 0.15;
  if (name.includes('short')) return 0.15;
  if (name.includes('wrap')) return 0.20;
  return 0.5;
}

export function calcVolumetricWeight(l, w, h) {
  return (l * w * h) / 5000;
}

export function getCountryCode(countryName) {
  const map = {
    'Australia': 'AU', 'New Zealand': 'NZ', 'Singapore': 'SG', 'Hong Kong': 'HK',
    'Macau': 'MO', 'Taiwan': 'TW', 'Japan': 'JP', 'South Korea': 'KR', 'Korea': 'KR',
    'Malaysia': 'MY', 'Thailand': 'TH', 'Indonesia': 'ID', 'Brunei': 'BN',
    'Vietnam': 'VN', 'Cambodia': 'KH', 'Myanmar': 'MM', 'Laos': 'LA', 'China': 'CN',
    'India': 'IN', 'Bangladesh': 'BD', 'Nepal': 'NP', 'Sri Lanka': 'LK', 'Pakistan': 'PK',
    'United States': 'US', 'USA': 'US', 'Canada': 'CA', 'Mexico': 'MX',
    'United Kingdom': 'GB', 'UK': 'GB', 'Germany': 'DE', 'France': 'FR', 'Italy': 'IT',
    'Spain': 'ES', 'Netherlands': 'NL', 'Belgium': 'BE', 'Switzerland': 'CH', 'Austria': 'AT',
    'Portugal': 'PT', 'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
    'Ireland': 'IE', 'Poland': 'PL', 'Czech Republic': 'CZ', 'Hungary': 'HU',
    'United Arab Emirates': 'AE', 'UAE': 'AE', 'Saudi Arabia': 'SA', 'Kuwait': 'KW',
    'Qatar': 'QA', 'Bahrain': 'BH', 'Oman': 'OM', 'Jordan': 'JO',
    'Brazil': 'BR', 'Argentina': 'AR', 'Chile': 'CL', 'Colombia': 'CO',
    'Russia': 'RU', 'Turkey': 'TR', 'South Africa': 'ZA', 'Nigeria': 'NG', 'Kenya': 'KE',
    'Egypt': 'EG', 'Fiji': 'FJ', 'Papua New Guinea': 'PG',
  };
  return map[countryName] || null;
}

export function calculateDHLRate(cartItems) {
  // Total actual weight
  const totalActualKg = cartItems.reduce((sum, item) => {
    const w = getProductWeight(item);
    return sum + w * (item.quantity || 1);
  }, 0);

  // Total volumetric weight — only calculated when all three dimensions are stored
  let totalVolKg = 0;
  for (const item of cartItems) {
    if (item.length_cm && item.width_cm && item.height_cm) {
      totalVolKg += calcVolumetricWeight(item.length_cm, item.width_cm, item.height_cm) * (item.quantity || 1);
    }
  }

  return { totalActualKg, totalVolKg };
}

export function getDHLShippingFee(cartItems, countryName) {
  const code = getCountryCode(countryName);
  const zone = (code && DHL_ZONES[code]) || 9;
  const { totalActualKg, totalVolKg } = calculateDHLRate(cartItems);
  const chargeableKg = Math.max(totalActualKg, totalVolKg);
  // Round up to nearest 0.5 kg, minimum 0.5
  const roundedKg = Math.max(0.5, Math.ceil(chargeableKg * 2) / 2);

  let fee;
  if (roundedKg <= 30) {
    // Find nearest rate bracket
    const brackets = Object.keys(DHL_RATES).map(Number).sort((a, b) => a - b);
    let bracket = brackets.find(b => b >= roundedKg) || 30;
    // For weights between 15-20, 20-25, 25-30 interpolate to nearest
    if (roundedKg > 15 && roundedKg < 20) bracket = 20;
    else if (roundedKg > 20 && roundedKg < 25) bracket = 25;
    else if (roundedKg > 25 && roundedKg < 30) bracket = 30;
    fee = DHL_RATES[bracket]?.[zone] || DHL_RATES[30][zone];
  } else {
    const extraKg = roundedKg - 30;
    fee = DHL_RATES[30][zone] + Math.ceil(extraKg * 2) * DHL_MULTIPLIER[zone];
  }

  return {
    fee: Math.round(fee),
    zone,
    chargeableKg: Math.round(chargeableKg * 100) / 100,
    roundedKg,
    countryCode: code,
  };
}