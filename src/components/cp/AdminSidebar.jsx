import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CPLogo from './CPLogo';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, LogOut, ExternalLink, Paintbrush, ImageIcon, Ticket, BookUser, ClipboardList, BarChart2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminSidebar({ user, collapsed = false, processingCount = 0 }) {
  const loc = useLocation();
  const isAdmin = user?.role === 'admin';

  const links = [
    { label: 'Dashboard', icon: LayoutDashboard, to: createPageUrl('Staff') },
    { label: 'Products', icon: Package, to: createPageUrl('StaffProducts') },
    { label: 'Categories', icon: Tag, to: createPageUrl('StaffCategories') },
    { label: 'Orders', icon: ShoppingBag, to: createPageUrl('StaffOrders'), badge: processingCount > 0 ? processingCount : null },
    { label: 'Hero Banners', icon: ImageIcon, to: createPageUrl('StaffHero') },
    { label: 'Custom Requests', icon: Paintbrush, to: createPageUrl('StaffCustomRequests') },
    { label: 'Promo Codes', icon: Ticket, to: createPageUrl('StaffPromoCodes') },
    { label: 'Customers', icon: BookUser, to: createPageUrl('StaffCustomers') },
    { label: 'Stock Log', icon: ClipboardList, to: createPageUrl('StaffStockLog') },
    { label: 'Metrics', icon: BarChart2, to: createPageUrl('StaffMetrics') },
    ...(isAdmin ? [{ label: 'Accounts', icon: Users, to: createPageUrl('AdminAccounts') }] : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#0d0d0d] border-r border-[#1a1a1a] flex-shrink-0">
      <div className="p-5 border-b border-[#1a1a1a]">
        <CPLogo size={28} variant="white" />
        <p className="font-mono-ui text-xs text-[#444] uppercase tracking-widest mt-2">
          {isAdmin ? 'Admin Portal' : 'Staff Portal'}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => {
          const active = loc.pathname === l.to;
          return (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-3 px-3 py-2.5 font-mono-ui text-xs uppercase tracking-wider transition-all ${
                active
                  ? 'bg-[#ff6b00]/10 text-[#ff6b00] border-l-2 border-[#ff6b00]'
                  : 'text-[#888] hover:text-white hover:bg-[#222]'
              }`}>
              <l.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{l.label}</span>
              {l.badge && (
                <span className="font-mono-ui text-xs px-1.5 py-0.5 bg-[#E87722] text-white rounded-none">
                  {l.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1a1a1a] space-y-1">
        <Link to={createPageUrl('Home')} target="_blank"
          className="flex items-center gap-3 px-3 py-2 font-mono-ui text-[10px] text-[#444] hover:text-white uppercase tracking-wider transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> View Store
        </Link>
        <button onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-3 py-2 font-mono-ui text-[10px] text-[#444] hover:text-[#ff0000] uppercase tracking-wider transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
        <div className="px-3 py-2">
          <p className="font-mono-ui text-xs text-[#333] truncate">{user?.email}</p>
          <p className="font-mono-ui text-xs text-[#ff6b00]">{user?.role?.toUpperCase()}</p>
        </div>
      </div>
    </aside>
  );
}