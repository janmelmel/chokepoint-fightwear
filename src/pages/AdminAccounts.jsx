import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/cp/AdminSidebar';
import { UserPlus, Shield, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAccounts() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { base44.auth.redirectToLogin(window.location.href); return; }
      setUser(u);
      if (u?.role !== 'admin') return;
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.User.list('-created_date', 50);
    setUsers(list);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole);
    setMessage(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInvite(false);
    setInviting(false);
    await load();
  };

  const changeRole = async (uid, role) => {
    await base44.entities.User.update(uid, { role });
    await load();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="font-mono-ui text-[#ff0000] text-sm">Access Denied — Admin Only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono-ui text-[10px] text-[#ff0000] uppercase tracking-widest">Admin Only</p>
              <h1 className="font-tactical text-4xl text-white">Staff Accounts</h1>
            </div>
            <button onClick={() => setShowInvite(true)} className="btn-glow-orange px-5 py-3 font-mono-ui text-xs tracking-widest uppercase flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Invite Staff
            </button>
          </div>

          {message && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20">
              <p className="font-mono-ui text-xs text-green-400">{message}</p>
              <button onClick={() => setMessage('')} className="ml-auto text-green-400/50 hover:text-green-400"><X className="w-4 h-4" /></button>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="card-tactical h-16 animate-pulse" />)}</div>
          ) : (
            <div className="card-tactical overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d]">
                <p className="font-mono-ui text-[10px] text-[#444] uppercase tracking-widest">{users.length} accounts</p>
              </div>
              <div className="divide-y divide-[#1a1a1a]">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-4">
                    <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${u.role === 'admin' ? 'bg-[#ff8c00]/10' : 'bg-[#1a1a1a]'}`}>
                      {u.role === 'admin' ? <Shield className="w-4 h-4 text-[#ff8c00]" /> : <User className="w-4 h-4 text-[#555]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm text-white">{u.full_name || 'No name'}</p>
                      <p className="font-mono-ui text-[10px] text-[#555] truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {u.id !== user.id ? (
                        <select value={u.role || 'user'} onChange={e => changeRole(u.id, e.target.value)}
                          className="bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-[10px] px-2 py-1.5 focus:outline-none focus:border-[#ff8c00]/60">
                          <option value="user">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="font-mono-ui text-[10px] text-[#ff8c00] border border-[#ff8c00]/30 px-2 py-1">YOU</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 border border-[#ff0000]/10 bg-[#ff0000]/5">
            <p className="font-mono-ui text-[10px] text-[#ff0000] uppercase tracking-widest mb-1">Security Note</p>
            <p className="font-mono-ui text-[10px] text-[#555]">
              Staff (role: user) cannot access Revenue Analytics or Admin-only routes.
              Only Admins can approve products, manage accounts, and view full analytics.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowInvite(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-[#111] border border-[#333]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                <h2 className="font-tactical text-2xl text-white">Invite Staff</h2>
                <button onClick={() => setShowInvite(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Email *</label>
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email"
                    className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60"
                    placeholder="staff@chokepoint.com" />
                </div>
                <div>
                  <label className="font-mono-ui text-[10px] text-[#555] uppercase tracking-widest block mb-1">Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333] text-white font-mono-ui text-sm px-3 py-2.5 focus:outline-none focus:border-[#ff8c00]/60">
                    <option value="user">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowInvite(false)} className="btn-glow-white flex-1 py-3 font-mono-ui text-xs tracking-widest uppercase">Cancel</button>
                  <button onClick={handleInvite} disabled={!inviteEmail || inviting}
                    className="btn-glow-orange flex-1 py-3 font-mono-ui text-xs tracking-widest uppercase disabled:opacity-50">
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}