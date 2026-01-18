
import React, { useState } from 'react';
import { Sparkles, Bot, Copy, RefreshCw, Wand2, ChevronRight, TurkishLira } from 'lucide-react';
import { generateProductDescription, analyzeCompetitorPrice } from '../services/geminiService';

export const AIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'description' | 'price'>('description');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [keywords, setKeywords] = useState('');
  const [price, setPrice] = useState<number>(0);

  const handleGenerate = async () => {
    if (!productName) return;
    setLoading(true);
    setResult('');
    try {
      if (activeTab === 'description') {
        const desc = await generateProductDescription(productName, features, keywords);
        setResult(desc);
      } else {
        const analysis = await analyzeCompetitorPrice(productName, price);
        setResult(analysis);
      }
    } catch (e) {
      setResult("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 h-full max-w-[1920px] mx-auto overflow-hidden">
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col h-fit lg:h-full overflow-hidden">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
               <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Elnoya AI Hub</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Yapay Zeka İçerik Asistanı</p>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setActiveTab('description'); setResult(''); }}
              className={`flex-1 text-xs font-black py-2.5 rounded-lg transition-all uppercase ${activeTab === 'description' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Açıklama
            </button>
             <button 
              onClick={() => { setActiveTab('price'); setResult(''); }}
              className={`flex-1 text-xs font-black py-2.5 rounded-lg transition-all uppercase ${activeTab === 'price' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Fiyat
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ürün Adı</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="Örn: Erkek Deri Cüzdan" />
            </div>

            {activeTab === 'description' ? (
              <>
                 <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Özellikler</label>
                  <textarea value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all h-24 sm:h-32 resize-none" placeholder="Hakiki deri, 8 kart bölmesi..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Anahtar Kelimeler</label>
                  <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="hediyelik, kaliteli" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Mevcut Fiyat (TL)</label>
                <div className="relative">
                  <TurkishLira className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 pl-9 text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all" placeholder="250" />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !productName}
            className={`w-full py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all mt-6 shadow-xl active:scale-95 ${loading || !productName ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/40'}`}
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {loading ? 'DÜŞÜNÜLÜYOR...' : (activeTab === 'description' ? 'İÇERİK OLUŞTUR' : 'ANALİZ ET')}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 relative flex flex-col min-h-[400px] lg:h-full overflow-hidden shadow-inner">
         {!result && !loading && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 opacity-40">
              <Bot className="w-16 h-16 sm:w-24 sm:h-24 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Süreci başlatmak için bilgileri doldurun</p>
           </div>
         )}
         
         {loading && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-5 h-5 text-purple-600 animate-pulse"/></div>
             </div>
             <p className="text-purple-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] animate-pulse">Elnoya AI hazırlıyor...</p>
           </div>
         )}

         {result && !loading && (
           <div className="bg-white m-4 sm:m-6 rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex-1 overflow-y-auto relative animate-fadeIn custom-scrollbar">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b border-gray-50">
                <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest flex items-center">
                  <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                  Yapay Zeka Çıktısı
                </h3>
                <button onClick={() => navigator.clipboard.writeText(result)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100" title="Kopyala">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                {result}
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
