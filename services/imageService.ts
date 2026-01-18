
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Bu fonksiyon ilerde gerçek bir sunucuya (Hostinger/PHP vb.) 
 * resim yüklemek istediğinizde fetch('/upload.php') ile değiştireceğiniz yerdir.
 */
export const uploadImageToServer = async (file: File): Promise<string> => {
  try {
    // Şimdilik kalıcılık için Base64 dönüştürüyoruz (Browser DB için)
    const base64 = await fileToBase64(file);
    return base64;
    
    /* 
    Gerçek sunucu örneği:
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('https://siteniz.com/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.url; 
    */
  } catch (error) {
    console.error("Image Upload Error:", error);
    throw error;
  }
};
