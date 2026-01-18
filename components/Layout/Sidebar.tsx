
import React from 'react';
import { 
  Package, 
  Grid, 
  LogOut,
  Palette,
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { NavSection } from '../../types';

interface SidebarProps {
  activeSection: any;
  onNavigate: (section: NavSection) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'user';
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  isNew?: boolean;
  adminOnly?: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, onLogout, isOpen, onClose, userRole }) => {
  const handleNavigation = (id: string) => {
    onNavigate(id as NavSection);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const menuItems: MenuItem[] = [
    { id: NavSection.INTEGRATIONS, label: 'Entegrasyonlar', icon: Grid },
    { id: NavSection.PRODUCTS, label: 'Ürünler', icon: Package },
    { id: NavSection.DESIGN, label: 'Tasarla', icon: Palette, isNew: true },
    { id: NavSection.SUBSCRIPTION, label: 'Abonelik Planları', icon: CreditCard },
    { id: NavSection.ADMIN, label: 'Admin Paneli', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div 
        className={`h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 font-sans z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
           <div className="flex items-center">
             <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2">
                E
             </div>
             <span className="font-bold text-xl text-gray-900 tracking-tight">elnoya</span>
           </div>
           <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
             <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            İşlem Menüsü
          </div>
          <nav className="space-y-1 px-3">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group select-none ${
                      isActive
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      {item.label}
                    </div>
                    
                    {item.isNew && (
                      <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px] font-bold">YENİ</span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
};
