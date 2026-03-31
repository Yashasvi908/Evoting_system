import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
   BarChart3,
   Users,
   LogOut,
   Globe,
   Bell,
   MapPin,
   Trash2,
   Camera,
   Flag,
   UserPlus,
   Upload,
   Database,
   FileSpreadsheet,
   TrendingUp,
   TrendingDown,
   UserCheck,
   ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
   const { user, logout } = useAuth();
   const [activeTab, setActiveTab] = useState('dashboard');
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   // CRITICAL: Guaranteed Array Initializations
   const [campaigns, setCampaigns] = useState([]);
   const [allCandidates, setAllCandidates] = useState([]);
   const [voters, setVoters] = useState([]);
   const [notices, setNotices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [campaignResults, setCampaignResults] = useState({});

   // Forms
   const [campaignForm, setCampaignForm] = useState({ name: '', startDate: '', endDate: '', constituency: '' });
   const [candidateForm, setCandidateForm] = useState({ name: '', party: '', campaignId: '', profilePic: '', partySymbol: '' });
   const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });
   const [voterFileData, setVoterFileData] = useState(null);

   useEffect(() => {
      fetchAllData();
      const interval = setInterval(fetchAllData, 10000);
      return () => clearInterval(interval);
   }, []);

   const fetchAllData = async () => {
      try {
         const token = localStorage.getItem('token');
         if (!token) return;
         const authHeader = { 'Authorization': `Bearer ${token}` };
         
         const [campRes, candRes, voterRes, noticeRes] = await Promise.all([
            fetch('http://localhost:5001/api/campaign', { headers: authHeader }),
            fetch('http://localhost:5001/api/candidates', { headers: authHeader }),
            fetch('http://localhost:5001/api/voters', { headers: authHeader }),
            fetch('http://localhost:5001/api/notices')
         ]);

         const camps = campRes.ok ? await campRes.json() : [];
         const cands = candRes.ok ? await candRes.json() : [];
         const vots = voterRes.ok ? await voterRes.json() : [];
         const nots = noticeRes.ok ? await noticeRes.json() : [];

         setCampaigns(Array.isArray(camps) ? camps : []);
         setAllCandidates(Array.isArray(cands) ? cands : []);
         setVoters(Array.isArray(vots) ? vots : []);
         setNotices(Array.isArray(nots) ? nots : []);

         const resultsMap = {};
         if (Array.isArray(camps)) {
            for (const camp of camps) {
               try {
                  const rRes = await fetch(`http://localhost:5001/api/result/${camp._id}`, { headers: authHeader });
                  if (rRes.ok) {
                     const rData = await rRes.json();
                     resultsMap[camp._id] = {
                        winner: rData.results?.[0] || null,
                        all: Array.isArray(rData.results) ? rData.results : [],
                        totalVotes: rData.totalVotesCast || 0
                     };
                  }
               } catch (e) { console.error("RES_FETCH_ERR", e); }
            }
         }
         setCampaignResults(resultsMap);
      } catch (err) { console.error("GLOBAL_FETCH_ERR", err); }
      finally { setLoading(false); }
   };

   const handleDeleteCandidate = async (id) => {
      if (!window.confirm('Terminate this Delegate record?')) return;
      try {
         await fetch(`http://localhost:5001/api/candidates/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
         });
         fetchAllData();
      } catch (err) { console.error(err); }
   };

   const handleDeleteCampaign = async (id) => {
      if (!window.confirm('Abort this Mission and all linked data?')) return;
      try {
         await fetch(`http://localhost:5001/api/campaign/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
         });
         fetchAllData();
      } catch (err) { console.error(err); }
   };

   const handleCreateCampaign = async (e) => {
      e.preventDefault();
      try {
         const res = await fetch('http://localhost:5001/api/campaign', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(campaignForm)
         });
         if (res.ok) {
            setCampaignForm({ name: '', startDate: '', endDate: '', constituency: '' });
            fetchAllData();
            alert("Mission Established!");
         }
      } catch (err) { console.error(err); }
   };

   const handleAddCandidate = async (e) => {
      e.preventDefault();
      try {
         const res = await fetch('http://localhost:5001/api/candidate', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(candidateForm)
         });
         if (res.ok) {
            setCandidateForm({ name: '', party: '', campaignId: '', profilePic: '', partySymbol: '' });
            fetchAllData();
            alert("Delegate Authorized!");
         }
      } catch (err) { console.error(err); }
   };

   const handleCreateNotice = async (e) => {
      e.preventDefault();
      try {
         const res = await fetch('http://localhost:5001/api/notices', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(noticeForm)
         });
         if (res.ok) {
            setNoticeForm({ title: '', message: '' });
            fetchAllData();
            alert("Notice Broadcasted!");
         }
      } catch (err) { console.error(err); }
   };

   const handleVoterUpload = async (e) => {
      e.preventDefault();
      if (!voterFileData) return alert("Select Identity File First!");
      try {
         const res = await fetch('http://localhost:5001/api/auth/register-bulk', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(voterFileData)
         });
         if (res.ok) {
            setVoterFileData(null);
            fetchAllData();
            alert("Identity Database Synced!");
         }
      } catch (err) { console.error(err); }
   };

   const handleFileChange = (e, target) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (target === 'voters') {
         const reader = new FileReader();
         const extension = file.name.split('.').pop().toLowerCase();
         reader.onload = (evt) => {
            try {
               if (extension === 'json') {
                  setVoterFileData(JSON.parse(evt.target.result));
               } else {
                  const bstr = evt.target.result;
                  const wb = XLSX.read(bstr, { type: 'binary' });
                  const ws = wb.Sheets[wb.SheetNames[0]];
                  const data = XLSX.utils.sheet_to_json(ws);
                  setVoterFileData(Array.isArray(data) ? data : []);
               }
            } catch (err) { alert("Format Error!"); }
         };
         if (extension === 'json') reader.readAsText(file);
         else reader.readAsBinaryString(file);
      } else {
         const reader = new FileReader();
         reader.onload = () => setCandidateForm(prev => ({ ...prev, [target]: reader.result }));
         reader.readAsDataURL(file);
      }
   };

   const menuItems = [
      { id: 'dashboard', label: 'ANALYTICS', icon: BarChart3 },
      { id: 'campaigns', label: 'CAMPAIGNS', icon: Globe },
      { id: 'candidates', label: 'CANDIDATES', icon: Users },
      { id: 'voters', label: 'VOTERS LIST', icon: UserPlus },
      { id: 'notices', label: 'NOTICES', icon: Bell },
   ];

   const logoutUser = () => {
      logout();
   };

   if (loading && (!voters || voters.length === 0)) return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50">
         <div className="w-16 h-16 border-4 border-[#0b1f3f] border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="font-black text-[#0b1f3f] uppercase italic">Establishing Admin Node...</p>
      </div>
   );

   return (
      <div className="h-full w-full flex bg-slate-50 font-sans overflow-hidden">
         {/* SIDEBAR */}
         {/* SIDEBAR (Offset from Header) */}
         <aside className={`${isSidebarOpen ? 'w-[280px]' : 'w-20'} bg-[#ff9933] h-[calc(100vh-80px)] fixed left-0 top-20 z-[200] transition-all duration-500 shadow-massive flex flex-col border-r border-black/5 overflow-hidden`}>
            <nav className="flex-grow px-4 space-y-4 mt-6 overflow-hidden">
               {menuItems.map((item, index) => {
                  const active = activeTab === item.id;
                  return (
                     <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)} 
                        style={{ animationDelay: `${index * 100}ms` }}
                        className={`w-full flex items-center gap-5 px-6 py-5 rounded-[2.5rem] transition-all animate-slide-right ${active ? 'bg-[#0b1f3f] text-white shadow-xl' : 'text-[#0b1f3f]/60 hover:text-[#0b1f3f]'}`}
                     >
                        <item.icon size={22} className={active ? 'text-[#ff9933]' : ''} />
                        <span className={`${isSidebarOpen ? 'block' : 'hidden'} text-[11px] font-black uppercase italic tracking-widest`}>{item.label}</span>
                     </button>
                  );
               })}
            </nav>
            <div className="mt-auto p-6 mb-12">
               <button onClick={logoutUser} className="w-full flex items-center gap-4 p-4 rounded-xl bg-black/10 hover:bg-[#0b1f3f] hover:text-white font-black italic uppercase text-[10px] transition-all">
                  <LogOut size={18} /> {isSidebarOpen && <span>LOGOUT_NODE</span>}
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT (Scroll managed by Layout) */}
         <main className={`flex-grow h-full py-10 px-8 lg:px-12 ${isSidebarOpen ? 'ml-[280px]' : 'ml-20'} overflow-visible`}>
            <div className="w-full max-w-[1600px] mx-auto">

               {activeTab === 'dashboard' && (
                  <div className="animate-reveal space-y-12">
                     <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-[16px] border-[#0b1f3f] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 flex gap-3 opacity-80 scale-75 md:scale-100">
                           <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[9px] font-black border border-green-200 flex items-center gap-2 italic uppercase"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> SEC_ONLINE</div>
                           <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black border border-blue-200 flex items-center gap-2 italic uppercase">LATENCY_SYNC 0.4ms</div>
                        </div>
                        <div><h2 className="text-4xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">Command Stats</h2><p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic leading-none">Live Intelligence Stream</p></div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-b-8 border-blue-500 hover:scale-[1.02] transition-transform group text-center">
                           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform text-blue-500"><Users size={20} /></div>
                           <h3 className="text-3xl font-black text-[#0b1f3f] tracking-tighter italic leading-none mb-1">{voters?.length || 0}</h3>
                           <p className="text-[9px] font-black text-blue-500 uppercase italic tracking-widest">Identity Nodes</p>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-b-8 border-orange-500 hover:scale-[1.02] transition-transform group text-center animate-scale-in" style={{ animationDelay: '200ms' }}>
                           <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform text-orange-500"><Globe size={20} /></div>
                           <h3 className="text-3xl font-black text-[#0b1f3f] tracking-tighter italic leading-none mb-1">{campaigns?.length || 0}</h3>
                           <p className="text-[9px] font-black text-orange-500 uppercase italic tracking-widest">Missions</p>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-b-8 border-red-500 hover:scale-[1.02] transition-transform group text-center relative overflow-hidden animate-scale-in" style={{ animationDelay: '300ms' }}>
                           <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform text-red-500"><ShieldCheck size={20} /></div>
                           <h3 className="text-3xl font-black text-[#0b1f3f] tracking-tighter italic leading-none mb-1 animate-pulse">
                              {Object.values(campaignResults || {}).reduce((sum, r) => sum + (r.totalVotes || 0), 0)}
                           </h3>
                           <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest">Ballot Entries</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[4rem] p-12 shadow-2xl space-y-12 border-2 border-slate-100 min-h-[500px] flex flex-col justify-center text-center relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-[2s]"><TrendingUp className="w-48 h-48" /></div>
                           <div className="w-fit mx-auto bg-orange-50 text-orange-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic mb-4">LATEST_RESULTS</div>
                           <div className="space-y-4">
                              <h2 className="text-5xl font-black text-[#0b1f3f] uppercase tracking-tighter italic leading-none flex items-center justify-center gap-4"><TrendingUp /> Victory Board</h2>
                              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.5em] italic">Real-Time Majority Detection Node</p>
                           </div>
                           {campaigns.length > 0 && campaignResults[campaigns[0]._id]?.winner ? (
                              <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-white shadow-inner flex flex-col items-center gap-4 animate-scale-up">
                                 <p className="text-[10px] font-black text-blue-500 uppercase italic">Leading Delegate</p>
                                 <h3 className="text-4xl font-black text-[#0b1f3f] uppercase italic">{campaignResults[campaigns[0]._id].winner.name}</h3>
                                 <div className="w-full h-1 bg-blue-500 mt-4 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest mt-2">{campaignResults[campaigns[0]._id].totalVotes} Nodes Synced</p>
                              </div>
                           ) : (
                              <p className="text-slate-300 font-black italic uppercase">Awaiting Vote Ingress...</p>
                           )}
                        </div>

                        <div className="bg-[#0b1f3f] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group min-h-[500px]">
                           <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                           <div className="relative z-10 flex flex-col h-full text-white">
                              <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                                 <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3"><BarChart3 className="text-orange-500" /> Pulse Analytics</h2>
                                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                              </div>
                              
                              <div className="space-y-16 flex-grow overflow-y-auto no-scrollbar pr-2">
                                 {(campaigns || []).map(camp => {
                                    const results = campaignResults[camp._id];
                                    return (
                                       <div key={camp._id} className="space-y-8 animate-reveal">
                                          <div className="flex items-center gap-4 border-l-4 border-orange-500 pl-4 bg-white/5 p-4 rounded-r-3xl">
                                             <div className="bg-white/10 p-3 rounded-xl"><Globe className="text-blue-400 w-5 h-5" /></div>
                                             <div>
                                                <p className="text-[9px] text-blue-300 font-black uppercase italic tracking-widest leading-none mb-1">{camp.constituency}</p>
                                                <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{camp.name}</h4>
                                             </div>
                                          </div>
                                          
                                          <div className="space-y-8 pt-4 px-2">
                                             {(results?.all || []).map((res, idx) => (
                                                <div key={idx} className="space-y-3 group">
                                                   <div className="flex justify-between items-end">
                                                      <div className="flex flex-col">
                                                         <span className="text-sm font-black text-white/80 uppercase italic tracking-tighter group-hover:text-blue-200 transition-colors">{res.name}</span>
                                                         <span className="text-[9px] font-black text-white/20 uppercase italic">{res.party}</span>
                                                      </div>
                                                      <span className="text-xs font-black text-white italic bg-white/10 px-4 py-1.5 rounded-full">{res.votes} <span className="text-[9px] text-white/30 uppercase">NODES</span></span>
                                                   </div>
                                                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-[2s] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${(res.votes / (results.totalVotes || 1)) * 100}%` }}></div>
                                                   </div>
                                                </div>
                                             ))}
                                             {(!results?.all || results.all.length === 0) && (
                                                <div className="py-10 text-center opacity-10 font-black uppercase italic text-xs tracking-[0.4em]">Standby_Mode</div>
                                             )}
                                          </div>
                                       </div>
                                    );
                                  })}
                                 {(!campaigns || campaigns.length === 0) && (
                                    <div className="flex-grow flex items-center justify-center opacity-20 flex-col gap-4 py-20"><Database size={64} /><p className="font-black uppercase italic tracking-[0.4em]">Mission Standby</p></div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'campaigns' && (
                  <div className="animate-reveal space-y-12">
                     <div className="bg-white rounded-[3.5rem] p-10 shadow-xl border-t-[16px] border-[#ff9933]">
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-12 border-b-2 border-slate-50 pb-8">
                           <div className="text-left"><h2 className="text-5xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">Missions</h2><p className="text-sm font-black text-orange-500 mt-2 uppercase tracking-[0.4em] italic leading-none">Mission Architect</p></div>
                           <form onSubmit={handleCreateCampaign} className="w-full bg-slate-50 p-10 rounded-[3rem] border-2 border-white shadow-xl flex flex-col items-center sm:items-end gap-10 flex-grow">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Name</label><input type="text" required placeholder="Name" className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-[#ff9933] outline-none w-full" value={campaignForm.name} onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })} /></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">City</label><input type="text" required placeholder="City" className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-[#ff9933] outline-none w-full" value={campaignForm.constituency} onChange={e => setCampaignForm({ ...campaignForm, constituency: e.target.value })} /></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Start</label><input type="datetime-local" required className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-[#ff9933] outline-none w-full" value={campaignForm.startDate} onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })} /></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">End</label><input type="datetime-local" required className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-[#ff9933] outline-none w-full" value={campaignForm.endDate} onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })} /></div>
                              </div>
                              <button type="submit" className="w-full sm:w-auto bg-[#0b1f3f] text-white px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-lg italic shadow-2xl hover:scale-105 active:scale-95 transition-all">SAVE_MISSION</button>
                           </form>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                           {(campaigns || []).map(c => (
                              <div key={c._id} className="bg-slate-50 p-8 rounded-[3rem] border-2 border-white shadow-sm hover:shadow-2xl hover:bg-white transition-all duration-500 group relative flex flex-col justify-between min-h-[220px]">
                                 <button onClick={() => handleDeleteCampaign(c._id)} className="absolute top-6 right-6 p-3 bg-white shadow-sm rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all z-20"><Trash2 size={16} /></button>
                                 <div><h4 className="text-2xl font-black text-[#0b1f3f] uppercase italic tracking-tighter break-words pr-10">{c.name}</h4><div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase mt-3 italic"><MapPin size={14} /> {c.constituency}</div></div>
                                 <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center"><span className="text-[9px] font-black text-slate-300 uppercase italic">Registered Mission</span><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]"></div></div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'candidates' && (
                  <div className="animate-reveal space-y-12">
                     <div className="bg-white rounded-[3.5rem] p-10 shadow-xl border-t-[16px] border-[#0b1f3f]">
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-12 border-b-2 border-slate-50 pb-8">
                           <div className="text-left"><h2 className="text-5xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">Delegates</h2><p className="text-sm font-black text-blue-500 mt-2 uppercase tracking-[0.4em] italic leading-none">Authority Registration</p></div>
                           <form onSubmit={handleAddCandidate} className="w-full bg-slate-50 p-10 rounded-[3rem] border-2 border-white shadow-xl flex flex-col items-center sm:items-end gap-10 flex-grow">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 w-full">
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Name</label><input type="text" required placeholder="Name" className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-600 outline-none w-full" value={candidateForm.name} onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })} /></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Party</label><input type="text" required placeholder="Party" className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-600 outline-none w-full" value={candidateForm.party} onChange={e => setCandidateForm({ ...candidateForm, party: e.target.value })} /></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Arena</label><select required className="bg-white p-6 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-600 outline-none cursor-pointer w-full" value={candidateForm.campaignId} onChange={e => setCandidateForm({ ...candidateForm, campaignId: e.target.value })}><option value="">Mission_Node</option>{campaigns.map(cp => <option key={cp._id} value={cp._id}>{cp.name}</option>)}</select></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">DP</label><label className="cursor-pointer bg-white p-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 w-full"><Camera className="text-blue-500" /><span className="text-[11px] font-black text-blue-500 italic">PIC</span><input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'profilePic')} /></label></div>
                                 <div className="flex flex-col gap-3"><label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Logo</label><label className="cursor-pointer bg-white p-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 w-full"><Flag /><span className="text-[11px] font-black italic">LOG</span><input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'partySymbol')} /></label></div>
                              </div>
                              <button type="submit" className="w-full sm:w-auto bg-[#0b1f3f] text-white px-20 py-6 rounded-[2.5rem] font-black uppercase text-lg italic shadow-xl">SAVE_RECORDS</button>
                           </form>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                           {(allCandidates || []).map(cand => (
                              <div key={cand._id} className="bg-slate-50 p-8 rounded-[3.5rem] border-2 border-white shadow shadow-white relative group overflow-hidden hover:shadow-2xl transition-all duration-500">
                                 <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                                    <button onClick={() => handleDeleteCandidate(cand._id)} className="p-3 bg-white shadow rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                                 </div>
                                 <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-8 border-white shadow-xl bg-white"><img src={cand.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + cand.name} className="w-full h-full object-cover" alt={cand.name} /></div>
                                    <div>
                                       <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-2xl p-2 shadow border-2 border-slate-100"><img src={cand.partySymbol} className="w-full h-full object-contain" alt="Symbol" /></div>
                                       <h4 className="text-2xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none mb-1">{cand.name}</h4>
                                       <p className="text-[10px] font-black text-blue-500 uppercase italic tracking-widest">{cand.party}</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'voters' && (
                  <div className="animate-reveal space-y-12">
                     <div className="bg-white rounded-[3.5rem] p-10 shadow-xl border-t-[16px] border-[#0b1f3f]">
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-12 border-b-2 border-slate-50 pb-8">
                           <div className="text-left"><h2 className="text-5xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">Voters</h2><p className="text-sm font-black text-slate-400 mt-2 uppercase tracking-[0.4em] italic leading-none">Identity Database</p></div>
                           <form onSubmit={handleVoterUpload} className="w-full bg-slate-50 p-8 rounded-[3rem] border-2 border-white shadow-xl flex flex-col sm:items-end gap-6 flex-grow">
                              <div className="flex flex-col gap-2 w-full">
                                 <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">Import Roles (.xlsx, .csv, .json)</label>
                                 <label className="bg-white p-10 rounded-3xl border-2 border-dotted border-slate-200 cursor-pointer flex items-center justify-center gap-4 text-slate-400 font-black italic hover:bg-slate-100 transition-all uppercase text-sm shadow-inner group">
                                    <FileSpreadsheet size={32} className="text-green-500" /> {voterFileData ? `Sync ${voterFileData.length} Entities` : "Select Identity File"}<input type="file" className="hidden" accept=".xlsx, .xls, .csv, .json" onChange={e => handleFileChange(e, 'voters')} />
                                 </label>
                              </div>
                              <button type="submit" className="w-full sm:w-auto bg-[#0b1f3f] text-white px-10 py-6 rounded-2xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2"><Database size={20} /> SYNC_DATABASE</button>
                           </form>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                           {(voters || []).map(v => (
                              <div key={v._id} className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px] ${v.hasVoted ? 'bg-green-50 border-green-500' : 'bg-slate-50 border-white'}`}>
                                 {v.hasVoted && <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic animate-bounce">VOTED</div>}
                                 
                                 <div className="flex flex-col gap-2">
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-sm overflow-hidden p-1">
                                       <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${v.name}`} className="w-full h-full object-cover" alt="Identicon"/>
                                    </div>
                                    <h3 className="text-xl font-black text-[#0b1f3f] mt-4 uppercase tracking-tighter leading-none">{v.name}</h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-2 italic">MASTER_ID: {v.voterId}</p>
                                 </div>

                                 <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${v.hasVoted ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div><span className={`text-[9px] font-black uppercase italic ${v.hasVoted ? 'text-green-600' : 'text-slate-300'}`}>{v.hasVoted ? 'BALLOT_CAST' : 'READY_NODE'}</span></div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'notices' && (
                  <div className="animate-reveal space-y-12">
                     <div className="bg-white rounded-[3.5rem] p-10 shadow-xl border-t-[16px] border-[#0b1f3f]">
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-12 border-b-2 border-slate-50 pb-8">
                           <div className="text-left"><h2 className="text-5xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">Notices</h2><p className="text-sm font-black text-slate-400 mt-2 uppercase tracking-[0.4em] italic leading-none">Broadcast Central</p></div>
                           <form onSubmit={handleCreateNotice} className="w-full bg-slate-50 p-8 rounded-[3rem] border-2 border-white shadow-xl flex flex-col md:flex-row items-end gap-6 flex-grow">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                 <div className="flex flex-col gap-2"><label className="text-[10px] font-black text-slate-400 uppercase italic">Title</label><input type="text" required placeholder="Subject" className="bg-white p-5 rounded-2xl font-bold border-2 border-slate-100 focus:border-[#ff9933] outline-none" value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} /></div>
                                 <div className="flex flex-col gap-2"><label className="text-[10px] font-black text-slate-400 uppercase italic">Message</label><input type="text" required placeholder="Details..." className="bg-white p-5 rounded-2xl font-bold border-2 border-slate-100 focus:border-[#ff9933] outline-none" value={noticeForm.message} onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })} /></div>
                              </div>
                              <button type="submit" className="bg-[#0b1f3f] text-white px-10 py-5 rounded-2xl font-black uppercase italic">POST_BROADCAST</button>
                           </form>
                        </div>
                        <div className="space-y-6">
                           {(notices || []).map(n => (
                              <div key={n._id} className="bg-white p-8 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-[#0b1f3f] transition-all">
                                 <div className="flex items-center gap-6"><div className="p-4 bg-slate-50 rounded-2xl text-[#0b1f3f] group-hover:bg-[#0b1f3f] group-hover:text-white transition-all"><Bell size={24} /></div><div><h4 className="text-xl font-black uppercase italic text-[#0b1f3f]">{n.title}</h4><p className="text-slate-400 font-bold text-sm italic">{n.message}</p></div></div>
                                 <p className="text-[10px] font-black text-slate-300 italic">{new Date(n.createdAt).toLocaleDateString()}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </main>
      </div>
   );
};

export default AdminDashboard;
