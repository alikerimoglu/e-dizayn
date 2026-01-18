
import React, { useState } from 'react';
import { Check, Sparkles, Shield, Rocket, CreditCard, ChevronRight } from 'lucide-react';

export const Subscription = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'basic',
      name: "Başlangıç",
      badge: "Verdant",
      title: "Emerald Surge",
      price: billingPeriod === 'yearly' ? 149 : 199,
      icon: Shield,
      wrapperClass: "card-wrapper-1",
      innerClass: "inner-wrapper-1",
      borderClass: "border-layer-1",
      mainClass: "card-main-1",
      glow1: "glow-1-layer-1",
      glow2: "glow-1-layer-2",
      overlay: "overlay-1-1",
      bgGlow: "background-glow-1",
      features: [
        "2 Pazaryeri Entegrasyonu",
        "500 Ürün Limiti",
        "Günlük Stok Güncelleme",
        "E-posta Desteği"
      ]
    },
    {
      id: 'professional',
      name: "Profesyonel",
      badge: "Aquatic",
      title: "Ocean Pulse",
      price: billingPeriod === 'yearly' ? 299 : 399,
      icon: Sparkles,
      isPopular: true,
      wrapperClass: "card-wrapper-2",
      innerClass: "inner-wrapper-2",
      borderClass: "border-layer-2",
      mainClass: "card-main-2",
      glow1: "glow-2-layer-1",
      glow2: "glow-2-layer-2",
      overlay: "overlay-2-1",
      bgGlow: "background-glow-2",
      features: [
        "5 Pazaryeri Entegrasyonu",
        "5000 Ürün Limiti",
        "Anlık Stok Güncelleme",
        "E-fatura Entegrasyonu",
        "Elnoya AI (100 Kredi)"
      ]
    },
    {
      id: 'expert',
      name: "Expert",
      badge: "Mystical",
      title: "Neon Dream",
      price: billingPeriod === 'yearly' ? 599 : 799,
      icon: Rocket,
      wrapperClass: "card-wrapper-3",
      innerClass: "inner-wrapper-3",
      borderClass: "border-layer-3",
      mainClass: "card-main-3",
      glow1: "glow-3-layer-1",
      glow2: "glow-3-layer-2",
      overlay: "overlay-3-1",
      bgGlow: "background-glow-3",
      features: [
        "Sınırsız Pazaryeri",
        "Sınırsız Ürün",
        "Anlık Stok & Fiyat",
        "Özel Müşteri Temsilcisi",
        "Elnoya AI (Sınırsız)"
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fadeIn min-h-screen relative overflow-hidden">
      <style>{`
        :root {
          --electric-1-border: #48dd84;
          --electric-1-light: oklch(from var(--electric-1-border) l c h);
          --gradient-1: oklch(from var(--electric-1-border) 0.3 calc(c / 2) h / 0.4);
          
          --electric-2-border: #48c4dd;
          --electric-2-light: oklch(from var(--electric-2-border) l c h);
          --gradient-2: oklch(from var(--electric-2-border) 0.3 calc(c / 2) h / 0.4);
          
          --electric-3-border: #dd48c4;
          --electric-3-light: oklch(from var(--electric-3-border) l c h);
          --gradient-3: oklch(from var(--electric-3-border) 0.3 calc(c / 2) h / 0.4);
          
          --color-neutral-900: oklch(0.185 0 0);
        }

        .gallery-container {
          display: flex;
          gap: 30px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          perspective: 1200px;
          padding: 20px 0;
        }

        .svg-container {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        /* Base Card Structure */
        [class^="card-wrapper-"] {
          padding: 2px;
          border-radius: 24px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
        }

        .card-wrapper-1 { background: linear-gradient(-30deg, var(--gradient-1), transparent, var(--gradient-1)), linear-gradient(to bottom, var(--color-neutral-900), var(--color-neutral-900)); }
        .card-wrapper-2 { background: linear-gradient(-30deg, var(--gradient-2), transparent, var(--gradient-2)), linear-gradient(to bottom, var(--color-neutral-900), var(--color-neutral-900)); }
        .card-wrapper-3 { background: linear-gradient(-30deg, var(--gradient-3), transparent, var(--gradient-3)), linear-gradient(to bottom, var(--color-neutral-900), var(--color-neutral-900)); }

        .card-wrapper-1:hover { transform: rotateY(-12deg) rotateX(8deg) scale(1.02); }
        .card-wrapper-2:hover { transform: translateY(-10px) rotateX(10deg) scale(1.05); }
        .card-wrapper-3:hover { transform: rotateY(12deg) rotateX(8deg) scale(1.02); }

        [class^="inner-wrapper-"] { position: relative; }

        [class^="border-layer-"] { border-radius: 24px; padding-right: 4px; padding-bottom: 4px; }
        .border-layer-1 { border: 2px solid rgba(72, 221, 132, 0.3); }
        .border-layer-2 { border: 2px solid rgba(72, 196, 221, 0.3); }
        .border-layer-3 { border: 2px solid rgba(221, 72, 196, 0.3); }

        [class^="card-main-"] {
          width: 320px;
          height: 520px;
          border-radius: 24px;
          margin-top: -4px;
          margin-left: -4px;
          background: #0a0a0a;
        }

        .card-main-1 { border: 2px solid var(--electric-1-border); filter: url(#turbulent-1); }
        .card-main-2 { border: 2px solid var(--electric-2-border); filter: url(#turbulent-2); }
        .card-main-3 { border: 2px solid var(--electric-3-border); filter: url(#turbulent-3); }

        [class*="glow-"][class*="-layer-1"] { border-radius: 24px; width: 100%; height: 100%; position: absolute; top: 0; left: 0; filter: blur(1px); }
        [class*="glow-"][class*="-layer-2"] { border-radius: 24px; width: 100%; height: 100%; position: absolute; top: 0; left: 0; filter: blur(4px); }

        .glow-1-layer-1 { border: 2px solid rgba(72, 221, 132, 0.5); }
        .glow-1-layer-2 { border: 2px solid var(--electric-1-light); }
        .glow-2-layer-1 { border: 2px solid rgba(72, 196, 221, 0.5); }
        .glow-2-layer-2 { border: 2px solid var(--electric-2-light); }
        .glow-3-layer-1 { border: 2px solid rgba(221, 72, 196, 0.5); }
        .glow-3-layer-2 { border: 2px solid var(--electric-3-light); }

        [class^="overlay-"] { position: absolute; width: 100%; height: 100%; top: 0; left: 0; border-radius: 24px; opacity: 0.8; mix-blend-mode: overlay; transform: scale(1.05); filter: blur(12px); pointer-events: none; }
        .overlay-1-1 { background: radial-gradient(circle at 50% 50%, var(--electric-1-border), transparent); }
        .overlay-2-1 { background: radial-gradient(circle at 50% 50%, var(--electric-2-border), transparent); }
        .overlay-3-1 { background: radial-gradient(circle at 50% 50%, var(--electric-3-border), transparent); }

        [class^="background-glow-"] { position: absolute; width: 100%; height: 100%; top: 0; left: 0; border-radius: 24px; filter: blur(32px); transform: scale(1.1); opacity: 0.15; z-index: -1; }
        .background-glow-1 { background: linear-gradient(-30deg, var(--electric-1-light), transparent, var(--electric-1-border)); }
        .background-glow-2 { background: linear-gradient(-30deg, var(--electric-2-light), transparent, var(--electric-2-border)); }
        .background-glow-3 { background: linear-gradient(-30deg, var(--electric-3-light), transparent, var(--electric-3-border)); }

        .card-content { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; display: flex; flex-direction: column; z-index: 10; pointer-events: none; }
        .content-header { display: flex; flex-direction: column; padding: 40px; padding-bottom: 12px; height: 100%; }
        .content-footer { display: flex; flex-direction: column; padding: 40px; padding-top: 12px; }

        .glass-badge {
          background: rgba(255, 255, 255, 0.05);
          backdrop-blur: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 6px 14px;
          text-transform: uppercase;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: white;
          width: fit-content;
        }

        .card-title { font-size: 32px; font-weight: 900; margin-top: 20px; color: white; tracking-tighter; text-transform: uppercase; }
        .card-price { font-size: 48px; font-weight: 900; color: white; display: flex; align-items: baseline; gap: 4px; margin-top: 5px; }
        .card-price span { font-size: 14px; opacity: 0.5; font-weight: 600; text-transform: uppercase; }
        
        .card-divider { margin-top: auto; border: none; height: 1px; background: white; opacity: 0.1; }
        
        .feature-list { list-style: none; margin-top: 15px; }
        .feature-item { font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.6); display: flex; items-center; gap: 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .feature-icon { width: 14px; height: 14px; color: rgba(255, 255, 255, 0.8); }

        .card-button {
          margin-top: 25px;
          padding: 16px;
          border-radius: 16px;
          font-weight: 900;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border: none;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-blur: 10px;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.3s ease;
        }
        .card-button:hover { background: white; color: black; transform: translateY(-2px); }

        .popular-tag {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          color: black;
          padding: 4px 16px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.2em;
          z-index: 20;
          box-shadow: 0 10px 20px rgba(255,255,255,0.2);
        }
      `}</style>

      {/* SVG Filters definitions */}
      <svg className="svg-container">
        <defs>
          <filter id="turbulent-1" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feBlend in="part1" in2="SourceGraphic" mode="color-dodge" result="combined" />
            <feDisplacementMap in="SourceGraphic" in2="combined" scale="25" xChannelSelector="R" yChannelSelector="B" />
          </filter>
          <filter id="turbulent-2" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="10" result="noise1" seed="3" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dy" values="500; 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feComposite in="offsetNoise1" in2="SourceGraphic" result="part1" />
            <feDisplacementMap in="SourceGraphic" in2="part1" scale="35" xChannelSelector="G" yChannelSelector="R" />
          </filter>
          <filter id="turbulent-3" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.025" numOctaves="10" result="noise1" seed="5" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dx" values="600; 0" dur="7s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feComposite in="offsetNoise1" in2="SourceGraphic" result="part1" />
            <feDisplacementMap in="SourceGraphic" in2="part1" scale="30" xChannelSelector="B" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">Geleceğin Entegrasyonu</h1>
        <p className="text-gray-500 font-bold max-w-2xl mx-auto uppercase tracking-wider text-xs">
          Hızınızı ikiye katlayın. Elnoya'nın elektrikli altyapısı ile sınırları kaldırın.
        </p>

        <div className="mt-10 flex justify-center items-center space-x-6">
          <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-300'}`}>Aylık</span>
          <button 
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-gray-100 transition-colors duration-300 ease-in-out focus:outline-none ${billingPeriod === 'yearly' ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out mt-0.5 ml-0.5 ${billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-300'}`}>
            Yıllık <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-md text-[8px]">%25 TASARRUF</span>
          </span>
        </div>
      </div>

      <div className="gallery-container relative z-10">
        {plans.map((plan) => (
          <div key={plan.id} className={plan.wrapperClass}>
            {plan.isPopular && <div className="popular-tag uppercase">Popüler Seçim</div>}
            <div className={plan.innerClass}>
              <div className={plan.borderClass}>
                <div className={plan.mainClass}></div>
              </div>
              <div className={plan.glow1}></div>
              <div className={plan.glow2}></div>
            </div>
            <div className={plan.overlay}></div>
            <div className={plan.bgGlow}></div>
            
            <div className="card-content">
              <div className="content-header">
                <div className="glass-badge">{plan.badge}</div>
                <h2 className="card-title leading-none">{plan.name}</h2>
                <div className="card-price">₺{plan.price} <span>/ AY</span></div>
                
                <hr className="card-divider" />
                
                <ul className="feature-list">
                  {plan.features.map((f, i) => (
                    <li key={i} className="feature-item">
                      <Check className="feature-icon" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button className="card-button">HEMEN BAŞLA</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 py-12 border-t border-gray-100 relative z-10">
        <div className="bg-gray-900 rounded-[40px] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-xl">
             <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 text-primary-400 text-[10px] font-black uppercase tracking-widest mb-6">
                Aktif Deneme Süresi
             </div>
             <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tighter uppercase leading-none">Ücretsiz Başlatın</h2>
             <p className="text-gray-400 font-bold text-sm uppercase tracking-wider leading-relaxed">
               14 gün boyunca tüm expert özelliklerini test edin. Kart bilgisi gerekmez.
             </p>
          </div>
          <button className="relative z-10 bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group">
             DENEMEYİ BAŞLAT <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
