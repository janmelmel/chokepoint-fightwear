import React, { useEffect, useRef } from 'react';
import {
  PHILIPPINES_PROVINCES,
  WORLD_COUNTRIES,
  getCitiesForProvince,
  getBarangaysForCity,
  getShippingZone,
  getShippingRate,
  SHIPPING_ZONES,
} from '@/lib/philippineAddress';

const INPUT_CLASS = "w-full bg-[#111] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60";
const LABEL_CLASS = "font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1";

export default function ShippingAddressForm({ value, onChange, errors }) {
  const isPhilippines = value.country === 'Philippines';

  // Reset city/barangay when province changes
  const prevProvince = useRef(value.province);
  useEffect(() => {
    if (prevProvince.current !== value.province && value.province) {
      prevProvince.current = value.province;
      onChange({ ...value, city: '', barangay: '' });
    } else {
      prevProvince.current = value.province;
    }
  }, [value.province]);

  // Reset barangay when city changes
  const prevCity = useRef(value.city);
  useEffect(() => {
    if (prevCity.current !== value.city && value.city) {
      prevCity.current = value.city;
      onChange({ ...value, barangay: '' });
    } else {
      prevCity.current = value.city;
    }
  }, [value.city]);

  const cities = value.province ? getCitiesForProvince(value.province) : [];
  const barangays = value.city ? getBarangaysForCity(value.city) : [];

  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="space-y-3">
      {/* Country */}
      <div>
        <label className={LABEL_CLASS}>Country *</label>
        <select value={value.country} onChange={set('country')}
          className={INPUT_CLASS + ' bg-[#111]'}>
          {WORLD_COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {!isPhilippines ? (
        <div className="border border-[#ff8c00]/20 bg-[#ff8c00]/5 p-4 space-y-3">
          <p className="font-mono-ui text-xs text-[#ff8c00] leading-relaxed">
            We currently only ship within the Philippines. For international orders, please chat with us or email us at{' '}
            <a href="mailto:sales@chokepoint-fightwear.com" className="underline">sales@chokepoint-fightwear.com</a>
          </p>
          <div className="flex gap-2 flex-wrap">
            <a href="https://www.facebook.com/profile.php?id=61571430141920" target="_blank" rel="noreferrer"
              style={{ background: '#1877F2', color: '#fff', fontWeight: 700 }}
              className="px-4 py-2 font-mono-ui text-xs uppercase tracking-widest">
              Chat with Us
            </a>
            <a href="mailto:sales@chokepoint-fightwear.com"
              style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
              className="px-4 py-2 font-mono-ui text-xs uppercase tracking-widest">
              Email Us
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Province */}
          <div>
            <label className={LABEL_CLASS}>Province *</label>
            <select value={value.province} onChange={set('province')}
              className={INPUT_CLASS + ' bg-[#111]' + (errors?.province ? ' border-[#ff0000]' : '')}>
              <option value="">Select Province</option>
              {PHILIPPINES_PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors?.province && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">{errors.province}</p>}
          </div>

          {/* City */}
          <div>
            <label className={LABEL_CLASS}>City / Municipality *</label>
            <select value={value.city} onChange={set('city')} disabled={!value.province}
              className={INPUT_CLASS + ' bg-[#111] disabled:opacity-40' + (errors?.city ? ' border-[#ff0000]' : '')}>
              <option value="">Select City</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors?.city && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">{errors.city}</p>}
          </div>

          {/* Barangay */}
          <div>
            <label className={LABEL_CLASS}>Barangay / District *</label>
            <select value={value.barangay} onChange={set('barangay')} disabled={!value.city}
              className={INPUT_CLASS + ' bg-[#111] disabled:opacity-40' + (errors?.barangay ? ' border-[#ff0000]' : '')}>
              <option value="">Select Barangay</option>
              {barangays.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {errors?.barangay && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">{errors.barangay}</p>}
          </div>

          {/* Street */}
          <div>
            <label className={LABEL_CLASS}>Street Address / House No. *</label>
            <input value={value.street} onChange={set('street')} placeholder="123 Sample St."
              className={INPUT_CLASS + (errors?.street ? ' border-[#ff0000]' : '')} />
            {errors?.street && <p className="font-mono-ui text-[10px] text-[#ff0000] mt-0.5">{errors.street}</p>}
          </div>

          {/* Postal Code */}
          <div>
            <label className={LABEL_CLASS}>Postal Code</label>
            <input value={value.postalCode} onChange={set('postalCode')} placeholder="0000"
              className={INPUT_CLASS} />
          </div>

          {/* Delivery Notes */}
          <div>
            <label className={LABEL_CLASS}>Delivery Notes (optional)</label>
            <input value={value.deliveryNotes} onChange={set('deliveryNotes')}
              placeholder="e.g. Leave at gate, Call upon arrival"
              className={INPUT_CLASS} />
          </div>

          {/* Shipping Fee Preview */}
          {value.province && (
            <div className="border border-[#222] bg-[#0d0d0d] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Shipping Zone</p>
                  <p className="font-mono-ui text-xs text-white">{getShippingZone(value.province)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest">Shipping Fee</p>
                  <p className="font-mono-ui text-sm text-[#ff8c00] font-bold">₱{getShippingRate(value.province).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}