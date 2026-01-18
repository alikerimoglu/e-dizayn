
import { User, MediaItem } from '../types';

/**
 * Elnoya Global Senkronizasyon Servisi
 * Verilerin tüm dünyadan erişilebilir olması için merkezi bir API ile çalışır.
 */

const API_ENDPOINT = '/api.php';

export const syncService = {
  async fetchUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_ENDPOINT}?action=get_users`);
      if (!response.ok) throw new Error('Sunucu hatası');
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.warn("API erişilemedi, yerel veriler kullanılıyor.");
      return JSON.parse(localStorage.getItem('elnoya_users') || '[]');
    }
  },

  async saveUser(user: User): Promise<boolean> {
    try {
      const response = await fetch(`${API_ENDPOINT}?action=save_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return response.ok;
    } catch (error) {
      const users = JSON.parse(localStorage.getItem('elnoya_users') || '[]');
      localStorage.setItem('elnoya_users', JSON.stringify([...users, user]));
      return false;
    }
  },

  async fetchMedia(): Promise<MediaItem[]> {
    try {
      const response = await fetch(`${API_ENDPOINT}?action=get_media`);
      if (!response.ok) throw new Error('Sunucu hatası');
      const data = await response.json();
      return data.media || [];
    } catch (error) {
      return JSON.parse(localStorage.getItem('elnoya_global_media') || '[]');
    }
  },

  async logMedia(media: MediaItem): Promise<boolean> {
    try {
      const response = await fetch(`${API_ENDPOINT}?action=log_media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      });
      return response.ok;
    } catch (error) {
      const mediaList = JSON.parse(localStorage.getItem('elnoya_global_media') || '[]');
      localStorage.setItem('elnoya_global_media', JSON.stringify([media, ...mediaList]));
      return false;
    }
  },

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_ENDPOINT}?action=delete_media&id=${id}`, { method: 'DELETE' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
