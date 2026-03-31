import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  History, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const PostVoteHistory = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const rawToken = localStorage.getItem('token');
        if (!rawToken) return;
        
        setIsLoading(true);
        const resp = await fetch('http://localhost:5001/api/vote/history', {
          headers: { 'Authorization': `Bearer ${rawToken}` }
        });
        const data = await resp.json();
        console.log("HISTORY_DATA_SYNC:", data);
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.error('History Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black italic text-[#0b1f3f]">RETRIEVING SECURE LEDGER...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4 animate-reveal pb-20">
       <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate('/voter')}
            className="flex items-center gap-2 text-[#0b1f3f] font-black text-sm hover:translate-x-[-4px] transition-all uppercase tracking-widest"
          >
            <ChevronLeft className="w-5 h-5" /> Dashboard Arena
          </button>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">
             <ShieldCheck className="w-4 h-4" /> Triple-Encrypted History
          </div>
       </div>

       <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-gray-50 overflow-hidden mb-12 animate-slide-up">
          <div className="p-12 text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><History className="w-32 h-32" /></div>
             <h2 className="text-4xl font-black text-[#0b1f3f] mb-2 uppercase tracking-tighter italic">Voter Participation Log</h2>
             <p className="text-gray-400 font-bold text-sm uppercase px-10">Your digital participation has been timestamped and securely archived in the secure node ledger.</p>
          </div>

          <div className="overflow-x-auto px-6 pb-12">
             <table className="w-full text-left">
                <thead className="bg-[#0b1f3f] text-white text-[10px] font-black uppercase tracking-[0.2em] italic">
                   <tr>
                      <th className="py-6 px-10 rounded-l-3xl">Campaign Node</th>
                      <th className="py-6 px-10">Constituency</th>
                      <th className="py-6 px-10">Selection Proof</th>
                      <th className="py-6 px-10 rounded-r-3xl text-center">Receipt</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {history.map((item, i) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                         <td className="py-10 px-10">
                            <p className="font-black text-[#0b1f3f] text-lg uppercase tracking-tighter leading-tight">{item.campaignId?.name || 'Unknown Campaign'}</p>
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Sync ID: {item._id.substring(0,12)}</span>
                         </td>
                         <td className="py-10 px-10 text-gray-500 font-black uppercase text-sm tracking-widest italic">{item.campaignId?.constituency || 'Global Node'}</td>
                         <td className="py-10 px-10">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm p-1">
                                  <img src={item.candidateId?.symbol || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-xl" alt="Party" />
                               </div>
                               <div>
                                  <p className="font-black text-[#0b1f3f] text-sm uppercase tracking-tighter leading-tight">{item.candidateId?.name || 'Authorized Choice'}</p>
                                  <span className="text-[10px] font-extrabold text-blue-600 uppercase italic opacity-70">{item.candidateId?.party || 'Party Reserved'}</span>
                               </div>
                            </div>
                         </td>
                         <td className="py-10 px-10 text-center">
                            <button 
                              onClick={() => navigate('/receipt')}
                              className="bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-transparent hover:border-orange-200 active:scale-95"
                            >
                               <FileText className="w-6 h-6" />
                            </button>
                         </td>
                      </tr>
                   ))}
                   {history.length === 0 && (
                      <tr>
                         <td colSpan="4" className="py-32 text-center font-black text-gray-100 uppercase italic text-2xl tracking-tighter opacity-50">No Participation Records Found on Secure Node.</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>

       <div className="flex justify-between items-center px-4 no-print animate-fade-in [animation-delay:300ms]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><UserCheck className="w-6 h-6" /></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Security Protocol: {user?.voterId}</p>
          </div>
          <button onClick={() => navigate('/voter')} className="bg-[#0b1f3f] text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-2xl">Return to Interface Home</button>
       </div>
    </div>
  );
};

export default PostVoteHistory;
