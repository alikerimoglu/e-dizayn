
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  Upload, 
  Layers, 
  Scissors, 
  Move, 
  Sun, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  X, 
  ImageIcon, 
  CheckCircle2, 
  PackagePlus, 
  Maximize2,
  RotateCw,
  RotateCcw
} from 'lucide-react';
import { Product, GeneratedVariation } from '../types';
import { CreateProductModal } from '../components/DesignStudio/CreateProductModal';
import { VariationsPool } from '../components/DesignStudio/VariationsPool';

interface DesignStudioProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
}

export interface DesignStudioHandle {
  removeBackground: () => void;
  saveToPool: () => void;
  createProduct: (mode: 'single' | 'multi-individual' | 'multi-batch') => void;
  setBackground: (color: string) => void;
  clearPool: () => void;
}

export const DesignStudio = forwardRef<DesignStudioHandle, DesignStudioProps>(({ products, onAddProduct, onUpdateProduct }, ref) => {
  const [baseImageQueue, setBaseImageQueue] = useState<string[]>([]);
  const [currentBaseImageIndex, setCurrentBaseImageIndex] = useState(0);
  const baseImage = baseImageQueue[currentBaseImageIndex] || null;

  const [printQueue, setPrintQueue] = useState<File[]>([]);
  const [currentPrint, setCurrentPrint] = useState<string | null>(null);
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariation[]>([]);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(window.innerWidth >= 1280);
  
  // Ürün oluşturma modal state
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [creationStep, setCreationStep] = useState<'type' | 'subtype' | 'select' | 'details'>('type');
  const [creationMode, setCreationMode] = useState<'single' | 'multi-individual' | 'multi-batch'>('single');
  const [selectedVariationIds, setSelectedVariationIds] = useState<string[]>([]);
  const [creationPrice, setCreationPrice] = useState<number>(599.90);
  const [creationStock, setCreationStock] = useState<number>(100);

  const [background, setBackground] = useState<string>('#ffffff');
  const [printTransform, setPrintTransform] = useState({ x: 0, y: 0, scale: 0.5, rotate: 0, opacity: 1 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ startDist: 0, startScale: 1, centerX: 0, centerY: 0 });
  const rotateStartRef = useRef({ startAngle: 0, initialRotate: 0, centerX: 0, centerY: 0 });
  
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printInputRef = useRef<HTMLInputElement>(null);

  const performBackgroundRemoval = async (imageUrl: string): Promise<string> => {
    return new Promise<string>((resolve) => {
        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 2000;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(imageUrl); return; }
            ctx.drawImage(img, 0, 0, width, height);
            
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const bgR = data[0], bgG = data[1], bgB = data[2], tolerance = 40;
            const matches = (r: number, g: number, b: number) => 
                Math.abs(r - bgR) < tolerance && 
                Math.abs(g - bgG) < tolerance && 
                Math.abs(b - bgB) < tolerance;

            const visited = new Uint8Array(width * height);
            const queue: [number, number][] = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
            
            queue.forEach(([x, y]) => {
                visited[y * width + x] = 1;
            });

            let head = 0;
            while (head < queue.length) {
                const [x, y] = queue[head++];
                const idx = (y * width + x) * 4;
                data[idx + 3] = 0;

                const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
                for (let i = 0; i < neighbors.length; i++) {
                    const [nx, ny] = neighbors[i];
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const vIdx = ny * width + nx;
                        if (!visited[vIdx]) {
                            const nIdx = vIdx * 4;
                            if (matches(data[nIdx], data[nIdx + 1], data[nIdx + 2])) {
                                visited[vIdx] = 1;
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = () => resolve(imageUrl);
    });
  };

  const handleBaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as File));
      setBaseImageQueue(prev => [...prev, ...newImages]);
    }
  };

  const loadPrint = async (file: File) => {
    let url = URL.createObjectURL(file);
    const processedUrl = await performBackgroundRemoval(url);
    setCurrentPrint(processedUrl);
    setPrintTransform({ x: 0, y: 0, scale: 0.5, rotate: 0, opacity: 1 });
  };

  const handlePrintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      if (!currentPrint) {
        loadPrint(files[0]);
        setPrintQueue(prev => [...prev, ...files.slice(1)]);
      } else {
        setPrintQueue(prev => [...prev, ...files]);
      }
    }
  };

  const removeCurrentPrint = () => {
    if (printQueue.length > 0) {
      const next = printQueue[0];
      setPrintQueue(prev => prev.slice(1));
      loadPrint(next);
    } else {
      setCurrentPrint(null);
    }
  };

  const removeBackground = async () => {
    if (!baseImage || isRemovingBg) return;
    setIsRemovingBg(true);
    try {
        const newUrl = await performBackgroundRemoval(baseImage);
        setBaseImageQueue(prev => {
          const next = [...prev];
          next[currentBaseImageIndex] = newUrl;
          return next;
        });
    } catch (err) {
        console.error("BG removal error:", err);
    } finally { setIsRemovingBg(false); }
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
        if (isResizing) {
            const currentDist = Math.hypot(clientX - resizeStartRef.current.centerX, clientY - resizeStartRef.current.centerY);
            const ratio = currentDist / resizeStartRef.current.startDist;
            setPrintTransform(prev => ({ ...prev, scale: Math.max(0.05, Math.min(3, resizeStartRef.current.startScale * ratio)) }));
        } else if (isRotating) {
            const angle = Math.atan2(clientY - rotateStartRef.current.centerY, clientX - rotateStartRef.current.centerX);
            const deg = (angle * 180) / Math.PI;
            const diff = deg - rotateStartRef.current.startAngle;
            setPrintTransform(prev => ({ ...prev, rotate: rotateStartRef.current.initialRotate + diff }));
        } else if (isDragging) {
            const REFERENCE_SIZE = 500;
            let scaleCorrection = 1;
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                if (rect.width > 0) scaleCorrection = REFERENCE_SIZE / rect.width;
            }
            const dx = (clientX - dragStartRef.current.x) * scaleCorrection;
            const dy = (clientY - dragStartRef.current.y) * scaleCorrection;
            setPrintTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            dragStartRef.current = { x: clientX, y: clientY };
        }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const onUp = () => { 
        setIsDragging(false); 
        setIsResizing(false); 
        setIsRotating(false); 
    };

    if (isDragging || isResizing || isRotating) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchend', onUp);
    }
    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, isResizing, isRotating]);

  const renderToImage = async (forceTransparent: boolean = false): Promise<string> => {
    if (!baseImage) return '';
    const baseImg = await new Promise<HTMLImageElement>((res, rej) => { 
      const i = new Image(); 
      i.crossOrigin = "anonymous"; 
      i.onload = () => res(i); 
      i.onerror = rej;
      i.src = baseImage; 
    });

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    if (!forceTransparent) {
        ctx.fillStyle = background === 'transparent' ? 'rgba(0,0,0,0)' : background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(baseImg, 0, 0);
    
    if (currentPrint) {
        const printImg = await new Promise<HTMLImageElement>((res, rej) => { 
          const i = new Image(); 
          i.crossOrigin = "anonymous"; 
          i.onload = () => res(i); 
          i.onerror = rej;
          i.src = currentPrint; 
        });

        ctx.save();
        const virtualPadding = 19;
        const virtualAvailable = 500 - (virtualPadding * 2); 
        const pxPerVirtualUnit = Math.max(baseImg.width, baseImg.height) / virtualAvailable;
        const centerX = baseImg.width / 2;
        const centerY = baseImg.height / 2;
        const targetX = centerX + (printTransform.x * pxPerVirtualUnit);
        const targetY = centerY + (printTransform.y * pxPerVirtualUnit);
        
        ctx.translate(targetX, targetY);
        ctx.rotate((printTransform.rotate * Math.PI) / 180);
        ctx.globalAlpha = printTransform.opacity;
        const printWidthPx = (400 * printTransform.scale) * pxPerVirtualUnit;
        const printHeightPx = (printImg.height / printImg.width) * printWidthPx;
        ctx.drawImage(printImg, -printWidthPx / 2, -printHeightPx / 2, printWidthPx, printHeightPx);
        ctx.restore();
    }
    return canvas.toDataURL('image/png');
  };

  const handleSaveToPool = async () => {
    if (!baseImage || !currentPrint) return;
    const blobUrl = await renderToImage(true);
    const newVariation: GeneratedVariation = { 
      id: Date.now().toString(), 
      blob: blobUrl, 
      printName: `Tasarım ${generatedVariations.length + 1}`, 
      timestamp: Date.now(),
      isFavorite: false,
      state: {
        baseImage,
        currentPrint,
        background,
        printTransform: { ...printTransform },
        filters: { ...filters }
      }
    };
    setGeneratedVariations(prev => [...prev, newVariation]);
    removeCurrentPrint();
  };

  const handleFinalizeCreation = () => {
    const selectedVariations = generatedVariations.filter(v => selectedVariationIds.includes(v.id));
    
    if (creationMode === 'single') {
        onAddProduct({
            id: Date.now().toString(),
            name: "Elnoya Özel Koleksiyon",
            sku: `ELN-${Math.floor(1000 + Math.random() * 9000)}`,
            modelCode: `MOD-${Math.floor(100 + Math.random() * 900)}`,
            price: creationPrice,
            stock: creationStock,
            image: selectedVariations[0]?.blob,
            images: selectedVariations.map(v => v.blob),
            marketplaceStatus: { trendyol: true, hepsiburada: true, n11: false }
        });
    } else if (creationMode === 'multi-individual') {
        selectedVariations.forEach((v, idx) => {
            onAddProduct({
                id: (Date.now() + idx).toString(),
                name: `Elnoya Tasarım ${idx + 1}`,
                sku: `ELN-${Math.floor(1000 + Math.random() * 9000)}-${idx}`,
                modelCode: `MOD-${Math.floor(100 + Math.random() * 900)}`,
                price: creationPrice,
                stock: creationStock,
                image: v.blob,
                images: [v.blob],
                marketplaceStatus: { trendyol: true, hepsiburada: true, n11: false }
            });
        });
    } else if (creationMode === 'multi-batch') {
        for (let i = 0; i < selectedVariations.length; i += 8) {
            const chunk = selectedVariations.slice(i, i + 8);
            onAddProduct({
                id: (Date.now() + i).toString(),
                name: `Elnoya Toplu Seri ${Math.floor(i / 8) + 1}`,
                sku: `ELN-BATCH-${Math.floor(1000 + Math.random() * 9000)}-${i}`,
                modelCode: `MOD-${Math.floor(100 + Math.random() * 900)}`,
                price: creationPrice,
                stock: creationStock,
                image: chunk[0].blob,
                images: chunk.map(v => v.blob),
                marketplaceStatus: { trendyol: true, hepsiburada: true, n11: false }
            });
        }
    }

    setGeneratedVariations(prev => prev.filter(v => !selectedVariationIds.includes(v.id)));
    setIsCreateProductModalOpen(false);
    setCreationStep('type');
    setSelectedVariationIds([]);
  };

  useImperativeHandle(ref, () => ({
    removeBackground,
    saveToPool: handleSaveToPool,
    createProduct: () => {
        setIsCreateProductModalOpen(true);
        setCreationStep('type');
    },
    setBackground,
    clearPool: () => setGeneratedVariations([]),
  }));

  const toggleVariationSelection = (id: string) => {
    setSelectedVariationIds(prev => {
        if (prev.includes(id)) return prev.filter(v => v !== id);
        if (creationMode === 'single' && prev.length >= 8) {
            alert("Tekli üründe en fazla 8 görsel seçilebilir.");
            return prev;
        }
        return [...prev, id];
    });
  };

  const startInteraction = (clientX: number, clientY: number) => {
    if (!isResizing && !isRotating) {
        setIsDragging(true); 
        dragStartRef.current = { x: clientX, y: clientY }; 
    }
  };

  const startResize = (clientX: number, clientY: number, rect: DOMRect) => {
    setIsResizing(true); 
    resizeStartRef.current = { 
        startDist: Math.hypot(clientX - (rect.left + rect.width/2), clientY - (rect.top + rect.height/2)), 
        startScale: printTransform.scale, 
        centerX: rect.left + rect.width/2, 
        centerY: rect.top + rect.height/2 
    }; 
  };

  const startRotate = (clientX: number, clientY: number, rect: DOMRect) => {
    setIsRotating(true); 
    rotateStartRef.current = { 
        centerX: rect.left + rect.width/2, 
        centerY: rect.top + rect.height/2,
        initialRotate: printTransform.rotate,
        startAngle: (Math.atan2(clientY - (rect.top + rect.height/2), clientX - (rect.left + rect.width/2)) * 180) / Math.PI
    }; 
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans overflow-hidden">
        {/* Workspace Header */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 shadow-sm">
            <div className="flex items-center">
                <Scissors className="mr-2.5 text-blue-600 w-5 h-5" /> 
                <h1 className="text-sm sm:text-lg font-black text-gray-900 tracking-tight uppercase">Tasarım Stüdyosu</h1>
            </div>
            
            <div className="flex items-center space-x-2">
                 <button onClick={removeBackground} title="Arkaplanı Kaldır" disabled={isRemovingBg || !baseImage} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl disabled:opacity-30 transition-all border border-red-100">
                    {isRemovingBg ? <Loader2 className="w-4 h-4 animate-spin"/> : <Scissors className="w-4 h-4" />}
                 </button>
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-200">
                    <Upload className="w-4 h-4" />
                    <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleBaseImageUpload} />
                 </button>
                 <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="xl:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    {isRightPanelOpen ? <X className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                 </button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            {/* Main Design Area */}
            <div className="flex-1 flex flex-col relative bg-[#f0f2f5] overflow-hidden min-h-0">
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-0 relative">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    
                    <div 
                        ref={canvasRef}
                        className="relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] bg-white select-none overflow-hidden rounded-[24px] ring-1 ring-black/5 flex items-center justify-center"
                        style={{ 
                            width: '100%', 
                            maxWidth: '420px', 
                            height: 'auto', 
                            maxHeight: 'calc(100% - 20px)',
                            aspectRatio: '1/1',
                            backgroundColor: background 
                        }}
                    >
                        {baseImage ? (
                            <>
                                <img src={baseImage} className="absolute w-full h-full object-contain pointer-events-none p-4" style={{ filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%)` }} />
                                {currentPrint && (
                                    <div
                                        className={`absolute top-1/2 left-1/2 group touch-none ${isDragging || isResizing || isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
                                        style={{ 
                                            transform: `translate(calc(-50% + ${printTransform.x}px), calc(-50% + ${printTransform.y}px)) rotate(${printTransform.rotate}deg) scale(${printTransform.scale})`, 
                                            width: '80%',
                                        }}
                                        onMouseDown={(e) => startInteraction(e.clientX, e.clientY)}
                                        onTouchStart={(e) => {
                                            if (e.touches.length > 0) startInteraction(e.touches[0].clientX, e.touches[0].clientY);
                                        }}
                                    >
                                        <img src={currentPrint} className="w-full h-auto pointer-events-none" style={{ opacity: printTransform.opacity }} />
                                        <div className="absolute inset-0 border-2 border-blue-500/40 rounded-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div 
                                                className="absolute -bottom-4 -right-4 w-10 h-10 bg-white border-2 border-blue-600 rounded-full pointer-events-auto shadow-2xl flex items-center justify-center cursor-nwse-resize hover:scale-110 transition-transform z-10"
                                                onMouseDown={(e) => { e.stopPropagation(); startResize(e.clientX, e.clientY, e.currentTarget.parentElement!.getBoundingClientRect()); }}
                                                onTouchStart={(e) => { e.stopPropagation(); if (e.touches.length > 0) startResize(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.parentElement!.getBoundingClientRect()); }}
                                            >
                                                <Maximize2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div 
                                                className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-blue-600 rounded-full pointer-events-auto shadow-2xl flex items-center justify-center cursor-crosshair hover:scale-110 transition-transform z-10"
                                                onMouseDown={(e) => { e.stopPropagation(); startRotate(e.clientX, e.clientY, e.currentTarget.parentElement!.getBoundingClientRect()); }}
                                                onTouchStart={(e) => { e.stopPropagation(); if (e.touches.length > 0) startRotate(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.parentElement!.getBoundingClientRect()); }}
                                            >
                                                <RotateCw className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div 
                                                className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 border-2 border-white rounded-full pointer-events-auto shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10" 
                                                onClick={(e) => { e.stopPropagation(); removeCurrentPrint(); }}
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
                                <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed text-gray-400">Mockup Hazırlamak İçin<br/>Önce Kıyafet Yükleyin</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Tools Toolbar */}
                <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-center sm:justify-start gap-1 shrink-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    {[
                        { id: 'bg', icon: Layers, label: 'Zemin' },
                        { id: 'filter', icon: Sun, label: 'Işık' },
                        { id: 'transform', icon: Move, label: 'Hizala' },
                    ].map(tool => (
                        <button key={tool.id} onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)} className={`flex flex-col items-center justify-center min-w-[70px] h-12 rounded-xl transition-all ${selectedTool === tool.id ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <tool.icon className="w-4 h-4 mb-1" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">{tool.label}</span>
                        </button>
                    ))}
                    {selectedTool && (
                        <div className="absolute bottom-16 sm:left-4 left-4 right-4 sm:right-auto bg-white shadow-2xl border border-gray-100 p-4 rounded-3xl z-30 animate-slideUp min-w-[280px]">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{selectedTool} KONTROLLERİ</span>
                                <button onClick={() => setSelectedTool(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-3 h-3 text-gray-400"/></button>
                            </div>
                            {selectedTool === 'bg' && (
                                <div className="grid grid-cols-4 gap-3">
                                    {['#ffffff', '#000000', '#f1f5f9', 'transparent'].map(c => (
                                        <button key={c} onClick={() => setBackground(c)} className={`w-10 h-10 rounded-xl border-2 transition-all ${background === c ? 'border-blue-600 scale-105 shadow-md ring-2 ring-blue-50' : 'border-gray-100 hover:border-gray-200'}`} style={{backgroundColor: c !== 'transparent' ? c : undefined}} />
                                    ))}
                                </div>
                            )}
                            {selectedTool === 'filter' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5"><span className="text-[9px] font-black text-gray-500 uppercase">Parlaklık</span><input type="range" max="200" value={filters.brightness} onChange={(e)=>setFilters(f=>({...f,brightness:Number(e.target.value)}))} className="w-full h-1.5 bg-gray-100 rounded-lg accent-blue-600 cursor-pointer"/></div>
                                    <div className="flex flex-col gap-1.5"><span className="text-[9px] font-black text-gray-500 uppercase">Kontrast</span><input type="range" max="200" value={filters.contrast} onChange={(e)=>setFilters(f=>({...f,contrast:Number(e.target.value)}))} className="w-full h-1.5 bg-gray-100 rounded-lg accent-blue-600 cursor-pointer"/></div>
                                </div>
                            )}
                            {selectedTool === 'transform' && (
                                <div className="space-y-3 text-center">
                                    <button onClick={() => setPrintTransform(p => ({...p, x: 0, y: 0}))} className="w-full py-2 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100">Merkeze Al</button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setPrintTransform(p => ({...p, rotate: p.rotate - 90}))} className="py-2 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 flex items-center justify-center gap-1.5"><RotateCcw className="w-3 h-3"/> -90°</button>
                                        <button onClick={() => setPrintTransform(p => ({...p, rotate: p.rotate + 90}))} className="py-2 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 flex items-center justify-center gap-1.5">+90° <RotateCw className="w-3 h-3"/></button>
                                    </div>
                                    <button onClick={() => setPrintTransform(p => ({...p, rotate: 0}))} className="w-full py-1 text-red-500 text-[8px] font-black uppercase tracking-widest">Sıfırla</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Design Control Center */}
            <div className={`fixed inset-y-0 right-0 z-40 w-72 bg-white shadow-2xl transition-transform duration-500 xl:relative xl:translate-x-0 border-l border-gray-100 flex flex-col ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center text-gray-700"><Layers className="w-3.5 h-3.5 mr-2 text-blue-500" /> TASARIM MERKEZİ</h3>
                    <button onClick={() => setIsRightPanelOpen(false)} className="xl:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X className="w-3.5 h-3.5 text-gray-400"/></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    <div onClick={() => printInputRef.current?.click()} className="border-2 border-dashed border-gray-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50/20 hover:text-blue-600 transition-all cursor-pointer group bg-gray-50/30">
                        <div className="w-14 h-14 bg-white rounded-[24px] flex items-center justify-center shadow-xl mb-4 group-hover:scale-105 transition-transform ring-4 ring-gray-50">
                            <Plus className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-center leading-relaxed">LOGONU VEYA DESENİNİ<br/>YÜKLEMEK İÇİN TIKLA</span>
                        <input ref={printInputRef} type="file" multiple hidden accept="image/*" onChange={handlePrintUpload} />
                    </div>

                    {currentPrint && (
                        <div className="p-4 bg-white border-2 border-gray-100 rounded-[28px] shadow-lg animate-fadeIn relative group overflow-hidden">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    <img src={currentPrint} className="w-16 h-16 object-contain bg-gray-50 rounded-xl border border-gray-100 p-1.5 shadow-inner" />
                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white"><CheckCircle2 className="w-3 h-3" /></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Aktif Tasarım</p>
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Yüklendi</p>
                                </div>
                            </div>
                            <button onClick={removeCurrentPrint} className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[9px] font-black uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"><Trash2 className="w-3 h-3" /> SİL VE SIRADAKİ</button>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-2.5 shrink-0">
                    <button onClick={handleSaveToPool} disabled={!baseImage || !currentPrint} className={`w-full py-4 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${!baseImage || !currentPrint ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'}`}><Save className="w-4 h-4" /> HAVUZA KAYDET</button>
                    <button onClick={() => { setIsCreateProductModalOpen(true); setCreationStep('type'); }} disabled={generatedVariations.length === 0} className={`w-full py-4 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${generatedVariations.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-500/30'}`}><PackagePlus className="w-4 h-4" /> ÜRÜN OLUŞTUR</button>
                </div>
            </div>
        </div>

        <VariationsPool 
          variations={generatedVariations} 
          onClear={() => setGeneratedVariations([])} 
          onEdit={(v) => {
            setBackground(v.state.background);
            setCurrentPrint(v.state.currentPrint);
            setPrintTransform(v.state.printTransform);
            setFilters(v.state.filters);
          }} 
        />

        <CreateProductModal 
          isOpen={isCreateProductModalOpen}
          onClose={() => setIsCreateProductModalOpen(false)}
          creationStep={creationStep}
          setCreationStep={setCreationStep}
          creationMode={creationMode}
          setCreationMode={setCreationMode}
          selectedVariationIds={selectedVariationIds}
          toggleVariationSelection={toggleVariationSelection}
          generatedVariations={generatedVariations}
          creationPrice={creationPrice}
          setCreationPrice={setCreationPrice}
          creationStock={creationStock}
          setCreationStock={setCreationStock}
          handleFinalizeCreation={handleFinalizeCreation}
        />
    </div>
  );
});
