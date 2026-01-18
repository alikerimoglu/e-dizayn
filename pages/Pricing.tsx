
import React, { useState } from 'react';
import { ModernPricingPage, PricingCardProps } from '../components/ui/animated-glassy-pricing';

export const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(true);

  const myPricingPlans: PricingCardProps[] = [
    {
      planName: "Başlangıç",
      description: "Yeni başlayanlar için ideal",
      price: isYearly ? "149" : "199",
      currency: "₺",
      features: [
        "2 Pazaryeri Entegrasyonu",
        "500 Ürün Limiti",
        "Günlük Stok Güncelleme",
        "E-posta Desteği",
        "Temel Analiz Paneli"
      ],
      buttonText: "HEMEN BAŞLA",
      buttonVariant: 'secondary'
    },
    {
      planName: "Profesyonel",
      description: "Büyüyen işletmeler için",
      price: isYearly ? "299" : "399",
      currency: "₺",
      features: [
        "5 Pazaryeri Entegrasyonu",
        "5000 Ürün Limiti",
        "Anlık Stok Güncelleme",
        "E-fatura Entegrasyonu",
        "Canlı Destek",
        "Elnoya AI (100 Kredi)"
      ],
      buttonText: "PROFESYONELE GEÇ",
      isPopular: true,
      buttonVariant: 'primary'
    },
    {
      planName: "Expert",
      description: "Sınırsız güç ve destek",
      price: isYearly ? "599" : "799",
      currency: "₺",
      features: [
        "Sınırsız Pazaryeri",
        "Sınırsız Ürün",
        "Anlık Stok & Fiyat Senkronu",
        "E-fatura & Muhasebe",
        "Özel Müşteri Temsilcisi",
        "Elnoya AI (Sınırsız)"
      ],
      buttonText: "BİZE ULAŞIN",
      buttonVariant: 'primary'
    }
  ];

  return (
    <div className="relative">
      {/* Monthly/Yearly Toggle Overlay */}
      <div className="absolute top-44 sm:top-56 left-0 w-full z-20 flex justify-center items-center gap-4">
        <span className={`text-sm font-bold transition-all ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Aylık</span>
        <button 
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isYearly ? 'bg-primary-600' : 'bg-gray-300'}`}
        >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${isYearly ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <span className={`text-sm font-bold transition-all ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}>
            Yıllık <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">%25 TASARRUF</span>
        </span>
      </div>

      <ModernPricingPage
        title={
          <>
            İşinizle Büyüyen <br/> <span className="text-primary-600">Esnek Fiyatlar</span>
          </>
        }
        subtitle="Kredi kartı gerekmeden 14 gün ücretsiz deneyin. İşinize en uygun planı seçerek hemen satışa başlayın."
        plans={myPricingPlans}
        showAnimatedBackground={true}
      />
    </div>
  );
};
