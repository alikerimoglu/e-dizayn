
import { MediaItem, User } from '../types';
import { syncService } from './apiService';

/**
 * Kullanıcının sağladığı upload.php dosyasıyla entegre çalışan yükleme servisi.
 */
export const uploadImageToServer = async (fileOrBase64: File | string): Promise<string | null> => {
  const formData = new FormData();
  
  if (typeof fileOrBase64 === 'string') {
    try {
      const response = await fetch(fileOrBase64);
      const blob = await response.blob();
      formData.append('file', blob, `elnoya_${Date.now()}.png`);
    } catch (e) {
      console.error("Base64 dönüşüm hatası:", e);
      return null;
    }
  } else {
    formData.append('file', fileOrBase64);
  }

  try {
    const response = await fetch('/upload.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Sunucu hatası');
    }

    const data = await response.json();
    if (data.success && data.url) {
      const sessionStr = localStorage.getItem('elnoya_session');
      const currentUser: User | null = sessionStr ? JSON.parse(sessionStr) : null;
      const uploadedBy = currentUser ? currentUser.username : 'Misafir';

      const newItem: MediaItem = {
        id: Math.random().toString(36).substr(2, 9),
        url: data.url,
        uploadedBy,
        timestamp: Date.now()
      };

      await syncService.logMedia(newItem);
      window.dispatchEvent(new CustomEvent('elnoya_media_updated'));
      
      return data.url;
    } else {
      console.error('Yükleme başarısız:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    return null;
  }
};
