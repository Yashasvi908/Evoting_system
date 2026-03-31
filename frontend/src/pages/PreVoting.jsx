import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Info, CheckCircle2, ArrowRight } from 'lucide-react';

const PreVoting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  
  const campaign = location.state?.campaign;

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4 animate-slide-up">
      <div className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden group hover:shadow-2xl transition duration-700">
        <div className="p-12 md:p-16 border-b border-gray-100 relative">
           <div className="absolute top-10 right-10 opacity-5"><ShieldCheck className="w-24 h-24" /></div>
           <div className="mb-10 text-left">
             <h2 className="text-3xl font-black text-[#0b1f3f] uppercase tracking-tighter italic">Voter ID: {user?.voterId}</h2>
             <p className="text-lg text-gray-500 font-bold mt-2 uppercase tracking-widest italic opacity-60">Eligibility Profile Verified</p>
           </div>
           
           <div className="flex items-center text-lg mb-10 text-left">
             <span className="font-extrabold text-[#0b1f3f] mr-4 uppercase tracking-tighter italic">Status:</span>
             <span className="flex items-center text-green-600 font-black bg-green-50 px-6 py-2 rounded-full border-2 border-green-100 uppercase tracking-widest text-sm shadow-sm italic">
               <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-3"></div> Eligible
             </span>
           </div>

           <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border-2 border-gray-100 text-left animate-slide-up" style={{ animationDelay: '100ms' }}>
             <h3 className="font-black text-[#0b1f3f] mb-6 flex items-center gap-3 uppercase tracking-widest italic shadow-sm w-fit bg-white px-6 py-2 rounded-full"><Info className="w-6 h-6 text-blue-500" /> Instructions</h3>
             <ul className="space-y-4 text-gray-500 text-xs font-black uppercase tracking-tight italic list-none">
               <li className="flex gap-4 animate-slide-right delay-100" style={{ animationDelay: '200ms' }}><div className="text-blue-500">▶</div>Selection is final and cannot be altered after authorization.</li>
               <li className="flex gap-4 animate-slide-right delay-200" style={{ animationDelay: '300ms' }}><div className="text-blue-500">▶</div>Your digital identity remains anonymous in the final count.</li>
               <li className="flex gap-4 animate-slide-right delay-300" style={{ animationDelay: '400ms' }}><div className="text-blue-500">▶</div>A secure receipt will be issued upon successful transmission.</li>
               <li className="flex gap-4 animate-slide-right delay-400" style={{ animationDelay: '500ms' }}><div className="text-blue-500">▶</div>Ensure stable node connection during the protocol.</li>
             </ul>
           </div>
        </div>

        <div className="p-12 bg-white flex flex-col items-center">
           <label className="flex items-center cursor-pointer mb-10 p-8 rounded-[2rem] border-2 border-gray-100 w-full max-w-lg hover:bg-gray-50 transition group">
             <input type="checkbox" className="peer sr-only" checked={agreed} onChange={() => setAgreed(!agreed)} />
             <div className="w-8 h-8 rounded-xl border-2 border-gray-300 peer-checked:bg-green-600 peer-checked:border-green-600 transition flex items-center justify-center shadow-inner group-hover:scale-110">
                <CheckCircle2 className={`w-5 h-5 text-white ${agreed ? 'block' : 'hidden'} animate-pop-in`} />
             </div>
             <span className="ml-5 font-black text-[#0b1f3f] uppercase tracking-tighter italic text-lg opacity-80 group-hover:opacity-100 transition-opacity">Accept Terms of Integrity</span>
           </label>

           <button 
             onClick={() => navigate('/vote', { state: { campaign } })}
             disabled={!agreed}
             className={`w-full max-w-lg font-black py-6 rounded-[2rem] shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-lg ${agreed ? 'bg-[#0b1f3f] hover:bg-blue-900 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'}`}
           >
             Proceed to Arena <ArrowRight className="w-7 h-7" />
           </button>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-200 text-[10px] font-bold uppercase tracking-widest italic no-print">SECURE NODE IDENTITY GATEWAY v3.0</div>
    </div>
  );
};

export default PreVoting;
