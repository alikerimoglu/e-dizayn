
import React, { useState, useRef, useEffect } from 'react';
import { X, Edit3, Save, Loader2, TurkishLira, Package, Plus, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { uploadImageToServer } from '../../services/uploadService';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
  isProcessing?: boolean;
  onRegenerate?: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, product, onClose, onSave, isProcessing, onRegenerate }) => {
  const [formData, setFormData] = useState<Product>({ ...product });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageDelete = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ 
      ...prev, 
      images: newImages, 
      image: newImages.length > 0 ? newImages[0] : prev.image 
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files) as File[];
      const newUrls: string[] = [];

      for (const file of files) {
        const serverUrl = await uploadImageToServer(file);
        if (serverUrl) {
          newUrls.push(serverUrl);
        } else {
          alert(`${file.name} yüklenemedi!`);
        }
      }

      const currentImages = formData.images || (formData.image ? [formData.image] : []);
      const combined = [...currentImages, ...newUrls].slice(0, 8);
      setFormData(prev => ({
        ...prev,
        images: combined,
        image: combined[0]
      }));
      setIsUploading(false);
    }
  };

  const images = formData.images && formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-scaleIn">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <Edit3 className="text-blue-600" /> ÜRÜNÜ DÜZENLE
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 custom-scrollbar">
          <div className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ÜRÜN GÖRSELLERİ ({images.length}/8)</label>
               <div className="grid grid-cols-4 gap-3">
                  {images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleImageDelete(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 8 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition-all"
                    >
                      {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                      <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleFileUpload} />
                    </button>
                  )}
               </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
               <p className="text-[10px] font-bold text-blue-600 leading-relaxed uppercase tracking-wide">İpucu: İlk sıradaki görsel "Ana Görsel" olarak atanır. Pazaryerlerinde listelenirken bu görsel kullanılır.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Ürün Adı</label>
                <button 
                  onClick={onRegenerate}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 hover:text-purple-800 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI YENİLE
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:bg-white outline-none transition-all ${isProcessing ? 'pr-10 text-gray-400' : ''}`} 
                  disabled={isProcessing}
                />
                {isProcessing && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 animate-spin" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">SKU (Stok Kodu)</label>
                 <input 
                   type="text" 
                   value={formData.sku} 
                   onChange={e => handleFieldChange('sku', e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:bg-white outline-none transition-all" 
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Model Kodu</label>
                 <input 
                   type="text" 
                   value={formData.modelCode} 
                   onChange={e => handleFieldChange('modelCode', e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:bg-white outline-none transition-all" 
                 />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Satış Fiyatı (TL)</label>
                 <div className="relative">
                    <TurkishLira className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => handleFieldChange('price', parseFloat(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-9 text-sm font-bold focus:bg-white outline-none transition-all" 
                    />
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stok Adedi</label>
                 <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="number" 
                      value={formData.stock} 
                      onChange={e => handleFieldChange('stock', parseInt(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-9 text-sm font-bold focus:bg-white outline-none transition-all" 
                    />
                 </div>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pazaryeri Durumu</label>
               <div className="flex gap-3">
                  {['trendyol', 'hepsiburada', 'n11'].map(p => (
                    <button 
                      key={p}
                      onClick={() => handleFieldChange('marketplaceStatus', { ...formData.marketplaceStatus, [p]: !formData.marketplaceStatus[p as keyof Product['marketplaceStatus']] })}
                      className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black border-2 transition-all uppercase ${formData.marketplaceStatus[p as keyof Product['marketplaceStatus']] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                      {p}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all">İPTAL</button>
          <button 
            onClick={() => onSave(formData)} 
            disabled={isProcessing || isUploading}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} DEĞİŞİKLİKLERİ KAYDET
          </button>
        </div>
      </div>
    </div>
  );
};
