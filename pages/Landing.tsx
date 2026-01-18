
import React from 'react';
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Zap, 
  BarChart3, 
  Globe2, 
  ShieldCheck, 
  Box, 
  ChevronRight, 
  Wand2 
} from 'lucide-react';
import { HeroGeometric } from '../components/ui/shape-landing-hero';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section with Geometric Animation */}
      <HeroGeometric 
        badge="E-ticaret yönetiminde yeni standart!"
        title1="Tüm Pazaryerlerini"
        title2="Tek Panelden Yönet"
      >
        <button 
          onClick={onStart} 
          className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center group w-full sm:w-auto"
        >
          Ücretsiz Başla
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="bg-white/10 border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 backdrop-blur-sm w-full sm:w-auto">
          Demo İzle
        </button>
        
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[10px] sm:text-xs text-white/30 font-black uppercase tracking-[0.2em] w-full">
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-primary-500 mr-2" /> KART İSTEMEZ</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-primary-500 mr-2" /> 14 GÜN ÜCRETSİZ</div>
        </div>
      </HeroGeometric>

      {/* Integrations Bar */}
      <div className="bg-[#030303] py-16 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-white/20 font-black text-center mb-10 uppercase tracking-[0.2em] text-[10px] sm:text-xs">TÜRKİYE'NİN DEVLERİYLE TAM ENTEGRASYON</p>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
            <span className="text-2xl sm:text-3xl font-black text-orange-500 tracking-tighter">trendyol</span>
            <span className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tighter">hepsiburada</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tighter">n11</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-400 tracking-tighter">amazon</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tighter">ciceksepeti</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 sm:py-32 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">İşinizi Büyüten <br/> Akıllı Özellikler</h2>
            <p className="text-lg text-gray-500 font-medium">Operasyonel yükü sırtınızdan alıyoruz, siz sadece büyümeye odaklanın.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {[
              { title: 'Merkezi Yönetim', desc: 'Ürünü bir kere oluşturun, tüm platformlarda tek tıkla yayınlayın. Varyant ve stok eşitlemesi otomatik.', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { title: 'AI Yazma Asistanı', desc: 'Ürün açıklamalarınızı yapay zeka ile saniyeler içinde oluşturun, SEO uyumlu içeriklerle öne çıkın.', icon: Wand2, color: 'text-purple-500', bg: 'bg-purple-50' },
              { title: 'e-Fatura Modülü', desc: 'Siparişlerinizi tek tıkla faturalandırın ve müşterilerinize otomatik olarak ulaştırın.', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50' },
              { title: 'Gelişmiş Analiz', desc: 'Karlılık, iade oranları ve pazar yeri performansınızı tek ekranda, detaylı grafiklerle izleyin.', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
              { title: 'Kargo Otomasyonu', desc: 'Kargo fişlerinizi otomatik oluşturun, süreç takibini panel üzerinden kolayca yapın.', icon: Globe2, color: 'text-orange-500', bg: 'bg-orange-50' },
              { title: 'Anlık Stok Senkronu', desc: 'Bir pazaryerinde satış olduğunda diğer tüm platformlarda stoklar saniyesinde güncellenir.', icon: Box, color: 'text-red-500', bg: 'bg-red-50' },
            ].map((feature, idx) => (
              <div key={idx} className="p-10 rounded-[40px] border border-gray-100 hover:border-primary-100 hover:bg-gray-50/50 transition-all group relative overflow-hidden">
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
