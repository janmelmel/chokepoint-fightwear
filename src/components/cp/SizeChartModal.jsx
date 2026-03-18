import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

const SIZE_CHARTS = {
  rashguard: {
    title: 'Rashguard Size Chart',
    unit: 'inches',
    headers: ['Size', 'Chest', 'Length', 'Sleeve'],
    rows: [
      ['XS', '32-34"', '26"', '7"'],
      ['S', '34-36"', '27"', '7.5"'],
      ['M', '36-38"', '28"', '8"'],
      ['L', '38-40"', '29"', '8.5"'],
      ['XL', '40-42"', '30"', '9"'],
      ['2XL', '42-44"', '31"', '9.5"'],
      ['3XL', '44-46"', '32"', '10"'],
    ]
  },
  shorts: {
    title: 'Grappling Shorts Size Chart',
    unit: 'inches',
    headers: ['Size', 'Waist', 'Outseam', 'Inseam'],
    rows: [
      ['XS', '26-28"', '17"', '7"'],
      ['S', '28-30"', '17.5"', '7.5"'],
      ['M', '30-32"', '18"', '8"'],
      ['L', '32-34"', '18.5"', '8.5"'],
      ['XL', '34-36"', '19"', '9"'],
      ['2XL', '36-38"', '19.5"', '9.5"'],
    ]
  },
  gi: {
    title: 'Gi Size Chart',
    unit: 'based on height/weight',
    headers: ['Size', 'Height', 'Weight'],
    rows: [
      ['A0', '5\'2" - 5\'5"', '110-140 lbs'],
      ['A1', '5\'5" - 5\'8"', '140-165 lbs'],
      ['A2', '5\'8" - 5\'11"', '165-195 lbs'],
      ['A3', '5\'11" - 6\'2"', '195-225 lbs'],
      ['A4', '6\'2" - 6\'5"', '225-260 lbs'],
      ['A5', '6\'5"+', '260+ lbs'],
    ]
  }
};

export default function SizeChartModal({ onClose, productType = 'rashguard' }) {
  const [activeChart, setActiveChart] = useState(productType);
  const chart = SIZE_CHARTS[activeChart] || SIZE_CHARTS.rashguard;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111] border border-[#333] max-h-[90vh] overflow-y-auto scrollbar-tactical"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#ff8c00]" />
            <h2 className="font-tactical text-xl text-white">Size Guide</h2>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222]">
          {Object.keys(SIZE_CHARTS).map(key => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`flex-1 py-3 font-mono-ui text-[10px] uppercase tracking-widest transition-colors ${
                activeChart === key
                  ? 'text-[#ff8c00] border-b-2 border-[#ff8c00] bg-[#ff8c00]/5'
                  : 'text-[#555] hover:text-white'
              }`}
            >
              {key === 'gi' ? 'Gi' : key === 'rashguard' ? 'Rashguard' : 'Shorts'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest mb-4">
            {chart.title} • Measurements in {chart.unit}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {chart.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-mono-ui text-[10px] text-[#888] uppercase tracking-widest text-left border-b border-[#222]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-3 py-3 font-mono-ui text-xs ${j === 0 ? 'text-[#ff8c00] font-bold' : 'text-white'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-[#0a0a0a] border border-[#222]">
            <p className="font-mono-ui text-[10px] text-[#ff8c00] uppercase tracking-widest mb-2">Sizing Tips</p>
            <ul className="space-y-1 font-inter text-xs text-[#666]">
              <li>• For a snug compression fit, go true to size</li>
              <li>• For a looser fit, size up one size</li>
              <li>• When between sizes, we recommend sizing up</li>
              <li>• Contact us if you need specific measurements</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}