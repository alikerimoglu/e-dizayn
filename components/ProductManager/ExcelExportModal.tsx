import React, { useState } from 'react';
import { X, FileSpreadsheet, Package, Sparkles, Loader2, FileCheck, FileDown, Info } from 'lucide-react';
import { Product } from '../../types';

interface ExcelExportModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  products: Product[]; 
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ isOpen, onClose, products }) => {
    const [generating, setGenerating] = useState(false);
    const [downloadReady, setDownloadReady] = useState<{ workbook: any; filename: string } | null>(null);

    if (!isOpen) return null;

    const handleCreateExcel = async () => {
        if (products.length === 0) {
            alert("Excel oluşturmak için ürün bulunamadı.");
            return;
        }

        setGenerating(true);
        setDownloadReady(null);

        setTimeout(() => {
            try {
                const XLSX = (window as any).XLSX;
                const headers = ["Ürün Adı", "Stok Kodu (SKU)", "Görsel 1", "Görsel 2", "Görsel 3", "Görsel 4", "Görsel 5", "Görsel 6", "Görsel 7", "Görsel 8"];
                
                const rows = products.map(p => {
                    const images = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
                    const row = [p.name, p.sku];
                    
                    for (let i = 0; i < 8; i++) {
                        row.push(images[i] || "");
                    }
                    return row;
                });

                const data = [headers, ...rows];
                const ws = XLSX.utils.aoa_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Ürün Listesi");
                
                const filename = `Elnoya_Urun_Listesi_${new Date().toISOString().slice(0, 10)}.xlsx`;
                
                XLSX.writeFile(wb, filename);

                setDownloadReady({
                    workbook: wb,
                    filename: filename
                });
            } catch (err) {
                console.error("Excel Oluşturma Hatası:", err);
                alert("Excel dosyası oluşturulurken bir hata oluştu.");
            } finally {
                setGenerating(false);
            }
        }, 800);
    };

    const handleDownload = () => {
        if (!downloadReady) return;
        (window as any).XLSX.writeFile(downloadReady.workbook, downloadReady.filename);
        onClose();
        setDownloadReady(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
             <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-scaleIn border border-gray-100">
                 <div className="flex justify-between items-center mb-8">
                     <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tight">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        </div>
                        Excel Oluşturucu
                     </h2>
                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                 </div>
                 
                 <div className="space-y-6">
                     {!downloadReady ? (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                                <Package className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Hazırlanmaya Hazır</h3>
                                <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Sistemdeki {products.length} ürün listelenecektir.</p>
                            </div>
                            
                            <button 
                                onClick={handleCreateExcel}
                                disabled={generating || products.length === 0}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none"
                            >
                                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {generating ? 'DOSYA HAZIRLANIYOR...' : 'EXCEL DOSYASINI OLUŞTUR'}
                            </button>
                        </div>
                     ) : (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-green-50 p-6 rounded-[24px] border border-green-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-green-600 ring-4 ring-green-50">
                                    <FileCheck className="w-8 h-8" />
                                </div>
                                <h3 className="font-black text-green-800 text-sm uppercase tracking-tight">Excel Dosyası İndirildi!</h3>
                                <p className="text-[10px] text-green-600 font-bold uppercase mt-1">Dosya otomatik olarak tarayıcınıza gönderildi.</p>
                            </div>

                            <button 
                                onClick={handleDownload}
                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all hover:bg-black active:scale-95 flex items-center justify-center gap-3"
                            >
                                <FileDown className="w-5 h-5" /> TEKRAR İNDİR
                            </button>

                            <button 
                                onClick={() => setDownloadReady(null)}
                                className="w-full py-3 text-gray-400 font-black text-[10px] uppercase hover:text-gray-600 transition-colors"
                            >
                                Yeni Liste Oluştur
                            </button>
                        </div>
                     )}

                     {!downloadReady && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-[9px] text-blue-600 font-black uppercase tracking-tight leading-relaxed">
                                    Oluşturulan Excel'de 'Ürün Adı', 'SKU' ve 8 adet görsel sütunu yan yana listelenir. Bu dosya ile toplu ürün güncellemelerinizi kolayca yapabilirsiniz.
                                </p>
                            </div>
                        </div>
                     )}
                 </div>
             </div>
        </div>
    );
};