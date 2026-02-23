import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ExternalLink, FileSpreadsheet, Inbox, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Staff() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Simple password protection - replace with your actual password
  const STAFF_PASSWORD = 'chokepoint2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === STAFF_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  // Replace these with your actual URLs
  const FORMSPREE_INBOX = 'https://formspree.io/forms/yourformid/submissions';
  const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Inter:wght@300;400;500;600;700&display=swap');
            .font-blackletter { font-family: 'UnifrakturMaguntia', cursive; }
            .font-body { font-family: 'Inter', sans-serif; }
          `}
        </style>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 border border-[#FF0A0A]/30 mb-4">
              <Lock className="w-6 h-6 text-[#FF0A0A]" />
            </div>
            <h1 className="font-blackletter text-3xl text-white">Staff Portal</h1>
            <p className="font-body text-xs text-white/40 mt-2 tracking-wider uppercase">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-4 bg-[#0A0A0A] border border-white/10 text-white font-body text-sm text-center tracking-widest focus:outline-none focus:border-[#FF0A0A]/50 transition-colors"
              />
            </div>
            
            {error && (
              <p className="font-body text-xs text-[#FF0A0A] text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#FF0A0A] text-white font-body text-sm tracking-widest uppercase hover:bg-[#cc0808] transition-colors"
            >
              Access Portal
            </button>
          </form>

          <Link 
            to={createPageUrl('Home')}
            className="flex items-center justify-center gap-2 mt-8 font-body text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Store
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Inter:wght@300;400;500;600;700&display=swap');
          .font-blackletter { font-family: 'UnifrakturMaguntia', cursive; }
          .font-body { font-family: 'Inter', sans-serif; }
        `}
      </style>

      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-blackletter text-2xl text-white">Staff Dashboard</h1>
            <p className="font-body text-xs text-white/40 mt-1">Chokepoint Fightwear</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to={createPageUrl('Home')}
              className="font-body text-xs text-white/40 hover:text-white transition-colors"
            >
              View Store
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 border border-white/10 font-body text-xs text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Formspree Inbox */}
            <motion.a
              href={FORMSPREE_INBOX}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group p-6 bg-[#0A0A0A] border border-white/10 hover:border-[#FF0A0A]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-[#FF0A0A]/10 flex items-center justify-center mb-4">
                  <Inbox className="w-6 h-6 text-[#FF0A0A]" />
                </div>
                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
              <h3 className="font-body text-lg font-semibold text-white">Custom Orders Inbox</h3>
              <p className="font-body text-sm text-white/40 mt-2">
                View all custom order submissions from Formspree
              </p>
            </motion.a>

            {/* Google Sheet */}
            <motion.a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group p-6 bg-[#0A0A0A] border border-white/10 hover:border-[#FF0A0A]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-green-500" />
                </div>
                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
              <h3 className="font-body text-lg font-semibold text-white">Order Tracker Sheet</h3>
              <p className="font-body text-sm text-white/40 mt-2">
                Manually track orders and inventory in Google Sheets
              </p>
            </motion.a>
          </div>

          {/* Embedded Sheet Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] border border-white/10 p-6"
          >
            <h3 className="font-body text-lg font-semibold text-white mb-4">Order Tracker (Embedded)</h3>
            <div className="aspect-video bg-[#111] border border-white/5 flex items-center justify-center">
              <div className="text-center p-8">
                <FileSpreadsheet className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="font-body text-sm text-white/40">
                  Replace this with your embedded Google Sheet
                </p>
                <p className="font-body text-xs text-white/20 mt-2">
                  File → Share → Publish to web → Embed
                </p>
              </div>
              {/* Uncomment and replace with your actual sheet embed URL:
              <iframe 
                src="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/htmlembed?gid=0" 
                className="w-full h-full"
                frameBorder="0"
              />
              */}
            </div>
          </motion.div>

          {/* Quick Stats Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            {[
              { label: 'Pending Orders', value: '—' },
              { label: 'Processing', value: '—' },
              { label: 'Shipped', value: '—' },
              { label: 'Completed', value: '—' }
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-[#0A0A0A] border border-white/5 text-center">
                <p className="font-body text-2xl font-bold text-white">{stat.value}</p>
                <p className="font-body text-xs text-white/40 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <p className="font-body text-xs text-white/20 text-center mt-8">
            Tip: Update stats manually in your Google Sheet, or upgrade to database integration for live data.
          </p>
        </div>
      </main>
    </div>
  );
}