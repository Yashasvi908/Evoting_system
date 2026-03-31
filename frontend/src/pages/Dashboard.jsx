import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2,
  Database,
  ShieldCheck,
  TrendingUp,
  Globe,
  FastForward,
  Play
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState([]);
  const [votedCampaignIds, setVotedCampaignIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [campResp, noticeResp, historyResp] = await Promise.all([
        fetch('http://localhost:5001/api/campaign', { headers: authHeader }),
        fetch('http://localhost:5001/api/notices'),
        fetch('http://localhost:5001/api/vote/history', { headers: authHeader })
      ]);

      const campaigns = await campResp.json();
      const noticesData = await noticeResp.json();
      const historyData = await historyResp.json();

      if (Array.isArray(campaigns)) {
        const now = new Date();
        const active = campaigns.filter(c => {
           const start = new Date(c.startDate);
           const end = new Date(c.endDate);
           return now >= start && now <= end;
        });

        const upcoming = campaigns.filter(c => {
           const start = new Date(c.startDate);
           return start > now;
        });

        setActiveCampaigns(active);
        setUpcomingCampaigns(upcoming);
      }
      
      if (Array.isArray(historyData)) {
         // Extract IDs of campaigns where user has already voted
         const votedIds = historyData.map(v => v.campaignId?._id || v.campaignId);
         setVotedCampaignIds(votedIds);
      }

      setNotices(Array.isArray(noticesData) ? noticesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return "CLOSED";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="w-full py-10 px-6 lg:px-12 space-y-12 bg-slate-50 min-h-screen font-sans">
      {/* 🚀 TOP HEADER BOX */}
      <div className="w-full bg-white rounded-[3rem] p-10 shadow-xl border-t-[16px] border-[#ff9933] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden animate-slide-up">
         <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 pointer-events-none text-[#ff9933]"><ShieldCheck size={120} /></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-0">Identity Verified</p>
            </div>
            <h2 className="text-4xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none mb-1">Voter Pulse</h2>
            <p className="text-[12px] font-black text-orange-500 uppercase tracking-widest italic opacity-60 leading-none">Official E-Voting Terminal</p>
         </div>

         <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2.5rem] border-2 border-white shadow-inner relative z-10 group hover:bg-white transition-all">
            <div className="w-16 h-16 bg-[#ff9933] text-white rounded-[1.5rem] flex items-center justify-center font-black text-3xl shadow-xl group-hover:rotate-6 transition-transform">
               {user?.name?.charAt(0)}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-none mb-2">Welcome Back,</p>
               <h4 className="text-2xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">{user?.name}</h4>
               <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[8px] font-black w-fit uppercase tracking-widest italic border border-green-200 mt-2">ACTIVE_NODE</div>
            </div>
         </div>
      </div>

      {/* ⚡ ACTIVE CAMPAIGNS ARENA (MULTIPLE) */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-3xl font-black text-[#0b1f3f] uppercase italic tracking-tighter flex items-center gap-4"><Play className="text-red-500 fill-red-500" size={32}/> Active Missions</h3>
            <span className="text-[11px] font-black text-slate-300 uppercase italic tracking-widest">Live Ballot Ingress Loop</span>
         </div>
         
         {loading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-6 bg-white rounded-[4rem] border-2 border-slate-100 shadow-xl">
               <Database className="text-slate-200 animate-bounce" size={64}/>
               <p className="font-black text-slate-300 uppercase italic tracking-[0.6em] animate-pulse">Syncing Chain State...</p>
            </div>
         ) : activeCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
               {activeCampaigns.map((camp, index) => {
                  const hasVotedInThis = votedCampaignIds.includes(camp._id);
                  return (
                     <div key={camp._id} style={{ animationDelay: `${index * 100}ms` }} className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-100 relative group overflow-hidden hover:shadow-orange-500/10 transition-all duration-500 h-full flex flex-col animate-scale-in">
                        <div className="absolute top-0 right-0 p-8 opacity-5 scale-125 rotate-12 group-hover:scale-110 transition-transform duration-[2s] pointer-events-none text-[#0b1f3f]"><Globe size={120} /></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 ${hasVotedInThis ? 'bg-green-500' : 'bg-red-500 animate-pulse'} rounded-full`}></div>
                                 <p className={`text-[8px] font-black uppercase tracking-[0.3em] italic ${hasVotedInThis ? 'text-green-600' : 'text-red-500'}`}>{hasVotedInThis ? 'BALLOT ARCHIVED' : 'MISSION ACTIVE'}</p>
                              </div>
                              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-black text-[#0b1f3f] text-[9px] uppercase italic tracking-widest flex items-center gap-2">
                                 <Clock size={10} className="text-slate-400"/> {getRemainingTime(camp.endDate)}
                              </div>
                           </div>

                           <h3 className="text-xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-[0.9] mb-3 break-words line-clamp-2">{camp.name}</h3>
                           <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase italic tracking-[0.2em] mb-6"><MapPin size={12}/> {camp.constituency}</div>

                           <div className="mt-auto">
                              {hasVotedInThis ? (
                                 <div className="w-full p-4 bg-green-50 rounded-[1.5rem] border-2 border-white shadow-inner flex items-center justify-center gap-2 text-green-700 font-black uppercase italic text-[10px] tracking-widest animate-reveal">
                                    <CheckCircle2 size={14}/> Ballot Secured
                                 </div>
                              ) : (
                                 <button 
                                    onClick={() => navigate('/prevoting', { state: { campaign: camp } })} 
                                    className="w-full bg-[#0b1f3f] hover:bg-black text-white px-6 py-4 rounded-[1.5rem] font-black text-sm uppercase italic tracking-[0.1em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                 >
                                    <span>Cast Vote</span>
                                    <FastForward className="group-hover:translate-x-2 transition-transform" size={18}/>
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         ) : (
            <div className="bg-white rounded-[4rem] p-32 border-4 border-white shadow-xl text-center space-y-6">
               <Globe className="mx-auto text-slate-100" size={120} />
               <h3 className="text-4xl font-black text-slate-200 uppercase italic tracking-tighter leading-none">Chain Standby</h3>
               <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.6em] mt-2 italic">Awaiting Autonomous Signal Ingress</p>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
         {/* BROADCASTS */}
         <div className="bg-white rounded-[4rem] p-10 shadow-2xl border-2 border-slate-50">
            <h3 className="text-2xl font-black text-[#0b1f3f] uppercase italic tracking-tighter mb-8 flex items-center gap-4"><Bell className="text-orange-500" /> Broadcasts</h3>
            <div className="space-y-6">
               {notices.map(n => (
                 <div key={n._id} className="p-8 bg-slate-50 rounded-[3rem] border-2 border-white hover:bg-white hover:shadow-xl transition-all group">
                    <h4 className="text-lg font-black text-[#0b1f3f] uppercase italic mb-2 group-hover:text-orange-500 transition-colors">{n.title}</h4>
                    <p className="text-sm font-bold text-slate-400 italic leading-relaxed line-clamp-2">{n.message}</p>
                 </div>
               ))}
               {notices.length === 0 && <div className="p-10 text-center font-black text-slate-300 uppercase italic text-[10px] tracking-widest">Zero Broadcasts Active</div>}
            </div>
         </div>

         {/* QUEUED */}
         <div className="bg-white rounded-[4rem] p-10 shadow-2xl border-2 border-slate-50">
            <h3 className="text-2xl font-black text-[#0b1f3f] uppercase italic tracking-tighter mb-8 flex items-center gap-4"><Clock className="text-blue-500" /> Incoming Missions</h3>
            <div className="space-y-6">
               {upcomingCampaigns.map(c => (
                 <div key={c._id} className="p-8 bg-slate-50 rounded-[3rem] border-2 border-white flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all">
                    <div>
                      <h4 className="text-lg font-black text-[#0b1f3f] uppercase italic mb-1">{c.name}</h4>
                      <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest leading-none">{c.constituency} • {new Date(c.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase italic tracking-[0.2em] border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">QUEUED</div>
                 </div>
               ))}
               {upcomingCampaigns.length === 0 && <div className="p-10 text-center font-black text-slate-300 uppercase italic text-[10px] tracking-widest">No Missions Scheduled</div>}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
