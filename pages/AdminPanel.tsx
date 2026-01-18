
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Calendar,
  X,
  AlertTriangle,
  Loader2,
  UserCheck,
  UserX,
  RefreshCw,
  Key,
  Lock,
  Eye,
  EyeOff,
  ImageIcon,
  LayoutGrid,
  Filter,
  Download,
  ExternalLink,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { User, MediaItem } from '../types';
import { syncService } from '../services/apiService';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'media'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'block' | 'unblock' | 'changePassword' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Media Filtering
  const [selectedMediaUser, setSelectedMediaUser] = useState<string>('all');
  
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);
    
    try {
      const [fetchedUsers, fetchedMedia] = await Promise.all([
        syncService.fetchUsers(),
        syncService.fetchMedia()
      ]);
      
      setUsers(fetchedUsers.sort((a: User, b: User) => b.createdAt - a.createdAt));
      setMediaItems(fetchedMedia);
    } catch (error) {
      console.error("Senkronizasyon hatası:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData(true);
    window.addEventListener('elnoya_users_updated', handleSync);
    window.addEventListener('elnoya_media_updated', handleSync);
    const interval = setInterval(() => loadData(true), 10000);
    return () => {
      window.removeEventListener('elnoya_users_updated', handleSync);
      window.removeEventListener('elnoya_media_updated', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Kullanıcıların yüklediği resim sayılarını hesapla
  const userMediaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mediaItems.forEach(item => {
      counts[item.uploadedBy] = (counts[item.uploadedBy] || 0) + 1;
    });
    return counts;
  }, [mediaItems]);

  // Benzersiz yükleyici listesini al
  const uniqueUploaders = useMemo(() => {
    return Array.from(new Set(mediaItems.map(m => m.uploadedBy))).sort();
  }, [mediaItems]);

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;
    let updatedUsers = [...users];
    if (actionType === 'delete') {
      updatedUsers = updatedUsers.filter(u => u.username !== selectedUser.username);
    } else if (actionType === 'block') {
      updatedUsers = updatedUsers.map(u => 
        u.username === selectedUser.username ? { ...u, status: 'blocked' as const } : u
      );
    } else if (actionType === 'unblock') {
      updatedUsers = updatedUsers.map(u => 
        u.username === selectedUser.username ? { ...u, status: 'active' as const } : u
      );
    } else if (actionType === 'changePassword') {
      if (!newPassword || newPassword.length < 4) {
        alert('Şifre en az 4 karakter olmalıdır.');
        return;
      }
      updatedUsers = updatedUsers.map(u => 
        u.username === selectedUser.username ? { ...u, password: newPassword } : u
      );
    }

    localStorage.setItem('elnoya_users', JSON.stringify(updatedUsers));
    window.dispatchEvent(new CustomEvent('elnoya_users_updated'));
    setUsers(updatedUsers);
    setSelectedUser(null);
    setActionType(null);
    setNewPassword('');
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("Bu resmi kütüphaneden silmek istediğinize emin misiniz?")) return;
    const success = await syncService.deleteMedia(id);
    if (success) {
      setMediaItems(prev => prev.filter(m => m.id !== id));
    } else {
      const updatedMedia = mediaItems.filter(m => m.id !== id);
      localStorage.setItem('elnoya_global_media', JSON.stringify(updatedMedia));
      setMediaItems(updatedMedia);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedia = mediaItems.filter(m => {
    const matchesSearch = m.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUserFilter = selectedMediaUser === 'all' || m.uploadedBy === selectedMediaUser;
    return matchesSearch && matchesUserFilter;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalImages: mediaItems.length,
    uniqueUploaders: uniqueUploaders.length
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fadeIn space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
        <div className="shrink-0">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" /> Elnoya Kontrol Paneli
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">Global Sistem Yönetimi (Senkronize)</p>
             {isSyncing && <RefreshCw className="w-3 h-3 text-primary-500 animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
          {[
            { label: 'Global Üye', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Aktif', value: stats.activeUsers, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Global Medya', value: stats.totalImages, icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Tasarımcılar', value: stats.uniqueUploaders, icon: LayoutGrid, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4" /> Kullanıcılar
        </button>
        <button 
          onClick={() => { setActiveTab('media'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'media' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ImageIcon className="w-4 h-4" /> Medya Kütüphanesi
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm flex flex-col min-h-[600px]">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={activeTab === 'users' ? "Kullanıcı adı veya e-posta..." : "Görsel ara..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Bulut Senkronizasyonu Aktif</span>
             <button onClick={() => loadData()} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all">
               <Loader2 className={`w-5 h-5 ${loading || isSyncing ? 'animate-spin text-primary-600' : ''}`} />
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'media' && (
            <div className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col shrink-0">
               <div className="p-4 border-b border-gray-100">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Yükleyiciye Göre</h3>
                  <button 
                    onClick={() => setSelectedMediaUser('all')}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all mb-1 ${selectedMediaUser === 'all' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                     <span>Tüm Görseller</span>
                     <span className={`text-[10px] ${selectedMediaUser === 'all' ? 'text-white/70' : 'text-gray-400'}`}>{mediaItems.length}</span>
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                  {uniqueUploaders.map(uploader => (
                    <button 
                      key={uploader}
                      onClick={() => setSelectedMediaUser(uploader)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedMediaUser === uploader ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-500/20' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <UserIcon className={`w-3.5 h-3.5 ${selectedMediaUser === uploader ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className="flex-1 text-left truncate">@{uploader}</span>
                      <span className="text-[10px] text-gray-400">{userMediaCounts[uploader] || 0}</span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="flex-1 overflow-x-auto overflow-y-auto">
            {activeTab === 'users' ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-5">Kullanıcı Bilgileri</th>
                    <th className="px-6 py-5">Rol / Durum</th>
                    <th className="px-6 py-5">Kayıt Tarihi</th>
                    <th className="px-8 py-5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          {loading ? <Loader2 className="w-12 h-12 mb-4 animate-spin" /> : <Users className="w-16 h-16 mb-4" />}
                          <p className="font-black uppercase tracking-widest text-sm">{loading ? 'Veriler Buluttan Çekiliyor...' : 'Kullanıcı bulunamadı'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.username} className="hover:bg-gray-50/50 transition-all group animate-fadeIn">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${user.role === 'admin' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-gray-900 text-sm flex items-center gap-2">
                                {user.username}
                              </div>
                              <div className="flex items-center text-[11px] text-gray-400 font-bold mt-0.5">
                                <Mail className="w-3 h-3 mr-1" /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {user.role}
                             </span>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status === 'active' ? 'AKTİF' : 'DONDURULDU'}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5 mr-2 opacity-40" />
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => { setSelectedUser(user); setActionType('changePassword'); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Şifre Değiştir"><Key className="w-4 h-4" /></button>
                            {user.status === 'active' ? (
                              <button onClick={() => { setSelectedUser(user); setActionType('block'); }} className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm" title="Hesabı Dondur"><Ban className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={() => { setSelectedUser(user); setActionType('unblock'); }} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Hesabı Aktif Et"><CheckCircle2 className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => { setSelectedUser(user); setActionType('delete'); }} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Hesabı Sil"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <ImageIcon className="w-5 h-5 text-primary-600" />
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">
                        {selectedMediaUser === 'all' ? 'TÜM KULLANICILARIN GÖRSELLERİ' : `@${selectedMediaUser} Kullanıcısının Görselleri`}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold">Toplam {filteredMedia.length} dosya listeleniyor.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                  {filteredMedia.length === 0 ? (
                     <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="font-black uppercase tracking-widest text-sm text-gray-300">Bu bölümde görsel bulunamadı</p>
                     </div>
                  ) : (
                    filteredMedia.map((media) => (
                      <div key={media.id} className="group relative animate-fadeIn">
                         <div 
                           onClick={() => setPreviewImage(media.url)}
                           className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-primary-500 transition-all cursor-zoom-in shadow-sm hover:shadow-xl hover:-translate-y-1"
                         >
                           <img src={media.url} className="w-full h-full object-cover" loading="lazy" />
                           <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[9px] font-black text-white truncate uppercase tracking-tighter">@{media.uploadedBy}</p>
                              <p className="text-[7px] text-gray-300 font-bold uppercase">{new Date(media.timestamp).toLocaleDateString('tr-TR')}</p>
                           </div>
                         </div>
                         <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-20">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteMedia(media.id); }}
                              className="w-8 h-8 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                            <a 
                              href={media.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="w-8 h-8 bg-white text-gray-700 rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                               <ExternalLink className="w-4 h-4" />
                            </a>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fadeIn" onClick={() => setPreviewImage(null)}>
           <button className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
             <X className="w-8 h-8" />
           </button>
           <img src={previewImage} className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl animate-scaleIn object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Action Modals */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn relative overflow-hidden">
            {actionType === 'changePassword' ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
                   <Key className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Şifre Değiştir</h3>
                <p className="text-gray-500 font-medium mb-8">
                  <span className="font-black text-gray-900">@{selectedUser.username}</span> kullanıcısı için yeni bir şifre belirleyin.
                </p>
                
                <div className="relative mb-8">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Yeni Şifre"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-12 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { setSelectedUser(null); setActionType(null); }}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={handleAction}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl"
                  >
                    ŞİFREYİ GÜNCELLE
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${actionType === 'delete' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                   <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Emin misiniz?</h3>
                <p className="text-gray-500 font-medium mb-8">
                  @{selectedUser.username} kullanıcısı dondurulacaktır.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => { setSelectedUser(null); setActionType(null); }} className="flex-1 py-4 bg-gray-100 rounded-2xl">İPTAL</button>
                  <button onClick={handleAction} className={`flex-[2] py-4 text-white rounded-2xl font-black uppercase ${actionType === 'delete' ? 'bg-red-600' : 'bg-orange-50'}`}>EVET</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
