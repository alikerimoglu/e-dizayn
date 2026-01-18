
import React, { useState, useRef } from 'react';
import { X, ImageIcon, UploadCloud, Plus, ChevronLeft, TurkishLira, Package, ArrowRight, AlertTriangle, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { uploadImageToServer } from '../../services/imageService';

interface AddProductModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (product: Product) => void; 
  onUpdate?: (product: Product) => void;
  products: Product[]; 
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, onUpdate, products }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePool, setImagePool] = useState<string[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    const [step, setStep] = useState<'select' | 'details'>('select');
    const [defaultPrice, setDefaultPrice] = useState<number>(599.90);
    const [defaultStock, setDefaultStock] = useState<number>(100);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            try {
                const files = Array.from(e.target.files) as File[];
                const uploadPromises = files.map(file => uploadImageToServer(file));
                const uploadedUrls = await Promise.all(uploadPromises);
                setImagePool(prev => [...prev, ...uploadedUrls]);
            } catch (err) {
                alert("Bazı resimler yüklenemedi.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const toggleImageSelection = (index: number) => {
        if (selectedIndices.includes(index)) {
            setSelectedIndices(prev => prev.filter(i => i !== index));
        } else {
            if (selectedIndices.length < 8) {
                setSelectedIndices(prev => [...prev, index]);
            } else {
                alert("Maksimum 8 resim seçebilirsiniz.");
            }
        }
    };

    const handleNextStep = () => {
        if (selectedIndices.length === 0) {
            alert("Lütfen en az bir resim seçin.");
            return;
        }
        setStep('details');
    };

    const handleCreateProductFinal = () => {
        const selectedImages = selectedIndices.map(idx => imagePool[idx]);
        const nextSkuNum = products.length + 1;
        const newProduct: Product = {
            id: Date.now().toString(),
            name: `Yeni Ürün ${nextSkuNum}`,
            sku: `ELN-${nextSkuNum}`,
            modelCode: `MOD-${nextSkuNum}`,
            stock: defaultStock,
            price: defaultPrice,
            image: selectedImages[0],
            images: selectedImages,
            marketplaceStatus: { trendyol: false, hepsiburada: false, n11: false }
        };
        onSave(newProduct);
        const remainingImages = imagePool.filter((_, idx) => !selectedIndices.includes(idx));
        setImagePool(remainingImages);
        setSelectedIndices([]);
        setStep('select');
    };

    const handleAssignToExisting = (product: Product) => {
        if (selectedIndices.length === 0) {
            alert("Lütfen önce havuzdan resim seçin.");
            return;
        }
        const selectedImages = selectedIndices.map(idx => imagePool[idx]);
        const currentImages = product.images || (product.image ? [product.image] : []);
        const maxToAdd = 8 - currentImages.length;
        
        if (selectedImages.length > maxToAdd) {
            if(!window.confirm(`Bu ürünün zaten ${currentImages.length} resmi var. Sadece ${maxToAdd} resim daha ekleyebiliriz. Devam edilsin mi?`)) return;
        }

        const imagesToAdd = selectedImages.slice(0, maxToAdd);
        const combined = [...currentImages, ...imagesToAdd].slice(0, 8);
        const updatedProduct: Product = {
            ...product,
            images: combined,
            image: combined[0]
        };
        onUpdate?.(updatedProduct);
        const remainingImages = imagePool.filter((_, idx) => !selectedIndices.slice(0, imagesToAdd.length).includes(idx));
        setImagePool(remainingImages);
        setSelectedIndices([]);
    };

    const missingImageProducts = products.filter(p => {
        const count = p.images?.length || (p.image ? 1 : 0);
        return count < 8;
    }).filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-hidden">
            <div className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-scaleIn border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                        <ImageIcon className="text-blue-600" /> {step === 'select' ? 'ÜRÜN EKLEME HAVUZU' : 'ÜRÜN DETAYLARINI BELİRLE'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><X className="w-5 h-5" /></button>
                    <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {step === 'select' ? (
                      <div className="space-y-8 animate-fadeIn">
                          <div className="mb-8">
                              {(imagePool.length === 0 && !isUploading) ? (
                                  <button 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="w-full h-64 border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-200 hover:text-blue-500 transition-all group"
                                  >
                                      <div className="p-6 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                          <UploadCloud className="w-12 h-12" />
                                      </div>
                                      <h3 className="text-lg font-black uppercase tracking-widest mb-1">Görsel Havuzu Boş</h3>
                                      <p className="text-xs font-bold opacity-60">Dosyaları seçmek için bu alana tıklayın veya sürükleyin</p>
                                  </button>
                              ) : (
                                  <div className="space-y-4">
                                      <div className="flex justify-between items-center px-1">
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Yüklenen Görseller ({imagePool.length})</span>
                                          <button 
                                              disabled={isUploading}
                                              onClick={() => fileInputRef.current?.click()}
                                              className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1.5 disabled:opacity-50"
                                          >
                                              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Plus className="w-3.5 h-3.5" />}
                                              DAHA FAZLA YÜKLE
                                          </button>
                                      </div>
                                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                          {isUploading && (
                                              <div className="aspect-square rounded-2xl border-4 border-dashed border-blue-200 flex items-center justify-center bg-blue-50">
                                                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                              </div>
                                          )}
                                          {imagePool.map((src, i) => (
                                              <div 
                                                  key={i} 
                                                  onClick={() => toggleImageSelection(i)}
                                                  className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-4 group ${
                                                      selectedIndices.includes(i) ? 'border-blue-600 scale-95 shadow-md' : 'border-gray-50 hover:border-gray-200'
                                                  }`}
                                              >
                                                  <img src={src} className="w-full h-full object-cover" />
                                                  {selectedIndices.includes(i) && (
                                                      <div className="absolute top-2 left-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg ring-2 ring-white">
                                                          {selectedIndices.indexOf(i) + 1}
                                                      </div>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                      
                                      <div className="flex justify-center py-4">
                                          <button 
                                              onClick={handleNextStep}
                                              disabled={selectedIndices.length === 0 || isUploading}
                                              className="w-full max-w-sm py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-black active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none flex items-center justify-center gap-3 group"
                                          >
                                              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> ÜRÜN BİLGİLERİNİ GİR
                                          </button>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {products.length > 0 && (
                            <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-200 animate-slideUp">
                              <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Görseli Eksik Ürünler</h3>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase">Havuzdaki resimleri atamak için ürün seçin</p>
                                  </div>
                                </div>
                              </div>

                              <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                  type="text" 
                                  placeholder="Eksik ürünlerde ara..." 
                                  value={searchTerm}
                                  onChange={e => setSearchTerm(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto no-scrollbar pb-4 px-1">
                                  {missingImageProducts.length === 0 ? (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                                        <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest text-center">Tüm ürünlerin görselleri tamam!<br/><span className="text-[10px] lowercase font-medium opacity-60">veya arama sonucu bulunamadı.</span></p>
                                    </div>
                                  ) : (
                                    missingImageProducts.map(p => {
                                      const currentCount = p.images?.length || (p.image ? 1 : 0);
                                      const isTotallyEmpty = currentCount === 0;
                                      
                                      return (
                                        <button 
                                          key={p.id}
                                          onClick={() => handleAssignToExisting(p)}
                                          className={`group relative flex flex-col p-4 rounded-[24px] border-2 transition-all text-left ${
                                            isTotallyEmpty 
                                              ? 'bg-red-50/50 border-red-100 hover:border-red-500 hover:bg-red-50' 
                                              : 'bg-white border-gray-100 hover:border-orange-500 hover:shadow-xl'
                                          }`}
                                        >
                                          <div className="flex items-center gap-4 mb-4">
                                              <div className="relative">
                                                  <img src={p.image || 'https://via.placeholder.com/150?text=Yok'} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                                                  {isTotallyEmpty && <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"><AlertTriangle className="w-3 h-3 text-white" /></div>}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <p className={`text-11px font-black truncate ${isTotallyEmpty ? 'text-red-700' : 'text-gray-900 group-hover:text-orange-600'}`}>{p.name}</p>
                                                  <p className="text-[9px] font-bold text-gray-400 mt-0.5">{p.sku}</p>
                                              </div>
                                          </div>

                                          <div className="flex flex-col gap-2 mt-auto">
                                              <div className="flex justify-between items-center">
                                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Görsel Kapasitesi</span>
                                                  <span className={`text-[10px] font-black ${currentCount > 0 ? 'text-orange-600' : 'text-red-500'}`}>{currentCount}/8</span>
                                              </div>
                                              <div className="flex gap-1">
                                                  {Array.from({ length: 8 }).map((_, idx) => (
                                                      <div 
                                                          key={idx} 
                                                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                                              idx < currentCount 
                                                                  ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' 
                                                                  : 'bg-gray-200'
                                                          }`}
                                                      />
                                                  ))}
                                              </div>
                                          </div>

                                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                                              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg">
                                                  <Plus className="w-4 h-4" />
                                              </div>
                                          </div>
                                        </button>
                                      );
                                    })
                                  )}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 animate-fadeIn max-w-2xl mx-auto space-y-10">
                          <div className="text-center space-y-2">
                             <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                                <TurkishLira className="w-10 h-10" />
                             </div>
                             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Fiyat ve Stok Bilgisi</h3>
                             <p className="text-sm font-medium text-gray-500">Oluşturulacak ürün için satış fiyatını ve başlangıç stok miktarını belirleyin.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                              <div className="space-y-2">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SATIŞ FİYATI (TL)</label>
                                  <div className="relative">
                                      <TurkishLira className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                                      <input 
                                          autoFocus
                                          type="number" 
                                          value={defaultPrice} 
                                          onChange={e => setDefaultPrice(parseFloat(e.target.value) || 0)}
                                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 pl-12 text-lg font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" 
                                          placeholder="0.00"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">STOK ADEDİ</label>
                                  <div className="relative">
                                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                                      <input 
                                          type="number" 
                                          value={defaultStock} 
                                          onChange={e => setDefaultStock(parseInt(e.target.value) || 0)}
                                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 pl-12 text-lg font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" 
                                          placeholder="0"
                                      />
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                              <button 
                                onClick={() => setStep('select')}
                                className="w-full py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                  <ChevronLeft className="w-5 h-5" /> GERİ DÖN
                              </button>
                              <button 
                                onClick={handleCreateProductFinal}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                              >
                                  TAMAMLA VE ÜRÜNÜ OLUŞTUR <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </button>
                          </div>
                      </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seçilen Resimler: {selectedIndices.length}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                      <AlertTriangle className="w-3 h-3 text-gray-400" /> Ürün başına max 8 resim eklenebilir
                  </div>
                </div>
            </div>
        </div>
    );
};
