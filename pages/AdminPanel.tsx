
import React, { useState, useEffect } from 'react';
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
  EyeOff
} from 'lucide-react';
import { User } from '../types';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'block' | 'unblock' | 'changePassword' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);
    
    const storedUsers = JSON.parse(localStorage.getItem('elnoya_users') || '[]');
    const sortedUsers = storedUsers.sort((a: User, b: User) => b.createdAt - a.createdAt);
    setUsers(sortedUsers);
    
    setLoading(false);
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    loadUsers();
    
    // Custom event listener for same-tab updates
    const handleSync = () => loadUsers(true);
    window.addEventListener('elnoya_users_updated', handleSync);
    
    // Storage event listener for cross-tab updates
    window.addEventListener('storage', (e) => {
      if (e.key === 'elnoya_users') {
        loadUsers(true);
      }
    });

    // Fallback polling
    const interval = setInterval(() => {
      loadUsers(true);
    }, 5000);

    return () => {
      window.removeEventListener('elnoya_users_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, []);

  const handleAction = () => {
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
    setShowPassword(false);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fadeIn space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
        <div className="shrink-0">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" /> Site Yönetimi
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">Tüm kullanıcılar ve sistem kontrolleri</p>
             {isSyncing && <RefreshCw className="w-3 h-3 text-primary-500 animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
          {[
            { label: 'Toplam Üye', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Aktif Kullanıcı', value: stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Yönetici', value: stats.admins, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Engelli', value: stats.blocked, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
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

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Kullanıcı adı veya e-posta ile ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Anlık Veri Senkronu Aktif</span>
             <button onClick={() => loadUsers()} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all">
               <Loader2 className={`w-5 h-5 ${loading || isSyncing ? 'animate-spin text-primary-600' : ''}`} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
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
                      <Users className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm">Kullanıcı bulunamadı</p>
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
                            {Date.now() - user.createdAt < 30000 && (
                                <span className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">YENİ</span>
                            )}
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
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')} {new Date(user.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => { setSelectedUser(user); setActionType('changePassword'); }}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Şifre Değiştir"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => { setSelectedUser(user); setActionType('block'); }}
                            className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            title="Hesabı Dondur"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setSelectedUser(user); setActionType('unblock'); }}
                            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="Hesabı Aktif Et"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedUser(user); setActionType('delete'); }}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Hesabı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { setSelectedUser(null); setActionType(null); setNewPassword(''); }}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={handleAction}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    ŞİFREYİ GÜNCELLE
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${actionType === 'delete' ? 'bg-red-600' : 'bg-orange-500'}`}></div>
                
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${actionType === 'delete' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                   <AlertTriangle className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Emin misiniz?</h3>
                <p className="text-gray-500 font-medium mb-8">
                  <span className="font-black text-gray-900">@{selectedUser.username}</span> kullanıcısı üzerinde <span className="font-bold text-primary-600 underline">
                    {actionType === 'delete' ? 'silme' : (actionType === 'block' ? 'dondurma' : 'aktif etme')}
                  </span> işlemi yapmak istediğinize emin misiniz? Bu işlem geri alınamayabilir.
                </p>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { setSelectedUser(null); setActionType(null); }}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={handleAction}
                    className={`flex-[2] py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${actionType === 'delete' ? 'bg-red-600 shadow-red-500/20 hover:bg-red-700' : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'}`}
                  >
                    EVET, DEVAM ET
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
