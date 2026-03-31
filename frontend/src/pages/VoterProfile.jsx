import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, ShieldCheck, User, Save, RefreshCcw } from 'lucide-react';

const VoterProfile = () => {
  const { user, updateUser } = useAuth(); // Assuming updateUser is available in context
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    profilePic: user?.profilePic || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Simulate API call to update profile
      const resp = await fetch('http://localhost:5001/api/voters/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });
      if (resp.ok) {
        alert('✅ Identity Node Updated Successfully');
        window.location.reload(); // Refresh to sync auth state
      }
    } catch (err) {
      console.error(err);
      alert('❌ Sync Failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-reveal pb-20">
      <div className="bg-white rounded-[4rem] p-16 shadow-massive border-t-[20px] border-[#ff9933] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><User size={300} /></div>
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
           <div className="relative group">
              <div className="w-48 h-48 rounded-[3rem] p-1.5 bg-gradient-to-tr from-[#0b1f3f] via-blue-600 to-[#ff9933] shadow-massive">
                <div className="w-full h-full rounded-[2.8rem] overflow-hidden border-4 border-white bg-slate-50">
                  <img src={profileForm.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="DP" />
                </div>
              </div>
              <label className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#ff9933] text-[#0b1f3f] rounded-2xl flex items-center justify-center cursor-pointer shadow-massive hover:scale-110 transition-all border-4 border-white">
                <Camera size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
           </div>

           <div className="text-center md:text-left space-y-4">
              <h2 className="text-5xl font-black text-[#0b1f3f] uppercase italic tracking-tighter leading-none">Voter Identity</h2>
              <div className="flex items-center gap-4 text-green-600 font-bold text-xs uppercase tracking-[0.3em] italic bg-green-50 px-6 py-2 rounded-full w-fit border border-green-100">
                <ShieldCheck size={16} /> Verified Citizen Node
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic mt-2">UID: {user?.voterId}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-16 space-y-8 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black text-[#0b1f3f] uppercase italic ml-4">Full_Legal_Name</label>
                 <input 
                    type="text" 
                    required 
                    placeholder="E.g. Sneha Verma" 
                    className="bg-slate-50 p-6 rounded-[2rem] font-black border-2 border-slate-100 focus:border-[#ff9933] outline-none shadow-sm transition-all text-lg italic"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                 />
              </div>
              <div className="flex flex-col gap-2 opacity-50">
                 <label className="text-[10px] font-black text-[#0b1f3f] uppercase italic ml-4">Assigned_Constituency (ReadOnly)</label>
                 <div className="bg-slate-50/50 p-6 rounded-[2rem] font-black border-2 border-dashed border-slate-200 text-slate-400 text-lg italic">{user?.constituency || 'Global Node'}</div>
              </div>
           </div>

           <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full md:w-fit bg-[#0b1f3f] hover:bg-blue-900 text-white font-black px-12 py-6 rounded-[2.5rem] shadow-massive flex items-center justify-center gap-6 transition-all transform active:scale-95 text-xl italic uppercase tracking-widest disabled:opacity-50"
           >
             {isUpdating ? <RefreshCcw className="animate-spin" /> : <Save />} 
             Synchronize Identity
           </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { label: 'Integrity Node', val: 'V6.2.0', color: 'blue' },
           { label: 'Biometric Status', val: 'ACTIVE', color: 'green' },
           { label: 'Last Sync', val: new Date().toLocaleTimeString(), color: 'orange' }
         ].map((item, index) => (
           <div key={item.label} style={{ animationDelay: `${(index + 2) * 100}ms` }} className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border-4 border-white shadow-massive text-center animate-scale-in">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-2">{item.label}</p>
              <p className={`text-2xl font-black text-${item.color}-600 italic uppercase tracking-tighter`}>{item.val}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default VoterProfile;
