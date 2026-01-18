import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';

interface ImageGalleryModalProps { 
  product: Product; 
  onClose: () => void; 
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ product, onClose }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const images = product.images && product.images.length > 0 ? product.images : [product.image!];

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col p-4 backdrop-blur-md animate-fadeIn" onClick={onClose}>
            <div className="absolute top-6 right-6 z-10">
                <button onClick={onClose} className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full" onClick={e => e.stopPropagation()}>
                <div className="relative group w-full flex justify-center">
                    <img src={images[activeIdx]} className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl object-contain border-4 border-white/5 transition-all" />
                    
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={() => setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button 
                                onClick={() => setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center w-full">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 max-w-full px-4">
                        {images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveIdx(idx)}
                                className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${idx === activeIdx ? 'border-blue-500 scale-110 shadow-lg' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};