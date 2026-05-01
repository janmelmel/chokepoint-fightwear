import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CPLogo from '@/components/cp/CPLogo';
import FooterLinks from '@/components/cp/FooterLinks';

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      {
        q: 'How long does shipping take?',
        a: 'For Metro Manila, orders typically arrive within 3-5 business days. Provincial deliveries may take 5-10 business days depending on location. Pre-orders will be shipped once production is complete.'
      },
      {
        q: 'How do I track my order?',
        a: 'You can track your order using your order number or email on our Track Order page. You\'ll also receive updates via the contact method you used to place your order.'
      },
      {
        q: 'Do you ship internationally?',
        a: 'Currently, we only ship within the Philippines. International shipping will be available soon. Follow our social media for updates!'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept GCash and direct payments via Facebook Messenger or Instagram DM. Payment instructions will be provided when you proceed to checkout.'
      }
    ]
  },
  {
    category: 'Products & Sizing',
    items: [
      {
        q: 'How do I find the right size?',
        a: 'Each product page has a size chart with detailed measurements. If you\'re between sizes, we recommend sizing up for a more comfortable fit. For compression wear like rashguards, true to size provides a snug fit.'
      },
      {
        q: 'What materials are your products made from?',
        a: 'Our rashguards use premium 4-way stretch polyester/spandex blend with sublimation printing. Gis are made from pearl weave cotton. Each product page lists specific material details.'
      },
      {
        q: 'Are your designs fade-resistant?',
        a: 'Yes! We use high-quality sublimation printing that embeds the ink into the fabric fibers, ensuring colors stay vibrant even after many washes.'
      },
      {
        q: 'Can I request custom designs?',
        a: 'Absolutely! We offer custom gear for teams, gyms, and individuals. Use our Custom Gear form on the homepage or contact us directly for bulk orders and team kits.'
      }
    ]
  },
  {
    category: 'Pre-Orders',
    items: [
      {
        q: 'What is a pre-order?',
        a: 'Pre-orders allow you to reserve items before they\'re produced. This helps us manage inventory and offer limited edition designs. Pre-order items are clearly marked on the product page.'
      },
      {
        q: 'When will my pre-order ship?',
        a: 'Pre-order production typically takes 2-4 weeks. You\'ll receive updates on your order status, and we\'ll notify you when your item ships.'
      },
      {
        q: 'Can I cancel a pre-order?',
        a: 'Pre-orders can be cancelled within 24 hours of placing the order. After that, orders are locked in for production. Contact us immediately if you need to make changes.'
      }
    ]
  },
  {
    category: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for unworn, unwashed items with original tags. Custom orders and pre-orders are non-refundable.'
      },
      {
        q: 'How do I exchange for a different size?',
        a: 'Contact us via Facebook Messenger or Instagram with your order number and the size you need. We\'ll arrange the exchange process and provide return shipping instructions.'
      },
      {
        q: 'What if I receive a defective item?',
        a: 'Quality is our priority. If you receive a defective item, contact us immediately with photos. We\'ll send a replacement at no extra cost.'
      }
    ]
  }
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#222]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-mono-ui text-sm text-white pr-4">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-[#555] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-inter text-sm text-[#888] pb-4 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-4 sm:px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/Home">
          <CPLogo size={32} variant="white" />
        </Link>
        <Link to="/Home" className="flex items-center gap-1 font-mono-ui text-xs text-[#555] hover:text-white uppercase tracking-widest transition-colors">
          <ChevronLeft className="w-3 h-3" /> Back to Shop
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <p className="font-mono-ui text-xs text-[#ff8c00] uppercase tracking-widest mb-2">Support</p>
          <h1 className="font-tactical text-4xl sm:text-5xl text-white">FAQs</h1>
          <p className="font-inter text-sm text-[#666] mt-3">Common questions about orders, products, and more.</p>
        </div>

        <div className="space-y-10">
          {FAQS.map(section => (
            <div key={section.category}>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="font-tactical text-xl text-white">{section.category}</h2>
                <div className="flex-1 h-px bg-[#222]" />
              </div>
              <div className="card-tactical">
                {section.items.map((item, i) => (
                  <FAQItem key={i} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 card-tactical p-8 text-center">
          <p className="font-tactical text-2xl text-white mb-2">Still have questions?</p>
          <p className="font-inter text-sm text-[#666] mb-4">Reach out to us on social media or email.</p>
          <div className="flex items-center justify-center gap-3">
            <a href="https://www.facebook.com/profile.php?id=61571430141920" target="_blank" rel="noreferrer"
              style={{ background: '#ff6b00', border: '1px solid #ff6b00', color: '#fff', fontWeight: 700 }}
              className="px-5 py-2.5 font-mono-ui text-xs uppercase tracking-widest">
              Facebook
            </a>
            <a href="https://www.instagram.com/chokepoint_fightwear/" target="_blank" rel="noreferrer"
              style={{ background: '#1c1c1c', border: '1px solid #444', color: '#d0d0d0' }}
              className="px-5 py-2.5 font-mono-ui text-xs uppercase tracking-widest">
              Instagram
            </a>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}