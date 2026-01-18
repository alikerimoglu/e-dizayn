import React, { useState } from 'react';
import { 
  Search, 
  Store, 
  Download, 
  ChevronRight, 
  Filter,
  X,
  Check,
  Wand2,
  Package,
  FileSpreadsheet,
  Sparkles,
  Plus,
  Loader2,
  Edit3
} from 'lucide-react';
import { Product } from '../types';
import { EditProductModal } from '../components/ProductManager/EditProductModal';
import { AddProductModal } from '../components/ProductManager/AddProductModal';
import { ExcelExportModal } from '../components/ProductManager/ExcelExportModal';
import { AutoNameModal } from '../components/ProductManager/AutoNameModal';
import { ImageGalleryModal } from '../components/ProductManager/ImageGalleryModal';

interface ProductManagerProps {
  products: Product[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (ids: string[]) => void;
  onBulkPriceUpdate: (ids: string[], price: number) => void;
  onBulkStockUpdate: (ids: string[], stock: number) => void;
  onBulkModelCodeUpdate: (ids: string[], modelCode: string) => void;
  onBulkAutoName: () => void;
  onSingleAutoName: (product: Product) => void;
  onNavigateToSubscription: () => void;
  processingIds: Set<string>;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ 
  products, 
  selectedIds, 
  onSelectionChange, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onBulkPriceUpdate, 
  onBulkStockUpdate, 
  onBulkModelCodeUpdate, 
  onBulkAutoName, 
  onSingleAutoName,
  onNavigateToSubscription,
  processingIds = new Set()
}) => {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAutoNameModalOpen, setIsAutoNameModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) onSelectionChange(products.map(p => p.id));
    else onSelectionChange([]);
  };

  const handleSelectOne = (id: string) => {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(item => item !== id) : [...selectedIds, id]);
  };

  const isBulkProcessing = processingIds.size > 0;

  return (
    <div className="flex flex-col h-full font-sans p-3 sm:p-5 lg:p-8 overflow-hidden text-gray-900">
        <div className="bg-[#8b008b] text-white py-2.5 px-4 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs font-bold shadow-md rounded-xl sm:rounded-2xl mb-5 gap-3 border border-white/10 shrink-0">
             <div className="flex items-center space-x-2">
                 <Sparkles className="w-4 h-4 text-yellow-400" />
                 <span className="italic tracking-tight">KISA SÜRELİ FIRSAT: %5 İndirim!</span>
             </div>
             <div className="flex items-center gap-3">
                 <button 
                  onClick={onNavigateToSubscription}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-lg transition-all uppercase text-[9px] font-black flex items-center shadow-lg active:scale-95"
                 >
                    SATIN AL <ChevronRight className="ml-1 w-3 h-3" />
                 </button>
                 <div className="hidden sm:flex space-x-3 font-mono items-center bg-black/20 px-3 py-1 rounded-full">
                     <span className="text-[10px]">01:12:45</span>
                 </div>
             </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col space-y-4 mb-4 shrink-0">
                <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
                    <div className="flex items-center">
                        <div className="p-2.5 bg-blue-500 rounded-xl mr-3 shadow-lg hidden sm:flex"><Store className="w-5 h-5 text-white" /></div>
                        <div>
                           <h1 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                               Ürün Listesi <span className="bg-gray-100 text-gray-500 text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-gray-200">{products.length}</span>
                           </h1>
                           <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Envanter yönetimi ve toplu işlemler.</p>
                        </div>
                    </div>
                    
                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 xl:pb-0">
                        <button className="flex flex-col items-center justify-center p-2 min-w-[70px] border border-gray-200 rounded-xl hover:bg-white hover:border-blue-500 bg-white/50 transition-all shadow-sm group">
                            <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 mb-1" />
                            <span className="text-[8px] font-bold text-gray-500 uppercase">Ürün Çek</span>
                        </button>
                        <button 
                            onClick={() => setIsAutoNameModalOpen(true)} 
                            disabled={isBulkProcessing}
                            className={`flex flex-col items-center justify-center p-2 min-w-[70px] border border-gray-200 rounded-xl transition-all shadow-sm group ${isBulkProcessing ? 'bg-purple-50 border-purple-200 cursor-wait' : 'hover:bg-white hover:border-purple-500 bg-white/50'}`}
                        >
                            {isBulkProcessing ? <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin mb-1" /> : <Wand2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 mb-1" />}
                            <span className={`text-[8px] font-bold uppercase ${isBulkProcessing ? 'text-purple-600' : 'text-gray-500'}`}>{isBulkProcessing ? 'Analiz...' : 'AI İsim'}</span>
                        </button>
                        <button onClick={() => setIsExcelModalOpen(true)} className="flex flex-col items-center justify-center p-2 min-w-[70px] border border-gray-200 rounded-xl hover:bg-white hover:border-green-500 bg-white/50 transition-all shadow-sm group">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 mb-1" />
                            <span className="text-[8px] font-bold text-gray-500 uppercase">Excel Oluştur</span>
                        </button>
                        <button onClick={() => setIsAddProductModalOpen(true)} className="flex flex-col items-center justify-center p-2 min-w-[70px] border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white bg-blue-50 transition-all shadow-sm group">
                            <Plus className="w-3.5 h-3.5 text-blue-500 group-hover:text-white mb-1" />
                            <span className="text-[8px] font-black text-blue-600 group-hover:text-white uppercase">Yeni</span>
                        </button>
                    </div>
                </div>
            </div>

            {isBulkProcessing && (
              <div className="bg-purple-600 text-white p-3 rounded-2xl mb-4 shadow-xl shadow-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse border border-purple-400">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 leading-none">AI Akıllı Analiz Devam Ediyor</p>
                    <p className="text-[9px] font-bold opacity-80 uppercase tracking-tight">Ürünler teker teker sırayla isimlendiriliyor...</p>
                  </div>
                </div>
                <div className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-widest">
                  İşlemdeki Ürün: {processingIds.size}
                </div>
              </div>
            )}

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 mb-4 shadow-sm shrink-0">
                {selectedIds.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-600 px-6 py-4 rounded-2xl gap-4 animate-fadeIn shadow-xl ring-4 ring-blue-50">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-black text-white text-sm sm:text-base leading-none block">{selectedIds.length} Ürün Seçildi</span>
                                <span className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mt-0.5 block">Seçim Modu Aktif</span>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => onSelectionChange([])} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl flex items-center justify-center border border-white/20 transition-all font-black text-xs uppercase tracking-widest" title="Seçimi Temizle">
                                <X className="w-5 h-5 mr-2" /> SEÇİMİ İPTAL ET
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500" />
                            <input type="text" placeholder="Ara..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white outline-none transition-all font-medium" />
                        </div>
                        <button className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-black flex items-center justify-center transition-all"><Filter className="w-3.5 h-3.5 mr-2" /> FİLTRE</button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:hidden gap-4 pb-12">
                    {products.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-400 font-medium">Ürün bulunamadı.</div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className={`bg-white rounded-2xl p-3 border transition-all shadow-sm ${selectedIds.includes(product.id) ? 'border-blue-500 ring-2 ring-blue-50' : (processingIds.has(product.id) ? 'border-purple-500 ring-2 ring-purple-50' : 'border-gray-100')}`}>
                                <div className="flex gap-3">
                                    <div className="shrink-0 flex flex-col gap-2">
                                        <div onClick={() => handleSelectOne(product.id)} className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.includes(product.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {selectedIds.includes(product.id) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="relative">
                                          <img src={product.image || 'https://via.placeholder.com/150?text=Resim+Yok'} onClick={() => setGalleryProduct(product)} className="w-14 h-14 rounded-lg object-cover bg-gray-50 border border-gray-100 cursor-zoom-in transition-opacity hover:opacity-80" />
                                          {processingIds.has(product.id) && <div className="absolute inset-0 bg-purple-600/20 rounded-lg flex items-center justify-center"><Loader2 className="w-5 h-5 text-purple-600 animate-spin" /></div>}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <h3 className={`text-xs font-black truncate leading-tight ${processingIds.has(product.id) ? 'text-purple-600' : 'text-gray-900'}`}>{product.name}</h3>
                                                {processingIds.has(product.id) && <Loader2 className="w-3 h-3 text-purple-600 animate-spin shrink-0" />}
                                            </div>
                                            <div className="flex gap-1 shrink-0 ml-1">
                                                <button 
                                                    onClick={() => onSingleAutoName?.(product)} 
                                                    disabled={processingIds.has(product.id)}
                                                    className="text-purple-500 hover:text-purple-700 p-1 disabled:opacity-30" 
                                                    title="İsmi Yapay Zeka ile Yenile"
                                                >
                                                    <Wand2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingProduct(product)} className="text-blue-500 hover:text-blue-700 p-1"><Edit3 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 mb-2">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">{product.sku}</span>
                                            <span className={`text-[8px] font-black px-1 rounded ${processingIds.has(product.id) ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{product.modelCode}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Fiyat</p>
                                                <p className="text-xs font-black text-gray-900">₺{product.price.toLocaleString('tr-TR')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Stok</p>
                                                <p className={`text-xs font-black ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>{product.stock}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="hidden xl:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-4 w-12"><div onClick={() => handleSelectAll(selectedIds.length !== products.length)} className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${selectedIds.length === products.length && products.length > 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>{selectedIds.length === products.length && products.length > 0 && <Check className="w-2.5 h-2.5 text-white" />}</div></th>
                                    <th className="px-3 py-4">ÜRÜN BİLGİSİ</th>
                                    <th className="px-3 py-4">MODEL KODU</th>
                                    <th className="px-3 py-4 text-right">FİYAT</th>
                                    <th className="px-3 py-4 text-center">STOK</th>
                                    <th className="px-3 py-4 text-center">PLATFORM</th>
                                    <th className="px-5 py-4 text-right">İŞLEM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-[11px]">
                                {products.map((product) => (
                                    <tr key={product.id} className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.includes(product.id) ? 'bg-blue-50/50' : ''} ${processingIds.has(product.id) ? 'bg-purple-50/50' : ''}`}>
                                        <td className="px-5 py-3"><div onClick={() => handleSelectOne(product.id)} className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${selectedIds.includes(product.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>{selectedIds.includes(product.id) && <Check className="w-2.5 h-2.5 text-white" />}</div></td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                  <img 
                                                    src={product.image || 'https://via.placeholder.com/150?text=Resim+Yok'} 
                                                    onClick={() => setGalleryProduct(product)}
                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 cursor-zoom-in transition-opacity hover:opacity-80" 
                                                  />
                                                  {processingIds.has(product.id) && (
                                                    <div className="absolute inset-0 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="min-w-0 flex items-center gap-2">
                                                    <span className={`font-black truncate ${processingIds.has(product.id) ? 'text-purple-600' : 'text-gray-900'}`}>{product.name}</span>
                                                    {processingIds.has(product.id) && <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3"><span className={`font-black px-1.5 py-0.5 rounded border ${processingIds.has(product.id) ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>{product.modelCode}</span></td>
                                        <td className="px-3 py-3 text-right font-black text-gray-900">₺{product.price.toLocaleString('tr-TR')}</td>
                                        <td className="px-3 py-3 text-center font-black">
                                            <span className={product.stock > 10 ? 'text-green-600' : 'text-red-600'}>{product.stock}</span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black ${product.marketplaceStatus.trendyol ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>TY</div>
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black ${product.marketplaceStatus.hepsiburada ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>HB</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => onSingleAutoName?.(product)} 
                                                    disabled={processingIds.has(product.id)}
                                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-30" 
                                                    title="İsmi Yapay Zeka ile Yenile"
                                                >
                                                    <Wand2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingProduct(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Düzenle"><Edit3 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {isAddProductModalOpen && (
          <AddProductModal 
            isOpen={isAddProductModalOpen} 
            onClose={() => setIsAddProductModalOpen(false)} 
            onSave={onAddProduct} 
            onUpdate={onUpdateProduct}
            products={products} 
          />
        )}
        {editingProduct && (
          <EditProductModal 
            isOpen={!!editingProduct} 
            product={editingProduct} 
            onClose={() => setEditingProduct(null)} 
            onSave={(updated) => {
              onUpdateProduct?.(updated);
              setEditingProduct(null);
            }} 
            isProcessing={processingIds.has(editingProduct.id)}
            onRegenerate={() => onSingleAutoName?.(editingProduct)}
          />
        )}
        {isAutoNameModalOpen && (
          <AutoNameModal 
            isOpen={isAutoNameModalOpen} 
            onClose={() => setIsAutoNameModalOpen(false)} 
            products={products} 
            onStartBulk={() => {
              onBulkAutoName?.();
              setIsAutoNameModalOpen(false);
            }}
          />
        )}
        {isExcelModalOpen && (
          <ExcelExportModal 
            isOpen={isExcelModalOpen} 
            onClose={() => setIsExcelModalOpen(false)} 
            products={products} 
          />
        )}
        {galleryProduct && <ImageGalleryModal product={galleryProduct} onClose={() => setGalleryProduct(null)} />}
    </div>
  );
};