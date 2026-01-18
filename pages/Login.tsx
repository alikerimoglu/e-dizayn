
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: any) => void;
  initialMode?: 'signin' | 'signup';
}

export const Login: React.FC<LoginProps> = ({ onLogin, initialMode = 'signin' }) => {
  const navigate = useNavigate();
  const [isToggled, setIsToggled] = useState(initialMode === 'signup');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [isToggled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const storedUsers: User[] = JSON.parse(localStorage.getItem('elnoya_users') || '[]');

    if (isToggled) {
      const userExists = storedUsers.find((u: any) => u.email === email || u.username === username);
      
      if (userExists) {
        setError('Bu kullanıcı adı veya e-posta zaten kayıtlı.');
        return;
      }

      const isAdmin = ['admin', 'owner', 'elnoya'].includes(username.toLowerCase()) || email.toLowerCase() === 'ali.kerimog@gmail.com';
      const newUser: User = { 
        username, 
        email, 
        password, 
        role: isAdmin ? 'admin' : 'user',
        status: 'active',
        createdAt: Date.now()
      };
      
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('elnoya_users', JSON.stringify(updatedUsers));
      
      // Dispatch sync event for other components (like AdminPanel)
      window.dispatchEvent(new CustomEvent('elnoya_users_updated'));
      
      onLogin(newUser);
      navigate('/dashboard');
    } else {
      const user = storedUsers.find((u: any) => 
        (u.username === username || u.email === username) && u.password === password
      );

      if (user) {
        if (user.status === 'blocked') {
          setError('Hesabınız yönetici tarafından askıya alınmıştır.');
          return;
        }
        onLogin(user);
        navigate('/dashboard');
      } else {
        const masterEmail = 'ali.kerimog@gmail.com';
        const masterPass = 'R0707ALan';

        if ((username === masterEmail || username === 'admin') && password === masterPass) {
           const adminUser: User = { 
             username: 'Admin', 
             email: masterEmail, 
             password: masterPass, 
             role: 'admin', 
             status: 'active', 
             createdAt: Date.now() 
           };
           
           if (!storedUsers.find(u => u.email === masterEmail)) {
             const finalUsers = [...storedUsers, adminUser];
             localStorage.setItem('elnoya_users', JSON.stringify(finalUsers));
             window.dispatchEvent(new CustomEvent('elnoya_users_updated'));
           }
           
           onLogin(adminUser);
           navigate('/dashboard');
           return;
        }
        setError('Hatalı kullanıcı adı veya parola. Lütfen bilgilerinizi kontrol edin.');
      }
    }
  };

  return (
    <div className="auth-page-root">
      <style>{`
        .auth-page-root {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #030303;
          padding: 20px;
          font-family: 'Poppins', sans-serif;
          color: #fff;
          margin: 0;
        }

        .auth-wrapper {
          position: relative;
          width: 100%;
          max-width: 800px;
          height: 500px;
          border: 2px solid #e11d48;
          box-shadow: 0 0 25px rgba(225, 29, 72, 0.4);
          overflow: hidden;
          background: #0f172a;
          border-radius: 20px;
        }

        .auth-wrapper .credentials-panel {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          z-index: 10;
        }

        .credentials-panel.signin {
          left: 0;
          padding: 0 40px;
        }

        .credentials-panel.signin .slide-element {
          transform: translateX(0%);
          transition: .4s;
          opacity: 1;
        }

        .credentials-panel.signin .slide-element:nth-child(1) { transition-delay: 0.8s; }
        .credentials-panel.signin .slide-element:nth-child(2) { transition-delay: 0.9s; }
        .credentials-panel.signin .slide-element:nth-child(3) { transition-delay: 1.0s; }
        .credentials-panel.signin .slide-element:nth-child(4) { transition-delay: 1.1s; }

        .auth-wrapper.toggled .credentials-panel.signin .slide-element {
          transform: translateX(-120%);
          opacity: 0;
          transition-delay: 0s !important;
        }

        .credentials-panel.signup {
          right: 0;
          padding: 0 40px;
          pointer-events: none;
        }
        
        .auth-wrapper.toggled .credentials-panel.signup {
          pointer-events: auto;
        }

        .credentials-panel.signup .slide-element {
          transform: translateX(120%);
          transition: .4s ease;
          opacity: 0;
          filter: blur(10px);
        }

        .auth-wrapper.toggled .credentials-panel.signup .slide-element {
          transform: translateX(0%);
          opacity: 1;
          filter: blur(0px);
        }

        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(1) { transition-delay: 0.7s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(2) { transition-delay: 0.8s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(3) { transition-delay: 0.9s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(4) { transition-delay: 1.0s; }
        .auth-wrapper.toggled .credentials-panel.signup .slide-element:nth-child(5) { transition-delay: 1.1s; }

        .credentials-panel h2 {
          font-size: 32px;
          text-align: center;
          margin-bottom: 10px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 2px;
          color: #fff;
        }

        .credentials-panel .field-wrapper {
          position: relative;
          width: 100%;
          height: 50px;
          margin-top: 15px;
        }

        .field-wrapper input {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: #fff;
          font-weight: 600;
          border-bottom: 2px solid #334155;
          padding-right: 23px;
          transition: .3s;
        }

        .field-wrapper input:focus,
        .field-wrapper input:valid {
          border-bottom: 2px solid #e11d48;
        }

        .field-wrapper label {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          font-size: 16px;
          color: #94a3b8;
          transition: .3s;
          pointer-events: none;
        }

        .field-wrapper input:focus~label,
        .field-wrapper input:valid~label {
          top: -5px;
          color: #e11d48;
          font-size: 12px;
        }

        .field-wrapper i {
          position: absolute;
          top: 50%;
          right: 0;
          font-size: 18px;
          transform: translateY(-50%);
          color: #475569;
        }

        .field-wrapper input:focus~i,
        .field-wrapper input:valid~i {
          color: #e11d48;
        }

        .submit-button {
          position: relative;
          width: 100%;
          height: 45px;
          background: transparent;
          border-radius: 40px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          border: 2px solid #e11d48;
          overflow: hidden;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #fff;
          margin-top: 20px;
        }

        .submit-button::before {
          content: "";
          position: absolute;
          height: 300%;
          width: 100%;
          background: linear-gradient(#030303, #e11d48, #030303, #e11d48);
          top: -100%;
          left: 0;
          z-index: -1;
          transition: .4s;
        }

        .submit-button:hover:before {
          top: 0;
        }

        .switch-link {
          font-size: 14px;
          text-align: center;
          margin: 15px 0 5px;
          color: #94a3b8;
        }

        .switch-link a {
          text-decoration: none;
          color: #e11d48;
          font-weight: 800;
        }

        .switch-link a:hover {
          text-decoration: underline;
        }

        .welcome-section {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          display: flex;
          justify-content: center;
          flex-direction: column;
          z-index: 5;
        }

        .welcome-section.signin {
          right: 0;
          text-align: right;
          padding: 0 40px;
        }

        .welcome-section.signin .slide-element {
          transform: translateX(0);
          transition: .4s ease;
          opacity: 1;
          filter: blur(0px);
        }

        .welcome-section.signin .slide-element:nth-child(1) { transition-delay: 0.8s; }

        .auth-wrapper.toggled .welcome-section.signin .slide-element {
          transform: translateX(120%);
          opacity: 0;
          filter: blur(10px);
          transition-delay: 0s !important;
        }

        .welcome-section.signup {
          left: 0;
          text-align: left;
          padding: 0 40px;
          pointer-events: none;
        }

        .welcome-section.signup .slide-element {
          transform: translateX(-120%);
          transition: .4s ease;
          opacity: 0;
          filter: blur(10PX);
        }

        .auth-wrapper.toggled .welcome-section.signup .slide-element {
          transform: translateX(0%);
          opacity: 1;
          filter: blur(0);
        }

        .auth-wrapper.toggled .welcome-section.signup .slide-element:nth-child(1) { transition-delay: 0.6s; }

        .welcome-section h2 {
          text-transform: uppercase;
          font-size: 36px;
          line-height: 1.3;
          font-weight: 900;
          color: #fff;
        }

        .background-shape {
          position: absolute;
          right: 0;
          top: -5px;
          height: 600px;
          width: 850px;
          background: linear-gradient(45deg, #030303, #e11d48);
          transform: rotate(10deg) skewY(40deg);
          transform-origin: bottom right;
          transition: 0.8s ease;
          transition-delay: 0.5s;
          z-index: 2;
        }

        .auth-wrapper.toggled .background-shape {
          transform: rotate(0deg) skewY(0deg);
          transition-delay: 0.2s;
        }

        .secondary-shape {
          position: absolute;
          left: 250px;
          top: 100%;
          height: 700px;
          width: 850px;
          background: #030303;
          border-top: 3px solid #e11d48;
          transform: rotate(0deg) skewY(0deg);
          transform-origin: bottom left;
          transition: 0.8s ease;
          transition-delay: 0.2s;
          z-index: 1;
        }

        .auth-wrapper.toggled .secondary-shape {
          transform: rotate(-11deg) skewY(-41deg);
          transition-delay: 0.4s;
        }

        .auth-footer {
          margin-top: 30px;
          text-align: center;
          padding: 15px;
          font-size: 14px;
        }

        .auth-footer a {
          color: #e11d48;
          text-decoration: none;
          font-weight: 600;
        }

        .error-toast {
          background: #be123c;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 10px;
          border: 1px solid #fecdd3;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .auth-wrapper {
            height: auto;
            min-height: 500px;
          }
          .auth-wrapper .credentials-panel,
          .welcome-section {
            width: 100%;
            position: relative;
          }
          .welcome-section, .background-shape, .secondary-shape {
            display: none;
          }
          .credentials-panel.signin,
          .credentials-panel.signup {
            display: none;
            padding: 40px 20px;
            width: 100%;
          }
          .auth-wrapper:not(.toggled) .credentials-panel.signin {
            display: flex;
          }
          .auth-wrapper.toggled .credentials-panel.signup {
            display: flex;
          }
          .credentials-panel.signin .slide-element,
          .credentials-panel.signup .slide-element {
            transform: translateX(0) !important;
            opacity: 1 !important;
            filter: blur(0) !important;
            transition-delay: 0s !important;
          }
        }
      `}</style>

      <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-12 h-12 bg-[#e11d48] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(225,29,72,0.5)]">E</div>
        <span className="text-3xl font-black tracking-tighter text-white uppercase">elnoya</span>
      </div>

      <div className={`auth-wrapper ${isToggled ? 'toggled' : ''}`}>
        <div className="background-shape"></div>
        <div className="secondary-shape"></div>

        <div className="credentials-panel signin">
          <h2 className="slide-element">Giriş Yap</h2>
          
          {error && !isToggled && (
            <div className="error-toast slide-element">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-wrapper slide-element">
              <input 
                type="text" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Kullanıcı Adı veya E-posta</label>
              <i className="fa-solid fa-user"></i>
            </div>

            <div className="field-wrapper slide-element">
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Parola</label>
              <i className="fa-solid fa-lock"></i>
            </div>

            <div className="field-wrapper slide-element">
              <button className="submit-button" type="submit">GİRİŞ</button>
            </div>

            <div className="switch-link slide-element">
              <p>Hesabınız yok mu? <br /> <a href="#" onClick={(e) => { e.preventDefault(); setIsToggled(true); }}>Kayıt Ol</a></p>
            </div>
          </form>
        </div>

        <div className="welcome-section signin">
          <h2 className="slide-element">TEKRAR HOŞ GELDİNİZ!</h2>
        </div>

        <div className="credentials-panel signup">
          <h2 className="slide-element">Kayıt Ol</h2>
          
          {error && isToggled && (
            <div className="error-toast slide-element">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-wrapper slide-element">
              <input 
                type="text" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Kullanıcı Adı</label>
              <i className="fa-solid fa-user"></i>
            </div>

            <div className="field-wrapper slide-element">
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>E-posta</label>
              <i className="fa-solid fa-envelope"></i>
            </div>

            <div className="field-wrapper slide-element">
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Parola</label>
              <i className="fa-solid fa-lock"></i>
            </div>

            <div className="field-wrapper slide-element">
              <button className="submit-button" type="submit">KAYDOL</button>
            </div>

            <div className="switch-link slide-element">
              <p>Zaten hesabınız var mı? <br /> <a href="#" onClick={(e) => { e.preventDefault(); setIsToggled(false); }}>Giriş Yap</a></p>
            </div>
          </form>
        </div>

        <div className="welcome-section signup">
          <h2 className="slide-element">ARAMIZA HOŞ GELDİNİZ!</h2>
        </div>
      </div>

      <div className="auth-footer">
        <p>❤️ <a href="/" target="_blank">elnoya</a> ile güçlendirildi</p>
      </div>
    </div>
  );
};
