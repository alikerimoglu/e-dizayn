
import React from 'react';
import { GeneratedVariation } from '../../types';

interface VariationsPoolProps {
  variations: GeneratedVariation[];
  onClear: () => void;
  onEdit: (v: GeneratedVariation) => void;
}

export const VariationsPool: React.FC<VariationsPoolProps> = ({ variations, onClear, onEdit }) => {
  if (variations.length === 0) return null;

  return (
    <div className="h-32 bg-white border-t border-gray-200 shrink-0 flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center shrink-0">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">HAVUZ ({variations.length})</span>
        <button onClick={onClear} className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Temizle</button>
      </div>
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center px-4 gap-4 py-2">
        {variations.map((v) => (
          <div 
            key={v.id} 
            className="relative group shrink-0 w-20 h-20 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:border-blue-300 transition-all cursor-pointer"
          >
            <img src={v.blob} className="w-full h-full object-contain p-1.5" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => onEdit(v)} 
                className="bg-white text-blue-700 px-2 py-1 rounded-md text-[8px] font-black uppercase"
              >
                DÜZENLE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
