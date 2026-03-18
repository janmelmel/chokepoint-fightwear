import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * StaffGuard — wraps any staff/admin page.
 * Only users registered in the Users table (role: admin or user/staff) can pass.
 * Anyone else is redirected to login or shown an access denied screen.
 */
export default function StaffGuard({ children, adminOnly = false }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'denied' | 'unauthenticated'
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);

      if (!u) {
        setStatus('unauthenticated');
        setTimeout(() => base44.auth.redirectToLogin(window.location.href), 1500);
        return;
      }

      // Only admin role can access staff portal
      if (u.role !== 'admin') {
        setStatus('denied');
        return;
      }

      setUser(u);
      setStatus('allowed');
    })();
  }, []);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-6 h-6 border-2 border-[#333] border-t-[#ff8c00] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <div className="w-6 h-6 border-2 border-[#333] border-t-[#ff8c00] rounded-full animate-spin" />
        <p className="font-mono-ui text-xs text-[#555] uppercase tracking-widest">Redirecting to login...</p>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] gap-6 px-4 text-center">
        <div className="w-16 h-16 border border-[#ff0000]/30 flex items-center justify-center bg-[#ff0000]/5">
          <span className="text-[#ff0000] text-3xl font-bold">✕</span>
        </div>
        <div>
          <p className="font-mono-ui text-[10px] text-[#ff0000] uppercase tracking-widest mb-2">Access Denied</p>
          <p className="font-tactical text-3xl text-white mb-2">Unauthorized</p>
          <p className="font-mono-ui text-xs text-[#555] max-w-xs">
            Your account does not have permission to access the staff portal.
            Contact your administrator.
          </p>
        </div>
        <button
          onClick={() => base44.auth.logout('/Home')}
          className="font-mono-ui text-xs text-[#555] hover:text-white uppercase tracking-widest transition-colors border border-[#333] px-6 py-2.5 hover:border-[#555]"
        >
          Back to Store
        </button>
      </div>
    );
  }

  // Inject user into children via cloneElement if children is a single element
  return typeof children === 'function' ? children(user) : children;
}