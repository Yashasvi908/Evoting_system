import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, BarChart3, History, Globe, Shield, Database } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const isVoter = location.pathname.startsWith('/voter') || location.pathname.startsWith('/history') || location.pathname.startsWith('/vote') || location.pathname.startsWith('/receipt');

  // VOTER NAVIGATION TABS
  const voterTabs = [
    { id: 'voter', label: 'DASHBOARD', icon: BarChart3, path: '/voter' },
    { id: 'history', label: 'MY VOTES', icon: History, path: '/history' },
  ];

  return (
    <div className="flex flex-col min-h-screen relative bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 🏗️ SLIM SAFFRON HEADER      {/* 🏗️ SLIM SAFFRON HEADER */}
      <header className="fixed top-0 left-0 w-full z-[110] bg-[#ff9933] shadow-[0_4px_30px_rgba(255,153,51,0.4)] border-b-4 border-white/20 h-20 px-12">
        <div className="w-full h-full flex items-center justify-between">
           {/* LEFT: OFFICIAL BRANDING */}
            <div className="flex items-center gap-6 group cursor-pointer animate-slide-up" onClick={() => navigate('/')}>
               <div className="bg-white p-1 rounded-[1rem] shadow-xl group-hover:scale-105 transition-all w-20 h-14 flex items-center justify-center overflow-hidden border border-slate-100">
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
               <div className="flex flex-col">
                 <h1 className="text-2xl font-black uppercase tracking-tighter italic text-[#0b1f3f] leading-none">Election Commission Of India</h1>
                 <p className="text-[10px] text-[#0b1f0b]/60 uppercase tracking-[0.4em] font-black mt-1 leading-none italic">Government of India official portal</p>
               </div>
            </div>

           {/* RIGHT: NAVIGATION & PROFILE HUB */}
           {user && (
              <div className="flex items-center gap-6">
                {isVoter && !isAdmin && (
                  <div className="flex items-center bg-black/5 backdrop-blur-3xl rounded-full p-1.5 border border-white/10 mr-4">
                    {voterTabs.map(tab => {
                      const isActive = location.pathname === tab.path;
                      return (
                        <button 
                          key={tab.id}
                          onClick={() => navigate(tab.path)}
                          className={`flex items-center gap-3 px-8 py-3 rounded-full text-[11px] font-black transition-all ${isActive ? 'bg-[#0b1f3f] text-white shadow-xl' : 'text-[#0b1f3f]/60 hover:text-black'}`}
                        >
                          <tab.icon size={18} className={isActive ? 'text-[#ff9933]' : 'opacity-40'} />
                          <span className="tracking-widest uppercase italic">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-4 bg-[#0b1f3f] text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 group">
                   <div className="text-right">
                      <p className="text-sm font-black italic uppercase leading-none tracking-tight">{user.name}</p>
                      <p className="text-[9px] text-[#ff9933] font-black tracking-widest mt-1.5 uppercase opacity-60">AUTH_OK</p>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-[#ff9933] overflow-hidden group-hover:scale-110 transition-transform shadow-xl">
                      <img src={user.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover" />
                   </div>
                   <div className="h-6 w-[1px] bg-white/10 mx-1" />
                   <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-all text-red-400"><LogOut size={18}/></button>
                 </div>
              </div>
           )}
        </div>
      </header>

      {/* PAGE WRAPPER (Removed transform animation to keep fixed children stable) */}
      {/* PAGE WRAPPER (Fluid with Edge Scrolling) */}
      <main className={`flex-grow w-full ${user ? 'pt-20' : 'pt-0'} ${isAdmin ? 'pb-14' : 'pb-24'} relative z-10 h-screen overflow-hidden`}>
         <div className="w-full h-full overflow-y-auto">
            <div className={`w-full h-full ${isAdmin ? 'px-0' : 'px-12'}`}>
               <Outlet />
            </div>
         </div>
      </main>

      {/* 🏡 SLIM GREEN FOOTER */}
      <footer className="fixed bottom-0 left-0 w-full z-[110] bg-[#138808] border-t-4 border-white shadow-[0_-10px_40px_rgba(19,136,8,0.4)] h-14 px-12">
        <div className="w-full h-full flex items-center justify-between">
           <div className="flex items-center gap-6 group">
              <ShieldCheck size={24} className="text-white drop-shadow-lg" />
              <p className="text-[11px] font-black uppercase text-white tracking-[0.4em] italic leading-none">Government Authority Sync</p>
           </div>

           <div className="flex items-center gap-10 px-10 py-3 bg-black/10 backdrop-blur-3xl rounded-full border border-white/5 h-12">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.8em] italic leading-none opacity-80 whitespace-nowrap">NIC HOSTED CLOUD</p>
              <div className="h-4 w-[1px] bg-white/20" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest whitespace-nowrap">made with <span className="text-red-500 animate-pulse">❤️</span> by techdot</p>
           </div>

           <div className="flex items-center gap-6 group text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">MASTER_NODE_v4.0.5</p>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10"><Database size={20} className="text-[#ff9933]" /></div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
