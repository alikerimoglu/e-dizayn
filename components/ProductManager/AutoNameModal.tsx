import React from 'react';
import { X, Wand2, Zap } from 'lucide-react';
import { Product } from '../../types';

interface AutoNameModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  products: Product[]; 
  onStartBulk?: () => void; 
}

export const AutoNameModal: React.FC<AutoNameModalProps> = ({ isOpen, onClose, products, onStartBulk }) => {
    if (!isOpen) return null;
    const productsToName = products.filter(p => p.image).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm overflow-hidden">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-md text-center shadow-2xl animate-scaleIn border border-gray-100 relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
                
                <div className="w-20 h-20 bg-purple-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Wand2 className="w-10 h-10 text-purple-600" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">AI İsim Sihirbazı</h3>
                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                  Envanterinizdeki <span className="text-purple-600 font-black">{productsToName} adet</span> görsele sahip ürün analiz edilerek SEO uyumlu ve dikkat çekici isimler sırayla atanacaktır.
                </p>

                <div className="bg-blue-50 rounded-2xl p-4 mb-8 text-left border border-blue-100">
                    <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                           İşlem sırasında ürünlerin teker teker işlendiğini listedeki göstergelerden takip edebilirsiniz.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                      onClick={onStartBulk} 
                      disabled={productsToName === 0}
                      className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 uppercase text-xs tracking-widest hover:bg-purple-700 active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                    >
                      TÜM ÜRÜNLERİ ANALİZ ET VE OLUŞTUR
                    </button>
                    <button onClick={onClose} className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">ŞİMDİ DEĞİL</button>
                </div>
            </div>
        </div>
    );
};