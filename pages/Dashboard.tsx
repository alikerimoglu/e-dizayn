
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Menu,
  User,
  LogOut,
  CreditCard,
  Settings,
  ChevronDown,
  Store as StoreIcon,
  Sparkles,
  ArrowRight,
  X as CloseIcon,
  Package,
  Layers,
  Grid,
  Plus,
  X,
  ChevronRight,
  Wand2,
  ShieldCheck
} from 'lucide-react';
import { Sidebar } from '../components/Layout/Sidebar';
import { ProductManager } from './ProductManager';
import { NavSection, Product, Store, MarketplaceType } from '../types';
import { StoreConnectModal } from '../components/StoreConnectModal';
import { DesignStudio, DesignStudioHandle } from './DesignStudio';
import { VoiceAssistant } from '../components/VoiceAssistant';
import { analyzeImageForProductName } from '../services/geminiService';
import { ChangePassword } from './ChangePassword';
import { Subscription } from './Subscription';
import { AdminPanel } from './AdminPanel';
import { Hyperspeed } from '../components/blocks/Hyperspeed';
import { hyperspeedPresets } from '../components/blocks/HyperSpeedPresets';

interface DashboardProps {
  onLogout: () => void;
  currentUser: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeSection, setActiveSection] = useState<NavSection | 'change-password'>(NavSection.INTEGRATIONS);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const getStorageKey = (key: string) => `elnoya_${key}_${currentUser.username}`;

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(getStorageKey('products'));
    return saved ? JSON.parse(saved) : [];
  });

  const [connectedStores, setConnectedStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(getStorageKey('stores'));
    return saved ? JSON.parse(saved) : [];
  });

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(() => {
      const saved = localStorage.getItem(getStorageKey('onboarding_dismissed'));
      return saved === 'true';
  });

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const designStudioRef = useRef<DesignStudioHandle>(null);

  useEffect(() => {
    localStorage.setItem(getStorageKey('products'), JSON.stringify(products));
  }, [products, currentUser.username]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('stores'), JSON.stringify(connectedStores));
  }, [connectedStores, currentUser.username]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('onboarding_dismissed'), hasDismissedOnboarding.toString());
  }, [hasDismissedOnboarding, currentUser.username]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const confirmMessage = ids.length === 1 
      ? "Bu ürünü silmek istediğinize emin misiniz?" 
      : `${ids.length} adet seçili ürünü toplu olarak silmek istediğinize emin misiniz?`;
    if (window.confirm(confirmMessage)) {
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleBulkPriceUpdate = (ids: string[], newPrice: number) => {
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, price: newPrice } : p));
  };

  const handleBulkStockUpdate = (ids: string[], newStock: number) => {
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, stock: newStock } : p));
  };

  const handleBulkModelCodeUpdate = (ids: string[], newModelCode: string) => {
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, modelCode: newModelCode } : p));
  };

  const handleBulkAutoName = async () => {
    const productsToUpdate = products.filter(p => p.image);
    if (productsToUpdate.length === 0) {
        alert("İsim oluşturulacak görsele sahip ürün bulunamadı.");
        return;
    }
    
    setProcessingIds(prev => {
        const next = new Set(prev);
        productsToUpdate.forEach(p => next.add(p.id));
        return next;
    });

    for (const product of productsToUpdate) {
        try {
            const result = await analyzeImageForProductName(product.image!, false);
            const newName = `Unisex ${result.color} 3 iplik "${result.text.toUpperCase()}" Baskılı Uzun Kollu Rahat Sweatshirt`;
            handleUpdateProduct({ ...product, name: newName });
        } catch (e) { 
            console.error(`Hata: ${product.sku}`, e); 
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }
    }
  };

  const handleSingleAutoName = async (product: Product) => {
      if (!product.image) {
          alert("Ürünün görseli bulunmadığı için isim oluşturulamıyor.");
          return;
      }
      setProcessingIds(prev => new Set(prev).add(product.id));
      try {
          const isAlreadyNamed = product.name.includes('"') || product.name.includes('Sade');
          const result = await analyzeImageForProductName(product.image, isAlreadyNamed);
          const newName = `Unisex ${result.color} 3 iplik "${result.text.toUpperCase()}" Baskılı Uzun Kollu Rahat Sweatshirt`;
          handleUpdateProduct({ ...product, name: newName });
      } catch (e) {
          console.error(e);
          alert("Yapay zeka şu an yanıt veremiyor.");
      } finally {
          setProcessingIds(prev => {
              const next = new Set(prev);
              next.delete(product.id);
              return next;
          });
      }
  };

  const handleStoreConnect = async (type: MarketplaceType, credentials: any) => {
    const newStore: Store = {
      id: Date.now().toString(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Mağazası`,
      status: 'connected',
      lastSync: new Date()
    };
    setConnectedStores([...connectedStores, newStore]);
  };

  const handleDesignAction = (action: string, args?: any) => {
    if (activeSection !== NavSection.DESIGN) {
      if(window.confirm("Bu işlem için Tasarla sayfasına geçmeniz gerekiyor. Geçilsin mi?")) {
        setActiveSection(NavSection.DESIGN);
      }
      return;
    }

    const handler = designStudioRef.current;
    if (!handler) return;

    switch (action) {
      case 'removeBackground': handler.removeBackground(); break;
      case 'saveToPool': handler.saveToPool(); break;
      case 'createProduct': handler.createProduct('single'); break;
      case 'setBackground': handler.setBackground(args); break;
      case 'clearPool': handler.clearPool(); break;
      default: console.warn("Unknown design action:", action);
    }
  };

  const handleStartDesigning = () => {
    setShowWelcome(false);
    setActiveSection(NavSection.DESIGN);
  };

  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black overflow-hidden animate-fadeIn">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
        
        <div className="relative z-10 text-center px-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-10 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)] leading-tight max-w-4xl mx-auto">
            Zaman senin elinde,<br/>
            <span className="text-primary-500">Şimdi tasarıma başla</span>
          </h1>
          
          <button 
            onClick={handleStartDesigning}
            className="group relative bg-white text-black px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
          >
            TASARIMA GİT <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="absolute top-10 left-10 z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">E</div>
          <span className="text-2xl font-black text-white tracking-tighter uppercase">elnoya</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case NavSection.PRODUCTS:
        return (
          <ProductManager 
            products={products}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onBulkPriceUpdate={handleBulkPriceUpdate}
            onBulkStockUpdate={handleBulkStockUpdate}
            onBulkModelCodeUpdate={handleBulkModelCodeUpdate}
            onBulkAutoName={handleBulkAutoName}
            onSingleAutoName={handleSingleAutoName}
            onNavigateToSubscription={() => setActiveSection(NavSection.SUBSCRIPTION)}
            processingIds={processingIds}
          />
        );
      case NavSection.DESIGN:
        return (
          <DesignStudio 
            ref={designStudioRef}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
          />
        );
      case NavSection.SUBSCRIPTION:
        return <Subscription />;
      case NavSection.ADMIN:
        return <AdminPanel />;
      case 'change-password':
        return <ChangePassword />;
      case NavSection.INTEGRATIONS:
      default:
        return (
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <Grid className="w-6 h-6 text-primary-600" /> Mağaza Entegrasyonları
                  </h1>
                  <p className="text-gray-500 font-medium mt-1">Tüm satış kanallarınızı tek bir yerden yönetin.</p>
               </div>
               <button 
                  onClick={() => setIsStoreModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-wider"
               >
                  <StoreIcon className="w-5 h-5" /> YENİ MAĞAZA BAĞLA
               </button>
            </div>

            {connectedStores.length === 0 && !hasDismissedOnboarding && (
              <div className="mb-10 bg-white rounded-[32px] p-8 sm:p-12 border-2 border-primary-100 shadow-2xl relative overflow-hidden group">
                 <button 
                  onClick={() => setHasDismissedOnboarding(true)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
                 >
                   <CloseIcon className="w-6 h-6" />
                 </button>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
                 <div className="flex flex-col lg:flex-row items-center gap-10 relative z-0">
                    <div className="flex-1 text-center lg:text-left">
                       <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-black mb-6 uppercase tracking-widest">
                          <Sparkles className="w-4 h-4 mr-2" /> Hoş Geldiniz!
                       </div>
                       <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">Satış Kanallarınızı <br/> Hemen Aktif Edin</h2>
                       <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed max-w-xl">
                          Trendyol, Hepsiburada veya N11 mağazanızı bağlayarak stoklarınızı senkronize edin ve ürünlerinizi otomatik isimlendirin.
                       </p>
                    </div>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {connectedStores.map(store => (
                    <div key={store.id} className="bg-white p-6 rounded-[28px] border border-gray-200 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg ${
                                store.type === 'trendyol' ? 'bg-orange-500 shadow-orange-500/20' :
                                store.type === 'hepsiburada' ? 'bg-orange-600 shadow-orange-600/20' :
                                store.type === 'n11' ? 'bg-red-600 shadow-red-600/20' : 'bg-gray-500'
                            }`}>
                                {store.type.substring(0,2).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">AKTİF</span>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <div className="font-black text-gray-900 text-lg">{store.name}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Son Senkron: {store.lastSync ? new Date(store.lastSync).toLocaleTimeString('tr-TR') : '---'}</div>
                        </div>

                        <div className="flex border-t border-gray-50 pt-4 gap-2">
                            <button className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <Settings className="w-3.5 h-3.5" /> Ayarlar
                            </button>
                            <button 
                                onClick={() => setConnectedStores(prev => prev.filter(s => s.id !== store.id))}
                                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={() => setIsStoreModalOpen(true)}
                    className="border-3 border-dashed border-gray-200 rounded-[28px] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:bg-primary-50/50 hover:text-primary-600 transition-all font-black group min-h-[220px]"
                >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em]">Mağaza Ekle</span>
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={(section) => setActiveSection(section as NavSection)}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={currentUser?.role}
      />
      
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 p-1">
               <Menu className="w-6 h-6" />
             </button>
             <div className="hidden sm:flex items-center bg-gray-50 rounded-xl px-4 py-2 w-48 lg:w-96 border border-gray-100">
                <Search className="text-gray-400 w-4 h-4 mr-2" />
                <input type="text" placeholder="Ara..." className="bg-transparent border-none focus:outline-none text-xs w-full text-gray-700 font-medium" />
             </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            {currentUser?.role === 'admin' && (
              <div className="hidden sm:flex items-center bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100">
                 <ShieldCheck className="w-3 h-3 mr-1" /> Site Sahibi
              </div>
            )}
            <button className="relative text-gray-500 hover:text-gray-700 p-1">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 sm:space-x-3 focus:outline-none group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-gray-200 transition-colors shadow-sm">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs sm:text-sm font-black text-gray-900">{currentUser?.username || 'Kullanıcı'}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {currentUser?.role === 'admin' ? 'Yönetici' : 'Mağaza Sahibi'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-fadeIn overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">Müşteri No: <span className="text-gray-900 ml-1">47202</span></p>
                    </div>
                    <div className="py-2">
                      <button onClick={() => { setActiveSection('change-password'); setIsProfileMenuOpen(false); }} className="w-full flex items-center px-5 py-3 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors font-bold uppercase tracking-tight">
                        <User className="w-4 h-4 mr-3 text-gray-400" /> Şifre Değiştir
                      </button>
                      <button onClick={() => { setActiveSection(NavSection.SUBSCRIPTION); setIsProfileMenuOpen(false); }} className="w-full flex items-center px-5 py-3 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors font-bold uppercase tracking-tight">
                        <CreditCard className="w-4 h-4 mr-3 text-gray-400" /> Abonelik
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button onClick={() => { setActiveSection(NavSection.ADMIN); setIsProfileMenuOpen(false); }} className="w-full flex items-center px-5 py-3 text-xs sm:text-sm text-primary-600 hover:bg-primary-50 transition-colors font-bold uppercase tracking-tight">
                          <ShieldCheck className="w-4 h-4 mr-3" /> Admin Paneli
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-50 py-2">
                      <button onClick={onLogout} className="w-full flex items-center px-5 py-3 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors font-black uppercase tracking-widest">
                        <LogOut className="w-4 h-4 mr-3" /> Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8f9fc]">
          <div className="max-w-[1920px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <StoreConnectModal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} onConnect={handleStoreConnect} />
      <VoiceAssistant 
        onNavigate={(page) => setActiveSection(page as any)} 
        products={products} 
        selectedIds={selectedIds} 
        onSelectAll={() => setSelectedIds(products.map(p => p.id))} 
        onDeselectAll={() => setSelectedIds([])} 
        onUpdateProduct={handleUpdateProduct} 
        onAddProduct={handleAddProduct} 
        onDeleteProduct={handleDeleteProduct} 
        onBulkPriceUpdate={handleBulkPriceUpdate} 
        onBulkStockUpdate={handleBulkStockUpdate} 
        onBulkAutoName={handleBulkAutoName} 
        onSingleAutoName={handleSingleAutoName}
        onDesignAction={handleDesignAction}
      />
    </div>
  );
};
