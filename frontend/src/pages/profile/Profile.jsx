import React, { useEffect, useState } from 'react';
import client from '../../api/client';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    client.get('/users/me')
      .then(res => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          risk_profile: res.data.risk_profile || 'Moderate'
        });
      })
      .catch(err => console.error("Could not fetch profile", err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await client.put('/users/me', formData);
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      alert("Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleKYCRequest = async () => {
    if (window.confirm("Submit your profile for identity verification? This will notify the admin team.")) {
      try {
        setLoading(true);
        await client.post('/users/me/request-kyc');
        fetchProfile(); // Refresh to see "Pending" status
      } catch (err) {
        console.error(err);
        alert("Request failed. Please check if the backend route exists.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center text-slate-400">Loading your profile...</div>;

  // FAIL-SAFE STATUS CHECK (Handles null, undefined, or empty strings)
  const currentStatus = user.kyc_status ? user.kyc_status : "Not Verified";

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10 min-h-screen bg-[#FDFDFD]">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your professional investor profile.</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className={`px-8 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-all ${
            isEditing 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {loading ? 'Processing...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* 2. LEFT COLUMN: IDENTITY & RISK */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* PERSONAL DETAILS CARD */}
          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Full Legal Name</label>
                {isEditing ? (
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-100 focus:border-blue-500 outline-none transition-colors" />
                ) : (
                  <p className="text-base font-medium text-slate-900">{user.name || "None Provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Identity</label>
                <p className="text-base font-medium text-slate-700">{user.email}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Primary Phone</label>
                {isEditing ? (
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border-b-2 border-slate-100 focus:border-blue-500 outline-none transition-colors" />
                ) : (
                  <p className="text-base font-medium text-slate-900">{user.phone || "--"}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Account Since</label>
                <p className="text-base font-medium text-slate-900">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* RISK STRATEGY CARD */}
          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Investment Strategy</h2>
            <p className="text-slate-400 text-xs mb-8">This setting helps our logic suggest assets that match your appetite for risk.</p>
            <div className="flex gap-6">
              {['Conservative', 'Moderate', 'Aggressive'].map((type) => (
                <button
                  key={type}
                  disabled={!isEditing}
                  onClick={() => setFormData({...formData, risk_profile: type})}
                  className={`flex-1 py-3 px-4 rounded border font-bold text-[10px] uppercase tracking-widest transition-all ${
                    (isEditing ? formData.risk_profile : user.risk_profile) === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-100 text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: KYC & STATUS (Classy Version) */}
        <div className="space-y-8">
          
          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Verification</h3>
            
            {/* DYNAMIC STATUS DISPLAY */}
            <div className={`p-6 rounded-lg mb-6 flex items-center gap-4 border ${
              currentStatus === 'Verified' ? 'bg-emerald-50 border-emerald-100' : 
              currentStatus === 'Pending' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-2xl">
                {currentStatus === 'Verified' ? '🛡️' : currentStatus === 'Pending' ? '⏳' : '⚠️'}
              </div>
              <div>
                <p className={`font-bold text-xs uppercase tracking-tighter ${
                   currentStatus === 'Verified' ? 'text-emerald-700' : 
                   currentStatus === 'Pending' ? 'text-amber-700' : 'text-slate-500'
                }`}>
                  {currentStatus}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {currentStatus === 'Verified' ? 'Fully Authorized' : 'Identity check required'}
                </p>
              </div>
            </div>

            {/* BUTTON LOGIC: Only show if NOT Verified and NOT Pending */}
            {currentStatus !== 'Verified' && currentStatus !== 'Pending' && (
              <button 
                onClick={handleKYCRequest}
                className="w-full bg-slate-900 text-white py-3 rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
              >
                Verify Identity
              </button>
            )}

            {currentStatus === 'Pending' && (
               <div className="text-center p-2 border border-dashed border-amber-200 rounded text-[10px] font-bold text-amber-600 uppercase">
                 Waiting for Manual Review
               </div>
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-xl text-white">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">System Role</p>
            <h3 className="text-xl font-medium tracking-tight uppercase italic">{user.role || "User"}</h3>
            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
               <span className="text-[10px] text-slate-500 font-bold uppercase">UID: #{user.id}</span>
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;