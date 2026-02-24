import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Trash2, ChevronRight, Lock } from 'lucide-react';

const STAGES = ['Processing', 'Packing', 'Out for Delivery', 'Completed'];

const STAGE_COLORS = {
  'Processing': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  'Packing': 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  'Out for Delivery': 'text-orange-400 border-orange-400/30 bg-orange-400/5',
  'Completed': 'text-green-400 border-green-400/30 bg-green-400/5',
};

const MOCK_ORDERS = [
  { id: 'CP-001', product: 'No Gi SET', customer: 'Juan D.', stage: 'Processing' },
  { id: 'CP-002', product: 'Rashguard (Classic Logo)', customer: 'Maria S.', stage: 'Packing' },
  { id: 'CP-003', product: 'Grimthorn SET', customer: 'Pedro R.', stage: 'Out for Delivery' },
  { id: 'CP-004', product: 'Pilipinas SET', customer: 'Ana L.', stage: 'Completed' },
];

const STAFF_PASSWORD = 'chokepoint2026';

export default function Staff() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cp_orders');
    setOrders(saved ? JSON.parse(saved) : MOCK_ORDERS);
  }, []);

  const save = (updated) => {
    setOrders(updated);
    localStorage.setItem('cp_orders', JSON.stringify(updated));
  };

  const updateStage = (id, stage) => {
    save(orders.map(o => o.id === id ? { ...o, stage } : o));
  };

  const deleteOrder = (id) => {
    save(orders.filter(o => o.id !== id));
  };

  const addOrder = () => {
    const newOrder = {
      id: `CP-${String(orders.length + 1).padStart(3, '0')}`,
      product: 'New Order',
      customer: 'Customer',
      stage: 'Processing',
    };
    save([...orders, newOrder]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pw === STAFF_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Inter:wght@400;500;600&display=swap');
          .font-gothic { font-family: 'UnifrakturMaguntia', cursive; }
          .font-inter { font-family: 'Inter', sans-serif; }
        `}</style>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs"
        >
          <div className="text-center mb-8">
            <Lock className="w-6 h-6 text-[#8b0000] mx-auto mb-4" />
            <h1 className="font-gothic text-3xl text-white">System Access</h1>
            <p className="font-inter text-xs text-white/30 mt-2 tracking-widest uppercase">Staff Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Password"
              className="w-full font-inter text-sm text-white bg-[#0a0a0a] border border-white/10 px-4 py-3 text-center tracking-widest focus:outline-none focus:border-[#8b0000]/60 placeholder-white/20"
            />
            {error && <p className="font-inter text-xs text-[#8b0000] text-center">{error}</p>}
            <button
              type="submit"
              className="w-full font-inter text-xs tracking-[0.3em] uppercase py-3 bg-[#8b0000] text-white hover:bg-[#a80000] transition-colors"
            >
              Enter
            </button>
          </form>
          <Link to={createPageUrl('Home')} className="flex items-center justify-center gap-1 mt-8 font-inter text-xs text-white/20 hover:text-white/40 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.stage === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Inter:wght@400;500;600;700&display=swap');
        .font-gothic { font-family: 'UnifrakturMaguntia', cursive; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-gothic text-2xl text-white">Operations</h1>
          <p className="font-inter text-[10px] text-white/30 uppercase tracking-widest">Chokepoint Staff</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Home')} className="font-inter text-xs text-white/30 hover:text-white/60 transition-colors">
            View Store
          </Link>
          <button onClick={() => setAuthed(false)} className="font-inter text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-1.5">
            Logout
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
        {/* Stage Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STAGES.map((stage) => (
            <div key={stage} className={`border px-4 py-4 ${STAGE_COLORS[stage]}`}>
              <p className="text-2xl font-bold">{stageCounts[stage]}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1 opacity-70">{stage}</p>
            </div>
          ))}
        </div>

        {/* Orders List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-gothic text-xl text-white">Order Stream</h2>
          <button
            onClick={addOrder}
            className="flex items-center gap-1.5 font-inter text-xs text-[#8b0000] border border-[#8b0000]/30 px-3 py-2 hover:bg-[#8b0000]/10 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Order
          </button>
        </div>

        <div className="space-y-2">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 border border-white/10 bg-[#0a0a0a] px-4 py-3 hover:border-white/20 transition-colors"
            >
              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-[10px] text-white/30 tracking-widest">{order.id}</span>
                  <span className={`font-inter text-[10px] uppercase tracking-wider border px-2 py-0.5 ${STAGE_COLORS[order.stage]}`}>
                    {order.stage}
                  </span>
                </div>
                <p className="font-inter text-sm text-white font-medium mt-0.5 truncate">{order.product}</p>
                <p className="font-inter text-xs text-white/40">{order.customer}</p>
              </div>

              {/* Stage Selector */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <select
                  value={order.stage}
                  onChange={e => updateStage(order.id, e.target.value)}
                  className="font-inter text-xs bg-[#111] border border-white/10 text-white/70 px-2 py-2 focus:outline-none focus:border-[#8b0000]/50 cursor-pointer max-w-[120px] sm:max-w-none"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-12 border border-white/5">
              <p className="font-inter text-xs text-white/20">No orders yet. Add one above.</p>
            </div>
          )}
        </div>

        <p className="font-inter text-[10px] text-white/15 text-center mt-8">
          Data stored in browser localStorage · No server calls
        </p>
      </main>
    </div>
  );
}