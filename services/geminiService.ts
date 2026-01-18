
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, features: string, keywords: string): Promise<string> => {
  try {
    const prompt = `
      Sen profesyonel bir e-ticaret içerik uzmanısın.
      Aşağıdaki ürün için SEO uyumlu, satış artırıcı ve dikkat çekici bir ürün açıklaması yaz.
      HTML formatında değil, düz metin veya markdown formatında yaz.
      
      Ürün Adı: ${productName}
      Özellikler: ${features}
      Anahtar Kelimeler: ${keywords}
      
      Türkçe dilinde, profesyonel ama samimi bir ton kullan.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Açıklama oluşturulamadı.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Üzgünüz, yapay zeka şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyiniz.";
  }
};

export const analyzeCompetitorPrice = async (productName: string, currentPrice: number): Promise<string> => {
     try {
    const prompt = `
      Bir e-ticaret danışmanı olarak hareket et.
      Ürün: "${productName}"
      Mevcut Fiyatımız: ${currentPrice} TL.
      
      Bu ürün için genel bir piyasa analizi tahmini yap ve fiyatlandırma stratejisi öner.
      (Not: Gerçek zamanlı veri yerine genel stratejik tavsiye ver).
      Kısa ve öz olsun (maksimum 3 cümle).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analiz yapılamadı.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Analiz servisi şu an kullanılamıyor.";
  }
}

export const analyzeImageForProductName = async (imageUrl: string, isRegeneration: boolean = false): Promise<{color: string, text: string}> => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
        });

        const prompt = `
            Bu görseldeki kıyafet ürününü çok detaylı analiz et.
            
            İhtiyacım olan bilgiler:
            1. Ürünün ana rengi (Örn: Siyah, Antrasit, Saks Mavisi, Ekru vb.)
            2. Baskı içeriği: 
               - Eğer üzerinde metin/yazı varsa o yazıyı al.
               - Eğer yazı yoksa ama bir görsel/figür/desen varsa o figürü kısa ve vurucu şekilde betimle (Örn: "Mavi Çapkını Giyen Ayı", "Uzaylı Kedisi", "Minimalist Dağ Figürü").
               - Hiçbir şey yoksa "Sade" yaz.
            
            ${isRegeneration ? "ÖNEMLİ: Bu ürün için daha önce bir analiz yapıldı. Lütfen bu sefer farklı bir bakış açısıyla veya daha farklı kelimelerle betimleme yap (Örn: 'Ayı' yerine 'Gözlüklü Ayıcık' gibi)." : ""}

            Cevabı SADECE şu JSON formatında döndür:
            {
              "color": "Renk İsmi",
              "text": "Baskı Metni veya Figür Betimlemesi"
            }
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: blob.type, data: base64Data } },
                    { text: prompt }
                ]
            }
        });

        const textResponse = result.text?.replace(/```json|```/g, '').trim() || "{}";
        let json;
        try {
            json = JSON.parse(textResponse);
        } catch (e) {
            json = { color: "Siyah", text: "Sade" };
        }

        return {
            color: json.color || "Siyah",
            text: json.text || "Sade"
        };
    } catch (error) {
        console.error("Vision AI Error:", error);
        return { color: "Siyah", text: "Sade" };
    }
}
