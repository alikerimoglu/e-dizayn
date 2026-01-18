
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { LandingPage } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { User } from './types';
import { AlertTriangle, LogOut } from 'lucide-react';

const MainLayout: React.FC<{ 
  children: React.ReactNode; 
}> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const hideNavbarRoutes = ['/dashboard', '/login', '/register'];
  const showNavbar = !hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <>
      {showNavbar && (
        <Navbar 
          onLoginClick={() => navigate('/login')} 
          onRegisterClick={() => navigate('/register')}
          onNavigate={(page) => {
             if (page === 'home') navigate('/');
             else if (page === 'pricing') navigate('/pricing');
             else navigate(`/${page}`);
          }} 
        />
      )}
      {children}
    </>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('elnoya_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('elnoya_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('elnoya_session');
  };

  // Real-time block detection logic
  useEffect(() => {
    if (!currentUser) return;

    const checkUserStatus = () => {
      const storedUsers: User[] = JSON.parse(localStorage.getItem('elnoya_users') || '[]');
      const userInDb = storedUsers.find(u => u.email === currentUser.email || u.username === currentUser.username);
      
      if (userInDb && userInDb.status === 'blocked') {
        setIsBlockedModalOpen(true);
        // Clear session immediately
        handleLogout();
      }
    };

    // Listen for changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'elnoya_users') {
        checkUserStatus();
      }
    };

    // Listen for custom events within the same tab (Admin Panel actions)
    const handleCustomSync = () => {
      checkUserStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('elnoya_users_updated', handleCustomSync);

    // Initial check in case they were blocked while offline
    checkUserStatus();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('elnoya_users_updated', handleCustomSync);
    };
  }, [currentUser]);

  const isLoggedIn = !!currentUser;

  return (
    <HashRouter>
      <MainLayout>
        {isBlockedModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn p-4">
            <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl text-center animate-scaleIn border border-red-100">
               <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-red-50/50">
                  <AlertTriangle className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">Erişim Engellendi</h2>
               <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                  Hesabınız bir yönetici tarafından <span className="text-red-600 font-bold uppercase tracking-widest text-xs px-2 py-1 bg-red-50 rounded-lg">engellenmiştir</span>. <br/>Daha fazla bilgi için destek ekibi ile iletişime geçebilirsiniz.
               </p>
               <button 
                onClick={() => {
                  setIsBlockedModalOpen(false);
                  window.location.hash = '#/login';
                }}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                  GİRİŞ EKRANINA DÖN <LogOut className="w-4 h-4" />
               </button>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<LandingPage onStart={() => window.location.hash = '#/register'} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          
          <Route 
            path="/dashboard/*" 
            element={
              isLoggedIn ? (
                <Dashboard onLogout={handleLogout} currentUser={currentUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/dashboard/change-password" 
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" state={{ section: 'change-password' }} replace /> 
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
};

export default App;
