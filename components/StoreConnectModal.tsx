import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Store as StoreIcon } from 'lucide-react';
import { MarketplaceType } from '../types';

interface StoreConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (type: MarketplaceType, credentials: any) => Promise<void>;
}

type Step = 'welcome' | 'select' | 'form' | 'success';

const Marketplaces = [
  { id: 'trendyol', name: 'Trendyol', color: 'bg-orange-500', initial: 'T', fields: ['API Key', 'API Secret', 'Satıcı ID (Supplier ID)'] },
  { id: 'hepsiburada', name: 'Hepsiburada', color: 'bg-orange-600', initial: 'HB', fields: ['Merchant ID'] },
  { id: 'n11', name: 'N11', color: 'bg-red-600', initial: 'n11', fields: ['API Key', 'API Secret'] },
  { id: 'ideasoft', name: 'IdeaSoft', color: 'bg-blue-400', initial: 'IS', fields: ['Domain', 'Token'] },
  { id: 'logo', name: 'Logo', color: 'bg-indigo-600', initial: 'L', fields: ['Kullanıcı Adı', 'Şifre'] },
];

export const StoreConnectModal: React.FC<StoreConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleMarketplaceSelect = (id: string) => {
    setSelectedMarketplace(id);
    setStep('form');
    setFormData({});
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (selectedMarketplace) {
      await onConnect(selectedMarketplace as MarketplaceType, formData);
      setStep('success');
    }
    setIsLoading(false);
  };

  const resetAndClose = () => {
    setStep('welcome');
    setSelectedMarketplace(null);
    setFormData({});
    onClose();
  };

  const renderWelcome = () => (
    <div className="text-center py-6">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
        <StoreIcon className="w-12 h-12 text-primary-600" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Mağaza Ayarları</h2>
      
      <div className="flex justify-center items-center gap-3 mb-8">
         {/* Replicating the screenshot icons style */}
         <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white z-10 hover:scale-110 transition-transform cursor-default" title="N11">n11</div>
         <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white z-10 hover:scale-110 transition-transform cursor-default" title="Hepsiburada">HB</div>
         <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-green-400 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white z-20 scale-110 hover:scale-125 transition-transform cursor-default" title="IdeaSoft/Ticimax">+</div>
         <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white z-10 hover:scale-110 transition-transform cursor-default" title="Trendyol">TY</div>
         <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white z-10 hover:scale-110 transition-transform cursor-default" title="Logo/Mikro">ef</div>
      </div>

      <p className="text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed text-sm">
        Elnoya'yı hazır hale getirmek için ilk olarak satış yaptığınız mağazalarınızın API bilgilerini tanımlamanız gerekmektedir.
      </p>

      <button 
        onClick={() => setStep('select')}
        className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-bold text-sm tracking-wide w-full max-w-xs shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl"
      >
        MAĞAZALARINI BAĞLAMAK İÇİN TIKLA
      </button>

      <p className="mt-8 text-xs text-gray-400">
        Herhangi bir sorunuz varsa <span className="text-gray-600 font-semibold cursor-pointer underline">Müşteri Destek</span> ekibimizle iletişime geçebilirsiniz.
      </p>
    </div>
  );

  const renderSelect = () => (
    <div className="py-4 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={() => setStep('welcome')} className="p-2 hover:bg-gray-100 rounded-full mr-2 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Entegrasyon Seç</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4">
        {Marketplaces.map(m => (
          <button
            key={m.id}
            onClick={() => handleMarketplaceSelect(m.id)}
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group text-left relative overflow-hidden"
          >
            <div className={`w-10 h-10 ${m.color} rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm mr-3 group-hover:scale-110 transition-transform z-10`}>
              {m.initial}
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-primary-700 z-10">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderForm = () => {
    const market = Marketplaces.find(m => m.id === selectedMarketplace);
    if (!market) return null;

    return (
      <div className="py-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setStep('select')} className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center">
            <div className={`w-8 h-8 ${market.color} rounded-lg flex items-center justify-center text-white font-bold text-xs mr-3`}>
              {market.initial}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{market.name} Bağla</h2>
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700 leading-snug">
                API bilgilerine {market.name} satıcı panelinden "Entegrasyon Bilgileri" sayfasından ulaşabilirsiniz.
              </p>
            </div>
          </div>

          {market.fields.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
              <input 
                required
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder={`${field} giriniz`}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
              />
            </div>
          ))}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-xl font-bold mt-6 flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Bağlantı Kontrol Ediliyor...' : 'Bağlantıyı Tamamla'}
          </button>
        </form>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="text-center py-12 animate-fadeIn">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tebrikler!</h2>
      <p className="text-gray-600 mb-8 max-w-xs mx-auto">
        Mağazanız başarıyla bağlandı. Ürünleriniz ve siparişleriniz şimdi senkronize ediliyor.
      </p>
      <div className="space-y-3">
        <button 
          onClick={resetAndClose}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg"
        >
          Panele Dön ve Ürünleri Gör
        </button>
        <button 
          onClick={() => { setStep('select'); setFormData({}); }}
          className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold transition-all"
        >
          Başka Mağaza Bağla
        </button>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity animate-fadeIn" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-[500px] border border-gray-100">
          
          {/* Close button */}
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-8 pb-10 pt-8">
            {step === 'welcome' && renderWelcome()}
            {step === 'select' && renderSelect()}
            {step === 'form' && renderForm()}
            {step === 'success' && renderSuccess()}
          </div>
        </div>
      </div>
    </div>
  );
};