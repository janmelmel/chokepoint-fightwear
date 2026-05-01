import React from 'react';
import { Link } from 'react-router-dom';
import CPLogo from './CPLogo';

const FB_URL = 'https://www.facebook.com/profile.php?id=61571430141920';
const IG_URL = 'https://www.instagram.com/chokepoint_fightwear/';

export default function FooterLinks() {
  return (
    <footer className="border-t border-[#1a1a1a] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <CPLogo size={32} variant="white" />
            <p className="font-tactical text-sm text-[#6ea8ff] italic mt-2">"No Escape From Chokepoint"</p>
            <div className="flex gap-3 mt-4">
              <a href={FB_URL} target="_blank" rel="noreferrer" className="text-[#555] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href={IG_URL} target="_blank" rel="noreferrer" className="text-[#555] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-mono-ui text-xs text-[#555] uppercase tracking-widest mb-3">Shop</h4>
            <ul className="space-y-2">
              <li><a href="#gear" className="font-mono-ui text-xs text-[#888] hover:text-white transition-colors">All Products</a></li>
              <li><a href="#custom" className="font-mono-ui text-xs text-[#888] hover:text-white transition-colors">Custom Gear</a></li>
              <li><Link to="/TrackOrder" className="font-mono-ui text-xs text-[#888] hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-mono-ui text-xs text-[#555] uppercase tracking-widest mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/FAQ" className="font-mono-ui text-xs text-[#888] hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/About" className="font-mono-ui text-xs text-[#888] hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/Contact" className="font-mono-ui text-xs text-[#888] hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono-ui text-xs text-[#555] uppercase tracking-widest mb-3">Contact</h4>
            <p className="font-mono-ui text-xs text-[#888]">sales@chokepoint-fightwear.com</p>
            <p className="font-mono-ui text-xs text-[#555] mt-2">Lapu Lapu City, CEBU Philippines</p>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono-ui text-xs text-[#444] uppercase tracking-widest">
            © 2026 Chokepoint Fightwear. All Rights Reserved.
          </p>
          <Link to="/Staff" className="font-mono-ui text-xs text-[#333] hover:text-[#555] uppercase tracking-widest transition-colors">
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>);

}