import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ChevronRight, Home, Info, Phone, LogIn } from 'lucide-react';

const Login = () => {
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (attempts >= 3) return;
    setError('');
    setIsLoading(true);
    try {
      const user = await login(voterId, password);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/voter');
    } catch (err) {
      setError(err.message);
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden font-sans bg-white text-slate-800">
      
      {/* 🇮🇳 OFFICIAL NAVBAR (Saffron to match Dashboard) */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-12 py-5 bg-[#ff9933] flex justify-between items-center shadow-lg border-b-4 border-white/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 bg-white rounded-sm flex items-center justify-center p-1 overflow-hidden shadow-2xl border border-slate-200">
              <div className="flex flex-col w-full h-full">
                <div className="bg-[#FF9933] h-[33%] w-full"></div>
                <div className="bg-white h-[34%] w-full flex items-center justify-center relative">
                   <div className="w-5 h-5 border-[1.5px] border-[#000080] rounded-full flex items-center justify-center">
                      <div className="w-[1px] h-4 bg-[#000080] absolute rotate-0"></div>
                      <div className="w-[1px] h-4 bg-[#000080] absolute rotate-45"></div>
                      <div className="w-[1px] h-4 bg-[#000080] absolute rotate-90"></div>
                      <div className="w-[1px] h-4 bg-[#000080] absolute rotate-[135deg]"></div>
                   </div>
                </div>
                <div className="bg-[#138808] h-[33%] w-full"></div>
              </div>
          </div>
          <div className="text-[#0b1f3f]">
            <h1 className="text-2xl font-black leading-none uppercase tracking-tighter">eVoting</h1>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest leading-none mt-1">National Portal</p>
          </div>
        </div>

        {/* Navbar Links Removed as requested */}
        <div></div>
      </nav>

      {/* 🇮🇳 OFFICIAL VIVID FLAG STRIPES BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white">
         {/* Solid Diagonal Bands (Exact Colors) */}
         <div className="absolute left-[-20%] bottom-0 w-[150%] h-[200px] bg-[#138808]/90 skew-y-[-15deg] shadow-inner"></div>
         <div className="absolute left-[-20%] bottom-[200px] w-[150%] h-[200px] bg-white skew-y-[-15deg]"></div>
         <div className="absolute left-[-20%] bottom-[400px] w-[150%] h-[200px] bg-[#FF9933]/90 skew-y-[-15deg] shadow-inner"></div>
      </div>

      {/* 🔮 MAIN CONTENT CANVAS */}
      <main className="flex-grow flex items-center justify-center lg:justify-end p-6 lg:pe-40 relative z-10 pt-32">
        
        {/* LEFT SIDE: OFFICIAL NAVY CHAKRA */}
        <div className="hidden lg:flex fixed left-32 top-[55%] -translate-y-1/2 flex-col items-center animate-reveal">
           <div className="relative group p-12 bg-white rounded-full border-4 border-[#000080]/10 shadow-massive">
              {/* Navy Blue Ashoka Chakra SVG */}
              <svg width="500" height="500" viewBox="0 0 200 200" className="opacity-95 drop-shadow-2xl">
                 <circle cx="100" cy="100" r="96" stroke="#000080" strokeWidth="5" fill="none" />
                 <circle cx="100" cy="100" r="18" fill="#000080" />
                 {[...Array(24)].map((_, i) => (
                    <g key={i} transform={`rotate(${i * 15} 100 100)`}>
                       <line x1="100" y1="100" x2="100" y2="10" stroke="#000080" strokeWidth="2.5" />
                       <circle cx="100" cy="12" r="2" fill="#000080" />
                    </g>
                 ))}
                 <circle cx="100" cy="100" r="92" stroke="#000080" strokeWidth="1" fill="none" opacity="0.3" />
              </svg>
           </div>
        </div>

        {/* RIGHT SIDE: THE LOGIN CARD (Fluid/Broader Version) */}
        <div className="w-full lg:w-[45%] bg-white border border-slate-200 rounded-[4rem] shadow-massive overflow-hidden animate-reveal p-16 md:p-24 lg:me-10">
          
          <div className="flex flex-col items-start gap-2 mb-16">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic">
              Enter Voter <br/> Card Number
            </h2>
            <div className="w-32 h-2.5 bg-blue-600 rounded-full mt-6"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            {/* VOTER ID INPUT */}
            <div className="space-y-3">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest pl-2">Voter ID:</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full py-5 px-8 rounded-2xl bg-white border-[3px] border-slate-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-[#f8fafc] transition-all outline-none text-xl"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  placeholder="e.g. ABC1234567"
                  required
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-3">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest pl-2">Security Token:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full py-5 px-8 rounded-2xl bg-white border-[3px] border-slate-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-[#f8fafc] transition-all outline-none text-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-xs uppercase" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs font-black text-center uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            {/* ACTION BUTTON (Official Blue - Less Neon) */}
            <button 
              type="submit"
              disabled={isLoading || attempts >= 3} 
              className={`w-full py-5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-2xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] ${attempts >= 3 ? 'opacity-30' : ''}`}
            >
              {isLoading ? 'Processing...' : (attempts >= 3 ? 'Locked' : 'Login')}
            </button>

            {/* ADMIN LOGIN FOOTER LINK */}
            <div className="flex justify-center pt-4">
                <button 
                  type="button"
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-800 uppercase tracking-widest border-b-2 border-transparent hover:border-blue-600 transition-all"
                  onClick={() => alert('Administrative node authorization required.')}
                >
                  Admin login
                </button>
            </div>
          </form>
        </div>
      </main>

      {/* 🔐 OFFICIAL FOOTER */}
      <footer className="fixed bottom-0 left-0 w-full p-8 flex justify-center lg:justify-start items-center pointer-events-none z-10">
        <div className="flex items-center gap-6 opacity-40 text-[10px] font-black text-slate-500 uppercase tracking-[1em] lg:ps-12">
           <span>GOVERNMENT OF INDIA</span>
           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
           <span>E-VOTING SYSTEM</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;



