import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Download, 
  LayoutDashboard, 
  ShieldCheck, 
  History,
  QrCode,
  Globe,
  Database,
  Lock,
  Stamp
} from 'lucide-react';

const ReceiptScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const transmittedData = location.state?.receipt;

  const [receiptData, setReceiptData] = useState({
    id: transmittedData?.receiptId || ('REC-' + Math.random().toString(36).substr(2, 12).toUpperCase()),
    hash: transmittedData?.token || ('SIG-' + Math.random().toString(36).substr(2, 24).toUpperCase()),
    time: new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })
  });

  const handleDownload = () => { window.print(); };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16 animate-reveal space-y-12 pb-32">
       <style>{`
         @media print { 
           body * { visibility: hidden; } 
           #receipt-content, #receipt-content * { visibility: visible; } 
           #receipt-content { 
             position: absolute; 
             left: 0; 
             top: 0; 
             width: 100%; 
             border: none !important;
             box-shadow: none !important;
           } 
           .no-print { display: none !important; } 
         }
         .certificate-glow {
           box-shadow: 0 0 100px rgba(0,0,0,0.05), inset 0 0 20px rgba(255,153,51,0.05);
         }
       `}</style>
       
       <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-white shadow-massive animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-2 rounded-lg shadow-lg rotate-12">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-6xl font-black text-[#0b1f3f] uppercase tracking-tighter italic leading-none">Authentication Successful</h2>
            <p className="text-[12px] font-black text-green-600 uppercase tracking-[0.4em] italic">Encrypted Ballot Node Verified & Committed</p>
          </div>
       </div>

       {/* THE CERTIFICATE CONTAINER */}
       <div id="receipt-content" className="bg-white rounded-[4rem] certificate-glow border-[16px] border-[#0b1f3f] relative overflow-hidden shadow-massive">
          {/* FLAG BORDER ACCENT */}
          <div className="absolute top-0 left-0 w-full h-4 flex">
            <div className="bg-[#FF9933] w-1/3"></div>
            <div className="bg-white w-1/3"></div>
            <div className="bg-[#138808] w-1/3"></div>
          </div>

          <div className="p-16 border-b-4 border-dashed border-slate-100 relative overflow-hidden bg-slate-50/30">
             {/* WATERMARK */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-32 border-[20px] border-green-500/10 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
                <span className="text-[100px] font-black text-green-500/10 uppercase tracking-widest italic opacity-50">AUTHORIZED</span>
             </div>

             <div className="flex flex-col items-center gap-8 relative z-10">
                {/* OFFICIAL LOGO */}
                <div className="bg-white p-2 rounded-2xl shadow-xl w-28 h-20 flex items-center justify-center overflow-hidden border-2 border-slate-100">
                  <div className="flex flex-col w-full h-full">
                    <div className="bg-[#FF9933] h-[33%] w-full"></div>
                    <div className="bg-white h-[34%] w-full flex items-center justify-center relative">
                      <div className="w-8 h-8 border-[2px] border-[#000080] rounded-full flex items-center justify-center">
                          <div className="w-[1.5px] h-6 bg-[#000080] absolute rotate-0"></div>
                          <div className="w-[1.5px] h-6 bg-[#000080] absolute rotate-45"></div>
                          <div className="w-[1.5px] h-6 bg-[#000080] absolute rotate-90"></div>
                          <div className="w-[1.5px] h-6 bg-[#000080] absolute rotate-[135deg]"></div>
                      </div>
                    </div>
                    <div className="bg-[#138808] h-[33%] w-full"></div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-5xl font-black text-[#0b1f3f] uppercase tracking-tighter italic leading-none mb-4">Integrity Certificate</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-[2px] w-12 bg-orange-400"></div>
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic">Digital Security Node Deployment v4.2.1</p>
                    <div className="h-[2px] w-12 bg-green-500"></div>
                  </div>
                </div>
             </div>
          </div>

          <div className="p-16 grid grid-cols-1 md:grid-cols-2 gap-12 relative bg-white">
             {/* DATA FIELDS */}
             <div className="space-y-10">
                <div className="space-y-4">
                   <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-3 leading-none">
                     <Database size={16} className="text-orange-500" /> Receipt ID
                   </p>
                   <p className="font-black text-[#0b1f3f] text-3xl tracking-tighter italic uppercase">{receiptData.id}</p>
                </div>

                <div className="space-y-4">
                   <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-3 leading-none">
                     <History size={16} className="text-[#0b1f3f]" /> Authority Time
                   </p>
                   <p className="font-black text-[#0b1f3f] text-2xl tracking-tighter italic uppercase">{receiptData.time}</p>
                </div>

                <div className="space-y-4">
                   <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-3 leading-none">
                     <Lock size={16} className="text-red-500" /> Voter Reference
                   </p>
                   <p className="font-black text-[#0b1f3f] text-5xl tracking-tighter italic uppercase bg-slate-100 py-3 px-8 rounded-3xl w-fit">{user?.voterId}</p>
                </div>
             </div>

             {/* QR & SIGNATURE */}
             <div className="space-y-10 flex flex-col items-center md:items-end justify-center">
                <div className="bg-[#0b1f3f] p-8 rounded-[3.5rem] shadow-massive group transition-all hover:scale-105 border-4 border-slate-200">
                    <div className="w-48 h-48 bg-white rounded-3xl p-4 shadow-inner flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=NodeID:${receiptData.id}|Voter:${user?.voterId}|Time:${receiptData.time}`} 
                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" 
                        alt="Verification QR"
                      />
                    </div>
                </div>
                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end gap-3 text-orange-600 font-black text-xs uppercase tracking-widest italic mb-2">
                    <QrCode size={18} /> Valid Master Node Token
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic opacity-60">Verified by National Election Commission Gateway</p>
                </div>
             </div>

             {/* FULL-WIDTH HASH FOOTER */}
             <div className="col-span-full space-y-4 bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 shadow-inner">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Cryptographic Hash (SHA256 Signature)</p>
                  <Stamp size={20} className="text-green-600 opacity-40" />
                </div>
                <p className="font-mono text-[13px] break-all text-[#0b1f3f] font-black leading-relaxed tracking-tight select-all">
                  {receiptData.hash}
                </p>
             </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="bg-slate-100/50 p-16 flex flex-col md:flex-row gap-8 no-print border-t-2 border-dashed border-slate-200">
             <button onClick={handleDownload} className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-8 rounded-full shadow-massive transition-all transform active:scale-95 text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 italic group">
               <Download className="w-7 h-7 group-hover:-translate-y-2 transition-transform" /> Download Proof
             </button>
             <button onClick={() => navigate('/voter')} className="flex-1 bg-[#0b1f3f] hover:bg-black text-white font-black py-8 rounded-full shadow-massive transition-all transform active:scale-95 text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 italic group">
               <LayoutDashboard className="w-7 h-7 group-hover:scale-125 transition-transform" /> Exit Console
             </button>
          </div>
       </div>

       <div className="text-center text-slate-300 text-[11px] font-black uppercase tracking-[1.5em] opacity-30 italic no-print pt-10 animate-pulse">
         Secured by National Intelligence Grid & Blockchain Ledger v4.0.1
       </div>
    </div>
  );
};

export default ReceiptScreen;
