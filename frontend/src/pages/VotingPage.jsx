import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Users, 
  MapPin, 
  TrendingUp, 
  ShieldCheck,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const VotingPage = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  
  const { recordVote, token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // AUTO-OTP & MODAL EFFECT
  useEffect(() => {
    if (showModal) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtp(code.split('')); 
    } else {
      setOtp(['', '', '', '', '', '']);
    }
  }, [showModal]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (campaign) {
        const now = new Date().getTime();
        const end = new Date(campaign.endDate).setHours(23, 59, 59, 999);
        const diff = end - now;
        if (diff <= 0) { setTimeLeft('CLOSED'); clearInterval(timer); }
        else {
          const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
          const mins = String(Math.floor((diff % (1000 * 60)) / (1000 * 60))).padStart(2, '0');
          const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
          setTimeLeft(`${hours}:${mins}:${secs}`);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [campaign]);

  useEffect(() => {
    const fetchArenaData = async () => {
      try {
        setIsLoading(true);
        const rawToken = localStorage.getItem('token') || token;
        const authHeader = { 'Authorization': `Bearer ${rawToken}` };
        
        // 🎯 PRIORITY 1: Targeted Mission from Dashboard
        let targetCampaign = location.state?.campaign;
        
        // 🎯 PRIORITY 2: Fallback to first active unit
        if (!targetCampaign) {
          const campRes = await fetch('http://localhost:5001/api/campaign/active', { headers: authHeader });
          const activeUnits = await campRes.json();
          if (Array.isArray(activeUnits) && activeUnits.length > 0) {
            targetCampaign = activeUnits[0];
          }
        }

        if (targetCampaign) {
          setCampaign(targetCampaign);
          const cRes = await fetch(`http://localhost:5001/api/candidate/${targetCampaign._id}`, { headers: authHeader });
          const cData = await cRes.json();
          setCandidates(Array.isArray(cData) ? cData : []);
        }
      } catch (err) { 
        console.error("ARENA_LOAD_ERR:", err); 
      } finally { 
        setIsLoading(false); 
      }
    };

    if (token) fetchArenaData();
  }, [token, location.state]);

  const handleVoteClick = (candId) => {
    setSelectedCandidate(candId);
    setShowModal(true);
  };

  const handleOtpSuccess = async () => {
    try {
      const receipt = await recordVote(campaign._id, selectedCandidate);
      navigate('/receipt', { state: { receipt } });
    } catch (err) {
      alert('❌ Authentication Failed: ' + err.message);
      setShowModal(false);
    }
  };

  if (isLoading) return (
     <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
        <div className="w-16 h-16 border-4 border-[#0b1f3f] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-[#0b1f3f] uppercase italic">Initializing Secure Node...</p>
     </div>
  );

  if (!campaign) return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
       <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-3xl font-black text-[#0b1f3f] uppercase italic tracking-tighter">No Active Protocols</h2>
          <p className="text-gray-400 font-bold max-w-sm uppercase italic">Please select an election from the command dashboard.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-[#0b1f3f] text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-black transition-all">Command Center</button>
       </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 px-6 animate-reveal pb-20">
       <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-t-[16px] border-[#0b1f3f] mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2s]"><MapPin size={120} /></div>
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
             <div className="space-y-4">
                <h1 className="text-6xl font-black text-[#0b1f3f] uppercase tracking-tighter italic leading-none">{campaign.name}</h1>
                <div className="flex items-center gap-3 bg-orange-50 w-fit px-6 py-2 rounded-full border border-orange-100">
                   <MapPin className="text-orange-500 w-5 h-5" />
                   <span className="text-sm font-black text-orange-600 uppercase italic tracking-widest">{campaign.constituency}</span>
                </div>
             </div>
             <div className="bg-[#0b1f3f] p-8 rounded-[2.5rem] shadow-2xl text-white min-w-[280px] relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Clock size={48} /></div>
                <p className="text-[10px] font-black uppercase text-blue-300 tracking-[0.4em] mb-3 italic">Secure Clock</p>
                <h2 className="text-4xl font-black tracking-tighter italic">{timeLeft}</h2>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 mb-10 flex flex-col md:flex-row items-center gap-6 group hover:translate-x-2 transition-transform">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:rotate-12 transition-transform"><ShieldCheck className="w-6 h-6" /></div>
          <div className="flex-grow text-left">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-1 leading-none">Authenticated ID Holder</p>
             <h3 className="text-2xl font-black text-[#0b1f3f] uppercase italic italic tracking-tighter leading-none">{user?.voterId}</h3>
          </div>
          <div className="w-full md:w-auto bg-green-50 text-green-600 px-6 py-3 rounded-full border border-green-100 text-[10px] font-black tracking-widest uppercase italic animate-reveal">Node Integrity Verified</div>
       </div>

       <div className="space-y-12">
         <div className="flex items-center gap-4 border-l-8 border-orange-500 pl-6"><Users className="text-[#0b1f3f] w-8 h-8" /><h2 className="text-4xl font-black text-[#0b1f3f] uppercase tracking-tighter italic">Candidates Arena</h2></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {candidates.map((cand, i) => (
                 <div key={cand._id} onClick={() => handleVoteClick(cand._id)} className={`bg-white rounded-[2.5rem] p-6 border-2 cursor-pointer transition-all duration-500 group animate-slide-up hover:shadow-xl hover:scale-[1.02] active:scale-95 text-left relative overflow-hidden ${selectedCandidate === cand._id ? 'border-orange-500 shadow-xl bg-orange-50/10' : 'border-gray-50'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2s] text-[#0b1f3f]"><TrendingUp className="w-20 h-20" /></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                       <div className="bg-gray-50 text-gray-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter group-hover:bg-[#0b1f3f] group-hover:text-white transition-colors">Verified Choice</div>
                       {selectedCandidate === cand._id && <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pop-in"><CheckCircle2 className="w-5 h-5" /></div>}
                    </div>
                    
                    <div className="flex gap-6 items-center mb-6 relative z-10">
                       <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md flex-shrink-0 group-hover:rotate-6 transition-transform duration-500 bg-gray-50 p-1">
                          <img 
                             src={cand.profilePic || cand.partySymbol || cand.symbol || 'https://api.dicebear.com/7.x/initials/svg?seed=' + cand.name} 
                             className="w-full h-full object-contain" 
                             alt={cand.name}
                          />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-[#0b1f3f] uppercase tracking-tighter italic leading-none">{cand.name}</h4>
                          <p className="font-extrabold text-[#fca55d] text-[9px] uppercase tracking-widest mt-1 italic">{cand.party || 'Independent'}</p>
                       </div>
                    </div>
   
                    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group-hover:bg-white transition-colors relative z-10">
                       <p className="text-[9px] font-black text-gray-300 uppercase italic">Digital Protocol</p>
                       <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic group-hover:text-[#0b1f3f]">Authorized</span>
                    </div>
                 </div>
               ))}
            </div>
       </div>

       {showModal && (
        <div className="fixed inset-0 bg-[#0b1f3f]/90 z-[100] flex items-center justify-center p-6 backdrop-blur-xl animate-fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-pop-in relative">
              <div className="p-10 text-center space-y-6">
                 <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-orange-100"><AlertCircle className="w-8 h-8" /></div>
                 <div><h3 className="text-2xl font-black text-[#0b1f3f] uppercase tracking-tighter italic mb-1">Authorize Protocol</h3><p className="text-gray-400 font-bold text-[10px] px-4 uppercase italic">Ballot entry initiated. Locked Selection.</p></div>

                 <div className="bg-[#0b1f3f] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                    <p className="text-[9px] font-black uppercase text-blue-300 tracking-[0.3em] mb-3 italic leading-none">Security Token</p>
                    <h2 className="text-4xl font-mono font-black tracking-[0.2em]">{generatedOtp}</h2>
                 </div>

                 <div className="pt-2 space-y-4">
                    <div className="flex justify-between items-center px-2"><label className="text-[9px] font-black text-[#0b1f3f] uppercase tracking-widest italic">Digital Ingress Code</label><span className="text-[8px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full animate-pulse italic">Syncing...</span></div>
                    <div className="flex justify-between gap-2">
                       {otp.map((d, i) => (
                          <div key={i} className="w-full h-12 border-2 border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center text-xl font-black text-[#0b1f3f] shadow-inner animate-slide-up" style={{animationDelay: `${i*50}ms`}}>{d}</div>
                       ))}
                    </div>
                 </div>

                 <button onClick={handleOtpSuccess} className="w-full bg-[#fca55d] hover:bg-[#ea8e40] text-white font-black py-5 rounded-[1.5rem] shadow-lg transition-all transform active:scale-95 uppercase tracking-[0.2em] text-sm italic flex items-center justify-center gap-3 group">AUTHENTICATE CHOICE <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></button>
                 <button onClick={() => setShowModal(false)} className="text-gray-300 font-extrabold text-[9px] uppercase tracking-widest hover:text-red-500 transition-colors italic">Terminate</button>
              </div>
           </div>
        </div>
      )}
      <div className="mt-8 text-center text-gray-300 text-[10px] font-bold uppercase tracking-[1.2em] opacity-40 italic">Secure Node integrity v3.0</div>
    </div>
  );
};

export default VotingPage;
