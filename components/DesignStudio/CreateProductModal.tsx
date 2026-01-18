
import React from 'react';
/* Added missing Plus icon import */
import { X, PackagePlus, Check, Grid, ImageIcon, ChevronLeft, ChevronRight, TurkishLira, Package, Plus } from 'lucide-react';
import { GeneratedVariation } from '../../types';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  creationStep: 'type' | 'subtype' | 'select' | 'details';
  setCreationStep: (step: any) => void;
  creationMode: 'single' | 'multi-individual' | 'multi-batch';
  setCreationMode: (mode: any) => void;
  selectedVariationIds: string[];
  toggleVariationSelection: (id: string) => void;
  generatedVariations: GeneratedVariation[];
  creationPrice: number;
  setCreationPrice: (val: number) => void;
  creationStock: number;
  setCreationStock: (val: number) => void;
  handleFinalizeCreation: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen, onClose, creationStep, setCreationStep, creationMode, setCreationMode,
  selectedVariationIds, toggleVariationSelection, generatedVariations,
  creationPrice, setCreationPrice, creationStock, setCreationStock, handleFinalizeCreation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[48px] p-8 sm:p-12 w-full max-w-4xl shadow-2xl relative border border-white/20 animate-scaleIn flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6"/></button>
        
        <div className="flex flex-col items-center text-center mb-8 shrink-0">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6 border border-orange-200">
            <PackagePlus className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Ürün Olarak Aktar</h3>
          
          <div className="flex items-center gap-4 mt-6">
            {['type', 'select', 'details'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                  (creationStep === 'type' || creationStep === 'subtype') && s === 'type' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                  creationStep === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' :
                  (['type', 'subtype', 'select', 'details'].indexOf(creationStep) > ['type', 'subtype', 'select', 'details'].indexOf(s) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')
                }`}>
                  {(['type', 'subtype', 'select', 'details'].indexOf(creationStep) > ['type', 'subtype', 'select', 'details'].indexOf(s)) ? <Check className="w-4 h-4"/> : i + 1}
                </div>
                {i < 2 && <div className="w-8 h-0.5 bg-gray-100"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4">
          {creationStep === 'type' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
              <button 
                onClick={() => { setCreationMode('single'); setCreationStep('select'); }}
                className="p-8 border-2 border-gray-100 rounded-[40px] hover:border-blue-500 hover:bg-blue-50/50 transition-all group text-left flex flex-col items-center text-center"
              >
                  <div className="w-16 h-16 bg-blue-100 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Plus className="w-8 h-8 text-blue-600" /></div>
                  <span className="block font-black text-gray-900 text-xl uppercase tracking-tight">Tekli Ürün Oluştur</span>
                  <span className="text-xs text-gray-500 font-bold uppercase mt-2 opacity-60">Havuzdan seçilen görsellerle (max 8) tek bir ürün oluşturun.</span>
              </button>
              <button 
                onClick={() => { setCreationStep('subtype'); }}
                className="p-8 border-2 border-gray-100 rounded-[40px] hover:border-orange-500 hover:bg-orange-50/50 transition-all group text-left flex flex-col items-center text-center"
              >
                  <div className="w-16 h-16 bg-orange-100 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Grid className="w-8 h-8 text-orange-600" /></div>
                  <span className="block font-black text-gray-900 text-xl uppercase tracking-tight">Çoklu Ürün Oluştur</span>
                  <span className="text-xs text-gray-500 font-bold uppercase mt-2 opacity-60">Birden fazla ürünü aynı anda oluşturun.</span>
              </button>
            </div>
          )}

          {creationStep === 'subtype' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
              <button 
                onClick={() => { setCreationMode('multi-individual'); setCreationStep('select'); }}
                className="p-8 border-2 border-gray-100 rounded-[40px] hover:border-blue-500 hover:bg-blue-50/50 transition-all group text-left flex flex-col items-center text-center"
              >
                  <div className="w-16 h-16 bg-blue-100 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><ImageIcon className="w-8 h-8 text-blue-600" /></div>
                  <span className="block font-black text-gray-900 text-lg uppercase tracking-tight">Her Resim Başı 1 Ürün</span>
                  <span className="text-xs text-gray-500 font-bold uppercase mt-2 opacity-60">Seçilen her bir tasarım ayrı birer ürün olarak sisteme eklenir.</span>
              </button>
              <button 
                onClick={() => { setCreationMode('multi-batch'); setCreationStep('select'); }}
                className="p-8 border-2 border-gray-100 rounded-[40px] hover:border-orange-500 hover:bg-orange-50/50 transition-all group text-left flex flex-col items-center text-center"
              >
                  <div className="w-16 h-16 bg-orange-100 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Grid className="w-8 h-8 text-orange-600" /></div>
                  <span className="block font-black text-gray-900 text-lg uppercase tracking-tight">Ürün Başı 8 Görsel (Batch)</span>
                  <span className="text-xs text-gray-500 font-bold uppercase mt-2 opacity-60">Seçilen görseller 8'erli gruplanarak birden fazla ürün oluşturulur.</span>
              </button>
            </div>
          )}

          {creationStep === 'select' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                  Tasarımları Seç {creationMode === 'single' ? '(Max 8)' : `(${selectedVariationIds.length} seçildi)`}
                </h4>
                {creationMode === 'single' && (
                  <span className={`text-xs font-black ${selectedVariationIds.length === 8 ? 'text-red-500' : 'text-blue-600'}`}>
                    {selectedVariationIds.length} / 8 Seçildi
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {generatedVariations.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => toggleVariationSelection(v.id)}
                    className={`relative aspect-square rounded-[32px] border-4 cursor-pointer transition-all overflow-hidden ${
                      selectedVariationIds.includes(v.id) ? 'border-blue-600 scale-95 shadow-xl' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <img src={v.blob} className="w-full h-full object-contain p-2" />
                    {selectedVariationIds.includes(v.id) && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {creationStep === 'details' && (
            <div className="max-w-md mx-auto space-y-8 animate-fadeIn">
               <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SATIŞ FİYATI (TL)</label>
                  <div className="relative">
                      <TurkishLira className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
                      <input 
                        type="number" 
                        value={creationPrice}
                        onChange={(e) => setCreationPrice(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-[28px] p-6 pl-14 text-xl font-black text-gray-900 focus:bg-white outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">STOK ADEDİ</label>
                  <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
                      <input 
                        type="number" 
                        value={creationStock}
                        onChange={(e) => setCreationStock(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-[28px] p-6 pl-14 text-xl font-black text-gray-900 focus:bg-white outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 shrink-0">
          {creationStep !== 'type' && (
            <button 
              onClick={() => {
                  if (creationStep === 'subtype') setCreationStep('type');
                  else if (creationStep === 'select') {
                      if (creationMode === 'single') setCreationStep('type');
                      else setCreationStep('subtype');
                  } else if (creationStep === 'details') setCreationStep('select');
              }}
              className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Geri
            </button>
          )}
          
          {(creationStep === 'select' || creationStep === 'details') && (
            <button 
              onClick={() => {
                  if (creationStep === 'select') {
                      if (selectedVariationIds.length === 0) { alert("Lütfen en az 1 tasarım seçin."); return; }
                      setCreationStep('details');
                  } else {
                      handleFinalizeCreation();
                  }
              }}
              className={`flex-[2] py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  creationStep === 'details' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-blue-600'
              }`}
            >
              {creationStep === 'details' ? 'Tamamla ve Ürünlere Aktar' : 'Devam Et'} <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
