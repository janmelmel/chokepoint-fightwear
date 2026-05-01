import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap } from 'lucide-react';

export default function AboutSection() {
  const values = [
    {
      icon: Target,
      title: 'Performance First',
      desc: 'Every piece is engineered for the demands of martial arts training and competition.'
    },
    {
      icon: Zap,
      title: 'Bold Design',
      desc: 'Stand out on the mats with our unique, limited-edition designs that represent your warrior spirit.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      desc: "Built by grapplers, for grapplers. We're part of the community we serve."
    }
  ];

  return (
    <section id="about" className="py-20 px-4 border-t border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Story */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono-ui text-xs text-[#4f8ef7] uppercase tracking-widest mb-2">Our Story</p>
            <h2 className="font-tactical text-4xl sm:text-5xl text-white mb-6">About Chokepoint</h2>
            <div className="space-y-4 text-[#888] font-inter text-sm leading-relaxed">
              <p>
                <span className="text-white font-semibold">Chokepoint Fightwear</span> was born from a passion for 
                Brazilian Jiu-Jitsu and a desire to bring bold, high-quality gear to the Filipino martial arts community.
              </p>
              <p>
                We believe your gear should be as fierce as your game. Every rashguard, gi, and piece of training 
                equipment we create is designed with performance in mind — breathable fabrics, durable construction, 
                and graphics that make a statement.
              </p>
              <p>
                Based in the Philippines, we're proud to support local athletes and gyms. Whether you're drilling 
                techniques or competing at the highest level, Chokepoint has you covered.
              </p>
            </div>
            <div className="mt-6">
              <p className="font-tactical text-xl text-[#6ea8ff] italic">"No Escape From Chokepoint"</p>
            </div>
          </motion.div>

          {/* Right - Values */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-tactical p-5 flex gap-4"
              >
                <div className="w-10 h-10 flex-shrink-0 border border-[#4f8ef7]/30 flex items-center justify-center bg-[#4f8ef7]/5">
                  <v.icon className="w-5 h-5 text-[#4f8ef7]" />
                </div>
                <div>
                  <h3 className="font-tactical text-lg text-white">{v.title}</h3>
                  <p className="font-inter text-sm text-[#666] mt-1">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}