
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from "@google/genai";
import { Mic, MicOff, X, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { Product, NavSection } from '../types';

interface VoiceAssistantProps {
  onNavigate: (page: NavSection) => void;
  products: Product[];
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (ids: string[]) => void;
  onBulkPriceUpdate: (ids: string[], price: number) => void;
  onBulkStockUpdate: (ids: string[], stock: number) => void;
  onBulkAutoName: () => void;
  onSingleAutoName: (product: Product) => void;
  onDesignAction?: (action: string, args?: any) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  onNavigate, 
  products,
  selectedIds,
  onSelectAll,
  onDeselectAll, 
  onUpdateProduct, 
  onAddProduct,
  onDeleteProduct,
  onBulkPriceUpdate,
  onBulkStockUpdate,
  onBulkAutoName,
  onSingleAutoName,
  onDesignAction
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to hold latest state for callbacks
  const productsRef = useRef(products);
  const selectedIdsRef = useRef(selectedIds);
  const onNavigateRef = useRef(onNavigate);
  const onSelectAllRef = useRef(onSelectAll);
  const onDeselectAllRef = useRef(onDeselectAll);
  const onUpdateProductRef = useRef(onUpdateProduct);
  const onAddProductRef = useRef(onAddProduct);
  const onDeleteProductRef = useRef(onDeleteProduct);
  const onBulkPriceUpdateRef = useRef(onBulkPriceUpdate);
  const onBulkStockUpdateRef = useRef(onBulkStockUpdate);
  const onBulkAutoNameRef = useRef(onBulkAutoName);
  const onSingleAutoNameRef = useRef(onSingleAutoName);
  const onDesignActionRef = useRef(onDesignAction);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    productsRef.current = products;
    selectedIdsRef.current = selectedIds;
  }, [products, selectedIds]);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
    onSelectAllRef.current = onSelectAll;
    onDeselectAllRef.current = onDeselectAll;
    onUpdateProductRef.current = onUpdateProduct;
    onAddProductRef.current = onAddProduct;
    onDeleteProductRef.current = onDeleteProduct;
    onBulkPriceUpdateRef.current = onBulkPriceUpdate;
    onBulkStockUpdateRef.current = onBulkStockUpdate;
    onBulkAutoNameRef.current = onBulkAutoName;
    onSingleAutoNameRef.current = onSingleAutoName;
    onDesignActionRef.current = onDesignAction;
  }, [onNavigate, onSelectAll, onDeselectAll, onUpdateProduct, onAddProduct, onDeleteProduct, onBulkPriceUpdate, onBulkStockUpdate, onBulkAutoName, onSingleAutoName, onDesignAction]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const tools: FunctionDeclaration[] = [
    {
      name: 'navigatePage',
      description: 'Navigates the user to a specific page or section of the application.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          page: {
            type: Type.STRING,
            description: 'The page to navigate to.',
            enum: ['dashboard', 'products', 'orders', 'ai-hub', 'settings', 'design']
          }
        },
        required: ['page']
      }
    },
    {
      name: 'designStartMasking',
      description: 'Starts the area selection mode (masking) in Design Studio.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'designRemoveBackground',
      description: 'Triggers background removal for the current base image in the Design Studio.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'designSaveToPool',
      description: 'Saves the current design to the variation pool in Design Studio.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'designCreateProduct',
      description: 'Converts designs from the studio into actual products in the inventory.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          mode: { 
            type: Type.STRING, 
            description: 'Selection mode: single (current design), bulk (all in pool), favorites (only starred).',
            enum: ['single', 'bulk', 'favorites']
          }
        },
        required: ['mode']
      }
    },
    {
      name: 'designSetBackgroundColor',
      description: 'Changes the background color of the design canvas.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          color: { type: Type.STRING, description: 'Hex code or color name (e.g., #ffffff, black, red, transparent)' }
        },
        required: ['color']
      }
    },
    {
      name: 'designClearPool',
      description: 'Removes all saved variations from the design pool.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'updateProduct',
      description: 'Updates details of a single product like price, stock, or name. Find product by SKU (el1), Name, or Barcode.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          searchTerm: { type: Type.STRING, description: 'SKU, Barcode, or Product Name' },
          price: { type: Type.NUMBER, description: 'New price (optional)' },
          stock: { type: Type.NUMBER, description: 'New stock quantity (optional)' },
          name: { type: Type.STRING, description: 'New product name (optional)' }
        },
        required: ['searchTerm']
      }
    },
    {
      name: 'selectAllProducts',
      description: 'Selects all products in the list by checking their checkboxes.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'unselectAllProducts',
      description: 'Unselects all products (unchecks all checkboxes).',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'bulkDeleteAllProducts',
      description: 'Deletes ALL products in the inventory immediately.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'deleteSelectedProducts',
      description: 'Deletes only the currently selected (checked) products.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'bulkUpdatePrice',
      description: 'Updates the price of ALL products in the inventory to a specific value.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          price: { type: Type.NUMBER, description: 'The new price to set for all products.' }
        },
        required: ['price']
      }
    },
    {
      name: 'bulkUpdateStock',
      description: 'Updates the stock quantity of ALL products in the inventory to a specific value.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          stock: { type: Type.NUMBER, description: 'The new stock quantity to set for all products.' }
        },
        required: ['stock']
      }
    },
    {
      name: 'bulkAutoGenerateNames',
      description: 'Triggers AI to automatically generate names for ALL products based on their images.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
      }
    },
    {
      name: 'autoGenerateName',
      description: 'Triggers AI to automatically generate the name for a SINGLE specific product based on its image.',
      parameters: {
        type: Type.OBJECT,
        properties: {
            searchTerm: { type: Type.STRING, description: 'SKU, Barcode, or Product Name' }
        },
        required: ['searchTerm']
      }
    },
    {
      name: 'createProduct',
      description: 'Creates a new product with specified details. Auto-generates SKU and Barcode.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Product Name' },
          price: { type: Type.NUMBER, description: 'Price (optional, default 0)' },
          stock: { type: Type.NUMBER, description: 'Stock (optional, default 0)' }
        },
        required: ['name']
      }
    },
    {
      name: 'deleteProduct',
      description: 'Deletes a product found by SKU, Barcode, or Name.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          searchTerm: { type: Type.STRING, description: 'SKU, Barcode, or Product Name' }
        },
        required: ['searchTerm']
      }
    },
    {
      name: 'getProductDetails',
      description: 'Retrieves full details of a product.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          searchTerm: { type: Type.STRING, description: 'SKU, Barcode, or Product Name' }
        },
        required: ['searchTerm']
      }
    }
  ];

  const findProduct = (term: string): Product | undefined => {
      const normalizedTerm = term.toLowerCase().replace(/\s+/g, '');
      return productsRef.current.find(p => 
          p.id === term || 
          p.sku.toLowerCase() === normalizedTerm || 
          p.barcode === term ||
          p.name.toLowerCase().includes(term.toLowerCase())
      );
  };

  const generateNextSku = (): string => {
      let maxEl = 0;
      productsRef.current.forEach(p => {
          const match = p.sku.match(/^el(\d+)$/i);
          if (match) {
              const num = parseInt(match[1]);
              if (num > maxEl) maxEl = num;
          }
      });
      return `el${maxEl + 1}`;
  };

  const generateBarcode = (): string => {
     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
     let result = "";
     for(let i=0; i<8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
     return result;
  };

  const generateModelCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "elnoya.";
    for(let i=0; i<6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const handleToolCall = async (fc: any) => {
      console.log("Voice Tool:", fc.name, fc.args);
      let result = "Action failed";

      try {
          if (fc.name === 'navigatePage') {
             onNavigateRef.current(fc.args.page as NavSection);
             result = `Navigated to ${fc.args.page}.`;
          } 
          // TASARIM KOMUTLARI
          else if (fc.name === 'designStartMasking') {
            onDesignActionRef.current?.('startMasking');
            result = "Area selection mode started. Please draw the print area.";
          }
          else if (fc.name === 'designRemoveBackground') {
             onDesignActionRef.current?.('removeBackground');
             result = "Removing background from design.";
          }
          else if (fc.name === 'designSaveToPool') {
             onDesignActionRef.current?.('saveToPool');
             result = "Current design saved to pool.";
          }
          else if (fc.name === 'designCreateProduct') {
             onDesignActionRef.current?.('createProduct', fc.args.mode);
             result = `Converting designs to products (Mode: ${fc.args.mode}).`;
          }
          else if (fc.name === 'designSetBackgroundColor') {
             onDesignActionRef.current?.('setBackground', fc.args.color);
             result = `Design background color changed to ${fc.args.color}.`;
          }
          else if (fc.name === 'designClearPool') {
             onDesignActionRef.current?.('clearPool');
             result = "Design pool cleared.";
          }
          // ÜRÜN KOMUTLARI
          else if (fc.name === 'updateProduct') {
             const { searchTerm, price, stock, name } = fc.args;
             const product = findProduct(searchTerm as string);
             if (product) {
                 const updates: Partial<Product> = {};
                 if (price !== undefined) updates.price = Number(price);
                 if (stock !== undefined) updates.stock = Number(stock);
                 if (name !== undefined) updates.name = String(name);
                 onUpdateProductRef.current({ ...product, ...updates });
                 result = `Updated ${product.sku}.`;
             } else { result = "Product not found."; }
          }
          else if (fc.name === 'selectAllProducts') {
             onSelectAllRef.current();
             result = "All products selected.";
          }
          else if (fc.name === 'unselectAllProducts') {
             onDeselectAllRef.current();
             result = "All products unselected.";
          }
          else if (fc.name === 'bulkDeleteAllProducts') {
             const allIds = productsRef.current.map(p => p.id);
             onDeleteProductRef.current(allIds);
             result = `Deleted all products.`;
          }
          else if (fc.name === 'bulkUpdatePrice') {
             const allIds = productsRef.current.map(p => p.id);
             onBulkPriceUpdateRef.current(allIds, Number(fc.args.price));
             result = `Updated all prices.`;
          }
          else if (fc.name === 'createProduct') {
             const { name, price, stock } = fc.args;
             const newProduct: Product = {
                 id: Date.now().toString(),
                 name: String(name || "Yeni Ürün"),
                 sku: generateNextSku(),
                 barcode: generateBarcode(),
                 modelCode: generateModelCode(),
                 stock: Number(stock || 0),
                 price: Number(price || 0),
                 marketplaceStatus: { trendyol: false, hepsiburada: false, n11: false },
                 images: [],
             };
             onAddProductRef.current(newProduct);
             result = `Created product ${newProduct.sku}.`;
          }
      } catch (e: any) {
          result = `Error: ${e.message}`;
      }

      return {
         id: fc.id,
         name: fc.name,
         response: { result }
      };
  };

  const stopSession = () => {
    if (sessionRef.current) {
        try { sessionRef.current.close(); } catch (e) {}
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  };

  const startSession = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputNode = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      let nextStartTime = 0;
      const sources = new Set<AudioBufferSourceNode>();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: tools }],
          systemInstruction: "You are the Elnoya Super Admin Voice Assistant. You can manage products AND design tasks. For Design Studio: you can start area selection (masking), remove backgrounds, save to pool, clear pool, change canvas color, and create products from designs. If the user asks for design tasks and they aren't on the design page, recommend navigating there first.",
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            scriptProcessor.onaudioprocess = (e) => {
               const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
               sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            inputNode.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall) {
                const responses = [];
                for (const fc of msg.toolCall.functionCalls) {
                    responses.push(await handleToolCall(fc));
                }
                sessionPromise.then(s => s.sendToolResponse({ functionResponses: responses }));
            }
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                setIsSpeaking(true);
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), outputAudioContext);
                const source = outputAudioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(outputAudioContext.destination);
                source.onended = () => {
                    sources.delete(source);
                    if (sources.size === 0) setIsSpeaking(false);
                };
                source.start(nextStartTime);
                nextStartTime += buffer.duration;
                sources.add(source);
            }
          },
          onclose: () => stopSession(),
          onerror: (err) => {
             stopSession();
             setError("Bağlantı kesildi");
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      stopSession();
      setError('Bağlantı hatası');
    }
  };

  function createBlob(data: Float32Array): Blob { 
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function decode(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const int16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, int16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < int16.length; i++) channelData[i] = int16[i] / 32768.0;
    return buffer;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
        {error && (
            <div className="absolute bottom-full mb-3 right-0 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap animate-bounce flex items-center text-sm font-bold z-50">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
                <div className="absolute -bottom-1 right-8 w-2 h-2 bg-red-600 rotate-45"></div>
            </div>
        )}
        {!isActive ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 ${isConnecting ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
          >
             {isConnecting ? <AlertCircle className="animate-spin text-white"/> : <Mic className="w-8 h-8 text-white" />}
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden flex flex-col">
             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                   <Sparkles className="w-5 h-5 animate-pulse" />
                   <span className="font-bold">Elnoya Asistan</span>
                </div>
                <button onClick={stopSession} className="hover:bg-white/20 p-1 rounded-full">
                   <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-6 flex flex-col items-center justify-center space-y-4">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'bg-purple-100 ring-8 ring-purple-50' : 'bg-gray-50'}`}>
                    {isSpeaking ? (
                        <Volume2 className="w-10 h-10 text-purple-600 animate-pulse" />
                    ) : (
                        <div className="flex space-x-1 h-8 items-center">
                            <div className="w-1.5 bg-purple-500 h-4 animate-wave"></div>
                            <div className="w-1.5 bg-purple-500 h-8 animate-wave delay-75"></div>
                            <div className="w-1.5 bg-purple-500 h-6 animate-wave delay-150"></div>
                            <div className="w-1.5 bg-purple-500 h-4 animate-wave delay-200"></div>
                        </div>
                    )}
                 </div>
                 <p className="text-sm text-gray-500 font-medium text-center">
                     {isSpeaking ? "Asistan konuşuyor..." : "Sizi dinliyorum. Tasarım yapabilir veya ürün yönetebilirim."}
                 </p>
                 <button 
                   onClick={stopSession}
                   className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold border border-red-100 px-3 py-1 rounded-full hover:bg-red-50"
                 >
                    Görüşmeyi Bitir
                 </button>
             </div>
          </div>
        )}
        <style>{`
          @keyframes wave {
            0%, 100% { height: 10px; }
            50% { height: 30px; }
          }
          .animate-wave {
            animation: wave 1s ease-in-out infinite;
          }
        `}</style>
    </div>
  );
};
