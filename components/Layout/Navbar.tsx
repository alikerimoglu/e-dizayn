
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Layers, ShoppingBag, BarChart, Globe } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md py-2 shadow-sm border-b border-gray-100' : 'bg-white py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
             <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">E</div>
             <span className="font-black text-xl text-gray-900 tracking-tighter">elnoya</span>
          </div>

          <div className="hidden lg:flex items-center space-x-10">
            <div className="relative group py-2">
              <button className="text-gray-500 hover:text-gray-900 font-bold text-sm flex items-center transition-colors uppercase tracking-wider">
                Özellikler <ChevronDown className="w-4 h-4 ml-1.5 opacity-50" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white shadow-2xl rounded-3xl border border-gray-100 p-8 grid grid-cols-2 gap-8 opacity-0 translate-y-4 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Entegrasyonlar</h3>
                  <div className="space-y-4">
                    <a href="#" className="flex items-start group/item">
                        <Globe className="w-6 h-6 text-primary-500 mt-1 mr-4 shrink-0" />
                        <div>
                          <div className="font-bold text-gray-900 group-hover/item:text-primary-600 transition-colors">Pazaryeri Entegrasyonu</div>
                          <p className="text-xs text-gray-500 font-medium">Trendyol, HB, Amazon tek panelde.</p>
                        </div>
                    </a>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Yönetim</h3>
                   <a href="#" className="flex items-start group/item">
                    <ShoppingBag className="w-6 h-6 text-green-500 mt-1 mr-4 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900 group-hover/item:text-green-600 transition-colors">Ürün Yönetimi</div>
                      <p className="text-xs text-gray-500 font-medium">Toplu ürün yükleme ve senkronizasyon.</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }} className="text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors uppercase tracking-wider">Fiyatlandırma</a>
            <a href="#blog" className="text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors uppercase tracking-wider">Blog</a>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <button onClick={onLoginClick} className="text-gray-900 hover:text-primary-600 font-black text-sm transition-colors uppercase tracking-wider">Giriş</button>
            <button onClick={onRegisterClick} className="bg-gray-900 hover:bg-black text-white px-7 py-2.5 rounded-2xl font-black text-sm shadow-xl transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wider">Ücretsiz Dene</button>
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 p-2 hover:bg-gray-100 rounded-xl transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-x-0 bg-white border-t border-gray-100 shadow-2xl transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
          <div className="px-6 py-10 space-y-6">
            <a href="#" className="block text-xl font-black text-gray-900 border-b border-gray-50 pb-4">Özellikler</a>
            <button onClick={() => {onNavigate('pricing'); setIsMenuOpen(false)}} className="block w-full text-left text-xl font-black text-gray-900 border-b border-gray-50 pb-4">Fiyatlandırma</button>
            <a href="#" className="block text-xl font-black text-gray-900 border-b border-gray-50 pb-4">Blog</a>
            <div className="pt-6 flex flex-col gap-4">
               <button onClick={onLoginClick} className="w-full text-center py-4 text-lg font-black text-gray-900 border-2 border-gray-900 rounded-2xl">GİRİŞ YAP</button>
               <button onClick={() => { onRegisterClick(); setIsMenuOpen(false); }} className="w-full text-center py-4 text-lg font-black text-white bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/30">ÜCRETSİZ DENE</button>
            </div>
          </div>
      </div>
    </nav>
  );
};
