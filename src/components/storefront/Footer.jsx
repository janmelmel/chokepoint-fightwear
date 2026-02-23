import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="text-center md:text-left">
            <h3 className="font-blackletter text-2xl text-white">Chokepoint</h3>
            <p className="font-body text-xs text-white/40 mt-1 tracking-wider">
              ELITE FIGHTWEAR
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com/chokepoint" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#FF0A0A] hover:border-[#FF0A0A]/50 transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://facebook.com/chokepoint" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#FF0A0A] hover:border-[#FF0A0A]/50 transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="mailto:contact@chokepoint.com"
              className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#FF0A0A] hover:border-[#FF0A0A]/50 transition-all"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-body text-xs text-white/30">
            © 2026 Chokepoint Fightwear. All rights reserved.
          </p>
          
          {/* Hidden Staff Link */}
          <Link 
            to={createPageUrl('Staff')}
            className="font-body text-xs text-white/10 hover:text-white/30 transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}